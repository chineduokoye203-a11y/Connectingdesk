import { createTicketSchema, listTicketsSchema, type CreateTicketInput, type ListTicketsInput } from "../schemas/ticket.schema";

export type TicketItem = {
  id: string;
  tenantId: string;
  customerId: string;
  customerName: string;
  subject: string;
  status: string;
  priority: string;
  channel: string;
  createdAt: string;
  updatedAt: string;
};

// In-memory fallback dataset for initial Phase 1 execution
const mockTickets: TicketItem[] = [
  {
    id: "ticket-101",
    tenantId: "default-tenant",
    customerId: "cust-01",
    customerName: "Alice Smith",
    subject: "Unable to access billing invoice",
    status: "OPEN",
    priority: "HIGH",
    channel: "EMAIL",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "ticket-102",
    tenantId: "default-tenant",
    customerId: "cust-02",
    customerName: "Bob Johnson",
    subject: "Question about API rate limits",
    status: "IN_PROGRESS",
    priority: "MEDIUM",
    channel: "CHAT",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export class TicketService {
  static async list(tenantId: string, input: ListTicketsInput) {
    const filtered = mockTickets.filter((t) => t.tenantId === tenantId);
    return {
      data: filtered,
      meta: {
        page: input.page,
        pageSize: input.pageSize,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / input.pageSize),
      },
    };
  }

  static async create(tenantId: string, input: CreateTicketInput): Promise<TicketItem> {
    const newTicket: TicketItem = {
      id: `ticket-${Date.now()}`,
      tenantId,
      customerId: input.customerId,
      customerName: "Customer Placeholder",
      subject: input.subject,
      status: "OPEN",
      priority: input.priority,
      channel: input.channel,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockTickets.push(newTicket);
    return newTicket;
  }
}
