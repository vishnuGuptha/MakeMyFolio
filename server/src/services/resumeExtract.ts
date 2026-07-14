import '../polyfills.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AppError } from '../utils/errors.js';

export interface ExtractedResumeData {
  displayName: string;
  content: {
    name: string;
    title: string;
    tagline: string;
    location: string;
    phone: string;
    email: string;
    linkedin: string;
    portfolioUrl: string;
    github: string;
    bio: string;
    yearsExperience: string;
    educationHighlight: string;
    stats: { label: string; value: string }[];
    aiTools: string[];
  };
  skills: { name: string; skills: { name: string; level?: string }[] }[];
  experiences: {
    type: 'job' | 'internship';
    company: string;
    role: string;
    location: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
    bullets: string[];
    projects: { name: string; url: string; techStack: string[] }[];
  }[];
  projects: {
    title: string;
    description: string;
    techStack: string[];
    liveUrl: string;
    githubUrl: string;
    featured: boolean;
    isPersonalProject: boolean;
    startDate: string;
    endDate: string;
  }[];
  education: {
    degree: string;
    institution: string;
    location: string;
    startYear: string;
    endYear: string;
    cgpa: string;
    status: string;
  }[];
  certifications: {
    name: string;
    issuer: string;
    year: string;
    url: string;
  }[];
}

const EXTRACTION_PROMPT = `You are a resume DATA EXTRACTOR (not a writer). Your job is to copy information from the resume into JSON with minimal changes.

CRITICAL — LITERAL EXTRACTION MODE (first import):
- Copy exact wording from the resume. Do NOT rewrite, paraphrase, polish, or "improve" any text.
- bio: use the resume's summary/profile/about paragraphs VERBATIM. Join multiple paragraphs with \\n\\n. Preserve original tense and voice (even if third person).
- tagline: copy the exact professional headline or summary line from the resume if present; otherwise leave empty.
- experience bullets: copy each bullet EXACTLY as written in the resume.
- project descriptions: copy EXACT text from the resume for each project.
- role, company, degree, certification names: copy EXACTLY as written.
- Only split/organize into the JSON structure — never change the words unless fixing obvious OCR typos.
- Do not invent facts, metrics, skills, or employers not in the resume.
- stats: only include if explicit numbers appear in the resume; do not estimate.
- Use empty strings or empty arrays when information is missing.

Return ONLY valid JSON matching this schema:

{
  "displayName": "Full name for portfolio title",
  "content": {
    "name": "Full name",
    "title": "Professional headline from resume (exact words)",
    "tagline": "Exact summary line from resume if available",
    "location": "City, Country",
    "phone": "",
    "email": "",
    "linkedin": "full URL if present",
    "portfolioUrl": "",
    "github": "full URL if present",
    "bio": "Verbatim summary/about text from resume",
    "yearsExperience": "e.g. 4.8+ only if stated",
    "educationHighlight": "Exact education line from resume if available",
    "stats": [{ "label": "...", "value": "..." }],
    "aiTools": []
  },
  "skills": [{ "name": "Category", "skills": [{ "name": "Skill", "level": "" }] }],
  "experiences": [{
    "type": "job",
    "company": "",
    "role": "",
    "location": "",
    "startDate": "MMM YYYY",
    "endDate": "MMM YYYY or Present",
    "isCurrent": false,
    "bullets": ["exact bullet from resume"],
    "projects": [{ "name": "", "url": "", "techStack": [] }]
  }],
  "projects": [{
    "title": "",
    "description": "exact project text from resume",
    "techStack": [],
    "liveUrl": "",
    "githubUrl": "",
    "featured": true,
    "isPersonalProject": false,
    "startDate": "",
    "endDate": ""
  }],
  "education": [{
    "degree": "",
    "institution": "",
    "location": "",
    "startYear": "",
    "endYear": "",
    "cgpa": "",
    "status": ""
  }],
  "certifications": [{ "name": "", "issuer": "", "year": "", "url": "" }]
}

Structural rules only (no rewriting):
- Group listed skills into categories if the resume does not already categorize them.
- experiences.type is "job" or "internship" based on resume labels.
- Return JSON only, no markdown.

--- RESUME TEXT ---
`;

const FALLBACK_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-3.1-flash-lite',
];

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new AppError('GEMINI_API_KEY is not configured on the server', 503);
  }
  return new GoogleGenerativeAI(apiKey);
}

function parseJsonResponse(text: string): ExtractedResumeData {
  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '');

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new AppError('Failed to parse AI response. Please try again.', 502);
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new AppError('Invalid AI response format', 502);
  }

  const data = parsed as Partial<ExtractedResumeData>;
  return {
    displayName: data.displayName || data.content?.name || '',
    content: {
      name: data.content?.name || '',
      title: data.content?.title || '',
      tagline: data.content?.tagline || '',
      location: data.content?.location || '',
      phone: data.content?.phone || '',
      email: data.content?.email || '',
      linkedin: data.content?.linkedin || '',
      portfolioUrl: data.content?.portfolioUrl || '',
      github: data.content?.github || '',
      bio: data.content?.bio || '',
      yearsExperience: data.content?.yearsExperience || '',
      educationHighlight: data.content?.educationHighlight || '',
      stats: Array.isArray(data.content?.stats) ? data.content.stats : [],
      aiTools: Array.isArray(data.content?.aiTools) ? data.content.aiTools : [],
    },
    skills: Array.isArray(data.skills) ? data.skills : [],
    experiences: Array.isArray(data.experiences) ? data.experiences : [],
    projects: Array.isArray(data.projects) ? data.projects : [],
    education: Array.isArray(data.education) ? data.education : [],
    certifications: Array.isArray(data.certifications) ? data.certifications : [],
  };
}

function getModelCandidates(): string[] {
  const configured = process.env.GEMINI_MODEL?.trim();
  const ordered = configured ? [configured, ...FALLBACK_MODELS] : FALLBACK_MODELS;
  return [...new Set(ordered)];
}

function shouldTryNextModel(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  if (/404|not found|not supported/i.test(msg)) return true;
  if (/429/.test(msg) && /limit:\s*0/i.test(msg)) return true;
  return false;
}

async function extractWithModel(resumeText: string, modelName: string): Promise<ExtractedResumeData> {
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.1,
    },
  });

  const result = await model.generateContent([
    { text: `${EXTRACTION_PROMPT}${resumeText}` },
  ]);

  const text = result.response.text();
  if (!text) throw new AppError('Empty response from Gemini', 502);
  return parseJsonResponse(text);
}

/** Send locally extracted resume text to Gemini for structured JSON */
export async function extractResumeFromText(resumeText: string): Promise<ExtractedResumeData> {
  const models = getModelCandidates();
  let lastError: unknown;

  for (const modelName of models) {
    try {
      console.log(`[resume-extract] Trying model: ${modelName} (${resumeText.length} chars input)`);
      return await extractWithModel(resumeText, modelName);
    } catch (err) {
      lastError = err;
      if (shouldTryNextModel(err)) {
        console.warn(`[resume-extract] Model ${modelName} unavailable, trying next...`);
        continue;
      }
      break;
    }
  }

  if (lastError instanceof AppError) throw lastError;
  const message = lastError instanceof Error ? lastError.message : 'Gemini API request failed';
  throw new AppError(`Resume extraction failed: ${message}`, 502);
}
