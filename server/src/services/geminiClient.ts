import '../polyfills.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AppError } from '../utils/errors.js';

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

export async function callGemini(
  prompt: string,
  options?: { json?: boolean; temperature?: number }
): Promise<string> {
  const models = getModelCandidates();
  let lastError: unknown;

  for (const modelName of models) {
    try {
      const genAI = getGeminiClient();
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          ...(options?.json ? { responseMimeType: 'application/json' } : {}),
          temperature: options?.temperature ?? 0.4,
        },
      });

      const result = await model.generateContent([{ text: prompt }]);
      const text = result.response.text();
      if (!text) throw new AppError('Empty response from Gemini', 502);
      return text;
    } catch (err) {
      lastError = err;
      if (shouldTryNextModel(err)) continue;
      break;
    }
  }

  if (lastError instanceof AppError) throw lastError;
  const message = lastError instanceof Error ? lastError.message : 'Gemini API request failed';
  throw new AppError(`AI request failed: ${message}`, 502);
}

export function parseGeminiJson<T>(text: string): T {
  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '');
  try {
    return JSON.parse(cleaned) as T;
  } catch {
    throw new AppError('Failed to parse AI response', 502);
  }
}
