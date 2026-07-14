import { Types } from 'mongoose';
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
} from '../models/index.js';

export async function logActivity(
  action: string,
  entity: string,
  portfolioProfileId?: Types.ObjectId | string,
  entityId?: string
) {
  await ActivityLog.create({
    portfolioProfileId: portfolioProfileId ? new Types.ObjectId(portfolioProfileId) : undefined,
    action,
    entity,
    entityId,
  });
}

export async function cascadeDeleteProfile(profileId: Types.ObjectId | string) {
  const id = new Types.ObjectId(profileId);
  await Promise.all([
    ProfileContent.deleteMany({ portfolioProfileId: id }),
    SiteSettings.deleteMany({ portfolioProfileId: id }),
    SkillCategory.deleteMany({ portfolioProfileId: id }),
    Experience.deleteMany({ portfolioProfileId: id }),
    Project.deleteMany({ portfolioProfileId: id }),
    Education.deleteMany({ portfolioProfileId: id }),
    Certification.deleteMany({ portfolioProfileId: id }),
    ContactMessage.deleteMany({ portfolioProfileId: id }),
    MediaAsset.deleteMany({ portfolioProfileId: id }),
    ActivityLog.deleteMany({ portfolioProfileId: id }),
    PortfolioProfile.deleteOne({ _id: id }),
  ]);
}

async function buildPortfolioAggregate(profile: {
  _id: Types.ObjectId;
  slug: string;
  displayName: string;
  isPublished: boolean;
  isDefault: boolean;
  updatedAt: Date;
}) {
  const profileId = profile._id;
  const [content, settings, skills, experiences, projects, education, certifications] = await Promise.all([
    ProfileContent.findOne({ portfolioProfileId: profileId }),
    SiteSettings.findOne({ portfolioProfileId: profileId }),
    SkillCategory.find({ portfolioProfileId: profileId }).sort({ order: 1 }),
    Experience.find({ portfolioProfileId: profileId }).sort({ order: 1 }),
    Project.find({ portfolioProfileId: profileId }).sort({ order: 1 }),
    Education.find({ portfolioProfileId: profileId }).sort({ order: 1 }),
    Certification.find({ portfolioProfileId: profileId }).sort({ order: 1 }),
  ]);

  const sectionVisibility =
    settings?.sectionVisibility instanceof Map
      ? Object.fromEntries(settings.sectionVisibility)
      : (settings?.sectionVisibility as Record<string, boolean> | undefined) ?? {};

  return {
    profile: {
      id: profile._id.toString(),
      slug: profile.slug,
      displayName: profile.displayName,
      isPublished: profile.isPublished,
      isDefault: profile.isDefault,
      updatedAt: profile.updatedAt,
    },
    content: content?.toObject() ?? null,
    settings: settings
      ? {
          ...settings.toObject(),
          sectionVisibility,
        }
      : null,
    skills: skills.map((s) => s.toObject()),
    experiences: experiences.map((e) => e.toObject()),
    projects: projects.map((p) => p.toObject()),
    education: education.map((e) => e.toObject()),
    certifications: certifications.map((c) => c.toObject()),
  };
}

/** Public site — published portfolios only */
export async function getPortfolioAggregate(slug: string) {
  const profile = await PortfolioProfile.findOne({
    slug,
    isPublished: true,
    deletedAt: null,
  });
  if (!profile) return null;
  return buildPortfolioAggregate(profile);
}

/** Owner/editor preview — works for drafts and published */
export async function getPortfolioAggregateById(profileId: string | Types.ObjectId) {
  const profile = await PortfolioProfile.findOne({
    _id: profileId,
    deletedAt: null,
  });
  if (!profile) return null;
  return buildPortfolioAggregate(profile);
}

export async function duplicateProfileContent(
  sourceProfileId: Types.ObjectId | string,
  targetProfileId: Types.ObjectId | string
) {
  const sourceId = new Types.ObjectId(sourceProfileId);
  const targetId = new Types.ObjectId(targetProfileId);

  const content = await ProfileContent.findOne({ portfolioProfileId: sourceId });
  if (content) {
    const { _id, portfolioProfileId, ...data } = content.toObject();
    await ProfileContent.create({ ...data, portfolioProfileId: targetId });
  }

  const settings = await SiteSettings.findOne({ portfolioProfileId: sourceId });
  if (settings) {
    const { _id, portfolioProfileId, ...data } = settings.toObject();
    await SiteSettings.create({ ...data, portfolioProfileId: targetId });
  }

  const skills = await SkillCategory.find({ portfolioProfileId: sourceId });
  for (const skill of skills) {
    const { _id, portfolioProfileId, ...data } = skill.toObject();
    await SkillCategory.create({ ...data, portfolioProfileId: targetId });
  }

  const experiences = await Experience.find({ portfolioProfileId: sourceId });
  for (const exp of experiences) {
    const { _id, portfolioProfileId, ...data } = exp.toObject();
    await Experience.create({ ...data, portfolioProfileId: targetId });
  }

  const projects = await Project.find({ portfolioProfileId: sourceId });
  for (const proj of projects) {
    const { _id, portfolioProfileId, ...data } = proj.toObject();
    await Project.create({ ...data, portfolioProfileId: targetId });
  }

  const education = await Education.find({ portfolioProfileId: sourceId });
  for (const edu of education) {
    const { _id, portfolioProfileId, ...data } = edu.toObject();
    await Education.create({ ...data, portfolioProfileId: targetId });
  }

  const certifications = await Certification.find({ portfolioProfileId: sourceId });
  for (const cert of certifications) {
    const { _id, portfolioProfileId, ...data } = cert.toObject();
    await Certification.create({ ...data, portfolioProfileId: targetId });
  }
}

export async function createEmptyProfileContent(profileId: Types.ObjectId | string) {
  await ProfileContent.create({ portfolioProfileId: profileId });
  await SiteSettings.create({ portfolioProfileId: profileId });
}
