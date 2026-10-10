import { NextRequest } from "next/server";
import { getTenantId } from "@/lib/tenant";
import { createTicketSchema, listTicketsSchema } from "@/features/tickets/schemas/ticket.schema";
import { TicketService } from "@/features/tickets/services/ticket.service";
import { ApiError, errorResponse, successResponse } from "@/lib/api-response";

export async function GET(request: NextRequest) {
  try {
    const tenantId = await getTenantId();
    const query = Object.fromEntries(request.nextUrl.searchParams);
    const parsed = listTicketsSchema.safeParse(query);

    if (!parsed.success) {
      return errorResponse(422, "VALIDATION_ERROR", "Invalid query parameters.", parsed.error.issues);
    }

    const result = await TicketService.list(tenantId, parsed.data);
    return successResponse(result.data, result.meta);
  } catch (err) {
    if (err instanceof ApiError) return errorResponse(err.status, err.code, err.message);
    return errorResponse(500, "INTERNAL_ERROR", "Something went wrong. Please try again later.");
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = await getTenantId();
    const body = await request.json();
    const parsed = createTicketSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse(422, "VALIDATION_ERROR", "Invalid request body.", parsed.error.issues);
    }

    const ticket = await TicketService.create(tenantId, parsed.data);
    return successResponse(ticket, undefined, 201);
  } catch (err) {
    if (err instanceof ApiError) return errorResponse(err.status, err.code, err.message);
    return errorResponse(500, "INTERNAL_ERROR", "Something went wrong. Please try again later.");
  }
}
