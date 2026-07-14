import { Types } from 'mongoose';
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

export interface ImportSummary {
  displayName: string;
  skills: number;
  experiences: number;
  projects: number;
  education: number;
  certifications: number;
}

export async function applyResumeExtract(
  profileId: Types.ObjectId,
  extracted: ExtractedResumeData,
  resumeUrl?: string
): Promise<{ content: Awaited<ReturnType<typeof ProfileContent.findOne>>; summary: ImportSummary }> {
  if (extracted.displayName) {
    await PortfolioProfile.findByIdAndUpdate(profileId, {
      displayName: extracted.displayName,
    });
  }

  const contentPayload = {
    ...extracted.content,
    ...(resumeUrl ? { resumeUrl } : {}),
  };

  const content = await ProfileContent.findOneAndUpdate(
    { portfolioProfileId: profileId },
    contentPayload,
    { new: true, upsert: true }
  );

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

  await logActivity('import', 'resume', profileId);

  return {
    content,
    summary: {
      displayName: extracted.displayName || extracted.content.name,
      skills: extracted.skills.length,
      experiences: extracted.experiences.length,
      projects: extracted.projects.length,
      education: extracted.education.length,
      certifications: extracted.certifications.length,
    },
  };
}
