import { Router } from 'express';
import { Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import {
  PortfolioProfile,
  ProfileContent,
  SiteSettings,
  SkillCategory,
  Experience,
  Project,
  Education,
  Certification,
  ContactMessage,
  MediaAsset,
  ActivityLog,
  PortfolioPageView,
  User,
} from '../models/index.js';
import { AuthRequest, requireAuth, requireProfileAccess } from '../middleware/auth.js';
import {
  cascadeDeleteProfile,
  createEmptyProfileContent,
  duplicateProfileContent,
  getPortfolioAggregateById,
  logActivity,
  toAdminSettingsJson,
} from '../services/portfolio.js';
import { generateSlug, isValidSlug, isReservedSlug, ensureUniqueSlug } from '../utils/slug.js';
import { ownerSlugTaken, publishedSlugTaken } from '../utils/slugAvailability.js';
import { deleteStoredFile, getStorageProvider, storeUpload } from '../services/storage.js';
import { AppError, sendError } from '../utils/errors.js';
import { deleteResumeFile, resolveResumeFilePath, sendResumeFile, getResumeDownloadName } from '../utils/resume.js';
import { extractResumeFromText } from '../services/resumeExtract.js';
import { enhanceSection, type EnhanceSection } from '../services/contentEnhance.js';
import {
  extractRawTextFromResume,
  getResumeExtension,
  isResumeFile,
} from '../services/resumeTextExtract.js';
import {
  applyResumeExtract,
  buildImportSummary,
  hasResumeUndo,
  restoreResumeSnapshot,
  ALL_IMPORT_SECTIONS,
  type ImportSections,
} from '../services/resumeImport.js';
import type { ExtractedResumeData } from '../services/resumeExtract.js';
import {
  FREE_IMPORT_USED_MESSAGE,
  FREE_PUBLISH_MESSAGE,
  getPlanLimits,
  normalizePlanId,
  PORTFOLIO_LIMIT_MESSAGE,
} from '../lib/plans.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

async function getOwnerPlan(req: AuthRequest) {
  if (req.auth?.role !== 'user') {
    return {
      plan: 'premium' as const,
      limits: getPlanLimits('premium'),
      resumeImportUsed: false,
      user: null as InstanceType<typeof User> | null,
    };
  }
  const user = await User.findById(req.auth.id).select('plan resumeImportUsed name email');
  if (!user) throw new AppError('User not found', 401);
  const plan = normalizePlanId(user.plan);
  return { plan, limits: getPlanLimits(plan), resumeImportUsed: !!user.resumeImportUsed, user };
}
const router = Router();
router.use(requireAuth);

function profileFilter(req: AuthRequest, opts?: { includeDeleted?: boolean }) {
  const base =
    req.auth?.role === 'user' ? { ownerId: new Types.ObjectId(req.auth.id) } : ({} as Record<string, unknown>);
  if (opts?.includeDeleted) return base;
  return { ...base, deletedAt: null };
}

const uploadDir = process.env.UPLOAD_DIR || 'uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const diskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});
/** Memory for cloud providers; disk for local STORAGE_PROVIDER */
const upload =
  getStorageProvider() === 'local'
    ? multer({ storage: diskStorage, limits: { fileSize: 10 * 1024 * 1024 } })
    : multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const resumeUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname) || '.pdf';
      cb(null, `resume-${req.params.profileId}-${Date.now()}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (isResumeFile(file.mimetype, file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOCX files are allowed'));
    }
  },
});

const resumeMemoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (isResumeFile(file.mimetype, file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOCX files are allowed'));
    }
  },
});

// --- Profile management ---
router.get('/profiles', async (req: AuthRequest, res) => {
  try {
    const profiles = await PortfolioProfile.find(profileFilter(req)).sort({ updatedAt: -1 });
    res.json(profiles);
  } catch (err) {
    sendError(res, err);
  }
});

router.get('/profiles/bin', async (req: AuthRequest, res) => {
  try {
    const profiles = await PortfolioProfile.find({
      ...profileFilter(req, { includeDeleted: true }),
      deletedAt: { $ne: null },
    }).sort({ deletedAt: -1 });
    res.json(profiles);
  } catch (err) {
    sendError(res, err);
  }
});

router.get('/profiles/check-slug/:slug', async (req: AuthRequest, res) => {
  try {
    const slug = String(req.params.slug);
    const excludeId = typeof req.query.excludeId === 'string' ? req.query.excludeId : undefined;
    const valid = isValidSlug(slug);
    if (!valid) {
      return res.json({
        available: false,
        valid,
        liveTaken: false,
        reserved: isReservedSlug(slug),
      });
    }

    const ownerId = req.auth?.role === 'user' ? req.auth.id : undefined;
    const takenByYou = ownerId ? await ownerSlugTaken(ownerId, slug, excludeId) : false;
    const liveTaken = await publishedSlugTaken(slug, excludeId);

    res.json({
      /** Free to use among this editor’s portfolios */
      available: !takenByYou,
      valid,
      /** Another published portfolio already owns this public URL */
      liveTaken,
    });
  } catch (err) {
    sendError(res, err);
  }
});

router.post('/profiles', async (req: AuthRequest, res) => {
  try {
    const { displayName, slug: customSlug, duplicateFromId } = req.body;
    if (!displayName) return res.status(400).json({ error: 'Display name is required' });

    if (req.auth?.role === 'user') {
      const { plan, limits } = await getOwnerPlan(req);
      const count = await PortfolioProfile.countDocuments({
        ownerId: req.auth.id,
        deletedAt: null,
      });
      if (count >= limits.maxPortfolios) {
        return res.status(403).json({
          error: PORTFOLIO_LIMIT_MESSAGE(limits.maxPortfolios, plan),
          code: 'PLAN_PORTFOLIO_LIMIT',
          plan,
          maxPortfolios: limits.maxPortfolios,
        });
      }
    }

    let slug = customSlug || generateSlug(displayName);
    if (isReservedSlug(slug)) {
      return res.status(400).json({ error: 'That URL is reserved. Choose a different slug.' });
    }
    if (!isValidSlug(slug)) return res.status(400).json({ error: 'Invalid slug format' });

    const ownerId = req.auth?.role === 'user' ? new Types.ObjectId(req.auth.id) : undefined;
    slug = await ensureUniqueSlug(slug, async (s) =>
      ownerId ? ownerSlugTaken(ownerId, s) : publishedSlugTaken(s)
    );

    if (duplicateFromId && req.auth?.role === 'user') {
      const source = await PortfolioProfile.findOne({
        _id: duplicateFromId,
        ownerId: req.auth.id,
        deletedAt: null,
      });
      if (!source) return res.status(403).json({ error: 'Cannot duplicate this profile' });
    }

    const profile = await PortfolioProfile.create({
      displayName,
      slug,
      ownerId,
      isPublished: false,
      isDefault: false,
    });

    if (duplicateFromId) {
      await duplicateProfileContent(duplicateFromId, profile._id);
    } else {
      await createEmptyProfileContent(profile._id);
    }

    await logActivity('create', 'profile', profile._id);
    res.status(201).json(profile);
  } catch (err) {
    sendError(res, err);
  }
});

router.get('/profiles/:profileId', requireProfileAccess, async (req, res) => {
  try {
    const profile = await PortfolioProfile.findById(req.params.profileId);
    res.json(profile);
  } catch (err) {
    sendError(res, err);
  }
});

/** Authenticated draft/live preview — same shape as public portfolio aggregate */
router.get('/profiles/:profileId/preview', requireProfileAccess, async (req, res) => {
  try {
    const data = await getPortfolioAggregateById(String(req.params.profileId));
    if (!data) return res.status(404).json({ error: 'Portfolio not found' });
    res.json(data);
  } catch (err) {
    sendError(res, err);
  }
});

router.put('/profiles/:profileId', requireProfileAccess, async (req, res) => {
  try {
    const { displayName, slug: rawSlug, showInGallery } = req.body as {
      displayName?: string;
      slug?: string;
      showInGallery?: boolean;
    };
    const profile = await PortfolioProfile.findById(req.params.profileId);
    if (!profile || profile.deletedAt) return res.status(404).json({ error: 'Not found' });

    const updates: { displayName?: string; slug?: string; showInGallery?: boolean } = {};
    if (typeof displayName === 'string' && displayName.trim()) {
      updates.displayName = displayName.trim();
    }

    if (typeof showInGallery === 'boolean') {
      if (showInGallery && !profile.isPublished) {
        return res.status(400).json({
          error: 'Publish your folio before listing it in the Examples gallery.',
          code: 'GALLERY_REQUIRES_PUBLISH',
        });
      }
      updates.showInGallery = showInGallery;
    }

    if (typeof rawSlug === 'string') {
      const slug = rawSlug.trim().toLowerCase();
      if (isReservedSlug(slug)) {
        return res.status(400).json({
          error: 'That URL is reserved. Choose a different slug.',
        });
      }
      if (!isValidSlug(slug)) {
        return res.status(400).json({
          error: 'Invalid slug. Use 3–60 characters: lowercase letters, numbers, and hyphens.',
        });
      }
      if (slug !== profile.slug) {
        if (profile.ownerId && (await ownerSlugTaken(profile.ownerId, slug, profile._id))) {
          return res.status(400).json({
            error: 'You already have another portfolio with this URL. Choose a different slug.',
          });
        }
        if (profile.isPublished && (await publishedSlugTaken(slug, profile._id))) {
          return res.status(400).json({
            error: 'That URL is already live on another published portfolio.',
          });
        }
        updates.slug = slug;
      }
    }

    if (!Object.keys(updates).length) {
      return res.status(400).json({ error: 'Nothing to update' });
    }

    Object.assign(profile, updates);
    await profile.save();
    await logActivity('update', 'profile', String(req.params.profileId));
    res.json(profile);
  } catch (err) {
    sendError(res, err);
  }
});

/** Soft-delete: move portfolio to bin (recoverable) */
router.delete('/profiles/:profileId', requireProfileAccess, async (req: AuthRequest, res) => {
  try {
    const profile = await PortfolioProfile.findById(req.params.profileId);
    if (!profile) return res.status(404).json({ error: 'Not found' });
    if (profile.deletedAt) return res.status(400).json({ error: 'Already in bin' });
    if (profile.isDefault && req.auth?.role !== 'platform_admin') {
      return res.status(400).json({ error: 'Cannot delete default profile' });
    }
    profile.deletedAt = new Date();
    profile.isPublished = false;
    profile.showInGallery = false;
    await profile.save();
    await logActivity('bin', 'profile', profile._id);
    res.json({ ok: true, profile });
  } catch (err) {
    sendError(res, err);
  }
});

/** Restore a soft-deleted portfolio from the bin */
router.post('/profiles/:profileId/restore', requireProfileAccess, async (req: AuthRequest, res) => {
  try {
    const profile = await PortfolioProfile.findById(req.params.profileId);
    if (!profile) return res.status(404).json({ error: 'Not found' });
    if (!profile.deletedAt) return res.status(400).json({ error: 'Profile is not in the bin' });
    profile.deletedAt = null;
    await profile.save();
    await logActivity('restore', 'profile', profile._id);
    res.json(profile);
  } catch (err) {
    sendError(res, err);
  }
});

/** Permanently delete a binned portfolio */
router.delete('/profiles/:profileId/permanent', requireProfileAccess, async (req: AuthRequest, res) => {
  try {
    const profile = await PortfolioProfile.findById(req.params.profileId);
    if (!profile) return res.status(404).json({ error: 'Not found' });
    if (!profile.deletedAt) {
      return res.status(400).json({ error: 'Move to bin first before permanent delete' });
    }
    if (profile.isDefault && req.auth?.role !== 'platform_admin') {
      return res.status(400).json({ error: 'Cannot delete default profile' });
    }
    await cascadeDeleteProfile(profile._id);
    await logActivity('delete', 'profile', String(req.params.profileId));
    res.json({ ok: true });
  } catch (err) {
    sendError(res, err);
  }
});

router.patch('/profiles/:profileId/publish', requireProfileAccess, async (req, res) => {
  try {
    const { isPublished } = req.body;
    const profile = await PortfolioProfile.findById(req.params.profileId);
    if (!profile || profile.deletedAt) return res.status(404).json({ error: 'Not found' });

    if (isPublished) {
      const { limits } = await getOwnerPlan(req as AuthRequest);
      if (!limits.canPublish) {
        return res.status(403).json({
          error: FREE_PUBLISH_MESSAGE,
          code: 'PLAN_PUBLISH_LOCKED',
        });
      }
      if (await publishedSlugTaken(profile.slug, profile._id)) {
        return res.status(400).json({
          error:
            'Cannot publish: another portfolio is already live at this URL. Change your slug, then publish.',
        });
      }
    }

    profile.isPublished = !!isPublished;
    if (!isPublished) {
      profile.showInGallery = false;
    }
    await profile.save();
    await logActivity(isPublished ? 'publish' : 'unpublish', 'profile', String(req.params.profileId));
    res.json(profile);
  } catch (err) {
    sendError(res, err);
  }
});

router.patch('/profiles/:profileId/set-default', requireProfileAccess, async (req: AuthRequest, res) => {
  try {
    if (req.auth?.role !== 'platform_admin') {
      return res.status(403).json({ error: 'Only platform admins can set default profile' });
    }
    await PortfolioProfile.updateMany({}, { isDefault: false });
    const profile = await PortfolioProfile.findByIdAndUpdate(
      req.params.profileId,
      { isDefault: true, isPublished: true },
      { new: true }
    );
    res.json(profile);
  } catch (err) {
    sendError(res, err);
  }
});

router.post('/profiles/:profileId/duplicate', requireProfileAccess, async (req: AuthRequest, res) => {
  try {
    const source = await PortfolioProfile.findById(req.params.profileId);
    if (!source || source.deletedAt) return res.status(404).json({ error: 'Source not found' });

    const ownerId =
      req.auth?.role === 'user'
        ? new Types.ObjectId(req.auth.id)
        : source.ownerId;

    const baseSlug = await ensureUniqueSlug(`${source.slug}-copy`, async (s) =>
      ownerId ? ownerSlugTaken(ownerId, s) : publishedSlugTaken(s)
    );

    const profile = await PortfolioProfile.create({
      displayName: `${source.displayName} (Copy)`,
      slug: baseSlug,
      ownerId,
      isPublished: false,
      isDefault: false,
      deletedAt: null,
    });

    await duplicateProfileContent(source._id, profile._id);
    await logActivity('duplicate', 'profile', profile._id);
    res.status(201).json(profile);
  } catch (err) {
    sendError(res, err);
  }
});

// --- Content routes (scoped) ---
function profileId(req: AuthRequest): Types.ObjectId {
  return new Types.ObjectId(String(req.params.profileId));
}

router.get('/profiles/:profileId/content', requireProfileAccess, async (req, res) => {
  try {
    const content = await ProfileContent.findOne({ portfolioProfileId: profileId(req) });
    res.json(content);
  } catch (err) {
    sendError(res, err);
  }
});

router.put('/profiles/:profileId/content', requireProfileAccess, async (req, res) => {
  try {
    const content = await ProfileContent.findOneAndUpdate(
      { portfolioProfileId: profileId(req) },
      req.body,
      { new: true, upsert: true }
    );
    await logActivity('update', 'content', String(req.params.profileId));
    res.json(content);
  } catch (err) {
    sendError(res, err);
  }
});

router.get('/profiles/:profileId/resume', requireProfileAccess, async (req: AuthRequest, res) => {
  try {
    const profile = await PortfolioProfile.findById(req.params.profileId);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

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

router.post(
  '/profiles/:profileId/resume',
  requireProfileAccess,
  resumeUpload.single('file'),
  async (req: AuthRequest, res) => {
    try {
      if (!req.file) throw new AppError('No file uploaded', 400);

      const pid = profileId(req);
      const profile = await PortfolioProfile.findById(pid);
      if (!profile) return res.status(404).json({ error: 'Profile not found' });

      const content = await ProfileContent.findOne({ portfolioProfileId: pid });
      if (content?.resumeUrl) deleteResumeFile(content.resumeUrl);

      const resumeUrl = `/${uploadDir}/${req.file.filename}`;
      const updated = await ProfileContent.findOneAndUpdate(
        { portfolioProfileId: pid },
        { resumeUrl },
        { new: true, upsert: true }
      );

      await logActivity('update', 'resume', String(req.params.profileId));
      res.status(201).json({ resumeUrl: updated?.resumeUrl ?? resumeUrl });
    } catch (err) {
      sendError(res, err);
    }
  }
);

router.delete('/profiles/:profileId/resume', requireProfileAccess, async (req: AuthRequest, res) => {
  try {
    const pid = profileId(req);
    const content = await ProfileContent.findOne({ portfolioProfileId: pid });
    if (!content?.resumeUrl) return res.status(404).json({ error: 'No resume uploaded' });

    deleteResumeFile(content.resumeUrl);
    content.resumeUrl = '';
    await content.save();
    await logActivity('delete', 'resume', String(req.params.profileId));
    res.json({ ok: true });
  } catch (err) {
    sendError(res, err);
  }
});

router.post(
  '/profiles/:profileId/resume/import',
  requireProfileAccess,
  resumeMemoryUpload.single('file'),
  async (req: AuthRequest, res) => {
    try {
      if (!req.file) throw new AppError('No file uploaded', 400);

      const { plan, limits, resumeImportUsed } = await getOwnerPlan(req);
      if (
        Number.isFinite(limits.maxResumeImports) &&
        resumeImportUsed &&
        limits.maxResumeImports <= 1
      ) {
        return res.status(403).json({
          error: FREE_IMPORT_USED_MESSAGE,
          code: 'PLAN_IMPORT_USED',
          plan,
        });
      }

      const pid = profileId(req);
      const profile = await PortfolioProfile.findById(pid);
      if (!profile) return res.status(404).json({ error: 'Profile not found' });

      const rawText = await extractRawTextFromResume(
        req.file.buffer,
        req.file.mimetype,
        req.file.originalname
      );
      console.log(`[resume-import] Extracted ${rawText.length} characters locally`);

      const extracted = await extractResumeFromText(rawText);

      // Keep the previous resume file until apply — cancel must not break downloads.
      const ext = getResumeExtension(req.file.mimetype, req.file.originalname);
      const filename = `resume-${req.params.profileId}-${Date.now()}${ext}`;
      const diskPath = path.join(uploadDir, filename);
      fs.writeFileSync(diskPath, req.file.buffer);
      const resumeUrl = `/${uploadDir}/${filename}`;

      // Preview only — Free import quota is consumed on /apply, not here.
      res.json({
        extracted,
        resumeUrl,
        summary: buildImportSummary(extracted),
        resumeImportUsed: false,
      });
    } catch (err) {
      sendError(res, err);
    }
  }
);

router.post('/profiles/:profileId/resume/import/apply', requireProfileAccess, async (req: AuthRequest, res) => {
  try {
    const { plan, limits, resumeImportUsed, user } = await getOwnerPlan(req);
    if (
      Number.isFinite(limits.maxResumeImports) &&
      resumeImportUsed &&
      limits.maxResumeImports <= 1
    ) {
      return res.status(403).json({
        error: FREE_IMPORT_USED_MESSAGE,
        code: 'PLAN_IMPORT_USED',
        plan,
      });
    }

    const body = req.body || {};
    const extracted = body.extracted as ExtractedResumeData | undefined;
    const resumeUrl = typeof body.resumeUrl === 'string' ? body.resumeUrl : undefined;
    if (!extracted?.content) throw new AppError('Missing extracted resume data', 400);

    const sectionsRaw = body.sections as Partial<ImportSections> | undefined;
    const sections: ImportSections = {
      ...ALL_IMPORT_SECTIONS,
      ...(sectionsRaw || {}),
    };

    const pid = profileId(req);
    const existing = await ProfileContent.findOne({ portfolioProfileId: pid });
    const previousResumeUrl = existing?.resumeUrl || '';

    const { content, summary } = await applyResumeExtract(pid, extracted, resumeUrl, sections);

    if (resumeUrl && previousResumeUrl && previousResumeUrl !== resumeUrl) {
      deleteResumeFile(previousResumeUrl);
    }

    if (user && Number.isFinite(limits.maxResumeImports)) {
      user.resumeImportUsed = true;
      await user.save();
    }

    res.json({
      content,
      summary,
      resumeUrl:
        resumeUrl ||
        (content && typeof content === 'object' && 'resumeUrl' in content
          ? String((content as { resumeUrl?: string }).resumeUrl || '')
          : ''),
      resumeImportUsed: Boolean(user && Number.isFinite(limits.maxResumeImports)),
      canUndo: true,
    });
  } catch (err) {
    sendError(res, err);
  }
});

router.get('/profiles/:profileId/resume/import/undo', requireProfileAccess, async (req, res) => {
  try {
    const pid = profileId(req);
    const available = await hasResumeUndo(pid);
    res.json({ available });
  } catch (err) {
    sendError(res, err);
  }
});

router.post('/profiles/:profileId/resume/import/undo', requireProfileAccess, async (req, res) => {
  try {
    const pid = profileId(req);
    const available = await hasResumeUndo(pid);
    if (!available) throw new AppError('Nothing to undo', 404);
    const { content } = await restoreResumeSnapshot(pid);
    res.json({ ok: true, content, canUndo: false });
  } catch (err) {
    sendError(res, err);
  }
});

router.post('/profiles/:profileId/ai/enhance', requireProfileAccess, async (req, res) => {
  try {
    const { section, context } = req.body as {
      section: EnhanceSection;
      context?: Record<string, unknown>;
    };
    if (!section) return res.status(400).json({ error: 'Section is required' });

    const valid: EnhanceSection[] = [
      'tagline',
      'bio',
      'title',
      'educationHighlight',
      'metaDescription',
      'experienceBullets',
      'projectDescription',
    ];
    if (!valid.includes(section)) {
      return res.status(400).json({ error: 'Invalid section' });
    }

    const result = await enhanceSection(section, context || {});
    await logActivity('enhance', `ai-${section}`, String(req.params.profileId));
    res.json({ result });
  } catch (err) {
    sendError(res, err);
  }
});

router.get('/profiles/:profileId/settings', requireProfileAccess, async (req, res) => {
  try {
    const settings = await SiteSettings.findOne({ portfolioProfileId: profileId(req) });
    res.json(toAdminSettingsJson(settings));
  } catch (err) {
    sendError(res, err);
  }
});

router.put('/profiles/:profileId/settings', requireProfileAccess, async (req, res) => {
  try {
    const body = { ...(req.body || {}) } as Record<string, unknown>;
    const rawCode = typeof body.accessCode === 'string' ? body.accessCode.trim() : '';
    delete body.accessCode;
    delete body.accessCodeHash;
    delete body.accessCodeSet;

    const existing = await SiteSettings.findOne({ portfolioProfileId: profileId(req) }).select(
      'accessCodeHash accessLockEnabled'
    );

    if (rawCode) {
      body.accessCodeHash = await bcrypt.hash(rawCode, 12);
    }

    const enablingLock = body.accessLockEnabled === true;
    const willHaveHash = Boolean(rawCode || existing?.accessCodeHash);
    if (enablingLock && !willHaveHash) {
      return res.status(400).json({ error: 'Set an access code before enabling the portfolio lock' });
    }

    const settings = await SiteSettings.findOneAndUpdate(
      { portfolioProfileId: profileId(req) },
      body,
      { new: true, upsert: true }
    );
    await logActivity('update', 'settings', String(req.params.profileId));
    res.json(toAdminSettingsJson(settings));
  } catch (err) {
    sendError(res, err);
  }
});

// Skills
router.get('/profiles/:profileId/skills', requireProfileAccess, async (req, res) => {
  try {
    const skills = await SkillCategory.find({ portfolioProfileId: profileId(req) }).sort({ order: 1 });
    res.json(skills);
  } catch (err) {
    sendError(res, err);
  }
});

router.post('/profiles/:profileId/skills', requireProfileAccess, async (req, res) => {
  try {
    const skill = await SkillCategory.create({ ...req.body, portfolioProfileId: profileId(req) });
    res.status(201).json(skill);
  } catch (err) {
    sendError(res, err);
  }
});

router.put('/profiles/:profileId/skills/reorder', requireProfileAccess, async (req, res) => {
  try {
    const { orderedIds } = req.body as { orderedIds?: string[] };
    if (!Array.isArray(orderedIds) || !orderedIds.length) {
      return res.status(400).json({ error: 'orderedIds array is required' });
    }
    const pid = profileId(req);
    await Promise.all(
      orderedIds.map((id, index) =>
        SkillCategory.updateOne({ _id: id, portfolioProfileId: pid }, { order: index })
      )
    );
    const skills = await SkillCategory.find({ portfolioProfileId: pid }).sort({ order: 1 });
    res.json(skills);
  } catch (err) {
    sendError(res, err);
  }
});

router.put('/profiles/:profileId/skills/:id', requireProfileAccess, async (req, res) => {
  try {
    const skill = await SkillCategory.findOneAndUpdate(
      { _id: req.params.id, portfolioProfileId: profileId(req) },
      req.body,
      { new: true }
    );
    if (!skill) return res.status(404).json({ error: 'Not found' });
    res.json(skill);
  } catch (err) {
    sendError(res, err);
  }
});

router.delete('/profiles/:profileId/skills/:id', requireProfileAccess, async (req, res) => {
  try {
    await SkillCategory.deleteOne({ _id: req.params.id, portfolioProfileId: profileId(req) });
    res.json({ ok: true });
  } catch (err) {
    sendError(res, err);
  }
});

// Experience
router.get('/profiles/:profileId/experience', requireProfileAccess, async (req, res) => {
  try {
    const items = await Experience.find({ portfolioProfileId: profileId(req) }).sort({ order: 1 });
    res.json(items);
  } catch (err) {
    sendError(res, err);
  }
});

router.post('/profiles/:profileId/experience', requireProfileAccess, async (req, res) => {
  try {
    const item = await Experience.create({ ...req.body, portfolioProfileId: profileId(req) });
    res.status(201).json(item);
  } catch (err) {
    sendError(res, err);
  }
});

router.put('/profiles/:profileId/experience/reorder', requireProfileAccess, async (req, res) => {
  try {
    const { orderedIds } = req.body as { orderedIds?: string[] };
    if (!Array.isArray(orderedIds) || !orderedIds.length) {
      return res.status(400).json({ error: 'orderedIds array is required' });
    }
    const pid = profileId(req);
    await Promise.all(
      orderedIds.map((id, index) =>
        Experience.updateOne({ _id: id, portfolioProfileId: pid }, { order: index })
      )
    );
    const items = await Experience.find({ portfolioProfileId: pid }).sort({ order: 1 });
    res.json(items);
  } catch (err) {
    sendError(res, err);
  }
});

router.put('/profiles/:profileId/experience/:id', requireProfileAccess, async (req, res) => {
  try {
    const item = await Experience.findOneAndUpdate(
      { _id: req.params.id, portfolioProfileId: profileId(req) },
      req.body,
      { new: true }
    );
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) {
    sendError(res, err);
  }
});

router.delete('/profiles/:profileId/experience/:id', requireProfileAccess, async (req, res) => {
  try {
    await Experience.deleteOne({ _id: req.params.id, portfolioProfileId: profileId(req) });
    res.json({ ok: true });
  } catch (err) {
    sendError(res, err);
  }
});

// Projects
router.get('/profiles/:profileId/projects', requireProfileAccess, async (req, res) => {
  try {
    const items = await Project.find({ portfolioProfileId: profileId(req) }).sort({ order: 1 });
    res.json(items);
  } catch (err) {
    sendError(res, err);
  }
});

router.post('/profiles/:profileId/projects', requireProfileAccess, async (req, res) => {
  try {
    const item = await Project.create({ ...req.body, portfolioProfileId: profileId(req) });
    res.status(201).json(item);
  } catch (err) {
    sendError(res, err);
  }
});

router.put('/profiles/:profileId/projects/reorder', requireProfileAccess, async (req, res) => {
  try {
    const { orderedIds } = req.body as { orderedIds?: string[] };
    if (!Array.isArray(orderedIds) || !orderedIds.length) {
      return res.status(400).json({ error: 'orderedIds array is required' });
    }
    const pid = profileId(req);
    await Promise.all(
      orderedIds.map((id, index) =>
        Project.updateOne({ _id: id, portfolioProfileId: pid }, { order: index })
      )
    );
    const items = await Project.find({ portfolioProfileId: pid }).sort({ order: 1 });
    res.json(items);
  } catch (err) {
    sendError(res, err);
  }
});

router.put('/profiles/:profileId/projects/:id', requireProfileAccess, async (req, res) => {
  try {
    const item = await Project.findOneAndUpdate(
      { _id: req.params.id, portfolioProfileId: profileId(req) },
      req.body,
      { new: true }
    );
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) {
    sendError(res, err);
  }
});

router.delete('/profiles/:profileId/projects/:id', requireProfileAccess, async (req, res) => {
  try {
    await Project.deleteOne({ _id: req.params.id, portfolioProfileId: profileId(req) });
    res.json({ ok: true });
  } catch (err) {
    sendError(res, err);
  }
});

// Education
router.get('/profiles/:profileId/education', requireProfileAccess, async (req, res) => {
  try {
    const items = await Education.find({ portfolioProfileId: profileId(req) }).sort({ order: 1 });
    res.json(items);
  } catch (err) {
    sendError(res, err);
  }
});

router.post('/profiles/:profileId/education', requireProfileAccess, async (req, res) => {
  try {
    const item = await Education.create({ ...req.body, portfolioProfileId: profileId(req) });
    res.status(201).json(item);
  } catch (err) {
    sendError(res, err);
  }
});

router.put('/profiles/:profileId/education/:id', requireProfileAccess, async (req, res) => {
  try {
    const item = await Education.findOneAndUpdate(
      { _id: req.params.id, portfolioProfileId: profileId(req) },
      req.body,
      { new: true }
    );
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) {
    sendError(res, err);
  }
});

router.delete('/profiles/:profileId/education/:id', requireProfileAccess, async (req, res) => {
  try {
    await Education.deleteOne({ _id: req.params.id, portfolioProfileId: profileId(req) });
    res.json({ ok: true });
  } catch (err) {
    sendError(res, err);
  }
});

// Certifications
router.get('/profiles/:profileId/certifications', requireProfileAccess, async (req, res) => {
  try {
    const items = await Certification.find({ portfolioProfileId: profileId(req) }).sort({ order: 1 });
    res.json(items);
  } catch (err) {
    sendError(res, err);
  }
});

router.post('/profiles/:profileId/certifications', requireProfileAccess, async (req, res) => {
  try {
    const item = await Certification.create({ ...req.body, portfolioProfileId: profileId(req) });
    res.status(201).json(item);
  } catch (err) {
    sendError(res, err);
  }
});

router.put('/profiles/:profileId/certifications/:id', requireProfileAccess, async (req, res) => {
  try {
    const item = await Certification.findOneAndUpdate(
      { _id: req.params.id, portfolioProfileId: profileId(req) },
      req.body,
      { new: true }
    );
    if (!item) return res.status(404).json({ error: 'Not found' });
    res.json(item);
  } catch (err) {
    sendError(res, err);
  }
});

router.delete('/profiles/:profileId/certifications/:id', requireProfileAccess, async (req, res) => {
  try {
    await Certification.deleteOne({ _id: req.params.id, portfolioProfileId: profileId(req) });
    res.json({ ok: true });
  } catch (err) {
    sendError(res, err);
  }
});

// Contact messages
router.get('/profiles/:profileId/contact-messages/unread-count', requireProfileAccess, async (req, res) => {
  try {
    const count = await ContactMessage.countDocuments({
      portfolioProfileId: profileId(req),
      read: false,
      archived: { $ne: true },
    });
    res.json({ count });
  } catch (err) {
    sendError(res, err);
  }
});

router.get('/profiles/:profileId/contact-messages', requireProfileAccess, async (req, res) => {
  try {
    const messages = await ContactMessage.find({ portfolioProfileId: profileId(req) })
      .sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    sendError(res, err);
  }
});

/** Update all messages in a conversation (same email). */
router.patch('/profiles/:profileId/contact-conversations', requireProfileAccess, async (req, res) => {
  try {
    const pid = profileId(req);
    const email = String(req.body?.email || '').trim().toLowerCase();
    if (!email) return res.status(400).json({ error: 'email is required' });

    const updates: Record<string, unknown> = {};
    if (typeof req.body.read === 'boolean') updates.read = req.body.read;
    if (typeof req.body.archived === 'boolean') updates.archived = req.body.archived;
    if (typeof req.body.contacted === 'boolean') updates.contacted = req.body.contacted;

    if (typeof req.body.pinned === 'boolean') {
      if (req.body.pinned) {
        const pinnedEmails = await ContactMessage.distinct('email', {
          portfolioProfileId: pid,
          pinned: true,
          archived: { $ne: true },
        });
        const normalized = pinnedEmails.map((e) => String(e).toLowerCase());
        if (!normalized.includes(email) && normalized.length >= 3) {
          return res.status(400).json({ error: 'You can pin up to 3 chats' });
        }
        updates.pinned = true;
        updates.pinnedAt = new Date();
      } else {
        updates.pinned = false;
        updates.pinnedAt = null;
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    // Match email case-insensitively
    const result = await ContactMessage.updateMany(
      {
        portfolioProfileId: pid,
        email: { $regex: new RegExp(`^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
      },
      { $set: updates }
    );

    const messages = await ContactMessage.find({ portfolioProfileId: pid }).sort({ createdAt: -1 });
    res.json({ modified: result.modifiedCount, messages });
  } catch (err) {
    sendError(res, err);
  }
});

