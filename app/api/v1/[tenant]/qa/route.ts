import { NextRequest } from "next/server";
import { QAService } from "@/features/qa/services/qa.service";
import { submitQAScorecardSchema } from "@/features/qa/schemas/qa.schema";
import { successResponse, errorResponse } from "@/lib/api-response";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tenant: string }> }
) {
  try {
    const { tenant } = await params;
    const reviews = await QAService.listReviews(tenant);
    return successResponse(reviews);
  } catch (error: any) {
    return errorResponse(500, "INTERNAL_SERVER_ERROR", error.message || "Failed to list QA reviews");
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ tenant: string }> }
) {
  try {
    const { tenant } = await params;
    const body = await request.json();
    const validated = submitQAScorecardSchema.parse(body);
    const evaluation = await QAService.submitEvaluation(tenant, validated);
    return successResponse(evaluation);
  } catch (error: any) {
    return errorResponse(400, "INVALID_INPUT", error.message || "Invalid QA submission input");
  }
}
