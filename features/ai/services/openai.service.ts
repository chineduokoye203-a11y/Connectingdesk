import { env } from "@/lib/env";
import { getTenantId } from "@/lib/tenant";
import { KnowledgeBaseService } from "@/features/kb/services/kb.service";
import OpenAI from "openai";

export type AISuggestionInput = {
  ticketId?: string;
  customerQuery: string;
  channel?: string;
};

export type SuggestedReply = {
  label: string;
  text: string;
};

export class OpenAIService {
  static async getReplySuggestions(input: AISuggestionInput): Promise<SuggestedReply[]> {
    const tenantId = await getTenantId();
    console.log("[OpenAI] Tenant:", tenantId);

    const docs = await KnowledgeBaseService.searchRelevantDocs(tenantId, input.customerQuery);
    console.log("[OpenAI] KB docs found:", docs.length);

    const ragContext = docs.length > 0
      ? docs.map((d) => `${d.title}: ${d.content}`).join("\n")
      : "No specific knowledge base articles found. Use general customer support best practices.";

    const apiKey = env.OPENAI_API_KEY;
    console.log("[OpenAI] API key starts with:", apiKey?.substring(0, 8));
    console.log("[OpenAI] Model:", env.OPENAI_MODEL);

    const client = new OpenAI({ apiKey });

    let response;
    try {
      response = await client.chat.completions.create({
        model: env.OPENAI_MODEL,
        temperature: 0.7,
        max_tokens: 1024,
        messages: [
          {
            role: "system",
            content: `You are an AI assistant for a customer support specialist. Generate 5 concise, professional reply suggestions for the specialist to use during a live call.

Rules:
- Each suggestion should be 1-2 sentences max
- Be polite, empathetic, and solution-oriented
- Use placeholders like [order_id] or [date] for variable data
- Vary the tone: one formal, one empathetic, one solution-focused, one quick acknowledgment, one escalation offer
- Never make up facts — only use provided context
- Return valid JSON: { "suggestions": [{ "label": "Suggestion 1 of 5", "text": "..." }, ...] }

Knowledge Base Context:
${ragContext}`,
          },
          {
            role: "user",
            content: `Customer query/context: "${input.customerQuery}"
Channel: ${input.channel || "phone"}
Generate 5 suggested replies for the specialist.`,
          },
        ],
        response_format: { type: "json_object" },
      });
    } catch {
      response = await client.chat.completions.create({
        model: env.OPENAI_MODEL,
        temperature: 0.7,
        max_tokens: 1024,
        messages: [
          {
            role: "system",
            content: `You are an AI assistant for a customer support specialist. Generate 5 concise, professional reply suggestions. Return them as a JSON array with "label" and "text" fields.`,
          },
          {
            role: "user",
            content: `Customer query: "${input.customerQuery}". Generate 5 suggestions.`,
          },
        ],
      });
    }

    const content = response.choices[0]?.message?.content;

    if (!content) {
      return this.getFallbackSuggestions();
    }

    try {
      const parsed = JSON.parse(content);
      const replies: SuggestedReply[] = Array.isArray(parsed.suggestions)
        ? parsed.suggestions
        : Array.isArray(parsed)
          ? parsed
          : [];

      if (replies.length === 0) return this.getFallbackSuggestions();

      return replies.map((r: { text?: string; reply?: string; content?: string }, i: number) => ({
        label: `Suggested Response ${i + 1} of ${replies.length}`,
        text: r.text || r.reply || r.content || "",
      }));
    } catch {
      return this.getFallbackSuggestions();
    }
  }

  private static getFallbackSuggestions(): SuggestedReply[] {
    return [
      { label: "Suggested Response 1 of 3", text: "Thank you for contacting us. I'm looking into your request right now and will have an update for you shortly." },
      { label: "Suggested Response 2 of 3", text: "I understand your concern. Let me review your account details and find the best solution for you." },
      { label: "Suggested Response 3 of 3", text: "I appreciate your patience. I'm going to escalate this to ensure it gets resolved as quickly as possible." },
    ];
  }
}
