import { streamGroqChat, generateGroqTitle } from "./groq";
import { streamGeminiChat, generateGeminiTitle } from "./gemini";

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

/**
 * AI Router with automatic failover.
 * Primary: Groq (qwen/qwen3.8-27b, openai/gpt-oss-120b) — ultra-fast inference
 * Fallback: Gemini (gemini-2.5-flash) — reliable fallback
 */
export async function streamChat(
  messages: ChatMessage[]
): Promise<ReadableStream<Uint8Array>> {
  try {
    // Try Groq first (primary — faster inference)
    console.log("[AI Router] Attempting Groq...");
    return await streamGroqChat(messages);
  } catch (error: unknown) {
    const err = error as { status?: number; message?: string };
    console.warn(`[AI Router] Groq failed: ${err.status || err.message}`);

    // If rate limited (429) or any error, fallback to Gemini
    if (err.status === 429 || err.status === 503 || true) {
      console.log("[AI Router] Falling back to Gemini...");
      try {
        return await streamGeminiChat(messages);
      } catch (geminiError: unknown) {
        const gErr = geminiError as { message?: string };
        console.error(`[AI Router] Gemini also failed: ${gErr.message}`);
        throw new Error("All AI models are currently unavailable. Please try again in a moment.");
      }
    }

    throw error;
  }
}

export async function generateTitle(userMessage: string): Promise<string> {
  try {
    return await generateGroqTitle(userMessage);
  } catch {
    try {
      return await generateGeminiTitle(userMessage);
    } catch {
      return "New Conversation";
    }
  }
}
