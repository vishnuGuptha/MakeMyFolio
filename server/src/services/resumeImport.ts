import { Types } from 'mongoose';
import mongoose, { Schema, Document } from 'mongoose';
import {
  PortfolioProfile,
  ProfileContent,
  SkillCategory,
  Experience,
  Project,
  Education,
  Certification,
} from '../models/index.js';
import { logActivity } from './portfolio.js';
import type { ExtractedResumeData } from './resumeExtract.js';
import { AppError } from '../utils/errors.js';

export interface ImportSummary {
  displayName: string;
  skills: number;
  experiences: number;
  projects: number;
  education: number;
  certifications: number;
}

export type ImportSections = {
  content: boolean;
  skills: boolean;
  experiences: boolean;
  projects: boolean;
  education: boolean;
  certifications: boolean;
};

export const ALL_IMPORT_SECTIONS: ImportSections = {
  content: true,
  skills: true,
  experiences: true,
  projects: true,
  education: true,
  certifications: true,
};

export type ResumeSnapshotData = {
  displayName: string;
  content: Record<string, unknown> | null;
  skills: Record<string, unknown>[];
  experiences: Record<string, unknown>[];
  projects: Record<string, unknown>[];
  education: Record<string, unknown>[];
  certifications: Record<string, unknown>[];
};

interface IResumeImportSnapshot extends Document {
  portfolioProfileId: Types.ObjectId;
  data: ResumeSnapshotData;
  createdAt: Date;
  updatedAt: Date;
}

