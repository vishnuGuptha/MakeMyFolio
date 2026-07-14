import { TryDemoSeed } from '../models/index.js';
import { getDefaultTryDemoSeed, type TryDemoSeedPayload } from '../data/defaultTryDemoSeed.js';

const THEME_IDS = new Set([
  'glass',
  'spotlight',
  'terminal',
  'command-center',
  'bento',
  'studio',
  'olive',
]);

function toPayload(doc: InstanceType<typeof TryDemoSeed>): TryDemoSeedPayload {
  return {
    version: 5,
    themeId: doc.themeId,
    content: doc.content as TryDemoSeedPayload['content'],
    skills: (doc.skills || []) as TryDemoSeedPayload['skills'],
    experiences: (doc.experiences || []) as TryDemoSeedPayload['experiences'],
    projects: (doc.projects || []) as TryDemoSeedPayload['projects'],
    education: (doc.education || []) as TryDemoSeedPayload['education'],
    certifications: (doc.certifications || []) as TryDemoSeedPayload['certifications'],
    workedWith: (doc.workedWith || []) as TryDemoSeedPayload['workedWith'],
    testimonials: (doc.testimonials || []) as TryDemoSeedPayload['testimonials'],
    updatedAt: (doc.updatedAt || new Date()).toISOString(),
  };
}

export async function ensureTryDemoSeed(): Promise<TryDemoSeedPayload> {
  let doc = await TryDemoSeed.findOne();
  if (!doc) {
    const defaults = getDefaultTryDemoSeed();
    doc = await TryDemoSeed.create({
      key: 'default',
      version: defaults.version,
      themeId: defaults.themeId,
      content: defaults.content,
      skills: defaults.skills,
      experiences: defaults.experiences,
      projects: defaults.projects,
      education: defaults.education,
      certifications: defaults.certifications,
      workedWith: defaults.workedWith,
      testimonials: defaults.testimonials,
    });
  }
  return toPayload(doc);
}

export function normalizeTryDemoSeedBody(body: unknown): TryDemoSeedPayload | null {
  if (!body || typeof body !== 'object') return null;
  const b = body as Record<string, unknown>;
  const content = b.content;
  if (!content || typeof content !== 'object') return null;
  const c = content as Record<string, unknown>;
  if (typeof c.name !== 'string') return null;

  const themeId = typeof b.themeId === 'string' && THEME_IDS.has(b.themeId) ? b.themeId : 'studio';

  return {
    version: 5,
    themeId,
    content: {
      name: String(c.name || ''),
      title: String(c.title || ''),
      tagline: String(c.tagline || ''),
      bio: String(c.bio || ''),
      location: String(c.location || ''),
      email: String(c.email || ''),
      phone: String(c.phone || ''),
      github: String(c.github || ''),
      linkedin: String(c.linkedin || ''),
      yearsExperience: String(c.yearsExperience || ''),
      profileImageUrl: String(c.profileImageUrl || ''),
    },
    skills: Array.isArray(b.skills) ? (b.skills as TryDemoSeedPayload['skills']) : [],
    experiences: Array.isArray(b.experiences)
      ? (b.experiences as TryDemoSeedPayload['experiences'])
      : [],
    projects: Array.isArray(b.projects) ? (b.projects as TryDemoSeedPayload['projects']) : [],
    education: Array.isArray(b.education) ? (b.education as TryDemoSeedPayload['education']) : [],
    certifications: Array.isArray(b.certifications)
      ? (b.certifications as TryDemoSeedPayload['certifications'])
      : [],
    workedWith: Array.isArray(b.workedWith)
      ? (b.workedWith as TryDemoSeedPayload['workedWith'])
      : [],
    testimonials: Array.isArray(b.testimonials)
      ? (b.testimonials as TryDemoSeedPayload['testimonials'])
      : [],
    updatedAt: new Date().toISOString(),
  };
}

export async function getTryDemoSeed(): Promise<TryDemoSeedPayload> {
  return ensureTryDemoSeed();
}

export async function saveTryDemoSeed(payload: TryDemoSeedPayload): Promise<TryDemoSeedPayload> {
  const doc = await TryDemoSeed.findOneAndUpdate(
    { key: 'default' },
    {
      $set: {
        version: 5,
        themeId: payload.themeId,
        content: payload.content,
        skills: payload.skills,
        experiences: payload.experiences,
        projects: payload.projects,
        education: payload.education,
        certifications: payload.certifications,
        workedWith: payload.workedWith,
        testimonials: payload.testimonials,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  if (!doc) {
    return ensureTryDemoSeed();
  }
  return toPayload(doc);
}

export async function resetTryDemoSeed(): Promise<TryDemoSeedPayload> {
  return saveTryDemoSeed(getDefaultTryDemoSeed());
}
