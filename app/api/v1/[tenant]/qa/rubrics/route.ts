import { NextRequest } from "next/server";
import { getTenantId } from "@/lib/tenant";
import { ApiError, errorResponse, successResponse } from "@/lib/api-response";
import { z } from "zod";

const createRubricSchema = z.object({
  name: z.string().min(3),
  criteria: z.array(
    z.object({
      name: z.string(),
      maxPoints: z.number().positive(),
      weight: z.number().optional(),
    })
  ),
});

export async function GET() {
  try {
    const tenantId = await getTenantId();
    // Return sample configured QA rubrics for the client tenant
    const rubrics = [
      {
        id: "rubric-01",
        tenantId,
        name: "Standard Client Omnichannel QA Rubric 2025",
        criteria: [
          { name: "Accuracy & Solution Quality", maxPoints: 30 },
          { name: "Tone & Professionalism", maxPoints: 25 },
          { name: "SLA & Keyword Compliance", maxPoints: 45 },
        ],
      },
    ];
    return successResponse(rubrics);
  } catch (err) {
    if (err instanceof ApiError) return errorResponse(err.status, err.code, err.message);
    return errorResponse(500, "INTERNAL_ERROR", "Failed to fetch QA rubrics.");
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = await getTenantId();
    const body = await request.json();
    const parsed = createRubricSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(422, "VALIDATION_ERROR", "Invalid rubric criteria", parsed.error.issues);
    }

    const created = {
      id: `rubric-${Date.now()}`,
      tenantId,
      ...parsed.data,
      createdAt: new Date().toISOString(),
    };

    return successResponse(created, undefined, 201);
  } catch (err) {
    if (err instanceof ApiError) return errorResponse(err.status, err.code, err.message);
    return errorResponse(500, "INTERNAL_ERROR", "Failed to create QA rubric.");
  }
}
