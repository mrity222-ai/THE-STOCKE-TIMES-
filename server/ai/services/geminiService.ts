import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const getApiKey = () => (process.env.GEMINI_API_KEY || '').trim();

function getAiClient(): GoogleGenAI | null {
  const key = getApiKey();
  if (!key) return null;
  try {
    return new GoogleGenAI({ apiKey: key });
  } catch (err) {
    console.warn('⚠️ GoogleGenAI initialization warning:', err);
    return null;
  }
}

const DEFAULT_GEMINI_MODEL = (process.env.GEMINI_MODEL || 'gemini-3.6-flash').trim();
const CANDIDATE_MODELS = [
  DEFAULT_GEMINI_MODEL,
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3.5-flash-lite',
  'gemini-2.5-flash',
].filter((model, index, models) => model && models.indexOf(model) === index);

export class GeminiService {
  /**
   * Generates structured JSON from Gemini using Zod schema validation, model fallback, and a repair retry loop.
   */
  static async generateStructuredJson<T>(
    prompt: string,
    schema: z.ZodSchema<T>,
    systemInstruction?: string,
    preferredModel: string = DEFAULT_GEMINI_MODEL
  ): Promise<{ data: T; rawText: string; latencyMs: number; tokensUsed?: number }> {
    const startTime = Date.now();
    const aiClient = getAiClient();

    if (!aiClient) {
      throw new Error('GEMINI_API_KEY is not configured in environment variables.');
    }

    const modelsToTry = [preferredModel, ...CANDIDATE_MODELS.filter(m => m !== preferredModel)];
    const fullSystemInstruction = `${systemInstruction || ''}\n\nCRITICAL INSTRUCTION: You MUST return strictly a valid, raw JSON object matching the requested format. Do NOT wrap in markdown \`\`\`json blocks. Output ONLY raw JSON.`;

    let attempts = 0;
    let lastError: any = null;

    for (const model of modelsToTry) {
      attempts = 0;
      while (attempts < 2) {
        attempts++;
        try {
          const response = await aiClient.models.generateContent({
            model,
            contents: prompt,
            config: {
              systemInstruction: attempts === 1
                ? fullSystemInstruction
                : `${fullSystemInstruction}\n\nFIX PREVIOUS PARSE ERROR: ${lastError?.message || 'Invalid JSON format'}. Please generate strictly valid JSON matching the schema cleanly.`,
              responseMimeType: 'application/json',
              temperature: 0.2
            }
          });

          const rawText = response.text || '';
          
          // Clean markdown backticks if present
          let cleanedJson = rawText.trim();
          if (cleanedJson.startsWith('```json')) {
            cleanedJson = cleanedJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
          } else if (cleanedJson.startsWith('```')) {
            cleanedJson = cleanedJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
          }

          const parsedJson = JSON.parse(cleanedJson);
          const validatedData = schema.parse(parsedJson);

          const latencyMs = Date.now() - startTime;
          return {
            data: validatedData,
            rawText,
            latencyMs,
            tokensUsed: response.usageMetadata?.totalTokenCount
          };
        } catch (err: any) {
          lastError = err;
          if (err.message && err.message.includes('404')) {
            // Model not found, break inner loop to try next model candidate
            break;
          }
          console.warn(`⚠️ Gemini Zod validation attempt ${attempts} on ${model} failed:`, err.message);
        }
      }
    }

    throw new Error(`Gemini JSON generation failed: ${lastError?.message || 'Invalid schema or model unavailable'}`);
  }

  /**
   * Health check to test Gemini API connectivity.
   */
  static async testConnection(): Promise<{ success: boolean; message: string; model: string }> {
    const aiClient = getAiClient();
    if (!aiClient) {
      return {
        success: false,
        message: 'GEMINI_API_KEY is missing in .env file',
        model: DEFAULT_GEMINI_MODEL
      };
    }

    for (const model of CANDIDATE_MODELS) {
      try {
        const response = await aiClient.models.generateContent({
          model,
          contents: 'Return a simple JSON test object: {"status": "ok", "message": "Gemini API active"}',
          config: { responseMimeType: 'application/json' }
        });

        return {
          success: true,
          message: response.text || 'Active',
          model
        };
      } catch (err: any) {
        if (!err.message?.includes('404')) {
          return {
            success: false,
            message: `Gemini API test failed: ${err.message}`,
            model
          };
        }
      }
    }

    return {
      success: false,
      message: 'No available Gemini model responded cleanly.',
      model: DEFAULT_GEMINI_MODEL
    };
  }
}
