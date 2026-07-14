import { Router } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { AdminUser, User } from '../models/index.js';
import { AuthRequest, requireAuth, requireUser, signToken } from '../middleware/auth.js';
import { sendError } from '../utils/errors.js';
import { createEmptyProfileContent } from '../services/portfolio.js';
import { PortfolioProfile } from '../models/index.js';
import { generateSlug, ensureUniqueSlug } from '../utils/slug.js';
import { ownerSlugTaken } from '../utils/slugAvailability.js';

const router = Router();

function cookieOpts() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };
}

router.post('/user/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ email, passwordHash, name });

    const baseSlug = await ensureUniqueSlug(generateSlug(name), async (s) =>
      ownerSlugTaken(user._id, s)
    );

    const profile = await PortfolioProfile.create({
      displayName: name,
      slug: baseSlug,
      ownerId: user._id,
      isPublished: false,
      isDefault: false,
    });
    await createEmptyProfileContent(profile._id);

    const token = signToken({ id: user._id.toString(), email: user.email, role: 'user', name: user.name });
    res.cookie('token', token, cookieOpts());

    res.status(201).json({
      email: user.email,
      name: user.name,
      role: 'user',
      profile: { id: profile._id, slug: profile.slug },
      onboarding: true,
    });
  } catch (err) {
    sendError(res, err);
  }
});

router.post('/user/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = signToken({ id: user._id.toString(), email: user.email, role: 'user', name: user.name });
    res.cookie('token', token, cookieOpts());
    res.json({ email: user.email, name: user.name, role: 'user' });
  } catch (err) {
    sendError(res, err);
  }
});

router.post('/platform/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await AdminUser.findOne({ email });
    if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = signToken({ id: admin._id.toString(), email: admin.email, role: 'platform_admin' });
    res.cookie('token', token, cookieOpts());
    res.json({ email: admin.email, role: 'platform_admin' });
  } catch (err) {
    sendError(res, err);
  }
});

/** @deprecated — use /user/login or /platform/login */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      const token = signToken({ id: user._id.toString(), email: user.email, role: 'user', name: user.name });
      res.cookie('token', token, cookieOpts());
      return res.json({ email: user.email, role: 'user', name: user.name });
    }
    const admin = await AdminUser.findOne({ email });
    if (admin && (await bcrypt.compare(password, admin.passwordHash))) {
      const token = signToken({ id: admin._id.toString(), email: admin.email, role: 'platform_admin' });
      res.cookie('token', token, cookieOpts());
      return res.json({ email: admin.email, role: 'platform_admin' });
    }
    return res.status(401).json({ error: 'Invalid credentials' });
  } catch (err) {
    sendError(res, err);
  }
});

router.post('/logout', (_req, res) => {
  res.clearCookie('token');
  res.json({ ok: true });
});

router.get('/me', requireAuth, (req: AuthRequest, res) => {
  res.json(req.auth);
});

/** Authenticated password change */
router.post('/user/change-password', requireUser, async (req: AuthRequest, res) => {
  try {
    const { currentPassword, newPassword } = req.body as {
      currentPassword?: string;
      newPassword?: string;
    };
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const user = await User.findById(req.auth!.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!(await bcrypt.compare(currentPassword, user.passwordHash))) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();
    res.json({ ok: true });
  } catch (err) {
    sendError(res, err);
  }
});

/**
 * Start password reset. Always returns a generic success message.
 * In non-production (or RESET_TOKEN_IN_RESPONSE=1), includes resetUrl for local testing.
 */
router.post('/user/forgot-password', async (req, res) => {
  try {
    const email = String(req.body?.email || '')
      .trim()
      .toLowerCase();
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await User.findOne({ email });
    const generic = {
      ok: true,
      message: 'If that email is registered, reset instructions are available.',
    };

    if (!user) return res.json(generic);

    const rawToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
    const resetUrl = `${clientUrl}/reset-password?token=${rawToken}`;

    // Hook for transactional email providers (Resend, SES, etc.)
    if (process.env.RESET_EMAIL_WEBHOOK) {
      await fetch(process.env.RESET_EMAIL_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, resetUrl, name: user.name }),
      }).catch((err) => console.error('RESET_EMAIL_WEBHOOK failed', err));
    } else {
      console.log(`[password-reset] ${user.email} → ${resetUrl}`);
    }

    const expose =
      process.env.NODE_ENV !== 'production' || process.env.RESET_TOKEN_IN_RESPONSE === '1';

    res.json(expose ? { ...generic, resetUrl } : generic);
  } catch (err) {
    sendError(res, err);
  }
});

router.post('/user/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body as { token?: string; newPassword?: string };
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const hashed = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpires: { $gt: new Date() },
    });
    if (!user) return res.status(400).json({ error: 'Invalid or expired reset link' });

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();
    res.json({ ok: true });
  } catch (err) {
    sendError(res, err);
  }
});

export default router;
