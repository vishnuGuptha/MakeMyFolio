import { callGemini, parseGeminiJson } from './geminiClient.js';
import { AppError } from '../utils/errors.js';

export type EnhanceSection =
  | 'tagline'
  | 'bio'
  | 'title'
  | 'educationHighlight'
  | 'metaDescription'
  | 'experienceBullets'
  | 'projectDescription';

const VOICE_RULES = `
Voice & audience:
- This is a personal portfolio / resume shown to HR and hiring managers.
- ALWAYS write in first person (I, my, me). Never third person. Do not use the person's full name in prose.
- Professional, confident, concise. Market-standard for tech roles in 2026.
- Use strong action verbs and quantified impact where the input supports it.
- Do not invent employers, dates, metrics, or tools not present in the input.
`;

const SECTION_PROMPTS: Record<EnhanceSection, (ctx: Record<string, unknown>) => string> = {
  tagline: (ctx) => `${VOICE_RULES}

Rewrite this hero tagline for a developer portfolio. One compelling line (max 160 chars) with key tech stack and experience.
Current: ${JSON.stringify(ctx)}

Return JSON: { "result": "..." }`,

  title: (ctx) => `${VOICE_RULES}

Rewrite this professional title/headline for portfolio hero. Short (3-8 words), role-focused, modern.
Current: ${JSON.stringify(ctx)}

Return JSON: { "result": "..." }`,

  bio: (ctx) => `${VOICE_RULES}

Rewrite the About Me bio. 2-3 short paragraphs in first person. Paragraph 1: who I am + core stack. Paragraph 2: impact & strengths. Paragraph 3 (optional): education or AI/tools edge if in input.
Use \\n\\n between paragraphs.

Current profile data:
${JSON.stringify(ctx)}

Return JSON: { "result": "..." }`,

  educationHighlight: (ctx) => `${VOICE_RULES}

Rewrite the education highlight card text. One line, first person e.g. "Currently pursuing..." 
Current: ${JSON.stringify(ctx)}

Return JSON: { "result": "..." }`,

  metaDescription: (ctx) => `${VOICE_RULES}

Write an SEO meta description (max 155 chars) for this portfolio. First person or neutral professional tone.
Current: ${JSON.stringify(ctx)}

Return JSON: { "result": "..." }`,

  experienceBullets: (ctx) => `${VOICE_RULES}

Rewrite job experience bullets for ATS and recruiters. 4-6 bullets. Start each with strong verbs. Include metrics only if in input. First person implied (no "I" needed every line).

Current role:
${JSON.stringify(ctx)}

Return JSON: { "result": ["bullet 1", "bullet 2"] }`,

  projectDescription: (ctx) => `${VOICE_RULES}

Rewrite project description. 2-4 sentences, first person, problem → solution → tech → outcome.
Current: ${JSON.stringify(ctx)}

Return JSON: { "result": "..." }`,
};

export async function enhanceSection(
  section: EnhanceSection,
  context: Record<string, unknown>
): Promise<string | string[]> {
  const buildPrompt = SECTION_PROMPTS[section];
  if (!buildPrompt) throw new AppError(`Unknown section: ${section}`, 400);

  const text = await callGemini(buildPrompt(context), { json: true });
  const parsed = parseGeminiJson<{ result: string | string[] }>(text);

  if (parsed.result === undefined || parsed.result === null) {
    throw new AppError('AI returned empty result', 502);
  }

  if (section === 'experienceBullets') {
    if (!Array.isArray(parsed.result)) {
      throw new AppError('Expected bullet list from AI', 502);
    }
    return parsed.result.filter((b) => typeof b === 'string' && b.trim());
  }

  if (typeof parsed.result !== 'string') {
    throw new AppError('Expected text result from AI', 502);
  }

  return parsed.result.trim();
}
