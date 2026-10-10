import { SubmitQAScorecardInput } from "../schemas/qa.schema";

export type QAScorecardItem = {
  id: string;
  tenantId: string;
  ticketId: string;
  agentId: string;
  agentName: string;
  reviewerId: string;
  rubricId: string;
  score: number;
  status: "PENDING" | "PASSED" | "FLAGGED" | "ESCALATED";
  feedback?: string;
  createdAt: string;
};

const mockQAReviews: QAScorecardItem[] = [
  {
    id: "qa-001",
    tenantId: "default-tenant",
    ticketId: "ticket-101",
    agentId: "agent-01",
    agentName: "Jane Doe (Agent)",
    reviewerId: "sup-01",
    rubricId: "rubric-101",
    score: 94.5,
    status: "PASSED",
    feedback: "Excellent empathy, verified security steps correctly before changing address.",
    createdAt: new Date().toISOString()
  },
  {
    id: "qa-002",
    tenantId: "default-tenant",
    ticketId: "ticket-102",
    agentId: "agent-02",
    agentName: "Alex Rivera",
    reviewerId: "sup-01",
    rubricId: "rubric-101",
    score: 72.0,
    status: "FLAGGED",
    feedback: "Missed mandatory greeting template in live chat.",
    createdAt: new Date().toISOString()
  }
];

export class QAService {
  static async listReviews(tenantId: string): Promise<QAScorecardItem[]> {
    return mockQAReviews.filter((r) => r.tenantId === tenantId);
  }

  static async submitEvaluation(tenantId: string, input: SubmitQAScorecardInput): Promise<QAScorecardItem> {
    const newItem: QAScorecardItem = {
      id: `qa-${Date.now()}`,
      tenantId,
      ticketId: input.ticketId,
      agentId: input.agentId,
      agentName: "Specialist",
      reviewerId: input.reviewerId,
      rubricId: input.rubricId,
      score: input.score,
      status: input.status,
      feedback: input.feedback,
      createdAt: new Date().toISOString()
    };
    mockQAReviews.push(newItem);
    return newItem;
  }
}
