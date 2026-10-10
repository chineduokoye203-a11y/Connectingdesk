import { NextRequest } from "next/server";
import { OpenAIService } from "@/features/ai/services/openai.service";
import { errorResponse, successResponse } from "@/lib/api-response";
import { z } from "zod";

const aiQuerySchema = z.object({
  ticketId: z.string().optional(),
  customerQuery: z.string().min(1, "Customer query is required"),
  channel: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = aiQuerySchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(422, "VALIDATION_ERROR", "Invalid query input", parsed.error.issues);
    }

    const suggestions = await OpenAIService.getReplySuggestions(parsed.data);
    return successResponse(suggestions);
  } catch (err) {
    return errorResponse(500, "INTERNAL_ERROR", "Failed to retrieve AI reply suggestions.");
  }
}
