export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  topic: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  user_id: string;
  role: "user" | "assistant" | "system";
  content: string;
  metadata: MessageMetadata;
  created_at: string;
}

export interface MessageMetadata {
  model_used?: string;
  visual_blocks?: VisualBlock[];
  code_examples?: CodeExample[];
  references?: string[];
  concepts?: string[];
  topic?: string;
}

export interface VisualBlock {
  type: "concept" | "step" | "analogy" | "diagram" | "quiz" | "tip";
  title: string;
  content: string;
  icon?: string;
}

export interface CodeExample {
  language: string;
  code: string;
  title?: string;
  description?: string;
  runnable?: boolean;
}

export interface LearningTopic {
  id: string;
  user_id: string;
  topic_name: string;
  category: string | null;
  mastery_level: number;
  concepts_learned: string[];
  total_interactions: number;
  last_studied_at: string;
  created_at: string;
  updated_at: string;
}

export interface LearningProgress {
  id: string;
  user_id: string;
  topic_id: string;
  concept: string;
  understood: boolean;
  confidence_score: number;
  times_reviewed: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Bookmark {
  id: string;
  user_id: string;
  message_id: string;
  note: string | null;
  created_at: string;
}

// Chat types
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  metadata?: MessageMetadata;
  isStreaming?: boolean;
  timestamp: Date;
}

export interface AIModelConfig {
  provider: "groq" | "gemini";
  model: string;
  apiKey: string;
}

export interface StreamChunk {
  content: string;
  done: boolean;
  model_used?: string;
}
