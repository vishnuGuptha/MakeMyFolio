import { Router } from 'express';
import { User, PortfolioProfile, ContactMessage, ActivityLog } from '../models/index.js';
import { requirePlatformAdmin } from '../middleware/auth.js';
import { sendError } from '../utils/errors.js';
import { cascadeDeleteProfile } from '../services/portfolio.js';
import { publishedSlugTaken } from '../utils/slugAvailability.js';
import {
  getTryDemoSeed,
  normalizeTryDemoSeedBody,
  resetTryDemoSeed,
  saveTryDemoSeed,
} from '../services/tryDemoSeed.js';
import { normalizePlanId } from '../lib/plans.js';

const router = Router();
router.use(requirePlatformAdmin);

router.get('/try-demo', async (_req, res) => {
  try {
    const seed = await getTryDemoSeed();
    res.json(seed);
  } catch (err) {
    sendError(res, err);
  }
});

router.put('/try-demo', async (req, res) => {
  try {
    const payload = normalizeTryDemoSeedBody(req.body);
    if (!payload) {
      return res.status(400).json({ error: 'Invalid try demo seed payload' });
    }
    const seed = await saveTryDemoSeed(payload);
    await ActivityLog.create({
      action: 'update',
      entity: 'try-demo-seed',
    });
    res.json(seed);
  } catch (err) {
    sendError(res, err);
  }
});

router.post('/try-demo/reset', async (_req, res) => {
  try {
    const seed = await resetTryDemoSeed();
    await ActivityLog.create({
      action: 'reset',
      entity: 'try-demo-seed',
    });
    res.json(seed);
  } catch (err) {
    sendError(res, err);
  }
});

router.get('/dashboard', async (_req, res) => {
  try {
    const [totalUsers, totalProfiles, publishedProfiles, unreadMessages, recentUsers] = await Promise.all([
      User.countDocuments(),
      PortfolioProfile.countDocuments(),
      PortfolioProfile.countDocuments({ isPublished: true }),
      ContactMessage.countDocuments({ read: false }),
      User.find().sort({ createdAt: -1 }).limit(10).select('name email createdAt'),
    ]);

    const recentProfiles = await PortfolioProfile.find()
      .sort({ updatedAt: -1 })
      .limit(10)
      .populate('ownerId', 'name email');

    res.json({
      totalUsers,
      totalProfiles,
      publishedProfiles,
      unreadMessages,
      recentUsers,
      recentProfiles,
    });
  } catch (err) {
    sendError(res, err);
  }
});

router.get('/users', async (_req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    const profiles = await PortfolioProfile.find().select('ownerId slug displayName isPublished updatedAt');

    const result = users.map((user) => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      plan: normalizePlanId(user.plan),
      planBilling: user.planBilling ?? null,
      planCurrency: user.planCurrency ?? null,
      planActivatedAt: user.planActivatedAt ?? null,
      createdAt: user.createdAt,
      portfolios: profiles
        .filter((p) => p.ownerId?.toString() === user._id.toString())
        .map((p) => ({
          _id: p._id,
          slug: p.slug,
          displayName: p.displayName,
          isPublished: p.isPublished,
          updatedAt: p.updatedAt,
        })),
    }));

    res.json(result);
  } catch (err) {
    sendError(res, err);
  }
});

router.patch('/users/:userId/plan', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const planRaw = typeof req.body?.plan === 'string' ? req.body.plan : '';
    if (planRaw !== 'free' && planRaw !== 'pro' && planRaw !== 'premium') {
      return res.status(400).json({ error: 'Plan must be free, pro, or premium' });
    }
    const plan = planRaw;

    const billingRaw = req.body?.planBilling;
    const currencyRaw = req.body?.planCurrency;

    let planBilling: 'monthly' | 'yearly' | null = null;
    let planCurrency: 'usd' | 'inr' | null = null;
    let planActivatedAt: Date | null = null;

    if (plan === 'free') {
      planBilling = null;
      planCurrency = null;
      planActivatedAt = null;
    } else {
      if (billingRaw !== 'monthly' && billingRaw !== 'yearly') {
        return res.status(400).json({ error: 'planBilling must be monthly or yearly' });
      }
      planBilling = billingRaw;
      if (currencyRaw === 'usd' || currencyRaw === 'inr') {
        planCurrency = currencyRaw;
      } else if (user.planCurrency === 'usd' || user.planCurrency === 'inr') {
        planCurrency = user.planCurrency;
      } else {
        planCurrency = 'inr';
      }
      planActivatedAt = new Date();
    }

    user.plan = plan;
    user.planBilling = planBilling;
    user.planCurrency = planCurrency;
    user.planActivatedAt = planActivatedAt;
    await user.save();

    await ActivityLog.create({
      action: 'update',
      entity: 'user-plan',
      entityId: `${user._id.toString()}:${plan}:${planBilling ?? 'none'}`,
    });

    res.json({
      _id: user._id,
      plan,
      planBilling,
      planCurrency,
      planActivatedAt,
    });
  } catch (err) {
    sendError(res, err);
  }
});

router.get('/profiles', async (_req, res) => {
  try {
    const profiles = await PortfolioProfile.find().sort({ updatedAt: -1 });
    const users = await User.find().select('name email');
    const userMap = Object.fromEntries(users.map((u) => [u._id.toString(), u]));

    res.json(
      profiles.map((p) => ({
        ...p.toObject(),
        owner: p.ownerId ? userMap[p.ownerId.toString()] : null,
      }))
    );
  } catch (err) {
    sendError(res, err);
  }
});

router.patch('/profiles/:profileId/publish', async (req, res) => {
  try {
    const { isPublished } = req.body;
    const profile = await PortfolioProfile.findById(req.params.profileId);
    if (!profile || profile.deletedAt) return res.status(404).json({ error: 'Not found' });

    if (isPublished && (await publishedSlugTaken(profile.slug, profile._id))) {
      return res.status(400).json({
        error: 'Cannot publish: another portfolio is already live at this URL.',
      });
    }

    profile.isPublished = !!isPublished;
    await profile.save();
    await ActivityLog.create({
      portfolioProfileId: profile._id,
      action: isPublished ? 'publish' : 'unpublish',
      entity: 'profile',
    });
    res.json(profile);
  } catch (err) {
    sendError(res, err);
  }
});

router.delete('/users/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const profiles = await PortfolioProfile.find({ ownerId: user._id });
    for (const profile of profiles) {
      if (!profile.isDefault) await cascadeDeleteProfile(profile._id);
    }
    await User.deleteOne({ _id: user._id });
    res.json({ ok: true });
  } catch (err) {
    sendError(res, err);
  }
});

router.get('/activity', async (_req, res) => {
  try {
    const activity = await ActivityLog.find().sort({ timestamp: -1 }).limit(50);
    res.json(activity);
  } catch (err) {
    sendError(res, err);
  }
});

export default router;
