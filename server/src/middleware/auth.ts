import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PortfolioProfile } from '../models/index.js';
import { AppError } from '../utils/errors.js';
import { getJwtSecret } from '../config/jwt.js';

export type AuthRole = 'user' | 'platform_admin';

export interface AuthPayload {
  id: string;
  email: string;
  role: AuthRole;
  name?: string;
}

export interface AuthRequest extends Request {
  auth?: AuthPayload;
  profile?: { id: string; slug: string };
}

export function signToken(payload: AuthPayload) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' });
}

function readToken(req: Request): AuthPayload | null {
  const token = req.cookies?.token;
  if (!token) return null;
  try {
    return jwt.verify(token, getJwtSecret()) as AuthPayload;
  } catch {
    return null;
  }
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const auth = readToken(req);
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });
  req.auth = auth;
  next();
}

export function requireUser(req: AuthRequest, res: Response, next: NextFunction) {
  const auth = readToken(req);
  if (!auth || auth.role !== 'user') return res.status(401).json({ error: 'Unauthorized' });
  req.auth = auth;
  next();
}

export function requirePlatformAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  const auth = readToken(req);
  if (!auth || auth.role !== 'platform_admin') return res.status(401).json({ error: 'Unauthorized' });
  req.auth = auth;
  next();
}

/** @deprecated use requirePlatformAdmin */
export const requireAdmin = requirePlatformAdmin;

export async function requireProfileAccess(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { profileId } = req.params;
    const profile = await PortfolioProfile.findById(profileId);
    if (!profile) throw new AppError('Profile not found', 404);

    // Binned profiles may only use restore / permanent-delete routes
    const url = req.originalUrl || req.url || '';
    const binLifecycle = /\/profiles\/[^/?]+\/(restore|permanent)\b/.test(url);
    if (profile.deletedAt && !binLifecycle) {
      throw new AppError('Profile is in the bin. Restore it to continue editing.', 400);
    }

    if (req.auth?.role === 'platform_admin') {
      req.profile = { id: profile._id.toString(), slug: profile.slug };
      return next();
    }

    if (req.auth?.role === 'user' && profile.ownerId?.toString() === req.auth.id) {
      req.profile = { id: profile._id.toString(), slug: profile.slug };
      return next();
    }

    return res.status(403).json({ error: 'Forbidden' });
  } catch (err) {
    next(err);
  }
}

export async function requireProfile(req: AuthRequest, _res: Response, next: NextFunction) {
  return requireProfileAccess(req, _res as Response, next);
}

export async function resolveProfileBySlug(req: Request, res: Response, next: NextFunction) {
  try {
    const { slug } = req.params;
    const profile = await PortfolioProfile.findOne({ slug, deletedAt: null });
    if (!profile) {
      return res.status(404).json({ error: 'Portfolio not found' });
    }
  } catch (err) {
    return next(err);
  }
  next();
}
