import { NextRequest } from "next/server";
import { OpenAIService } from "@/features/ai/services/openai.service";
import { errorResponse, successResponse } from "@/lib/api-response";
import { z } from "zod";

const suggestionSchema = z.object({
  customerQuery: z.string().min(1, "Customer query is required"),
  channel: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = suggestionSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(422, "VALIDATION_ERROR", "Invalid input", parsed.error.issues);
    }

    console.log("[AI Suggestions] Request received:", parsed.data);
    const suggestions = await OpenAIService.getReplySuggestions(parsed.data);
    console.log("[AI Suggestions] Generated:", suggestions.length, "suggestions");
    return successResponse({ suggestions });
  } catch (err) {
    console.error("[AI Suggestions] Full error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return errorResponse(500, "AI_ERROR", message);
  }
}