router.patch('/profiles/:profileId/contact-messages/:id', requireProfileAccess, async (req, res) => {
  try {
    const allowed: Record<string, unknown> = {};
    if (typeof req.body.read === 'boolean') allowed.read = req.body.read;
    if (typeof req.body.archived === 'boolean') allowed.archived = req.body.archived;
    if (typeof req.body.contacted === 'boolean') allowed.contacted = req.body.contacted;
    if (typeof req.body.pinned === 'boolean') {
      allowed.pinned = req.body.pinned;
      allowed.pinnedAt = req.body.pinned ? new Date() : null;
    }

    const message = await ContactMessage.findOneAndUpdate(
      { _id: req.params.id, portfolioProfileId: profileId(req) },
      { $set: allowed },
      { new: true }
    );
    if (!message) return res.status(404).json({ error: 'Not found' });
    res.json(message);
  } catch (err) {
    sendError(res, err);
  }
});

// Media
router.get('/profiles/:profileId/media', requireProfileAccess, async (req, res) => {
  try {
    const media = await MediaAsset.find({ portfolioProfileId: profileId(req) }).sort({ uploadedAt: -1 });
    res.json(media);
  } catch (err) {
    sendError(res, err);
  }
});

router.post('/profiles/:profileId/media/upload', requireProfileAccess, upload.single('file'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) throw new AppError('No file uploaded', 400);
    const stored = await storeUpload(req.file);
    const asset = await MediaAsset.create({
      portfolioProfileId: profileId(req),
      filename: stored.filename,
      url: stored.url,
      mimeType: stored.mimeType,
      size: stored.size,
      provider: stored.provider,
      storageKey: stored.storageKey,
    });
    res.status(201).json(asset);
  } catch (err) {
    sendError(res, err);
  }
});