const resumeImportSnapshotSchema = new Schema<IResumeImportSnapshot>(
  {
    portfolioProfileId: {
      type: Schema.Types.ObjectId,
      ref: 'PortfolioProfile',
      required: true,
      unique: true,
      index: true,
    },
    data: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

export const ResumeImportSnapshot = mongoose.model<IResumeImportSnapshot>(
  'ResumeImportSnapshot',
  resumeImportSnapshotSchema
);

function stripDoc<T extends Record<string, unknown>>(doc: T | null | undefined): Record<string, unknown> | null {
  if (!doc) return null;
  const { _id, __v, portfolioProfileId, createdAt, updatedAt, ...rest } = doc as Record<string, unknown>;
  return rest;
}

export async function captureResumeSnapshot(profileId: Types.ObjectId): Promise<void> {
  const profile = await PortfolioProfile.findById(profileId).lean();
  const content = await ProfileContent.findOne({ portfolioProfileId: profileId }).lean();
  const skills = await SkillCategory.find({ portfolioProfileId: profileId }).lean();
  const experiences = await Experience.find({ portfolioProfileId: profileId }).lean();
  const projects = await Project.find({ portfolioProfileId: profileId }).lean();
  const education = await Education.find({ portfolioProfileId: profileId }).lean();
  const certifications = await Certification.find({ portfolioProfileId: profileId }).lean();

  const data: ResumeSnapshotData = {
    displayName: profile?.displayName || '',
    content: content
      ? (stripDoc(content as unknown as Record<string, unknown>) as Record<string, unknown>)
      : null,
    skills: skills.map((s) => stripDoc(s as unknown as Record<string, unknown>)!).filter(Boolean),
    experiences: experiences
      .map((s) => stripDoc(s as unknown as Record<string, unknown>)!)
      .filter(Boolean),
    projects: projects.map((s) => stripDoc(s as unknown as Record<string, unknown>)!).filter(Boolean),
    education: education.map((s) => stripDoc(s as unknown as Record<string, unknown>)!).filter(Boolean),
    certifications: certifications
      .map((s) => stripDoc(s as unknown as Record<string, unknown>)!)
      .filter(Boolean),
  };

  await ResumeImportSnapshot.findOneAndUpdate(
    { portfolioProfileId: profileId },
    { data },
    { upsert: true, new: true }
  );
}

export async function hasResumeUndo(profileId: Types.ObjectId): Promise<boolean> {
  const snap = await ResumeImportSnapshot.findOne({ portfolioProfileId: profileId })
    .select('_id')
    .lean();
  return Boolean(snap);
}

export async function restoreResumeSnapshot(
  profileId: Types.ObjectId
): Promise<{ ok: true; content: Awaited<ReturnType<typeof ProfileContent.findOne>> }> {
  const snap = await ResumeImportSnapshot.findOne({ portfolioProfileId: profileId });
  if (!snap?.data) {
    throw new AppError('No import snapshot to undo', 404);
  }

  const data = snap.data;

  if (data.displayName) {
    await PortfolioProfile.findByIdAndUpdate(profileId, { displayName: data.displayName });
  }

  if (data.content) {
    await ProfileContent.findOneAndUpdate(
      { portfolioProfileId: profileId },
      { ...data.content, portfolioProfileId: profileId },
      { upsert: true }
    );
  }

  await SkillCategory.deleteMany({ portfolioProfileId: profileId });
  if (data.skills.length) {
    await SkillCategory.insertMany(
      data.skills.map((row, i) => ({
        ...row,
        portfolioProfileId: profileId,
        order: typeof row.order === 'number' ? row.order : i,
      }))
    );
  }

  await Experience.deleteMany({ portfolioProfileId: profileId });
  if (data.experiences.length) {
    await Experience.insertMany(
      data.experiences.map((row, i) => ({
        ...row,
        portfolioProfileId: profileId,
        order: typeof row.order === 'number' ? row.order : i,
      }))
    );
  }

  await Project.deleteMany({ portfolioProfileId: profileId });
  if (data.projects.length) {
    await Project.insertMany(
      data.projects.map((row, i) => ({
        ...row,
        portfolioProfileId: profileId,
        order: typeof row.order === 'number' ? row.order : i,
      }))
    );
  }

  await Education.deleteMany({ portfolioProfileId: profileId });
  if (data.education.length) {
    await Education.insertMany(
      data.education.map((row, i) => ({
        ...row,
        portfolioProfileId: profileId,
        order: typeof row.order === 'number' ? row.order : i,
      }))
    );
  }

  await Certification.deleteMany({ portfolioProfileId: profileId });
  if (data.certifications.length) {
    await Certification.insertMany(
      data.certifications.map((row, i) => ({
        ...row,
        portfolioProfileId: profileId,
        order: typeof row.order === 'number' ? row.order : i,
      }))
    );
  }

  await ResumeImportSnapshot.deleteOne({ portfolioProfileId: profileId });
  await logActivity('undo', 'resume-import', profileId);

  const content = await ProfileContent.findOne({ portfolioProfileId: profileId });
  return { ok: true, content };
}

export function buildImportSummary(extracted: ExtractedResumeData): ImportSummary {
  return {
    displayName: extracted.displayName || extracted.content.name,
    skills: extracted.skills.length,
    experiences: extracted.experiences.length,
    projects: extracted.projects.length,
    education: extracted.education.length,
    certifications: extracted.certifications.length,
  };
}

export async function applyResumeExtract(
  profileId: Types.ObjectId,
  extracted: ExtractedResumeData,
  resumeUrl?: string,
  sections: ImportSections = ALL_IMPORT_SECTIONS
): Promise<{ content: Awaited<ReturnType<typeof ProfileContent.findOne>>; summary: ImportSummary }> {
  await captureResumeSnapshot(profileId);

  if (sections.content && extracted.displayName) {
    await PortfolioProfile.findByIdAndUpdate(profileId, {
      displayName: extracted.displayName,
    });
  }

  if (sections.content) {
    const contentPayload = {
      ...extracted.content,
      ...(resumeUrl ? { resumeUrl } : {}),
    };
    await ProfileContent.findOneAndUpdate(
      { portfolioProfileId: profileId },
      contentPayload,
      { new: true, upsert: true }
    );
  } else if (resumeUrl) {
    await ProfileContent.findOneAndUpdate(
      { portfolioProfileId: profileId },
      { resumeUrl },
      { upsert: true }
    );
  }

  if (sections.skills) {
    await SkillCategory.deleteMany({ portfolioProfileId: profileId });
    if (extracted.skills.length > 0) {
      await SkillCategory.insertMany(
        extracted.skills.map((cat, i) => ({
          portfolioProfileId: profileId,
          name: cat.name || `Category ${i + 1}`,
          order: i,
          skills: (cat.skills || []).map((s, j) => ({
            name: s.name,
            level: s.level || '',
            order: j,
          })),
        }))
      );
    }
  }

  if (sections.experiences) {
    await Experience.deleteMany({ portfolioProfileId: profileId });
    if (extracted.experiences.length > 0) {
      await Experience.insertMany(
        extracted.experiences.map((exp, i) => ({
          portfolioProfileId: profileId,
          type: exp.type === 'internship' ? 'internship' : 'job',
          company: exp.company || 'Company',
          role: exp.role || '',
          location: exp.location || '',
          startDate: exp.startDate || '',
          endDate: exp.endDate || '',
          isCurrent: !!exp.isCurrent,
          bullets: exp.bullets || [],
          projects: (exp.projects || []).map((p) => ({
            name: p.name || '',
            url: p.url || '',
            techStack: p.techStack || [],
          })),
          order: i,
        }))
      );
    }
  }

  if (sections.projects) {
    await Project.deleteMany({ portfolioProfileId: profileId });
    if (extracted.projects.length > 0) {
      await Project.insertMany(
        extracted.projects.map((proj, i) => ({
          portfolioProfileId: profileId,
          title: proj.title || `Project ${i + 1}`,
          description: proj.description || '',
          techStack: proj.techStack || [],
          liveUrl: proj.liveUrl || '',
          githubUrl: proj.githubUrl || '',
          imageUrl: '',
          featured: !!proj.featured,
          isPersonalProject: !!proj.isPersonalProject,
          startDate: proj.startDate || '',
          endDate: proj.endDate || '',
          order: i,
        }))
      );
    }
  }

  if (sections.education) {
    await Education.deleteMany({ portfolioProfileId: profileId });
    if (extracted.education.length > 0) {
      await Education.insertMany(
        extracted.education.map((edu, i) => ({
          portfolioProfileId: profileId,
          degree: edu.degree || '',
          institution: edu.institution || '',
          location: edu.location || '',
          startYear: edu.startYear || '',
          endYear: edu.endYear || '',
          cgpa: edu.cgpa || '',
          status: edu.status || '',
          url: '',
          imageUrl: '',
          order: i,
        }))
      );
    }
  }

  if (sections.certifications) {
    await Certification.deleteMany({ portfolioProfileId: profileId });
    if (extracted.certifications.length > 0) {
      await Certification.insertMany(
        extracted.certifications.map((cert, i) => ({
          portfolioProfileId: profileId,
          name: cert.name || '',
          issuer: cert.issuer || '',
          year: cert.year || '',
          url: cert.url || '',
          imageUrl: '',
          order: i,
        }))
      );
    }
  }

  await logActivity('import', 'resume', profileId);

  const content = await ProfileContent.findOne({ portfolioProfileId: profileId });
  return {
    content,
    summary: buildImportSummary(extracted),
  };
}
