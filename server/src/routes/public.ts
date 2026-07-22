import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import { PortfolioProfile, ContactMessage, ProfileContent, User, PortfolioPageView, SiteSettings } from '../models/index.js';
import {
  getAccessCodeHashForSlug,
  getPortfolioAggregate,
  redactLockedPortfolio,
} from '../services/portfolio.js';
import { getTryDemoSeed } from '../services/tryDemoSeed.js';
import { notifyOwnerOfContactMessage } from '../services/emailNotify.js';
import { sendError } from '../utils/errors.js';
import { resolveResumeFilePath, sendResumeFile, getResumeDownloadName } from '../utils/resume.js';
import { signUnlockToken, verifyUnlockToken } from '../utils/portfolioUnlock.js';

const router = Router();

function looksLikeBot(userAgent: string | undefined): boolean {
  if (!userAgent) return false;
  return /bot|crawl|spider|slurp|facebookexternalhit|preview|headless/i.test(userAgent);
}

function unlockHeader(req: { get: (n: string) => string | undefined; query: Record<string, unknown> }) {
  const header = req.get('x-portfolio-unlock');
  if (header) return header;
  const q = req.query.unlockToken;
  return typeof q === 'string' ? q : undefined;
}

router.get('/try-demo', async (_req, res) => {
  try {
    const seed = await getTryDemoSeed();
    res.json(seed);
  } catch (err) {
    sendError(res, err);
  }
});

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many contact requests' },
});

const unlockLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Too many unlock attempts. Please try again later.' },
});

router.get('/default-slug', async (_req, res) => {
  try {
    const profile = await PortfolioProfile.findOne({
      isDefault: true,
      isPublished: true,
      deletedAt: null,
    });
    if (!profile) {
      const fallback = await PortfolioProfile.findOne({ isPublished: true, deletedAt: null }).sort({
        createdAt: 1,
      });
      return res.json({ slug: fallback?.slug ?? null });
    }
    res.json({ slug: profile.slug });
  } catch (err) {
    sendError(res, err);
  }
});

router.get('/profiles', async (_req, res) => {
  try {
    const profiles = await PortfolioProfile.find({ isPublished: true, deletedAt: null })
      .select('slug displayName updatedAt')
      .sort({ displayName: 1 });
    res.json(profiles);
  } catch (err) {
    sendError(res, err);
  }
});

/** Opt-in published folios for the public Examples gallery. */
router.get('/examples', async (_req, res) => {
  try {
    const profiles = await PortfolioProfile.find({
      isPublished: true,
      showInGallery: true,
      deletedAt: null,
    })
      .select('slug displayName updatedAt')
      .sort({ updatedAt: -1 })
      .limit(48);

    const ids = profiles.map((p) => p._id);
    const [contents, settingsList] = await Promise.all([
      ProfileContent.find({ portfolioProfileId: { $in: ids } }).select(
        'portfolioProfileId name title tagline profileImageUrl'
      ),
      SiteSettings.find({ portfolioProfileId: { $in: ids } }).select(
        'portfolioProfileId portfolioTheme'
      ),
    ]);

    const contentById = new Map(
      contents.map((c) => [c.portfolioProfileId.toString(), c])
    );
    const themeById = new Map(
      settingsList.map((s) => [s.portfolioProfileId.toString(), s.portfolioTheme || 'glass'])
    );

    res.json({
      examples: profiles.map((p) => {
        const id = p._id.toString();
        const content = contentById.get(id);
        return {
          id,
          slug: p.slug,
          displayName: p.displayName,
          name: content?.name?.trim() || p.displayName,
          title: content?.title?.trim() || '',
          tagline: content?.tagline?.trim() || '',
          profileImageUrl: content?.profileImageUrl || '',
          themeId: themeById.get(id) || 'glass',
          updatedAt: p.updatedAt,
        };
      }),
    });
  } catch (err) {
    sendError(res, err);
  }
});

