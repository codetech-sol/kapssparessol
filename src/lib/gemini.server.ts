import { GoogleGenerativeAI, type Content } from "@google/generative-ai";

export type ChatMessage = { role: "user" | "assistant"; content: string };

/**
 * Converts OpenAI-style chat history into Gemini's Content[] format.
 * - "user"  → role "user"
 * - "assistant" → role "model"
 * - "content" → parts: [{ text }]
 *
 * Leading assistant-only messages (e.g. the UI welcome bubble) are dropped so
 * Gemini history always starts with a user turn.
 */
export function mapMessagesToGeminiContents(messages: ChatMessage[]): Content[] {
  let normalized = messages;

  while (normalized.length > 0 && normalized[0].role === "assistant") {
    normalized = normalized.slice(1);
  }

  return normalized.map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));
}

export function createGeminiClient(apiKey: string) {
  return new GoogleGenerativeAI(apiKey);
}
