import { NextRequest } from "next/server";
import { LeaderboardService } from "@/features/leaderboard/services/leaderboard.service";
import { leaderboardQuerySchema } from "@/features/leaderboard/schemas/leaderboard.schema";
import { getTenantId } from "@/lib/tenant";
import { errorResponse, successResponse } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const tenantId = await getTenantId();
    const query = Object.fromEntries(request.nextUrl.searchParams);
    const parsed = leaderboardQuerySchema.safeParse(query);

    if (!parsed.success) {
      return errorResponse(422, "VALIDATION_ERROR", "Invalid query parameters.", parsed.error.issues);
    }

    const entries = await LeaderboardService.getLeaderboard(tenantId, parsed.data.period);
    return successResponse(entries, { period: parsed.data.period });
  } catch (err) {
    console.error("[Leaderboard] Error:", err);
    const message = err instanceof Error ? err.message : "Failed to load leaderboard";
    return errorResponse(500, "LEADERBOARD_ERROR", message);
  }
}
