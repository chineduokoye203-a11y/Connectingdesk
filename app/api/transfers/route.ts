import { NextRequest } from "next/server";
import { TransferService } from "@/features/transfers/services/transfer.service";
import { getTenantId } from "@/lib/tenant";
import { errorResponse, successResponse } from "@/lib/api-response";
import { z } from "zod";

const transferSchema = z.object({
  callId: z.string().min(1, "Call ID is required"),
  supervisorId: z.string().min(1, "Supervisor is required"),
  supervisorName: z.string().min(1, "Supervisor name is required"),
  reason: z.string().min(1, "Transfer reason is required"),
  customerInfo: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = transferSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(422, "VALIDATION_ERROR", "Invalid transfer input", parsed.error.issues);
    }

    const tenantId = await getTenantId();
    const record = await TransferService.transferToSupervisor({
      ...parsed.data,
      tenantId,
    });

    return successResponse({ transfer: record }, undefined, 201);
  } catch (err) {
    console.error("[Transfer] Error:", err);
    const message = err instanceof Error ? err.message : "Failed to transfer call";
    return errorResponse(500, "TRANSFER_ERROR", message);
  }
}
