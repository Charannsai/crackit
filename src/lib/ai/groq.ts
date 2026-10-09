import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Verified available Groq models in prioritized order
const GROQ_MODELS = [
  "qwen/qwen3.8-27b",
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
];

export async function streamGroqChat(
  messages: { role: "system" | "user" | "assistant"; content: string }[]
): Promise<ReadableStream<Uint8Array>> {
  let completion: any = null;
  let activeModel = GROQ_MODELS[0];
  let lastError: unknown = null;

  for (const model of GROQ_MODELS) {
    try {
      completion = await groq.chat.completions.create({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 4096,
        stream: true,
      });
      activeModel = model;
      break;
    } catch (err: unknown) {
      lastError = err;
      console.warn(`[Groq] Model ${model} failed, trying next fallback:`, (err as Error)?.message);
    }
  }

  if (!completion) {
    throw lastError || new Error("All Groq models failed");
  }

  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content || "";
          if (content) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ content, done: false })}\n\n`)
            );
          }
        }
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ content: "", done: true, model_used: `groq/${activeModel}` })}\n\n`
          )
        );
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });
}

export async function generateGroqTitle(userMessage: string): Promise<string> {
  for (const model of GROQ_MODELS) {
    try {
      const completion = await groq.chat.completions.create({
        model,
        messages: [
          {
            role: "system",
            content: "Generate a short, descriptive title (3-6 words) for a conversation. Return ONLY the title text.",
          },
          { role: "user", content: userMessage },
        ],
        temperature: 0.5,
        max_tokens: 20,
      });

      return completion.choices[0]?.message?.content?.trim() || "New Conversation";
    } catch {
      continue;
    }
  }
  return "New Conversation";
}
