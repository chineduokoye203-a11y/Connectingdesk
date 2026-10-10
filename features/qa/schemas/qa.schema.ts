import { z } from "zod";

export const qaReviewStatusEnum = z.enum(["PENDING", "PASSED", "FLAGGED", "ESCALATED"]);

export const submitQAScorecardSchema = z.object({
  ticketId: z.string().min(1, "Ticket ID is required"),
  agentId: z.string().min(1, "Agent ID is required"),
  reviewerId: z.string().min(1, "Reviewer ID is required"),
  rubricId: z.string().min(1, "Rubric ID is required"),
  score: z.number().min(0).max(100),
  status: qaReviewStatusEnum,
  feedback: z.string().optional(),
  criteriaScores: z.array(
    z.object({
      criterionName: z.string(),
      weight: z.number(),
      score: z.number()
    })
  )
});

export type SubmitQAScorecardInput = z.infer<typeof submitQAScorecardSchema>;
