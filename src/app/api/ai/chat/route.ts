import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { streamChat, generateTitle } from "@/lib/ai/router";
import { TUTOR_SYSTEM_PROMPT } from "@/lib/ai/prompts";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages, conversationId } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages are required" },
        { status: 400 }
      );
    }

    // Build messages with system prompt
    const aiMessages = [
      { role: "system" as const, content: TUTOR_SYSTEM_PROMPT },
      ...messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    // Handle conversation persistence
    let activeConversationId = conversationId;

    if (!activeConversationId) {
      // Create new conversation
      const userMessage = messages[messages.length - 1]?.content || "";
      const title = await generateTitle(userMessage);

      const { data: conversation, error: convError } = await supabase
        .from("conversations")
        .insert({
          user_id: user.id,
          title,
          topic: userMessage.slice(0, 100),
        })
        .select()
        .single();

      if (convError) {
        console.error("Conversation creation error:", convError);
      } else {
        activeConversationId = conversation.id;
      }
    }

    // Save user message
    if (activeConversationId) {
      const lastUserMsg = messages[messages.length - 1];
      if (lastUserMsg?.role === "user") {
        await supabase.from("messages").insert({
          conversation_id: activeConversationId,
          user_id: user.id,
          role: "user",
          content: lastUserMsg.content,
          metadata: {},
        });
      }
    }

    // Stream AI response
    const stream = await streamChat(aiMessages);

    // Create a TransformStream to capture the full response for saving
    let fullResponse = "";
    let modelUsed = "";

    const transformStream = new TransformStream({
      transform(chunk, controller) {
        const text = new TextDecoder().decode(chunk);
        // Parse SSE data to capture full response
        const lines = text.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                fullResponse += data.content;
              }
              if (data.model_used) {
                modelUsed = data.model_used;
              }
            } catch {
              // Skip parse errors
            }
          }
        }
        controller.enqueue(chunk);
      },
      async flush() {
        // Save assistant message after streaming completes
        if (activeConversationId && fullResponse) {
          const supabaseAdmin = await createClient();
          await supabaseAdmin.from("messages").insert({
            conversation_id: activeConversationId,
            user_id: user.id,
            role: "assistant",
            content: fullResponse,
            metadata: { model_used: modelUsed },
          });

          // Update conversation timestamp
          await supabaseAdmin
            .from("conversations")
            .update({ updated_at: new Date().toISOString() })
            .eq("id", activeConversationId);

          // Track learning progress
          try {
            await trackLearning(supabaseAdmin, user.id, messages[messages.length - 1]?.content || "");
          } catch (e) {
            console.error("Learning tracking error:", e);
          }
        }
      },
    });

    const responseStream = stream.pipeThrough(transformStream);

    return new Response(responseStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Conversation-Id": activeConversationId || "",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}

async function trackLearning(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  userMessage: string
) {
  // Extract a simple topic from the message
  const topicWords = userMessage
    .toLowerCase()
    .replace(/explain|teach|help|me|understand|what|is|are|how|does|do|the|a|an|about|can|you|please|i|want|to|learn|know/gi, "")
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .slice(0, 3)
    .join(" ");

  const topicName = topicWords || "General Learning";

  // Upsert learning topic
  const { data: existing } = await supabase
    .from("learning_topics")
    .select("*")
    .eq("user_id", userId)
    .eq("topic_name", topicName)
    .single();

  if (existing) {
    await supabase
      .from("learning_topics")
      .update({
        total_interactions: existing.total_interactions + 1,
        mastery_level: Math.min(100, existing.mastery_level + 5),
        last_studied_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
  } else {
    await supabase.from("learning_topics").insert({
      user_id: userId,
      topic_name: topicName,
      category: "General",
      mastery_level: 10,
      total_interactions: 1,
    });
  }
}
