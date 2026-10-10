import { z } from "zod";

export const TicketStatusEnum = z.enum([
  "OPEN",
  "ASSIGNED",
  "IN_PROGRESS",
  "WAITING_CUSTOMER",
  "WAITING_INTERNAL",
  "ESCALATED",
  "RESOLVED",
  "CLOSED",
  "REOPENED",
]);

export const TicketPriorityEnum = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);
export const ConversationChannelEnum = z.enum(["CALL", "CHAT", "EMAIL", "SOCIAL"]);

export const createTicketSchema = z.object({
  customerId: z.string().uuid("Invalid customer ID"),
  subject: z.string().min(3, "Subject must be at least 3 characters long"),
  priority: TicketPriorityEnum.default("MEDIUM"),
  channel: ConversationChannelEnum.default("EMAIL"),
  initialComment: z.string().optional(),
});

export const listTicketsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(100).default(20),
  status: TicketStatusEnum.optional(),
  priority: TicketPriorityEnum.optional(),
  search: z.string().optional(),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type ListTicketsInput = z.infer<typeof listTicketsSchema>;