router.get('/portfolio/:slug', async (req, res) => {
  try {
    const data = await getPortfolioAggregate(req.params.slug);
    if (!data) return res.status(404).json({ error: 'Portfolio not found or unpublished' });

    // Fire-and-forget page view (skip obvious bots). Never block the visitor.
    if (!looksLikeBot(req.get('user-agent'))) {
      void PortfolioPageView.create({
        portfolioProfileId: data.profile.id,
      }).catch((err) => console.error('[analytics] view record failed', err));
    }

    const locked = Boolean(data.settings?.accessLockEnabled);
    const token = unlockHeader(req);
    const slug = String(req.params.slug);
    if (locked && !(token && verifyUnlockToken(token, slug))) {
      return res.json(redactLockedPortfolio(data));
    }

    res.json(data);
  } catch (err) {
    sendError(res, err);
  }
});

router.post('/portfolio/:slug/unlock', unlockLimiter, async (req, res) => {
  try {
    const slug = String(req.params.slug);
    const code = typeof req.body?.code === 'string' ? req.body.code.trim() : '';
    const resumeToken = typeof req.body?.token === 'string' ? req.body.token.trim() : '';

    const meta = await getAccessCodeHashForSlug(slug);
    if (!meta || !meta.enabled) {
      return res.status(400).json({ error: 'This portfolio is not locked' });
    }

    if (resumeToken) {
      if (!verifyUnlockToken(resumeToken, slug)) {
        return res.status(401).json({ error: 'Session expired. Enter the access code again.' });
      }
      const data = await getPortfolioAggregate(slug);
      if (!data) return res.status(404).json({ error: 'Portfolio not found or unpublished' });
      return res.json({ ...data, unlockToken: resumeToken });
    }

    if (!code) {
      return res.status(400).json({ error: 'Access code is required' });
    }
    if (!meta.hash || !(await bcrypt.compare(code, meta.hash))) {
      return res.status(401).json({ error: 'Invalid access code' });
    }

    const data = await getPortfolioAggregate(slug);
    if (!data) return res.status(404).json({ error: 'Portfolio not found or unpublished' });

    const unlockToken = signUnlockToken(slug, meta.profileId);
    res.json({ ...data, unlockToken });
  } catch (err) {
    sendError(res, err);
  }
});

router.get('/portfolio/:slug/resume', async (req, res) => {
  try {
    const profile = await PortfolioProfile.findOne({
      slug: req.params.slug,
      isPublished: true,
      deletedAt: null,
    });
    if (!profile) return res.status(404).json({ error: 'Not found' });

    const content = await ProfileContent.findOne({ portfolioProfileId: profile._id });
    if (!content?.resumeUrl) return res.status(404).json({ error: 'Resume not available' });

    const filePath = resolveResumeFilePath(content.resumeUrl);
    if (!filePath) return res.status(404).json({ error: 'Resume file not found' });

    const download = req.query.download === '1' || req.query.download === 'true';
    sendResumeFile(res, filePath, getResumeDownloadName(profile.slug, filePath), download);
  } catch (err) {
    sendError(res, err);
  }
});

router.post('/contact/:slug', contactLimiter, async (req, res) => {
  try {
    const profile = await PortfolioProfile.findOne({
      slug: req.params.slug,
      isPublished: true,
      deletedAt: null,
    });
    if (!profile) return res.status(404).json({ error: 'Portfolio not found' });

    const { name, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }

    await ContactMessage.create({
      portfolioProfileId: profile._id,
      name,
      email,
      message,
    });

    // Fire-and-forget owner notification (webhook or console). Never block the visitor.
    void (async () => {
      try {
        if (!profile.ownerId) return;
        const owner = await User.findById(profile.ownerId).select('email name');
        if (!owner?.email) return;
        const clientUrl = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
        await notifyOwnerOfContactMessage({
          to: owner.email,
          ownerName: owner.name || 'there',
          visitorName: String(name).trim(),
          visitorEmail: String(email).trim().toLowerCase(),
          message: String(message).trim(),
          portfolioName: profile.displayName || profile.slug,
          portfolioSlug: profile.slug,
          inboxUrl: `${clientUrl}/dashboard/messages`,
        });
      } catch (err) {
        console.error('[contact-email] notify failed', err);
      }
    })();

    res.status(201).json({ ok: true });
  } catch (err) {
    sendError(res, err);
  }
});

export default router;
