import type { LeaderboardPeriod } from "../schemas/leaderboard.schema";

/* ─────────────────────────────────────────────────────────────
   Leaderboard domain model

   The leaderboard is *derived* from raw support events — resolved
   tickets and QA reviews — rather than stored as a fixed ranking.
   That way it recomputes automatically as real work happens.

   Data sources (single seam to swap for production):
   - listAgents()        → agents in the tenant (currently in-memory)
   - listResolvedTickets() → tickets resolved (channel + timestamp)
   - listQAReviews()      → QA reviews (score + timestamp)

   In production these read from PostgreSQL (Prisma) instead of the
   in-memory datasets below. The aggregation logic above the seam
   stays identical.
   ───────────────────────────────────────────────────────────── */

export type LeaderboardEntry = {
  agentId: string;
  name: string;
  initials: string;
  color: string;
  callsResolved: number;
  ticketsResolved: number;
  qaScore: number;
  reviewCount: number;
  qualityScore: number;
};

type AgentProfile = {
  id: string;
  name: string;
  skill: number; // 0–1, drives average QA score
  volume: number; // 0–1, drives resolution throughput
  color: string;
};

type ResolvedTicket = {
  agentId: string;
  channel: "CALL" | "CHAT" | "EMAIL" | "SOCIAL";
  resolvedAt: number;
};

type QAReview = {
  agentId: string;
  score: number; // 0–100
  createdAt: number;
};

const DAY_MS = 86_400_000;

const AVATAR_COLORS = [
  "#3080ff",
  "#8B5CF6",
  "#00875A",
  "#F68B1E",
  "#EC4899",
  "#3B82F6",
  "#008CDB",
  "#0EA5E9",
];

const AGENT_PROFILES: AgentProfile[] = [
  { id: "ag-1", name: "Adewale Bello", skill: 0.9, volume: 1.0, color: AVATAR_COLORS[0] },
  { id: "ag-2", name: "Chiamaka Nwosu", skill: 0.94, volume: 0.9, color: AVATAR_COLORS[1] },
  { id: "ag-you", name: "Jane Doe", skill: 0.82, volume: 0.8, color: AVATAR_COLORS[2] },
  { id: "ag-4", name: "Emeka Obi", skill: 0.86, volume: 0.76, color: AVATAR_COLORS[3] },
  { id: "ag-5", name: "Fatima Sule", skill: 0.78, volume: 0.7, color: AVATAR_COLORS[4] },
  { id: "ag-6", name: "Ibrahim Danjuma", skill: 0.72, volume: 0.62, color: AVATAR_COLORS[5] },
  { id: "ag-7", name: "Ngozi Okafor", skill: 0.66, volume: 0.54, color: AVATAR_COLORS[6] },
  { id: "ag-8", name: "Tunde Adeyemi", skill: 0.58, volume: 0.46, color: AVATAR_COLORS[7] },
];

/** Deterministic PRNG so the seeded dataset is stable between renders. */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashCode(value: string): number {
  let h = 0;
  for (let i = 0; i < value.length; i += 1) {
    h = (Math.imul(31, h) + value.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

function initialsOf(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/**
 * In-memory seed for the "resolved tickets" and "QA reviews" event streams.
 * Simulates ~35 days of activity so the week / month / all-time periods
 * produce different results. Replace with Prisma reads when live.
 */
function seedEventStreams(): { tickets: ResolvedTicket[]; reviews: QAReview[] } {
  const tickets: ResolvedTicket[] = [];
  const reviews: QAReview[] = [];
  const channels: ResolvedTicket["channel"][] = ["CALL", "CALL", "CALL", "CHAT", "EMAIL", "SOCIAL"];
  const now = Date.now();

  for (const agent of AGENT_PROFILES) {
    const rand = mulberry32(hashCode(agent.id));
    const ticketCount = Math.round(agent.volume * 170);
    const reviewCount = Math.round(agent.volume * 55);

    for (let i = 0; i < ticketCount; i += 1) {
      const resolvedAt = now - Math.floor(rand() * 35) * DAY_MS;
      tickets.push({
        agentId: agent.id,
        channel: channels[Math.floor(rand() * channels.length)],
        resolvedAt,
      });
    }

    for (let i = 0; i < reviewCount; i += 1) {
      const createdAt = now - Math.floor(rand() * 35) * DAY_MS;
      const noise = (rand() - 0.5) * 16;
      const score = Math.round(Math.min(100, Math.max(40, agent.skill * 98 + noise)) * 10) / 10;
      reviews.push({ agentId: agent.id, score, createdAt });
    }
  }

  return { tickets, reviews };
}

const { tickets: SEED_TICKETS, reviews: SEED_REVIEWS } = seedEventStreams();

function periodStart(period: LeaderboardPeriod): number {
  if (period === "week") return Date.now() - 7 * DAY_MS;
  if (period === "month") return Date.now() - 30 * DAY_MS;
  return 0;
}

/**
 * Quality Score (0–100) — rewards call *quality* first, volume second,
 * so specialists are not incentivised to churn through low-quality calls.
 *   QA Score .......... 60%
 *   Resolution volume .. 40% (relative to the top performer)
 */
function computeQualityScore(qaScore: number, callsResolved: number, maxCalls: number): number {
  const volumeComponent = maxCalls > 0 ? (callsResolved / maxCalls) * 100 : 0;
  return Math.round(qaScore * 0.6 + volumeComponent * 0.4);
}

export class LeaderboardService {
  static async getLeaderboard(_tenantId: string, period: LeaderboardPeriod): Promise<LeaderboardEntry[]> {
    const since = periodStart(period);

    const resolvedTickets = SEED_TICKETS.filter((t) => t.resolvedAt >= since);
    const reviews = SEED_REVIEWS.filter((r) => r.createdAt >= since);

    const rows = AGENT_PROFILES.map((agent) => {
      const agentTickets = resolvedTickets.filter((t) => t.agentId === agent.id);
      const agentReviews = reviews.filter((r) => r.agentId === agent.id);

      const callsResolved = agentTickets.filter((t) => t.channel === "CALL").length;
      const ticketsResolved = agentTickets.length;
      const reviewCount = agentReviews.length;
      const qaScore = reviewCount
        ? Math.round((agentReviews.reduce((sum, r) => sum + r.score, 0) / reviewCount) * 10) / 10
        : 0;

      return {
        agentId: agent.id,
        name: agent.name,
        initials: initialsOf(agent.name),
        color: agent.color,
        callsResolved,
        ticketsResolved,
        qaScore,
        reviewCount,
        qualityScore: 0,
      };
    });

    const maxCalls = Math.max(...rows.map((r) => r.callsResolved), 1);

    return rows
      .map((row) => ({ ...row, qualityScore: computeQualityScore(row.qaScore, row.callsResolved, maxCalls) }))
      .sort((a, b) => b.qualityScore - a.qualityScore || b.callsResolved - a.callsResolved);
  }
}