router.delete('/profiles/:profileId/media/:id', requireProfileAccess, async (req, res) => {
  try {
    const asset = await MediaAsset.findOne({ _id: req.params.id, portfolioProfileId: profileId(req) });
    if (!asset) return res.status(404).json({ error: 'Not found' });
    await deleteStoredFile(asset);
    await MediaAsset.deleteOne({ _id: asset._id });
    res.json({ ok: true });
  } catch (err) {
    sendError(res, err);
  }
});

// Dashboard stats + publish readiness
router.get('/profiles/:profileId/dashboard', requireProfileAccess, async (req, res) => {
  try {
    const pid = profileId(req);
    const pidObj = new Types.ObjectId(pid);
    const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [
      projects,
      experiences,
      skills,
      education,
      certifications,
      messages,
      activity,
      content,
      profile,
      viewsLast7Days,
      viewsByDayRaw,
    ] = await Promise.all([
      Project.countDocuments({ portfolioProfileId: pid }),
      Experience.countDocuments({ portfolioProfileId: pid }),
      SkillCategory.countDocuments({ portfolioProfileId: pid }),
      Education.countDocuments({ portfolioProfileId: pid }),
      Certification.countDocuments({ portfolioProfileId: pid }),
      ContactMessage.countDocuments({ portfolioProfileId: pid, read: false }),
      ActivityLog.find({ portfolioProfileId: pid }).sort({ timestamp: -1 }).limit(10),
      ProfileContent.findOne({ portfolioProfileId: pid }).select(
        'resumeUrl profileImageUrl bio tagline name title'
      ),
      PortfolioProfile.findById(pid),
      PortfolioPageView.countDocuments({
        portfolioProfileId: pidObj,
        createdAt: { $gte: since7d },
      }),
      PortfolioPageView.aggregate<{ _id: string; count: number }>([
        { $match: { portfolioProfileId: pidObj, createdAt: { $gte: since7d } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    if (!profile || profile.deletedAt) {
      return res.status(404).json({ error: 'Not found' });
    }

    const countByDay = new Map(viewsByDayRaw.map((r) => [r._id, r.count]));
    const viewsByDay: { date: string; count: number }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i));
      const key = d.toISOString().slice(0, 10);
      viewsByDay.push({ date: key, count: countByDay.get(key) ?? 0 });
    }

    const hasResume = !!content?.resumeUrl;
    const hasProfileImage = !!content?.profileImageUrl;
    const hasBio = !!(content?.bio?.trim() || content?.tagline?.trim());
    const hasBasics = !!(content?.name?.trim() || content?.title?.trim());

    res.json({
      projects,
      experiences,
      skills,
      education,
      certifications,
      unreadMessages: messages,
      viewsLast7Days,
      viewsByDay,
      lastUpdated: profile.updatedAt,
      activity,
      isPublished: !!profile.isPublished,
      slug: profile.slug,
      displayName: profile.displayName,
      readiness: {
        hasBasics,
        hasBio,
        hasProfileImage,
        hasResume,
        hasSkills: skills > 0,
        hasExperience: experiences > 0,
        hasProjects: projects > 0,
        hasEducation: education > 0,
      },
    });
  } catch (err) {
    sendError(res, err);
  }
});

export default router;
