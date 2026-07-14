import { createFileRoute } from "@tanstack/react-router";
import { COMPANY_PROFILE } from "@/lib/company-profile";
import {
  createGeminiClient,
  mapMessagesToGeminiContents,
  type ChatMessage,
} from "@/lib/gemini.server";

type ChatBody = { messages?: ChatMessage[] };

const SYSTEM_PROMPT = `You are the KAPS Virtual Assistant for KAPS Spares Solutions Ltd, a Zambian automotive spare parts and vehicle service company. Answer user questions ONLY using the company profile provided below. Be friendly, concise, and professional.

Rules:
- Answer questions about our services, spare parts categories, branches, contact details, delivery, or company info directly from the profile.
- If a user asks about a specific part or service and the profile does not confirm we currently stock/offer that specific item, DO NOT invent availability. Instead, explain that we source virtually any part on demand through our international supplier network (China, Dubai, South Africa, Japan) and suggest they submit a formal request via the "Submit a Formal Request" button so our team can get back to them with pricing and availability.
- If a question is completely unrelated to KAPS or automotive matters, politely redirect back to how you can help.
- Keep responses under 150 words. Use plain text, no markdown headers.

=== COMPANY PROFILE ===
${COMPANY_PROFILE}
=== END PROFILE ===`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const body = (await request.json()) as ChatBody;
        const messages = Array.isArray(body.messages) ? body.messages : [];
        if (messages.length === 0) {
          return new Response(JSON.stringify({ error: "No messages" }), {
            status: 400,
            headers: { "content-type": "application/json" },
          });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
          return new Response(
            JSON.stringify({
              error: "AI service is not configured. Set GEMINI_API_KEY in your environment.",
            }),
            { status: 500, headers: { "content-type": "application/json" } },
          );
        }

        const modelName = process.env.GEMINI_MODEL ?? "gemini-1.5-flash";
        const contents = mapMessagesToGeminiContents(messages);

        if (contents.length === 0) {
          return new Response(JSON.stringify({ error: "No user messages to process." }), {
            status: 400,
            headers: { "content-type": "application/json" },
          });
        }

        try {
          const genAI = createGeminiClient(apiKey);
          const model = genAI.getGenerativeModel({
            model: modelName,
            systemInstruction: SYSTEM_PROMPT,
          });

          const result = await model.generateContent({ contents });
          const text = result.response.text();

          return new Response(JSON.stringify({ reply: text }), {
            headers: { "content-type": "application/json" },
          });
        } catch (err) {
          const message = err instanceof Error ? err.message : "Unknown error";
          const status = /429|RESOURCE_EXHAUSTED/i.test(message)
            ? 429
            : /402|quota/i.test(message)
              ? 402
              : 500;
          return new Response(JSON.stringify({ error: message }), {
            status,
            headers: { "content-type": "application/json" },
          });
        }
      },
    },
  },
});
