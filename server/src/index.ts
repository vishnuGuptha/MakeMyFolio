import './polyfills.js';
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import path from 'path';
import authRoutes from './routes/auth.js';
import publicRoutes from './routes/public.js';
import adminRoutes from './routes/admin.js';
import platformRoutes from './routes/platform.js';
import { PortfolioProfile } from './models/index.js';
import { getJwtSecret } from './config/jwt.js';
import { getStorageProvider } from './services/storage.js';
import { ensureTryDemoSeed } from './services/tryDemoSeed.js';
import { sendError } from './utils/errors.js';

const app = express();
const PORT = process.env.PORT || 4000;
const CLIENT_URL = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
const APP_DOMAIN = process.env.APP_DOMAIN || 'buildmyfolio.com';

function isAllowedCorsOrigin(origin: string | undefined): boolean {
  if (!origin) return true;
  if (origin === CLIENT_URL) return true;
  try {
    const { hostname, protocol } = new URL(origin);
    if (protocol !== 'http:' && protocol !== 'https:') return false;
    if (hostname === APP_DOMAIN || hostname === `www.${APP_DOMAIN}`) return true;
    if (hostname.endsWith(`.${APP_DOMAIN}`)) return true;
  } catch {
    return false;
  }
  if (process.env.NODE_ENV !== 'production' && origin.includes('localhost')) return true;
  return false;
}

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
  cors({
    origin(origin, callback) {
      callback(null, isAllowedCorsOrigin(origin) ? origin : false);
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(process.cwd(), process.env.UPLOAD_DIR || 'uploads')));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many login attempts' },
});

const resumeImportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { error: 'Too many resume imports. Please try again later.' },
});

const aiEnhanceLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 40,
  message: { error: 'Too many AI requests. Please try again later.' },
});

app.use('/api/auth/user/login', authLimiter);
app.use('/api/auth/user/register', authLimiter);
app.use('/api/auth/platform/login', authLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth', authRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/user/profiles/:profileId/resume/import', resumeImportLimiter);
app.use('/api/user/profiles/:profileId/ai/enhance', aiEnhanceLimiter);
app.use('/api/user', adminRoutes);
app.use('/api/platform', platformRoutes);
/** @deprecated use /api/user */
app.use('/api/admin', adminRoutes);

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  sendError(res, err);
});

async function start() {
  // Fail fast in production if JWT is misconfigured
  getJwtSecret();
  console.log(`Media storage provider: ${getStorageProvider()}`);

  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/portfolio-cms';
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');
  // Drop legacy global unique on slug; apply per-owner + published-only uniqueness.
  await PortfolioProfile.syncIndexes();
  await ensureTryDemoSeed();
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
