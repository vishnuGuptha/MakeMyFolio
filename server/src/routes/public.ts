import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { PortfolioProfile, ContactMessage, ProfileContent } from '../models/index.js';
import { getPortfolioAggregate } from '../services/portfolio.js';
import { getTryDemoSeed } from '../services/tryDemoSeed.js';
import { sendError } from '../utils/errors.js';
import { resolveResumeFilePath, sendResumeFile, getResumeDownloadName } from '../utils/resume.js';

const router = Router();

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

router.get('/portfolio/:slug', async (req, res) => {
  try {
    const data = await getPortfolioAggregate(req.params.slug);
    if (!data) return res.status(404).json({ error: 'Portfolio not found or unpublished' });
    res.json(data);
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

    res.status(201).json({ ok: true });
  } catch (err) {
    sendError(res, err);
  }
});

export default router;
