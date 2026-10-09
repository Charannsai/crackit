import { GoogleGenAI } from "@google/genai";

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// Verified available Gemini models in prioritized order
const GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-flash-latest",
];

export async function streamGeminiChat(
  messages: { role: "system" | "user" | "assistant"; content: string }[]
): Promise<ReadableStream<Uint8Array>> {
  const encoder = new TextEncoder();

  // Extract system instruction and convert messages to Gemini format
  const systemMessage = messages.find((m) => m.role === "system");
  const chatMessages = messages
    .filter((m) => m.role !== "system")
    .map((m) => ({
      role: m.role === "assistant" ? ("model" as const) : ("user" as const),
      parts: [{ text: m.content }],
    }));

  const lastUserMessage = chatMessages.pop();
  if (!lastUserMessage) {
    throw new Error("No user message found");
  }

  let response: any = null;
  let activeModel = GEMINI_MODELS[0];
  let lastError: unknown = null;

  for (const model of GEMINI_MODELS) {
    try {
      response = await genai.models.generateContentStream({
        model,
        contents: [...chatMessages, lastUserMessage],
        config: {
          systemInstruction: systemMessage?.content,
          temperature: 0.7,
          maxOutputTokens: 4096,
        },
      });
      activeModel = model;
      break;
    } catch (err: unknown) {
      lastError = err;
      console.warn(`[Gemini] Model ${model} failed, trying next fallback:`, (err as Error)?.message);
    }
  }

  if (!response) {
    throw lastError || new Error("All Gemini models failed");
  }

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of response) {
          const content = chunk.text || "";
          if (content) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ content, done: false })}\n\n`)
            );
          }
        }
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ content: "", done: true, model_used: `gemini/${activeModel}` })}\n\n`
          )
        );
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}

export async function generateGeminiTitle(userMessage: string): Promise<string> {
  for (const model of GEMINI_MODELS) {
    try {
      const response = await genai.models.generateContent({
        model,
        contents: `Generate a short, concise title (3-5 words) for a conversation about: "${userMessage}". Output ONLY the title text, with no quotes or punctuation.`,
        config: {
          temperature: 0.5,
          maxOutputTokens: 20,
        },
      });

      return response.text?.trim() || "New Conversation";
    } catch {
      continue;
    }
  }
  return "New Conversation";
}
