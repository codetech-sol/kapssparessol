import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export function createOpenAIProvider(apiKey: string) {
  return createOpenAICompatible({
    name: "openai",
    apiKey,
    baseURL: "https://api.openai.com/v1",
  });
}
