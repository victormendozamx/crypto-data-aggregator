/**
 * Groq/OpenAI API utilities
 * AI features for premium endpoints
 */

const AI_API_KEY = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;
const AI_MODEL = process.env.AI_MODEL || 'llama-3.3-70b-versatile';
const AI_PROVIDER = process.env.AI_PROVIDER || 'groq';

export function isGroqConfigured(): boolean {
  return !!AI_API_KEY;
}

export async function promptGroqJson<T>(prompt: string, _schema?: unknown): Promise<T | null> {
  if (!AI_API_KEY) {
    return null;
  }

  try {
    const apiUrl =
      AI_PROVIDER === 'groq'
        ? 'https://api.groq.com/openai/v1/chat/completions'
        : 'https://api.openai.com/v1/chat/completions';

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${AI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: AI_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      console.error('AI API error:', await response.text());
      return null;
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;

    if (!content) {
      return null;
    }

    return JSON.parse(content) as T;
  } catch (error) {
    console.error('AI request failed:', error);
    return null;
  }
}
