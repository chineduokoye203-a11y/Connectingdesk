import { z } from "zod";

export const leaderboardPeriodEnum = z.enum(["week", "month", "all"]);

export const leaderboardQuerySchema = z.object({
  period: leaderboardPeriodEnum.default("week"),
});

export type LeaderboardQuery = z.infer<typeof leaderboardQuerySchema>;
export type LeaderboardPeriod = z.infer<typeof leaderboardPeriodEnum>;
