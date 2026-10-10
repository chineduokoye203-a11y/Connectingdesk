"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Headphones, Bell, MessageSquare, Sun, Moon, Mic, MicOff, Pause,
  PhoneOff, ArrowLeft, ArrowRight, Sparkles,
  Send, ChevronDown, RotateCcw, CheckCircle, PhoneIncoming,
  PhoneOutgoing, Search, X, Calendar, RefreshCw, AlertTriangle,
  Phone, Mail, Inbox, Clock, CreditCard, Trophy, User, Delete, CornerUpRight, Pencil,
  Copy, Type, Paperclip, Smile, Link, Download, Image, Share, ChevronRight,
  Landmark, ShieldCheck,
  Building2, KeyRound, LogOut, Star, Grid2x2,
} from "lucide-react";

/* ─── Data ─────────────────────────────────── */
const PRINCIPALS = [
  { id: "p1", name: "CHOWDECK", description: "Chowdeck is a technology company that provides logistics services to both vendors...", color: "#00875A", initial: "C", queue: 10, logo: "/logos/chowdeck.png.png" },
  { id: "p2", name: "JUMIA", description: "Jumia is a leading Pan African e-commerce platform that connects millions of consumers", color: "#F68B1E", initial: "J", queue: 10, logo: "/jumiaa.png" },
  { id: "p3", name: "JIJI NIGERIA", description: "Jiji Nigeria is a leading brand in the Nigerian market that offers a wide range of products..", color: "#008CDB", initial: "JJ", queue: 8, logo: "/logos/Jiji.png.png" },
];

const NAV_LABELS: Record<string, string> = {
  calls: "Calls",
  messages: "Messages",
  earning: "Earning History",
  rates: "Rates",
  payout: "Payout",
  leaderboard: "Leaderboard",
  profile: "Profile",
};

type AgentStatusId = "online" | "away" | "busy" | "offline" | "after-call-work" | "on-break" | "training";

const AGENT_STATUSES: { id: AgentStatusId; label: string; color: string; bg: string }[] = [
  { id: "online", label: "Online - Ready for Calls", color: "#00875A", bg: "#e8f5ef" },
  { id: "away", label: "Away", color: "#F68B1E", bg: "#fdf1e0" },
  { id: "busy", label: "Busy - On Call", color: "var(--color-error-color)", bg: "var(--color-error-container-color)" },
  { id: "after-call-work", label: "After Call Work", color: "#8B5CF6", bg: "#f1ecfe" },
  { id: "on-break", label: "On Break", color: "#EC4899", bg: "#fdeef5" },
  { id: "training", label: "Training", color: "#3B82F6", bg: "#e8f1fe" },
  { id: "offline", label: "Offline", color: "var(--color-outline-color)", bg: "var(--color-surface-container-color)" },
];

const DECLINE_REASONS = [
  "Already on another call",
  "On a break",
  "Technical issues",
  "End of shift",
  "Other",
];

const STATUS_TITLES: Record<AgentStatusId, string> = {
  online: "You are in the Queue",
  away: "You are Away",
  busy: "You are Busy - On Call",
  "after-call-work": "After Call Work",
  "on-break": "You are on Break",
  training: "You are in Training",
  offline: "You are Offline",
};

const AI_SUGGESTIONS_FALLBACK = [
  { label: "Suggested Response 1 of 3", text: "Thank you for contacting us. I'm looking into your request right now and will have an update for you shortly." },
  { label: "Suggested Response 2 of 3", text: "I understand your concern. Let me review your account details and find the best solution for you." },
  { label: "Suggested Response 3 of 3", text: "I appreciate your patience. I'm going to escalate this to ensure it gets resolved as quickly as possible." },
];

type LiveSuggestion = { label: string; text: string; live?: boolean };

type LiveAiStage = {
  customerLine: string;
  intent: string;
  suggestions: { label: string; text: string }[];
};

const LIVE_AI_STAGES: LiveAiStage[] = [
  {
    customerLine: "Hi, I ordered a delivery last week but the tracking hasn't updated since Monday.",
    intent: "Order & delivery status",
    suggestions: [
      { label: "Acknowledge & verify", text: "Thank you for waiting. I'm pulling up your tracking details now - can you confirm the order number you have on your end?" },
      { label: "Set expectation", text: "I can see the shipment is still within its delivery window. Let me check the courier updates and give you a confirmed status." },
    ],
  },
  {
    customerLine: "I'm worried it might be lost. Other people say deliveries get stuck at the Lagos hub.",
    intent: "Reassurance & escalation",
    suggestions: [
      { label: "Validate concern", text: "That is completely understandable. Let me verify with the dispatch team so I can give you an accurate update rather than a guess." },
      { label: "Proactive step", text: "I'll raise a trace to the hub now and set a 10-minute check-in so you're not left waiting for an answer." },
    ],
  },
  {
    customerLine: "And if it stays delayed, will I get a refund for the shipping fee?",
    intent: "Delivery SLA & compensation",
    suggestions: [
      { label: "Policy-aware reply", text: "For service delays under our SLA, we can waive the shipping fee or issue a partial refund once the claim is confirmed. Let me verify your eligibility." },
      { label: "Next step", text: "Compensation needs approval per policy, so I'll prepare the claim now and loop in the billing team - you'll get confirmation once it is processed." },
    ],
  },
  {
    customerLine: "That's fine, as long as I get an update by the end of today.",
    intent: "Commit to outcome",
    suggestions: [
      { label: "Close the loop", text: "I'll make sure you receive a written update by end of day via SMS and email - whichever you prefer. Anything else I can help with?" },
    ],
  },
];

const FILTER_CHIPS = ["Order and Delivery", "Card Payment", "Product", "Transaction", "Return and Refund"];

type OutboundContact = {
  id: string;
  customerName: string;
  customerId: string;
  phone: string;
  email: string;
  accountStatus: "active" | "inactive" | "suspended";
  previousInteractions: number;
  lastCallDate: string;
  lastDisposition: string;
  time: string;
  duration: string;
  status: string;
  disposition: string;
  reasonForCallback: string;
};

const OUTBOUND_CALL_HISTORY: OutboundContact[] = [
  { id: "oc1", customerName: "Chidi Okoro", customerId: "CUST-4521", phone: "+234 812 345 6789", email: "chidi.okoro@email.com", accountStatus: "active", previousInteractions: 5, lastCallDate: "Aug 19, 2026", lastDisposition: "Resolved", time: "10:23 AM", duration: "4:12", status: "completed", disposition: "Resolved", reasonForCallback: "Follow up on loyalty rewards redemption — customer asked to confirm points balance." },
  { id: "oc2", customerName: "Fatima Abubakar", customerId: "CUST-3187", phone: "+234 908 123 4567", email: "fatima.a@email.com", accountStatus: "active", previousInteractions: 2, lastCallDate: "Aug 15, 2026", lastDisposition: "Escalated to Supervisor", time: "09:50 AM", duration: "1:45", status: "no-answer", disposition: "—", reasonForCallback: "Delayed delivery complaint — needs update on resolution from logistics team." },
  { id: "oc3", customerName: "Bola Adeyemi", customerId: "CUST-7803", phone: "+234 706 987 6543", email: "bola.adeyemi@email.com", accountStatus: "active", previousInteractions: 8, lastCallDate: "Aug 18, 2026", lastDisposition: "Escalated to Supervisor", time: "09:15 AM", duration: "6:30", status: "completed", disposition: "Escalated to Supervisor", reasonForCallback: "Billing dispute — double charge on last invoice. Billing team investigating." },
  { id: "oc4", customerName: "Emeka Nwankwo", customerId: "CUST-5509", phone: "+234 803 456 7890", email: "emeka.n@email.com", accountStatus: "suspended", previousInteractions: 1, lastCallDate: "Aug 10, 2026", lastDisposition: "—", time: "Yesterday", duration: "0:52", status: "busy", disposition: "—", reasonForCallback: "Account suspended — customer wants reinstatement process explained." },
  { id: "oc5", customerName: "Sade Okafor", customerId: "CUST-2216", phone: "+234 815 678 1234", email: "sade.okafor@email.com", accountStatus: "active", previousInteractions: 4, lastCallDate: "Aug 17, 2026", lastDisposition: "Callback Required", time: "Yesterday", duration: "3:08", status: "completed", disposition: "Callback Required", reasonForCallback: "Subscription renewal — customer asked for pricing options before renewing." },
  { id: "oc6", customerName: "Ibrahim Musa", customerId: "CUST-6634", phone: "+234 709 234 5678", email: "ibrahim.musa@email.com", accountStatus: "active", previousInteractions: 3, lastCallDate: "Aug 20, 2026", lastDisposition: "Resolved", time: "Yesterday", duration: "2:41", status: "completed", disposition: "Resolved", reasonForCallback: "Login issue resolved — follow up to confirm no recurrence." },
  { id: "oc7", customerName: "Amina Bello", customerId: "CUST-1102", phone: "+234 811 998 7700", email: "amina.bello@email.com", accountStatus: "active", previousInteractions: 6, lastCallDate: "Aug 14, 2026", lastDisposition: "Resolved", time: "2 days ago", duration: "5:10", status: "completed", disposition: "Resolved", reasonForCallback: "Premium plan enquiry — customer wants to upgrade but needs feature breakdown." },
  { id: "oc8", customerName: "Tunde Akinola", customerId: "CUST-8812", phone: "+234 705 321 0987", email: "tunde.akinola@email.com", accountStatus: "inactive", previousInteractions: 0, lastCallDate: "—", lastDisposition: "—", time: "2 days ago", duration: "0:30", status: "no-answer", disposition: "—", reasonForCallback: "New lead — no prior interactions. Call to introduce services and activate account." },
  { id: "oc9", customerName: "Ngozi Eze", customerId: "CUST-3345", phone: "+234 902 111 2233", email: "ngozi.eze@email.com", accountStatus: "active", previousInteractions: 3, lastCallDate: "Aug 16, 2026", lastDisposition: "Callback Required", time: "3 days ago", duration: "2:55", status: "completed", disposition: "Callback Required", reasonForCallback: "Plan downgrade request — needs pricing discussion before confirming." },
  { id: "oc10", customerName: "Kunle Adesanya", customerId: "CUST-4490", phone: "+234 816 444 5566", email: "kunle.a@email.com", accountStatus: "active", previousInteractions: 7, lastCallDate: "Aug 19, 2026", lastDisposition: "Resolved", time: "3 days ago", duration: "8:02", status: "completed", disposition: "Resolved", reasonForCallback: "API integration resolved — follow up to confirm everything is working smoothly." },
  { id: "oc11", customerName: "Zainab Abdullahi", customerId: "CUST-2278", phone: "+234 809 777 8899", email: "zainab.abd@email.com", accountStatus: "active", previousInteractions: 2, lastCallDate: "Aug 12, 2026", lastDisposition: "Resolved", time: "4 days ago", duration: "3:22", status: "completed", disposition: "Resolved", reasonForCallback: "Shipping address updated — confirm delivery to new address." },
  { id: "oc12", customerName: "Damilola Ogundimu", customerId: "CUST-5561", phone: "+234 703 222 3344", email: "damilola.o@email.com", accountStatus: "active", previousInteractions: 4, lastCallDate: "Aug 18, 2026", lastDisposition: "Escalated to Supervisor", time: "4 days ago", duration: "4:48", status: "completed", disposition: "Escalated to Supervisor", reasonForCallback: "Double charge complaint — escalated to billing. Follow-up pending resolution." },
  { id: "oc13", customerName: "Uche Okonkwo", customerId: "CUST-7700", phone: "+234 810 666 7788", email: "uche.ok@email.com", accountStatus: "suspended", previousInteractions: 1, lastCallDate: "Aug 8, 2026", lastDisposition: "—", time: "5 days ago", duration: "1:15", status: "completed", disposition: "—", reasonForCallback: "Account suspended — needs walkthrough of reinstatement steps." },
  { id: "oc14", customerName: "Funke Akindele", customerId: "CUST-9934", phone: "+234 813 555 6677", email: "funke.akindele@email.com", accountStatus: "active", previousInteractions: 10, lastCallDate: "Aug 20, 2026", lastDisposition: "Resolved", time: "5 days ago", duration: "6:45", status: "completed", disposition: "Resolved", reasonForCallback: "Power user feedback call — collect product improvement suggestions." },
  { id: "oc15", customerName: "Obinna Nnaemeke", customerId: "CUST-6688", phone: "+234 907 888 9900", email: "obinna.n@email.com", accountStatus: "active", previousInteractions: 3, lastCallDate: "Aug 15, 2026", lastDisposition: "Callback Required", time: "6 days ago", duration: "2:18", status: "completed", disposition: "Callback Required", reasonForCallback: "Team plan pricing enquiry — send follow-up email with pricing breakdown." },
];

const DISPOSITIONS = ["Resolved", "Escalated to Supervisor", "Callback Required"];
const TRAINING_DISPOSITION = "Test Call";

const SUPERVISORS = [
  { id: "s1", name: "Adaeze Okonkwo" },
  { id: "s2", name: "Tunde Bakare" },
  { id: "s3", name: "Nneka Eze" },
];

type MessageThread = {
  id: string;
  sender: "customer" | "agent";
  name: string;
  text: string;
  time: string;
};

type MessageSource = "Chat" | "Email" | "SMS" | "Twitter" | "TikTok" | "Instagram" | "Facebook";

type PrincipalMessage = {
  id: string;
  customerName: string;
  channel: "Chat" | "Email" | "Social";
  source: MessageSource;
  email?: string;
  username?: string;
  app?: string;
  preview: string;
  unread: number;
  thread: MessageThread[];
  handled?: boolean;
};

const PRINCIPAL_MESSAGES: Record<string, PrincipalMessage[]> = {
  p1: [
    { id: "m1", customerName: "Sarah Jenkins", channel: "Chat", source: "Chat", preview: "I need to change the delivery address for order #FCE-9402.", unread: 2, thread: [
      { id: "t1", sender: "customer", name: "Sarah Jenkins", text: "Hello! My shipment #FCE-9402 was supposed to ship to Austin, but the portal says Dallas.", time: "10:40 AM" },
      { id: "t2", sender: "customer", name: "Sarah Jenkins", text: "I need to change the delivery address urgently before it dispatches.", time: "10:42 AM" },
    ]},
    { id: "m2", customerName: "Marcus Vance", channel: "Email", source: "Email", email: "mvance@enterprise.co", preview: "Re: bulk subscription discount renewal.", unread: 0, thread: [
      { id: "t3", sender: "customer", name: "Marcus Vance", text: "Hi support team, we are extending our tier-2 enterprise contract. Can you send the updated order form?", time: "09:15 AM" },
    ]},
    { id: "m3", customerName: "Elena Rostova", channel: "Social", source: "TikTok", username: "@elena.codes", app: "TikTok", preview: "Webhook calls are hitting 429 errors during high load.", unread: 1, thread: [
      { id: "t4", sender: "customer", name: "Elena Rostova", text: "Hey! Our webhook calls are hitting 429 errors during high load. Could you bump our API quota?", time: "4:30 PM" },
    ]},
  ],
  p2: [
    { id: "m4", customerName: "Kingsley Okafor", channel: "Chat", source: "Chat", preview: "My payment went through but the order still shows pending.", unread: 3, thread: [
      { id: "t5", sender: "customer", name: "Kingsley Okafor", text: "Hi, I paid for my order 30 minutes ago but it still shows pending.", time: "11:05 AM" },
    ]},
    { id: "m5", customerName: "Amara Bello", channel: "Email", source: "Email", email: "amara.bello@gmail.com", preview: "Refund request for a cancelled item.", unread: 0, thread: [
      { id: "t6", sender: "customer", name: "Amara Bello", text: "I cancelled item #JUM-2201 and would like a refund to my original payment method.", time: "08:50 AM" },
    ]},
  ],
  p3: [
    { id: "m6", customerName: "Tunde Alabi", channel: "Chat", source: "Chat", preview: "I want to renew my featured listing.", unread: 1, thread: [
      { id: "t7", sender: "customer", name: "Tunde Alabi", text: "How do I renew my featured listing and boost my ad?", time: "12:20 PM" },
    ]},
    { id: "m7", customerName: "Ngozi Eze", channel: "Social", source: "Instagram", username: "@ngozi.shop", app: "Instagram", preview: "My account was flagged incorrectly.", unread: 2, thread: [
      { id: "t8", sender: "customer", name: "Ngozi Eze", text: "My seller account was flagged for no reason. Can someone review it?", time: "1:10 PM" },
    ]},
  ],
};

/* ─── Earnings & Payouts ─────────────────────── */
type EarningStatus = "pending" | "approved" | "paid" | "on-hold";
type WorkType = "call" | "chat" | "email" | "ticket" | "ai";

type QaResult = "Passed" | "Flagged" | "Not Reviewed";

type EarningEvent = {
  id: string;
  workType: WorkType;
  principal: string;
  refId: string;
  base: number;
  bonus: number;
  qaAdjustment: number;
  status: EarningStatus;
  createdAt: number;
  qaStatus: QaResult;
  note: string;
  paidAt?: number;
  paymentMethod?: string;
  payRef?: string;
};

type PayoutStatus = "processing" | "paid" | "failed" | "cancelled";

type PayoutRecord = {
  id: string;
  amount: number;
  fee: number;
  netAmount: number;
  reference: string;
  method: string;
  status: PayoutStatus;
  bankName: string;
  accountNumberMasked: string;
  createdAt: number;
  processingDate?: number;
  completedAt?: number;
  failureReason?: string;
};

const CALL_EARNING_RATE = 25000;
const MESSAGE_EARNING_RATE = 12500;
const AI_EARNING_RATE = 15000;
const PAYOUT_TARGET = 1000000;
const PAYOUT_DAY_OF_MONTH = 25;
const DAY_MS = 86400000;

type PayoutAccount = { bankName: string; accountNumber: string; accountName: string };
const maskAccount = (n: string) => (n.length >= 7 ? `${n.slice(0, 3)} •••• ${n.slice(-4)}` : n);

// Payout accounts are set up by Connectdesk, not by the specialist.
const SEED_PAYOUT_ACCOUNT: PayoutAccount = {
  bankName: "Guaranty Trust Bank (GTB)",
  accountNumber: "0123456789",
  accountName: "Jane Doe",
};

const ordinal = (n: number) => {
  const suffix = n % 10 === 1 && n % 100 !== 11 ? "st" : n % 10 === 2 && n % 100 !== 12 ? "nd" : n % 10 === 3 && n % 100 !== 13 ? "rd" : "th";
  return `${n}${suffix}`;
};
const PAYOUT_DAY_OF_MONTHOrdinal = ordinal(PAYOUT_DAY_OF_MONTH);

/** Payouts run automatically on a fixed day each month, so the agent never triggers one. */
const getNextPayoutDate = () => {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth(), PAYOUT_DAY_OF_MONTH);
  if (next.getTime() < now.getTime()) next.setMonth(next.getMonth() + 1);
  return next;
};

const fmtMoney = (n: number) => `₦${n.toFixed(2)}`;
const NGN_PER_USD = 1550;
const fmtUsd = (n: number) => `$${(n / NGN_PER_USD).toFixed(2)}`;
const fmtDate = (ts: number) =>
  new Date(ts).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
const fmtTime = (ts: number) =>
  new Date(ts).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

const earningTotal = (e: EarningEvent) => e.base + e.bonus + e.qaAdjustment;

/* ─── Principal Rates ───────────────────────────
 * What each Client Company pays Connectdesk per unit of work handled.
 * This is inbound revenue, not specialist payout — see the Earnings History page.
 */
type RateUnit = "inbound-call" | "outbound-call" | "chat" | "email" | "social";

const RATE_UNITS: RateUnit[] = ["inbound-call", "outbound-call", "chat", "email", "social"];

const RATE_UNIT_META: Record<RateUnit, { label: string; group: "Calls" | "Omnichannel Messages"; desc: string; color: string; bg: string }> = {
  "inbound-call": { label: "Inbound Call", group: "Calls", desc: "A call the customer initiated", color: "#3080ff", bg: "#e8f1fe" },
  "outbound-call": { label: "Outbound Call", group: "Calls", desc: "A call we place to the customer", color: "#1B6EF3", bg: "#e6f0ff" },
  chat: { label: "Live Chat Ticket", group: "Omnichannel Messages", desc: "A ticket resolved over live chat", color: "#8B5CF6", bg: "#f1ecfe" },
  email: { label: "Email Ticket", group: "Omnichannel Messages", desc: "A ticket resolved over email", color: "#EC4899", bg: "#fdeef5" },
  social: { label: "Social Ticket", group: "Omnichannel Messages", desc: "A ticket resolved over social channels", color: "#F68B1E", bg: "#fdf1e0" },
};

type PrincipalRate = {
  principalId: string;
  rates: Record<RateUnit, number>;
};

const PRINCIPAL_RATES: PrincipalRate[] = [
  { principalId: "p1", rates: { "inbound-call": 30000, "outbound-call": 36000, chat: 14000, email: 12000, social: 13500 } },
  { principalId: "p2", rates: { "inbound-call": 34000, "outbound-call": 40000, chat: 15500, email: 14000, social: 15000 } },
  { principalId: "p3", rates: { "inbound-call": 28000, "outbound-call": 33000, chat: 12500, email: 11000, social: 12000 } },
];

const WORK_TYPE_ORDER: WorkType[] = ["call", "chat", "email", "ticket", "ai"];
const WORK_TYPE_META: Record<WorkType, { label: string; color: string; bg: string }> = {
  call: { label: "Call", color: "#3080ff", bg: "#e8f1fe" },
  chat: { label: "Chat", color: "#8B5CF6", bg: "#f1ecfe" },
  email: { label: "Email", color: "#EC4899", bg: "#fdeef5" },
  ticket: { label: "Ticket", color: "#F68B1E", bg: "#fdf1e0" },
  ai: { label: "AI Task", color: "#00875A", bg: "#e8f5ef" },
};

const TASK_LABELS: Record<WorkType, string> = {
  call: "Phone Call",
  chat: "Live Chat Conversation",
  email: "Email Thread",
  ticket: "Ticket Resolution",
  ai: "AI-Assisted Task",
};

const QA_META: Record<QaResult, { label: string; color: string; bg: string }> = {
  Passed: { label: "Passed", color: "#00875A", bg: "#e8f5ef" },
  Flagged: { label: "Flagged", color: "#E5484D", bg: "#fdeeee" },
  "Not Reviewed": { label: "Not Reviewed", color: "var(--color-on-surface-variant-color)", bg: "#eef1f4" },
};

const seedEvent = (
  id: string,
  workType: WorkType,
  principal: string,
  refId: string,
  base: number,
  bonus: number,
  qaAdjustment: number,
  status: EarningStatus,
  daysAgo: number,
  hourOffset = 0,
  meta: { qaStatus?: QaResult; note?: string; paidOffsetDays?: number; paymentMethod?: string; payRef?: string } = {}
): EarningEvent => {
  const createdAt = Date.now() - daysAgo * DAY_MS - hourOffset * 3600000;
  return {
    id,
    workType,
    principal,
    refId,
    base,
    bonus,
    qaAdjustment,
    status,
    createdAt,
    qaStatus: meta.qaStatus ?? "Not Reviewed",
    note: meta.note ?? "No additional notes.",
    ...(meta.paidOffsetDays !== undefined ? { paidAt: createdAt + meta.paidOffsetDays * DAY_MS } : {}),
    ...(meta.paymentMethod ? { paymentMethod: meta.paymentMethod } : {}),
    ...(meta.payRef ? { payRef: meta.payRef } : {}),
  };
};

const SEED_EARNINGS: EarningEvent[] = [
  // Today — pending QA review
  seedEvent("e01", "call", "CHOWDECK", "CUST-8821", CALL_EARNING_RATE, 0, 0, "pending", 0, 2, { note: "Awaiting QA review of this call." }),
  seedEvent("e02", "chat", "CHOWDECK", "TKT-1042", MESSAGE_EARNING_RATE, 250, 0, "pending", 0, 5, { note: "Awaiting QA review of this chat." }),
  seedEvent("e03", "email", "CHOWDECK", "TKT-1041", MESSAGE_EARNING_RATE, 0, 0, "pending", 1, 0, { note: "Awaiting QA review of this email." }),
  // Recent — approved, awaiting release
  seedEvent("e04", "call", "CHOWDECK", "CUST-1102", CALL_EARNING_RATE, 0, 0, "approved", 2, 0, { qaStatus: "Passed", note: "QA score 4.6/5 — clear, empathetic resolution." }),
  seedEvent("e05", "call", "JUMIA", "CUST-9034", CALL_EARNING_RATE, 500, 0, "approved", 3, 0, { qaStatus: "Passed", note: "QA score 4.3/5 — order query resolved promptly." }),
  seedEvent("e06", "ai", "CHOWDECK", "AI-3301", AI_EARNING_RATE, 0, 0, "approved", 2, 0, { qaStatus: "Passed", note: "QA score 4.8/5 — draft summary accurately captured intent." }),
  seedEvent("e07", "ticket", "JUMIA", "TKT-0981", MESSAGE_EARNING_RATE, 0, -250, "approved", 3, 0, { qaStatus: "Passed", note: "QA score 4.1/5 — helpful response; slight delay noted." }),
  // On hold — flagged for QA review
  seedEvent("e08", "ticket", "JIJI NIGERIA", "TKT-0977", MESSAGE_EARNING_RATE, 0, 0, "on-hold", 4, 0, { qaStatus: "Flagged", note: "Flagged for review — escalation made without documented customer consent." }),
  seedEvent("e09", "call", "CHOWDECK", "CUST-7803", CALL_EARNING_RATE, 0, 0, "on-hold", 5, 0, { qaStatus: "Flagged", note: "Flagged for review — greeting and verification were skipped during the call." }),
  // Paid
  seedEvent("e10", "chat", "CHOWDECK", "TKT-0940", MESSAGE_EARNING_RATE, 250, 0, "paid", 6, 0, { qaStatus: "Passed", note: "QA score 4.5/5 — recommended package matched the customer's need.", paidOffsetDays: 2, paymentMethod: "GTBank •••• 4567", payRef: "PAY-2026-0147" }),
  seedEvent("e11", "call", "CHOWDECK", "CUST-6634", CALL_EARNING_RATE, 0, 0, "paid", 7, 0, { qaStatus: "Passed", note: "QA score 4.7/5 — handled the complaint professionally.", paidOffsetDays: 2, paymentMethod: "GTBank •••• 4567", payRef: "PAY-2026-0146" }),
  seedEvent("e12", "email", "JUMIA", "TKT-0932", MESSAGE_EARNING_RATE, 0, 0, "paid", 8, 0, { qaStatus: "Passed", note: "QA score 4.4/5 — clear, well-structured written response.", paidOffsetDays: 2, paymentMethod: "GTBank •••• 4567", payRef: "PAY-2026-0146" }),
  seedEvent("e13", "call", "CHOWDECK", "CUST-2216", CALL_EARNING_RATE, 0, 0, "paid", 8, 0, { qaStatus: "Passed", note: "QA score 4.9/5 — excellent follow-through on the issue.", paidOffsetDays: 3, paymentMethod: "GTBank •••• 4567", payRef: "PAY-2026-0145" }),
  seedEvent("e14", "ticket", "JIJI NIGERIA", "TKT-0918", MESSAGE_EARNING_RATE, 300, 0, "paid", 9, 0, { qaStatus: "Passed", note: "QA score 4.2/5 — issue resolved in good time.", paidOffsetDays: 3, paymentMethod: "GTBank •••• 4567", payRef: "PAY-2026-0145" }),
  seedEvent("e15", "ai", "CHOWDECK", "AI-3288", AI_EARNING_RATE, 0, 0, "paid", 10, 0, { qaStatus: "Passed", note: "QA score 4.6/5 — AI-assisted draft was accurate and approved.", paidOffsetDays: 3, paymentMethod: "GTBank •••• 4567", payRef: "PAY-2026-0145" }),
  seedEvent("e16", "call", "CHOWDECK", "CUST-9934", CALL_EARNING_RATE, 0, 0, "paid", 10, 0, { qaStatus: "Passed", note: "QA score 4.5/5 — maintained the expected service standard.", paidOffsetDays: 4, paymentMethod: "GTBank •••• 4567", payRef: "PAY-2026-0144" }),
  seedEvent("e17", "chat", "CHOWDECK", "TKT-0905", MESSAGE_EARNING_RATE, 0, 0, "paid", 12, 0, { qaStatus: "Passed", note: "QA score 4.3/5 — polite and concise resolution.", paidOffsetDays: 4, paymentMethod: "GTBank •••• 4567", payRef: "PAY-2026-0144" }),
  seedEvent("e18", "call", "CHOWDECK", "CUST-4410", 80000, 0, 0, "paid", 15, 0, { qaStatus: "Passed", note: "QA score 4.6/5 — large account migration resolved.", paidOffsetDays: 3, paymentMethod: "GTBank •••• 4567", payRef: "PAY-2026-0143" }),
  seedEvent("e19", "call", "JUMIA", "CUST-5211", 70000, 0, 0, "paid", 16, 0, { qaStatus: "Passed", note: "QA score 4.7/5 — escalation resolved within SLA.", paidOffsetDays: 3, paymentMethod: "GTBank •••• 4567", payRef: "PAY-2026-0143" }),
  seedEvent("e20", "ticket", "CHOWDECK", "TKT-0870", 50000, 0, 0, "paid", 18, 0, { qaStatus: "Passed", note: "QA score 4.4/5 — complex order issue closed.", paidOffsetDays: 4, paymentMethod: "GTBank •••• 4567", payRef: "PAY-2026-0142" }),
  seedEvent("e21", "ai", "CHOWDECK", "AI-3222", 45000, 0, 0, "paid", 20, 0, { qaStatus: "Passed", note: "QA score 4.8/5 — high-value AI-assisted campaign.", paidOffsetDays: 4, paymentMethod: "GTBank •••• 4567", payRef: "PAY-2026-0142" }),
  seedEvent("e22", "call", "JIJI NIGERIA", "CUST-7755", 60000, 0, 0, "paid", 22, 0, { qaStatus: "Passed", note: "QA score 4.5/5 — dispute handled to customer satisfaction.", paidOffsetDays: 4, paymentMethod: "GTBank •••• 4567", payRef: "PAY-2026-0141" }),
  seedEvent("e23", "ticket", "CHOWDECK", "TKT-0842", 40000, 0, 0, "paid", 25, 0, { qaStatus: "Passed", note: "QA score 4.3/5 — returns request processed accurately.", paidOffsetDays: 5, paymentMethod: "GTBank •••• 4567", payRef: "PAY-2026-0141" }),
];

const SEED_PAYOUTS: PayoutRecord[] = [
  { id: "pay-1", amount: 150000, fee: 500, netAmount: 149500, reference: "PAY-78221", method: "Bank Transfer", status: "paid", bankName: "Guaranty Trust Bank (GTB)", accountNumberMasked: "•••• 6789", createdAt: Date.now() - 7 * DAY_MS, completedAt: Date.now() - 7 * DAY_MS },
  { id: "pay-2", amount: 100000, fee: 500, netAmount: 99500, reference: "PAY-76412", method: "Bank Transfer", status: "paid", bankName: "Guaranty Trust Bank (GTB)", accountNumberMasked: "•••• 6789", createdAt: Date.now() - 20 * DAY_MS, completedAt: Date.now() - 20 * DAY_MS },
  { id: "pay-3", amount: 75000, fee: 500, netAmount: 74500, reference: "PAY-75103", method: "Bank Transfer", status: "processing", bankName: "Guaranty Trust Bank (GTB)", accountNumberMasked: "•••• 6789", createdAt: Date.now() - 33 * DAY_MS, processingDate: Date.now() - 33 * DAY_MS },
  { id: "pay-4", amount: 50000, fee: 500, netAmount: 49500, reference: "PAY-73891", method: "Bank Transfer", status: "failed", bankName: "Guaranty Trust Bank (GTB)", accountNumberMasked: "•••• 6789", createdAt: Date.now() - 46 * DAY_MS, failureReason: "Your payout could not be processed because the bank account details could not be verified." },
];

/* ─── Leaderboard ───────────────────────────── */
type LeaderboardPeriod = "week" | "month" | "all";

type LeaderboardMetric = {
  callsResolved: number;
  ticketsResolved: number;
  qaScore: number; // 0–100
  csat: number; // 0–100 customer satisfaction
  sla: number; // 0–100 % within SLA
  reviewCount: number;
};

type LeaderboardSeedAgent = {
  agentId: string;
  name: string;
  initials: string;
  color: string;
  metrics: Record<LeaderboardPeriod, LeaderboardMetric>;
};

const LEADERBOARD_PERIODS: { id: LeaderboardPeriod; label: string }[] = [
  { id: "week", label: "This Week" },
  { id: "month", label: "This Month" },
  { id: "all", label: "All Time" },
];

// The signed-in specialist. Swap this for the auth session user when live.
const CURRENT_AGENT_NAME = "Jane Doe";

const AGENT_PROFILE = {
  employeeId: "FCE-2214",
  email: "jane.doe@connectdesk.app",
  phone: "+234 803 555 0142",
  team: "E-Commerce Support Team",
  supervisor: "Adaeze Okonkwo",
  joined: "Mar 12, 2025",
  timezone: "WAT (GMT+1)",
  languages: ["English", "Yoruba", "Pidgin"],
  assignedPrincipalIds: ["p1", "p2", "p3"],
  initials: "JD",
};

const PROFILE_PREF_TITLES = [
  { key: "emailUpdates", label: "Email notifications", desc: "Get email updates about your account and activity." },
  { key: "escalationAlerts", label: "Escalation alerts", desc: "Get alerted as soon as a call escalates to a supervisor." },
  { key: "qaFeedback", label: "QA feedback", desc: "Get notified when your calls and tickets receive QA review." },
  { key: "weeklySummary", label: "Weekly summary", desc: "Receive a performance summary every Monday morning." },
] as const;

const SEED_NOTIFICATIONS = [
  { id: 1, icon: "QA", title: "QA review published", desc: "Your call QC-4412 (JUMIA) was scored 87/100 by Adaeze Okonkwo.", time: "10 min ago", read: false },
  { id: 2, icon: "SL", title: "SLA reminder", desc: "Ticket JUM-5531 is approaching its response SLA (12 min left).", time: "32 min ago", read: false },
  { id: 3, icon: "AC", title: "ACW time high", desc: "Your average after-call note time is above the target for this week.", time: "2 hr ago", read: false },
  { id: 4, icon: "MG", title: "New message from supervisor", desc: "Adaeze Okonkwo sent: \"Great work this week - keep it up.\"", time: "5 hr ago", read: true },
  { id: 5, icon: "EB", title: "Earnings available", desc: "N18,250 is scheduled for your next monthly payout.", time: "Today", read: true },
  { id: 6, icon: "KB", title: "Knowledge base updated", desc: "New article: Reversal & refund policy for CHOWDECK.", time: "Yesterday", read: true },
];

/**
 * Quality Score (0–100) — rewards call *quality* first, volume last.
 *   QA Score .......... 50%
 *   CSAT ............... 20%
 *   SLA Compliance ..... 20%
 *   Resolution volume .. 10% (relative to the top performer)
 */
const computeQualityScore = (qaScore: number, csat: number, sla: number, callsResolved: number, maxCalls: number) =>
  Math.round(qaScore * 0.5 + csat * 0.2 + sla * 0.2 + (maxCalls > 0 ? (callsResolved / maxCalls) * 100 : 0) * 0.1);

/** Quality Rating (0–5, half-star steps) derived from the 0–100 Quality Score. */
const toQualityRating = (qualityScore: number) =>
  Math.max(0, Math.min(5, Math.round((qualityScore / 100) * 10) / 2));

const SEED_LEADERBOARD: LeaderboardSeedAgent[] = [
  { agentId: "ag-1", name: "Adewale Bello", initials: "AB", color: "#3080ff", metrics: {
    week: { callsResolved: 42, ticketsResolved: 54, qaScore: 88, csat: 92, sla: 96, reviewCount: 18 },
    month: { callsResolved: 168, ticketsResolved: 216, qaScore: 86, csat: 91, sla: 95, reviewCount: 72 },
    all: { callsResolved: 1240, ticketsResolved: 1580, qaScore: 84, csat: 90, sla: 94, reviewCount: 520 },
  } },
  { agentId: "ag-2", name: "Chiamaka Nwosu", initials: "CN", color: "#8B5CF6", metrics: {
    week: { callsResolved: 39, ticketsResolved: 48, qaScore: 94, csat: 97, sla: 99, reviewCount: 20 },
    month: { callsResolved: 154, ticketsResolved: 192, qaScore: 93, csat: 96, sla: 98, reviewCount: 80 },
    all: { callsResolved: 1180, ticketsResolved: 1460, qaScore: 91, csat: 95, sla: 97, reviewCount: 560 },
  } },
  { agentId: "ag-you", name: "Jane Doe", initials: "JD", color: "#00875A", metrics: {
    week: { callsResolved: 36, ticketsResolved: 44, qaScore: 82, csat: 93, sla: 90, reviewCount: 15 },
    month: { callsResolved: 141, ticketsResolved: 176, qaScore: 81, csat: 92, sla: 89, reviewCount: 60 },
    all: { callsResolved: 1100, ticketsResolved: 1350, qaScore: 80, csat: 91, sla: 88, reviewCount: 430 },
  } },
  { agentId: "ag-4", name: "Emeka Obi", initials: "EO", color: "#F68B1E", metrics: {
    week: { callsResolved: 34, ticketsResolved: 41, qaScore: 86, csat: 90, sla: 93, reviewCount: 16 },
    month: { callsResolved: 137, ticketsResolved: 165, qaScore: 85, csat: 89, sla: 92, reviewCount: 64 },
    all: { callsResolved: 1060, ticketsResolved: 1290, qaScore: 84, csat: 88, sla: 91, reviewCount: 460 },
  } },
  { agentId: "ag-5", name: "Fatima Sule", initials: "FS", color: "#EC4899", metrics: {
    week: { callsResolved: 31, ticketsResolved: 38, qaScore: 78, csat: 85, sla: 87, reviewCount: 13 },
    month: { callsResolved: 128, ticketsResolved: 154, qaScore: 77, csat: 84, sla: 86, reviewCount: 52 },
    all: { callsResolved: 990, ticketsResolved: 1200, qaScore: 76, csat: 83, sla: 85, reviewCount: 380 },
  } },
  { agentId: "ag-6", name: "Ibrahim Danjuma", initials: "ID", color: "#3B82F6", metrics: {
    week: { callsResolved: 28, ticketsResolved: 34, qaScore: 72, csat: 80, sla: 82, reviewCount: 12 },
    month: { callsResolved: 119, ticketsResolved: 143, qaScore: 71, csat: 79, sla: 81, reviewCount: 48 },
    all: { callsResolved: 920, ticketsResolved: 1120, qaScore: 70, csat: 78, sla: 80, reviewCount: 350 },
  } },
  { agentId: "ag-7", name: "Ngozi Okafor", initials: "NO", color: "#008CDB", metrics: {
    week: { callsResolved: 25, ticketsResolved: 31, qaScore: 66, csat: 74, sla: 78, reviewCount: 10 },
    month: { callsResolved: 110, ticketsResolved: 132, qaScore: 65, csat: 73, sla: 77, reviewCount: 40 },
    all: { callsResolved: 860, ticketsResolved: 1040, qaScore: 64, csat: 72, sla: 76, reviewCount: 300 },
  } },
  { agentId: "ag-8", name: "Tunde Adeyemi", initials: "TA", color: "#0EA5E9", metrics: {
    week: { callsResolved: 22, ticketsResolved: 27, qaScore: 58, csat: 68, sla: 70, reviewCount: 9 },
    month: { callsResolved: 98, ticketsResolved: 118, qaScore: 57, csat: 67, sla: 69, reviewCount: 36 },
    all: { callsResolved: 780, ticketsResolved: 940, qaScore: 56, csat: 66, sla: 68, reviewCount: 260 },
  } },
  // Messaging specialists — they never take calls, so Calls Resolved stays at 0.
  { agentId: "ag-9", name: "Zainab Lawal", initials: "ZL", color: "#7C3AED", metrics: {
    week: { callsResolved: 0, ticketsResolved: 61, qaScore: 90, csat: 93, sla: 95, reviewCount: 17 },
    month: { callsResolved: 0, ticketsResolved: 244, qaScore: 88, csat: 92, sla: 94, reviewCount: 68 },
    all: { callsResolved: 0, ticketsResolved: 1920, qaScore: 86, csat: 90, sla: 92, reviewCount: 510 },
  } },
  { agentId: "ag-10", name: "Kelechi Uche", initials: "KU", color: "#16A34A", metrics: {
    week: { callsResolved: 0, ticketsResolved: 47, qaScore: 74, csat: 82, sla: 84, reviewCount: 11 },
    month: { callsResolved: 0, ticketsResolved: 188, qaScore: 72, csat: 80, sla: 83, reviewCount: 44 },
    all: { callsResolved: 0, ticketsResolved: 1480, qaScore: 70, csat: 79, sla: 81, reviewCount: 330 },
  } },
];

const STAR_EMPTY = "#C9D0D8";
const STAR_FULL = "#F6B01E";

/**
 * 0–5 quality rating shown as a single star that fills proportionally.
 */
function StarRating({ value, size = 14 }: { value: number; size?: number }) {
  const rating = Math.max(0, Math.min(5, value));
  const fill = rating / 5;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
      <span style={{ position: "relative", display: "inline-flex", lineHeight: 0 }}>
        <Star size={size} color={STAR_EMPTY} fill={STAR_EMPTY} strokeWidth={1.5} />
        <span style={{ position: "absolute", top: 0, left: 0, height: "100%", width: `${fill * 100}%`, overflow: "hidden", display: "inline-flex" }}>
          <Star size={size} color={STAR_FULL} fill={STAR_FULL} strokeWidth={1.5} />
        </span>
      </span>
      <span style={{ fontSize: "12px", fontWeight: 500, color: "var(--color-on-surface-color)" }}>{rating.toFixed(1)}</span>
    </span>
  );
}

function PrincipalLogo({ principal, size = 48 }: { principal: typeof PRINCIPALS[0]; size?: number }) {
  const [failed, setFailed] = useState(false);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "var(--radius-md)",
        backgroundColor: failed ? principal.color : "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: 500,
        fontSize: Math.max(12, Math.round(size * 0.4)),
        overflow: "hidden",
        flexShrink: 0,
        border: "1px solid var(--color-outline-variant-color)",
      }}
    >
      {failed ? (
        principal.initial
      ) : (
        <img
          src={principal.logo}
          alt={principal.name}
          onError={() => setFailed(true)}
          style={{ width: "100%", height: "100%", objectFit: "contain", padding: "2px" }}
        />
      )}
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p style={{ fontSize: "11px", fontWeight: 500, letterSpacing: "0.4px", color: "var(--color-on-surface-variant-color)", margin: "0 0 4px" }}>{label}</p>
      <div style={{ fontSize: "13px", fontWeight: 500, wordWrap: "break-word" }}>{value}</div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", padding: "10px 0", borderBottom: "1px solid var(--color-outline-variant-color)" }}>
      <span style={{ fontSize: "13px", color: "var(--color-on-surface-variant-color)" }}>{label}</span>
      <span style={{ fontSize: "13px", fontWeight: 500, textAlign: "right" }}>{value}</span>
    </div>
  );
}

function AgentStatusDropdown({ status, onChange, hideOnline }: { status: AgentStatusId; onChange: (s: AgentStatusId) => void; hideOnline?: boolean }) {
  const [open, setOpen] = useState(false);
  const statuses = hideOnline ? AGENT_STATUSES.filter((s) => s.id !== "online") : AGENT_STATUSES;
  const current = statuses.find((s) => s.id === status) || statuses[0];
  return (
    <div style={{ position: "relative" }}>
      <button className="status-pill" style={{ width: "100%", borderRadius: "8px" }} onClick={() => setOpen((o) => !o)}>
        <span className="status-dot" style={{ backgroundColor: current.color }} />
        <span style={{ flex: 1, textAlign: "left", fontSize: "12px", whiteSpace: "nowrap" }}>{current.label}</span>
        <ChevronDown size={13} />
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: "4px",
            backgroundColor: "var(--color-surface-color)",
            border: "1px solid var(--color-outline-variant-color)",
            borderRadius: "8px",
            boxShadow: "var(--elevation-2)",
            zIndex: 10,
            overflow: "hidden",
          }}
        >
          {statuses.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                onChange(s.id);
                setOpen(false);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                width: "100%",
                padding: "10px 12px",
                border: "none",
                background: s.id === status ? "var(--color-surface-container-high-color)" : "transparent",
                cursor: "pointer",
                fontSize: "12px",
                color: "var(--color-on-surface-color)",
                textAlign: "left",
              }}
            >
              <span className="status-dot" style={{ backgroundColor: s.color }} />
              {s.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Disposition Dropdown ───────────────────── */
function DispositionDropdown({ value, onChange }: { value: string; onChange: (d: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  return (
    <div style={{ position: "relative" }} ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          padding: "var(--spacing-3) var(--spacing-4)",
          border: "1.5px solid var(--color-outline-variant-color)",
          borderRadius: "var(--radius-md)",
          backgroundColor: "var(--color-surface-container-low-color)",
          fontSize: "var(--font-body-medium-size)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          outline: "none",
        }}
      >
        <span>{value}</span>
        <ChevronDown size={16} style={{ color: "var(--color-on-surface-variant-color)" }} />
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: "4px",
            backgroundColor: "var(--color-surface-color)",
            border: "1px solid var(--color-outline-variant-color)",
            borderRadius: "8px",
            boxShadow: "var(--elevation-2)",
            zIndex: 10,
            overflow: "hidden",
          }}
        >
          {DISPOSITIONS.map((d) => (
            <button
              key={d}
              onClick={() => { onChange(d); setOpen(false); }}
              className="dd-option"
            >
              {d}
            </button>
          ))}
          <div style={{ height: "1px", backgroundColor: "var(--color-outline-variant-color)", margin: "4px 0" }} />
          <button
            onClick={() => { onChange(TRAINING_DISPOSITION); setOpen(false); }}
            className="dd-option dd-option-muted"
          >
            {TRAINING_DISPOSITION}
          </button>
        </div>
      )}
    </div>
  );
}

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function DatePicker({ value, onChange, min }: { value: string; onChange: (v: string) => void; min?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const today = new Date();
  const [viewDate, setViewDate] = useState(() => {
    if (value) { const [y, m, d] = value.split("-").map(Number); return new Date(y, m - 1, d); }
    return new Date(today.getFullYear(), today.getMonth(), today.getDate());
  });

  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const minDate = min ? (() => { const [y, m, d] = min.split("-").map(Number); return new Date(y, m - 1, d); })() : null;

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const pad = (n: number) => n.toString().padStart(2, "0");
  const display = value ? (() => { const [y, m, d] = value.split("-").map(Number); return `${pad(d)}/${pad(m)}/${y}`; })() : "";

  return (
    <div style={{ position: "relative" }} ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          padding: "var(--spacing-3) var(--spacing-4)",
          border: "1.5px solid var(--color-outline-variant-color)",
          borderRadius: "var(--radius-md)",
          backgroundColor: "var(--color-surface-container-low-color)",
          fontSize: "var(--font-body-medium-size)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          outline: "none",
          color: value ? "var(--color-on-surface-color)" : "var(--color-outline-color)",
          textAlign: "left",
        }}
      >
        <span>{display || "DD/MM/YYYY"}</span>
        <Calendar size={16} style={{ color: "var(--color-on-surface-variant-color)", flexShrink: 0 }} />
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            backgroundColor: "var(--color-surface-color)",
            border: "1px solid var(--color-outline-variant-color)",
            borderRadius: "8px",
            boxShadow: "var(--elevation-3)",
            zIndex: 10,
            padding: "var(--spacing-3)",
            width: 280,
          }}
        >
          {/* Month/Year nav */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--spacing-3)" }}>
            <button
              type="button"
              onClick={() => setViewDate(new Date(year, month - 1, 1))}
              style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center", color: "var(--color-on-surface-color)" }}
            >
              <ArrowLeft size={18} />
            </button>
            <span style={{ fontWeight: 500, fontSize: "14px" }}>{MONTHS[month]} {year}</span>
            <button
              type="button"
              onClick={() => setViewDate(new Date(year, month + 1, 1))}
              style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center", color: "var(--color-on-surface-color)" }}
            >
              <ArrowRight size={18} />
            </button>
          </div>
          {/* Day headers */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px", marginBottom: "4px" }}>
            {DAYS.map((d) => (
              <div key={d} style={{ textAlign: "center", fontSize: "11px", fontWeight: 500, color: "var(--color-on-surface-variant-color)", padding: "4px 0" }}>{d}</div>
            ))}
          </div>
          {/* Day grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px" }}>
            {cells.map((day, i) => {
              if (day === null) return <div key={`e${i}`} />;
              const dateStr = `${year}-${pad(month + 1)}-${pad(day)}`;
              const isSelected = value === dateStr;
              const isPast = minDate ? new Date(year, month, day) < minDate : false;
              const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
              return (
                <button
                  key={day}
                  type="button"
                  disabled={isPast}
                  onClick={() => { onChange(dateStr); setOpen(false); setViewDate(new Date(year, month, day)); }}
                  style={{
                    width: "100%",
                    aspectRatio: "1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "13px",
                    border: "none",
                    borderRadius: "50%",
                    cursor: isPast ? "default" : "pointer",
                    backgroundColor: isSelected ? "var(--color-primary-color)" : isToday ? "var(--color-primary-container-color)" : "transparent",
                    color: isPast ? "var(--color-outline-color)" : isSelected ? "var(--color-on-primary-color)" : "var(--color-on-surface-color)",
                    fontWeight: isToday && !isSelected ? 700 : 400,
                    opacity: isPast ? 0.4 : 1,
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function DateRangePicker({
  from,
  to,
  onChange,
}: {
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const today = new Date();
  const [viewDate, setViewDate] = useState(() => {
    if (from) { const [y, m, d] = from.split("-").map(Number); return new Date(y, m - 1, d); }
    if (to) { const [y, m, d] = to.split("-").map(Number); return new Date(y, m - 1, d); }
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const pad = (n: number) => n.toString().padStart(2, "0");
  const fmt = (s: string) => {
    if (!s) return "";
    const [y, m, d] = s.split("-").map(Number);
    return `${pad(d)}/${pad(m)}/${y}`;
  };

  const fromDate = from ? (() => { const [y, m, d] = from.split("-").map(Number); return new Date(y, m - 1, d); })() : null;
  const toDate = to ? (() => { const [y, m, d] = to.split("-").map(Number); return new Date(y, m - 1, d); })() : null;
  const tsFrom = fromDate ? fromDate.getTime() : null;
  const tsTo = toDate ? toDate.getTime() : null;

  const handleDay = (d: number) => {
    const dateStr = `${year}-${pad(month + 1)}-${pad(d)}`;
    if (!fromDate) {
      onChange(dateStr, "");
    } else if (!toDate) {
      const clicked = new Date(year, month, d);
      if (clicked.getTime() < fromDate.getTime()) {
        onChange(dateStr, "");
      } else {
        onChange(from, dateStr);
        setOpen(false);
      }
    } else {
      onChange(dateStr, "");
    }
  };

  return (
    <div style={{ position: "relative", width: "100%" }} ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          height: 40,
          padding: "0 12px",
          border: "1.5px solid var(--color-outline-variant-color)",
          borderRadius: "var(--radius-md)",
          backgroundColor: "var(--color-surface-container-low-color)",
          fontSize: "13px",
          cursor: "pointer",
          color: from || to ? "var(--color-on-surface-color)" : "var(--color-outline-color)",
          textAlign: "left",
        }}
      >
        <Calendar size={14} style={{ flexShrink: 0, color: "var(--color-on-surface-variant-color)" }} />
        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {from || to ? `${fmt(from) || "DD/MM/YYYY"} - ${fmt(to) || "DD/MM/YYYY"}` : "DD/MM/YYYY - DD/MM/YYYY"}
        </span>
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            backgroundColor: "var(--color-surface-color)",
            border: "1px solid var(--color-outline-variant-color)",
            borderRadius: "8px",
            boxShadow: "var(--elevation-3)",
            zIndex: 10,
            padding: "var(--spacing-3)",
            width: 280,
          }}
        >
          <p style={{ fontSize: "11px", color: "var(--color-on-surface-variant-color)", marginBottom: "8px" }}>
            {from && !to ? "Select the end date" : "Select a start date, then an end date"}
          </p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--spacing-3)" }}>
            <button
              type="button"
              onClick={() => setViewDate(new Date(year, month - 1, 1))}
              style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center", color: "var(--color-on-surface-color)" }}
            >
              <ArrowLeft size={18} />
            </button>
            <span style={{ fontWeight: 500, fontSize: "14px" }}>{MONTHS[month]} {year}</span>
            <button
              type="button"
              onClick={() => setViewDate(new Date(year, month + 1, 1))}
              style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", display: "flex", alignItems: "center", color: "var(--color-on-surface-color)" }}
            >
              <ArrowRight size={18} />
            </button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px", marginBottom: "4px" }}>
            {DAYS.map((d) => (
              <div key={d} style={{ textAlign: "center", fontSize: "11px", fontWeight: 500, color: "var(--color-on-surface-variant-color)", padding: "4px 0" }}>{d}</div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px" }}>
            {cells.map((day, i) => {
              if (day === null) return <div key={`e${i}`} />;
              const dateStr = `${year}-${pad(month + 1)}-${pad(day)}`;
              const ts = new Date(year, month, day).getTime();
              const isStart = dateStr === from;
              const isEnd = dateStr === to;
              const inRange = tsFrom !== null && tsTo !== null && ts >= tsFrom && ts <= tsTo;
              const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleDay(day)}
                  style={{
                    width: "100%",
                    aspectRatio: "1",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "13px",
                    border: "none",
                    borderRadius: isStart || isEnd ? "50%" : "50%",
                    cursor: "pointer",
                    backgroundColor: isStart || isEnd ? "var(--color-primary-color)" : inRange ? "var(--color-primary-container-color)" : "transparent",
                    color: isStart || isEnd ? "var(--color-on-primary-color)" : "var(--color-on-surface-color)",
                    fontWeight: isStart || isEnd || isToday ? 700 : 400,
                    boxShadow: inRange ? "none" : "none",
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

const ASSIGN_OPTIONS = [
  { value: "me", label: "Me (Jane Doe)" },
  { value: "available", label: "Any Available Agent" },
  ...SUPERVISORS.map((s) => ({ value: s.id, label: `${s.name} (Supervisor)` })),
];

function AssignToDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  const selected = ASSIGN_OPTIONS.find((o) => o.value === value);

  return (
    <div style={{ position: "relative" }} ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          padding: "var(--spacing-3) var(--spacing-4)",
          border: "1.5px solid var(--color-outline-variant-color)",
          borderRadius: "var(--radius-md)",
          backgroundColor: "var(--color-surface-container-low-color)",
          fontSize: "var(--font-body-medium-size)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          outline: "none",
          color: selected ? "var(--color-on-surface-color)" : "var(--color-outline-color)",
        }}
      >
        <span>{selected ? selected.label : "Select who will make the call"}</span>
        <ChevronDown size={16} style={{ color: "var(--color-on-surface-variant-color)" }} />
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: "4px",
            backgroundColor: "var(--color-surface-color)",
            border: "1px solid var(--color-outline-variant-color)",
            borderRadius: "8px",
            boxShadow: "var(--elevation-2)",
            zIndex: 10,
            overflow: "hidden",
          }}
        >
          {ASSIGN_OPTIONS.map((o) => (
            <button
              key={o.value}
              onClick={() => { onChange(o.value); setOpen(false); }}
              className={`dd-option${value === o.value ? " selected" : ""}`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Component ─────────────────────────────── */
export default function AgentWorkspace() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [navItem, setNavItem] = useState<"calls" | "messages" | "earning" | "rates" | "payout" | "leaderboard" | "profile">("calls");

  /**
   * Agent view state machine:
   *   principals → choose-call-mode → in-queue → active-call → after-call-note → wrap-up-complete
   */
  const [view, setView] = useState<
    "principals" | "choose-call-mode" | "in-queue" | "active-call" | "after-call-note" | "wrap-up-complete" | "outbound-call"
  >("principals");

  // Wrap-up complete stats
  const [wrapUpCallDuration, setWrapUpCallDuration] = useState("");
  const [wrapUpCustomerName, setWrapUpCustomerName] = useState("");
  const [callsToday, setCallsToday] = useState(12);
  const [wrapUpDisposition, setWrapUpDisposition] = useState("");
  const [wrapUpNotes, setWrapUpNotes] = useState("");
  const [wrapUpCallbackScheduled, setWrapUpCallbackScheduled] = useState(false);
  const [wrapUpCallbackDate, setWrapUpCallbackDate] = useState("");
  const [wrapUpCallbackTime, setWrapUpCallbackTime] = useState("");
  const [wrapUpCallbackPhone, setWrapUpCallbackPhone] = useState("");
  const [wrapUpCallbackReason, setWrapUpCallbackReason] = useState("");
  const [wrapUpCallbackAssignTo, setWrapUpCallbackAssignTo] = useState("");

  const [activePrincipal, setActivePrincipal] = useState<typeof PRINCIPALS[0] | null>(null);
  const [callMode, setCallMode] = useState<"inbound" | "outbound" | null>(null);
  const [agentStatus, setAgentStatus] = useState<AgentStatusId>("online");
  const [incomingCallOpen, setIncomingCallOpen] = useState(false);
  const [declineReasonOpen, setDeclineReasonOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState<string | null>(null);
  const [declineToast, setDeclineToast] = useState<string | null>(null);

  // Call controls
  const [isMuted, setIsMuted] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [dialPadOpen, setDialPadOpen] = useState(false);
  const [dialedNumber, setDialedNumber] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferMessage, setTransferMessage] = useState("");
  const [transferSupervisor, setTransferSupervisor] = useState("");
  const [transferSent, setTransferSent] = useState(false);
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);
  const [transferDone, setTransferDone] = useState(false);
  const transferModalRef = useRef<HTMLDivElement>(null);
  const dialPadRef = useRef<HTMLDivElement>(null);
  const [callSeconds, setCallSeconds] = useState(0);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Call tab
  const [callTab, setCallTab] = useState<"suggested" | "notes" | "message">("suggested");
  const [activeChip, setActiveChip] = useState("Order and Delivery");
  const [callNotes, setCallNotes] = useState("");
  const [messageText, setMessageText] = useState("");
  const [messageSent, setMessageSent] = useState(false);

  // AI suggestions
  const [aiSuggestions, setAiSuggestions] = useState<LiveSuggestion[]>(AI_SUGGESTIONS_FALLBACK);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Live AI listening simulation
  const [liveStage, setLiveStage] = useState(0);
  const liveAiTimerRef = useRef<NodeJS.Timeout | null>(null);

  // After-call note
  const [disposition, setDisposition] = useState("Resolved");
  const [acNotes, setAcNotes] = useState("");
  const [acSecondsLeft, setAcSecondsLeft] = useState(180);
  const acTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Schedule callback modal
  const [showScheduleCallback, setShowScheduleCallback] = useState(false);
  const [callbackPhone, setCallbackPhone] = useState("+234 708 948 8172");
  const [callbackDate, setCallbackDate] = useState("");
  const [callbackTime, setCallbackTime] = useState("");
  const [callbackReason, setCallbackReason] = useState("");
  const [callbackAssignTo, setCallbackAssignTo] = useState("");
  const [callbackSaved, setCallbackSaved] = useState(false);
  const [callbackScheduled, setCallbackScheduled] = useState(false);
  const [callbackConfirmVisible, setCallbackConfirmVisible] = useState(false);
  const callbackConfirmTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Queue countdown simulation
  const [queueSimStep, setQueueSimStep] = useState(0);

  // Outbound call search & dropdown
  const [outboundSearch, setOutboundSearch] = useState("");
  const [outboundDialNumber, setOutboundDialNumber] = useState("");
  const [outboundDropdownOpen, setOutboundDropdownOpen] = useState(false);
  const [selectedOutboundContact, setSelectedOutboundContact] = useState<OutboundContact | null>(null);
  const [outboundHistoryExpanded, setOutboundHistoryExpanded] = useState(false);
  const outboundDropdownRef = useRef<HTMLDivElement>(null);

  // Messages inbox
  const [messagesView, setMessagesView] = useState<"principals" | "inbox">("principals");
  const [messagePrincipalId, setMessagePrincipalId] = useState<string | null>("p1");
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>("m1");
  const [messages, setMessages] = useState<Record<string, PrincipalMessage[]>>(PRINCIPAL_MESSAGES);

  // Earnings & payouts
  const [earnings, setEarnings] = useState<EarningEvent[]>(SEED_EARNINGS);
  const [payouts] = useState<PayoutRecord[]>(SEED_PAYOUTS);
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<LeaderboardPeriod>("week");
  const [payoutToast, setPayoutToast] = useState<string | null>(null);
  const [payoutAccount] = useState<PayoutAccount | null>(SEED_PAYOUT_ACCOUNT);

  // Profile
  const [profileContact, setProfileContact] = useState({ email: AGENT_PROFILE.email, phone: AGENT_PROFILE.phone, languages: AGENT_PROFILE.languages.join(", ") });
  const [prefs, setPrefs] = useState({ emailUpdates: true, escalationAlerts: true, qaFeedback: true, weeklySummary: false });
  const [pwOpen, setPwOpen] = useState(false);
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState<string | null>(null);
  const [topbarPanel, setTopbarPanel] = useState<"notifications" | null>(null);
  const [notifications, setNotifications] = useState(SEED_NOTIFICATIONS);
  const [showCannotResolveModal, setShowCannotResolveModal] = useState(false);
  const [cannotResolveReason, setCannotResolveReason] = useState("");
  const [suggestedSearch, setSuggestedSearch] = useState("");
  const [sentConfirmation, setSentConfirmation] = useState(false);
  const [attachments, setAttachments] = useState<{ name: string; size: number }[]>([]);
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const [replyImages, setReplyImages] = useState<string[]>([]);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [fontStyle, setFontStyle] = useState<"normal" | "bold" | "italic" | "underline">("normal");
  const [fontDropdownOpen, setFontDropdownOpen] = useState(false);
  const fontDropdownRef = useRef<HTMLDivElement>(null);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkText, setLinkText] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const editorRef = useRef<HTMLDivElement>(null);
  const selRangeRef = useRef<Range | null>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (fontDropdownRef.current && !fontDropdownRef.current.contains(e.target as Node)) {
        setFontDropdownOpen(false);
      }
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target as Node)) {
        setEmojiOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
  };

  /* ─── Call timer ─────────────────────────── */
  useEffect(() => {
    if (view === "active-call") {
      callTimerRef.current = setInterval(() => setCallSeconds((s) => s + 1), 1000);
    } else {
      if (callTimerRef.current) clearInterval(callTimerRef.current);
      if (view !== "after-call-note") setCallSeconds(0);
    }
    return () => { if (callTimerRef.current) clearInterval(callTimerRef.current); };
  }, [view]);

  /* ─── After-call timer ─────────────────────── */
  useEffect(() => {
    if (view === "after-call-note") {
      acTimerRef.current = setInterval(() => {
        setAcSecondsLeft((s) => {
          if (s <= 1) { handleAcSaveAndClose(); return 0; }
          return s - 1;
        });
      }, 1000);
    } else {
      if (acTimerRef.current) clearInterval(acTimerRef.current);
    }
    return () => { if (acTimerRef.current) clearInterval(acTimerRef.current); };
  }, [view]);

  /* ─── Incoming call modal timer ─────────────── */
  const prevAgentStatus = useRef<AgentStatusId>("online");
  useEffect(() => {
    const previous = prevAgentStatus.current;
    prevAgentStatus.current = agentStatus;
    const changedToOnline = previous !== "online" && agentStatus === "online";
    if (changedToOnline) {
      setView("in-queue");
      const timer = setTimeout(() => setIncomingCallOpen(true), 3000);
      return () => clearTimeout(timer);
    } else if (agentStatus !== "online") {
      setIncomingCallOpen(false);
    }
  }, [agentStatus]);

  /* ─── Auto-sync agent status with call state ─── */
  useEffect(() => {
    if (view === "active-call") {
      setAgentStatus("busy");
    } else if (view === "after-call-note") {
      setAgentStatus("after-call-work");
    }
  }, [view]);

  /* ─── Close transfer modal on click outside ── */
  useEffect(() => {
    if (!isTransferring) return;
    const handle = (e: MouseEvent) => {
      if (transferModalRef.current && !transferModalRef.current.contains(e.target as Node)) {
        setIsTransferring(false);
      }
    };
    const timer = setTimeout(() => document.addEventListener("mousedown", handle), 0);
    return () => { clearTimeout(timer); document.removeEventListener("mousedown", handle); };
  }, [isTransferring]);

  /* ─── Close dial pad on click outside ── */
  useEffect(() => {
    if (!dialPadOpen) return;
    const handle = (e: MouseEvent) => {
      if (dialPadRef.current && !dialPadRef.current.contains(e.target as Node)) {
        setDialPadOpen(false);
      }
    };
    const timer = setTimeout(() => document.addEventListener("mousedown", handle), 0);
    return () => { clearTimeout(timer); document.removeEventListener("mousedown", handle); };
  }, [dialPadOpen]);

  /* ─── Close outbound dropdown on click outside ── */
  useEffect(() => {
    if (!outboundDropdownOpen) return;
    const handle = (e: MouseEvent) => {
      if (outboundDropdownRef.current && !outboundDropdownRef.current.contains(e.target as Node)) {
        setOutboundDropdownOpen(false);
      }
    };
    const timer = setTimeout(() => document.addEventListener("mousedown", handle), 0);
    return () => { clearTimeout(timer); document.removeEventListener("mousedown", handle); };
  }, [outboundDropdownOpen]);

  /* ─── Fetch AI suggestions ────────────────── */
  const fetchAiSuggestions = React.useCallback(async (query: string) => {
    setAiLoading(true);
    setAiError(null);
    try {
      const res = await fetch("/api/ai/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerQuery: query, channel: "phone" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Failed to fetch suggestions");
      setAiSuggestions(json.data.suggestions);
    } catch (err: unknown) {
      setAiError(err instanceof Error ? err.message : "Something went wrong");
      setAiSuggestions(AI_SUGGESTIONS_FALLBACK);
    } finally {
      setAiLoading(false);
    }
  }, []);

  /* ─── Live AI listening simulation (timer only) ── */
  useEffect(() => {
    if (view !== "active-call") return;
    if (liveAiTimerRef.current) clearInterval(liveAiTimerRef.current);
    liveAiTimerRef.current = setInterval(() => {
      setLiveStage((s) => {
        const next = s + 1;
        if (next >= LIVE_AI_STAGES.length) {
          if (liveAiTimerRef.current) clearInterval(liveAiTimerRef.current);
          return s;
        }
        return next;
      });
    }, 9000);
    return () => { if (liveAiTimerRef.current) clearInterval(liveAiTimerRef.current); };
  }, [view]);

  const fmtCallTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  /* Live AI listening - derived from the current call (listens only, no transcription) */
  const liveListening = view === "active-call";
  const liveAssistantReplies = liveListening
    ? LIVE_AI_STAGES.slice(0, liveStage + 1).map((st, i) => ({
        id: i + 1,
        label: st.suggestions[0].label,
        reply: st.suggestions[0].text,
        current: i === liveStage,
      }))
    : [];
  const liveSuggestions = liveListening && liveStage >= 0 && liveStage < LIVE_AI_STAGES.length
    ? LIVE_AI_STAGES[liveStage].suggestions.map((sg) => ({ ...sg, live: true }))
    : [];
  const shownSuggestions = liveSuggestions.length > 0 ? liveSuggestions : aiSuggestions;

  const fmtAcTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  /* ─── Navigation helpers ─────────────────── */
  const handleNav = (id: "calls" | "messages" | "earning" | "rates" | "payout" | "leaderboard" | "profile") => {
    setNavItem(id);
    if (id === "calls") {
      setCallMode(null);
      setActivePrincipal(null);
      setView("principals");
    } else if (id === "messages") {
      setMessagesView("principals");
      setMessagePrincipalId(null);
      setSelectedThreadId(null);
    }
  };

  const selectPrincipal = (p: typeof PRINCIPALS[0]) => {
    setActivePrincipal(p);
    setView("choose-call-mode");
  };

  const selectMessagePrincipal = (p: typeof PRINCIPALS[0]) => {
    setMessagesView("inbox");
    setMessagePrincipalId(p.id);
    const msgs = messages[p.id] || [];
    setSelectedThreadId(msgs.length > 0 ? (msgs.find((m) => !m.handled)?.id || msgs[0].id) : null);
  };

  const backToMessagePrincipals = () => {
    setMessagesView("principals");
    setMessagePrincipalId(null);
    setSelectedThreadId(null);
  };

  const backToCallPrincipals = () => {
    setCallMode(null);
    setActivePrincipal(null);
    setView("principals");
  };

  const selectCallMode = (mode: "inbound" | "outbound") => {
    setCallMode(mode);
    if (mode === "outbound") {
      setOutboundSearch("");
      setOutboundDialNumber("");
      setSelectedOutboundContact(null);
      setOutboundDropdownOpen(false);
      setAgentStatus("offline");
      setView("outbound-call");
    } else {
      setAgentStatus("online");
      setView("in-queue");
      setTimeout(() => setIncomingCallOpen(true), 3000);
    }
  };

  const acceptCall = () => {
    setCallTab("suggested");
    setIsMuted(false);
    setIsOnHold(false);
    setLiveStage(0);
    setView("active-call");
  };

  const endCall = () => {
    setAcSecondsLeft(180);
    setAcNotes("");
    setDisposition("Resolved");
    setShowScheduleCallback(false);
    setCallbackSaved(false);
    setView("after-call-note");
  };

  const handleScheduleCallbackSave = () => {
    if (!callbackDate || !callbackTime || !callbackAssignTo) return;
    setCallbackSaved(false);
    setCallbackScheduled(true);
    setShowScheduleCallback(false);
    setCallbackConfirmVisible(true);
    if (callbackConfirmTimerRef.current) clearTimeout(callbackConfirmTimerRef.current);
    callbackConfirmTimerRef.current = setTimeout(() => {
      setCallbackConfirmVisible(false);
    }, 1800);
  };

  const handleAcSaveAndClose = () => {
    // Capture values for the wrap-up summary before resetting
    const customerName = callMode === "outbound" && selectedOutboundContact ? selectedOutboundContact.customerName : "John Doe";
    setWrapUpCallDuration(fmtCallTime(callSeconds));
    setWrapUpCustomerName(customerName);
    setWrapUpDisposition(disposition);
    setWrapUpNotes(acNotes);
    setWrapUpCallbackScheduled(callbackScheduled);
    setWrapUpCallbackDate(callbackDate);
    setWrapUpCallbackTime(callbackTime);
    setWrapUpCallbackPhone(callbackPhone);
    setWrapUpCallbackReason(callbackReason);
    setWrapUpCallbackAssignTo(callbackAssignTo);
    setCallsToday((prev) => prev + 1);
    if (disposition !== TRAINING_DISPOSITION) {
      setEarnings((prev) => [
        {
          id: `earn-${Date.now()}`,
          workType: "call",
          principal: activePrincipal?.name ?? "CHOWDECK",
          refId: selectedOutboundContact?.customerId ?? "CUST-8821",
          base: CALL_EARNING_RATE,
          bonus: 0,
          qaAdjustment: 0,
          status: "pending",
          createdAt: Date.now(),
          qaStatus: "Not Reviewed",
          note: "Awaiting QA review of this call.",
        },
        ...prev,
      ]);
    }
    // Reset call state
    setCallSeconds(0);
    setMessageSent(false);
    setCallbackScheduled(false);
    setCallbackSaved(false);
    setAcNotes("");
    setDisposition("Resolved");
    setView("wrap-up-complete");
  };

  const backToCallMode = () => {
    setCallMode(null);
    setIsMuted(false);
    setIsOnHold(false);
    setView("choose-call-mode");
  };

  const handleDeclineSubmit = () => {
    if (!declineReason) return;
    setDeclineReasonOpen(false);
    setDeclineToast(`Declined: ${declineReason}. Supervisor has been notified.`);
    setTimeout(() => setDeclineToast(null), 4000);
  };

  const handleTransferSubmit = async () => {
    if (!transferSupervisor || !transferMessage) return;
    const supervisor = SUPERVISORS.find((s) => s.id === transferSupervisor);
    if (!supervisor) return;

    setTransferLoading(true);
    setTransferError(null);
    try {
      const res = await fetch("/api/transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          callId: `call-${Date.now()}`,
          supervisorId: supervisor.id,
          supervisorName: supervisor.name,
          reason: transferMessage,
          customerInfo: "John Doe — CUST-8821",
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error?.message || "Transfer failed");
      setTransferSent(true);
    } catch (err: unknown) {
      setTransferError(err instanceof Error ? err.message : "Transfer failed");
    } finally {
      setTransferLoading(false);
    }
  };

  const handleTransferDone = () => {
    setTransferDone(true);
    setIsTransferring(false);
    setTransferSent(false);
    setTransferMessage("");
    setTransferSupervisor("");
    endCall();
  };

  const openPrincipalMessages = (p: typeof PRINCIPALS[0]) => {
    setNavItem("messages");
    setMessagePrincipalId(p.id);
    setSelectedThreadId(PRINCIPAL_MESSAGES[p.id]?.[0]?.id ?? null);
    setMessagesView("inbox");
  };

  const messagePrincipal = PRINCIPALS.find((p) => p.id === messagePrincipalId) || null;
  const principalMessages = messagePrincipalId ? messages[messagePrincipalId] || [] : [];
  const selectedThread = principalMessages.find((m) => m.id === selectedThreadId) || null;
  const currentAgentStatus = AGENT_STATUSES.find((s) => s.id === agentStatus) || AGENT_STATUSES[0];
  const selectedPrincipalQueueEmpty = messagePrincipalId ? (principalMessages.filter((m) => !m.handled).length === 0) : false;

  /* ─── Earnings computations ─────────────────── */
  const paidEarnings = earnings.filter((e) => e.status === "paid").reduce((s, e) => s + earningTotal(e), 0);
  const withdrawnAmount = payouts.filter((p) => p.status === "paid" || p.status === "processing").reduce((s, p) => s + p.amount, 0);
  const availableBalance = Math.max(0, paidEarnings - withdrawnAmount);
  const lifetimeEarnings = earnings.reduce((s, e) => s + earningTotal(e), 0);
  const pendingEarnings = earnings.filter((e) => e.status !== "paid");
  const pendingEarningsAmount = pendingEarnings.reduce((s, e) => s + earningTotal(e), 0);
  const totalPaidOut = payouts.filter((p) => p.status === "paid").reduce((s, p) => s + p.netAmount, 0);
  const lastPayout = [...payouts].sort((a, b) => b.createdAt - a.createdAt)[0] || null;
  const nextPayoutDate = getNextPayoutDate();
  const workTypeSummary = WORK_TYPE_ORDER.map((wt) => {
    const list = earnings.filter((e) => e.workType === wt);
    return { workType: wt, count: list.length, total: list.reduce((s, e) => s + earningTotal(e), 0) };
  });

  /* ─── Leaderboard computations ─────────────── */
  const maxCalls = Math.max(...SEED_LEADERBOARD.map((a) => a.metrics[leaderboardPeriod].callsResolved), 1);
  const rankedAgents = SEED_LEADERBOARD
    .map((a) => {
      const m = a.metrics[leaderboardPeriod];
      // Specialists assigned to calls cannot reply to messages, so a call agent
      // never has ticket resolutions to show.
      const isCallAgent = m.callsResolved > 0;
      return {
        agentId: a.agentId,
        name: a.name,
        initials: a.initials,
        color: a.color,
        callsResolved: m.callsResolved,
        ticketsResolved: isCallAgent ? null : m.ticketsResolved,
        qaScore: m.qaScore,
        csat: m.csat,
        sla: m.sla,
        reviewCount: m.reviewCount,
        qualityScore: computeQualityScore(m.qaScore, m.csat, m.sla, m.callsResolved, maxCalls),
        qualityRating: toQualityRating(computeQualityScore(m.qaScore, m.csat, m.sla, m.callsResolved, maxCalls)),
        isYou: a.name === CURRENT_AGENT_NAME,
      };
    })
    .sort((a, b) => b.qualityScore - a.qualityScore || b.callsResolved - a.callsResolved);
  const topThree = rankedAgents.slice(0, 3);
  const podiumOrder = [topThree[1], topThree[0], topThree[2]].filter(Boolean);
  const youRow = rankedAgents.find((r) => r.isYou) || null;
  const yourRank = youRow ? rankedAgents.indexOf(youRow) + 1 : null;
  const maxQa = Math.max(...rankedAgents.map((r) => r.qaScore), 1);
  const maxCsat = Math.max(...rankedAgents.map((r) => r.csat), 1);
  const maxSla = Math.max(...rankedAgents.map((r) => r.sla), 1);
  const youRel = youRow
    ? {
        "QA Score": youRow.qaScore / maxQa,
        CSAT: youRow.csat / maxCsat,
        "SLA Compliance": youRow.sla / maxSla,
        "Resolution Volume": youRow.callsResolved / maxCalls,
      }
    : null;
  const youStrength = youRel ? Object.entries(youRel).sort((a, b) => b[1] - a[1])[0] : null;
  const youFocus = youRel ? Object.entries(youRel).sort((a, b) => a[1] - b[1])[0] : null;
  const youStrengthLabel = youStrength ? youStrength[0] : null;
  const youFocusLabel = youFocus ? youFocus[0] : null;
  const youFocusHint =
    youFocusLabel === "QA Score"
      ? "Follow the call rubric closely — greeting, verification, empathy, and a clear resolution."
      : youFocusLabel === "CSAT"
        ? "Improve how customers feel after each call — clarity, politeness, and follow-through."
        : youFocusLabel === "SLA Compliance"
          ? "Watch response and handle times to keep every interaction within the agreed SLA."
          : youFocusLabel === "Resolution Volume"
            ? "Increase your handled volume while keeping quality high to climb the board."
            : "";

  /* ─── Profile computations ─────────────────── */
  const yourWeekMetric = SEED_LEADERBOARD.find((a) => a.name === CURRENT_AGENT_NAME)?.metrics.week ?? null;
  const yourWeekMaxCalls = Math.max(...SEED_LEADERBOARD.map((a) => a.metrics.week.callsResolved), 1);
  const yourWeekQuality = yourWeekMetric
    ? computeQualityScore(yourWeekMetric.qaScore, yourWeekMetric.csat, yourWeekMetric.sla, yourWeekMetric.callsResolved, yourWeekMaxCalls)
    : null;

  const togglePref = (key: keyof typeof prefs) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

  const toggleTopbarPanel = (p: "notifications") => setTopbarPanel((prev) => (prev === p ? null : p));

  const markAllNotifsRead = () => setNotifications((n) => n.map((x) => ({ ...x, read: true })));

  const submitPassword = () => {
    if (pwForm.next.length < 8) {
      setPwError("New password must be at least 8 characters.");
      return;
    }
    if (pwForm.next !== pwForm.confirm) {
      setPwError("New password and confirmation do not match.");
      return;
    }
    setPwError(null);
    setPwSuccess("Password updated successfully.");
    setPwForm({ current: "", next: "", confirm: "" });
    setPwOpen(false);
  };

  const handleSignOut = () => {
    setAgentStatus("offline");
  };

  const statusMeta = (s: EarningStatus) =>
    s === "paid"
      ? { label: "Paid", color: "#00875A", bg: "#e8f5ef" }
      : s === "approved"
        ? { label: "Approved", color: "#3080ff", bg: "#e8f1fe" }
        : s === "on-hold"
          ? { label: "On Hold", color: "#F68B1E", bg: "#fdf1e0" }
          : { label: "Pending", color: "#8B5CF6", bg: "#f1ecfe" };

  const payoutStatusMeta = (s: PayoutStatus) =>
    s === "paid"
      ? { label: "Paid", color: "#00875A", bg: "#e8f5ef" }
      : s === "failed"
        ? { label: "Failed", color: "var(--color-error-color)", bg: "var(--color-error-container-color)" }
        : s === "processing"
          ? { label: "Processing", color: "#1B6EF3", bg: "#e8f0fe" }
          : { label: "Cancelled", color: "var(--color-on-surface-variant-color)", bg: "var(--color-surface-container-high-color)" };

  const workTypeIcon = (wt: WorkType, size = 13) =>
    wt === "call" ? <Phone size={size} />
      : wt === "chat" ? <MessageSquare size={size} />
        : wt === "email" ? <Mail size={size} />
          : wt === "ticket" ? <Inbox size={size} />
            : <Sparkles size={size} />;

  const rateUnitIcon = (u: RateUnit, size = 14) =>
    u === "inbound-call" ? <PhoneIncoming size={size} />
      : u === "outbound-call" ? <PhoneOutgoing size={size} />
        : u === "chat" ? <MessageSquare size={size} />
          : u === "email" ? <Mail size={size} />
            : <Share size={size} />;

  /* ─── Principal rate computations ─────────────── */
  const ratePrincipals = PRINCIPALS.filter((p) => PRINCIPAL_RATES.some((r) => r.principalId === p.id));
  const rateGroupOrder = RATE_UNITS.reduce<string[]>((groups, u) => {
    const g = RATE_UNIT_META[u].group;
    if (!groups.includes(g)) groups.push(g);
    return groups;
  }, []);
  const highestRate = (u: RateUnit) => Math.max(...PRINCIPAL_RATES.map((r) => r.rates[u]));
  const rateFor = (principalId: string, unit: RateUnit) =>
    PRINCIPAL_RATES.find((r) => r.principalId === principalId)?.rates[unit] ?? null;

  const captureSelection = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0).cloneRange();
    if (editorRef.current && editorRef.current.contains(range.commonAncestorContainer)) {
      selRangeRef.current = range;
    }
  };

  const escapeHtml = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  const openLinkModal = () => {
    const sel = window.getSelection();
    let highlighted = "";
    if (sel && sel.rangeCount > 0 && editorRef.current && editorRef.current.contains(sel.anchorNode)) {
      highlighted = sel.toString();
      selRangeRef.current = sel.getRangeAt(0).cloneRange();
    } else if (selRangeRef.current) {
      highlighted = selRangeRef.current.toString();
    }
    setLinkText(highlighted || "");
    setLinkUrl("");
    setLinkModalOpen(true);
  };

  const setSelRangeRef = () => { selRangeRef.current = null; };

  const insertLink = () => {
    const url = linkUrl.trim();
    if (!url) return;
    const normalized = /^https?:\/\//.test(url) ? url : `https://${url}`;
    const text = linkText.trim() || normalized;

    const ed = editorRef.current;
    if (ed) {
      if (selRangeRef.current) {
        const sel = window.getSelection();
        if (sel) {
          sel.removeAllRanges();
          sel.addRange(selRangeRef.current);
        }
      }
      document.execCommand(
        "insertHTML",
        false,
        `<a href="${escapeHtml(normalized)}" target="_blank" rel="noreferrer" style="color:#3080ff; text-decoration:underline">${escapeHtml(text)}</a>`
      );
      ed.focus();
    }
    setLinkText("");
    setLinkUrl("");
    setSelRangeRef();
    setLinkModalOpen(false);
  };

  const appendToEditor = (html: string, replace = false) => {
    const ed = editorRef.current;
    if (!ed) return;
    ed.focus();
    if (replace) {
      ed.innerHTML = html;
    } else {
      let sel = window.getSelection();
      if (!sel) return;
      if (sel.rangeCount === 0 || !ed.contains(sel.anchorNode)) {
        const range = document.createRange();
        range.selectNodeContents(ed);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
      }
      document.execCommand("insertHTML", false, html);
    }
  };

  const sendMessageReply = () => {
    const plain = (editorRef.current?.innerText || "").trim();
    if (!plain || !messagePrincipalId) return;
    const currentThread = selectedThread || (messages[messagePrincipalId] || []).find((m) => !m.handled);
    if (!currentThread) return;
    if (messagePrincipal) {
      const workType: WorkType =
        currentThread.source === "Chat" ? "chat"
          : currentThread.source === "Email" ? "email"
            : "ticket";
      setEarnings((prev) => [
        {
          id: `earn-${Date.now()}`,
          workType,
          principal: messagePrincipal.name,
          refId: `TKT-${String(Date.now()).slice(-4)}`,
          base: MESSAGE_EARNING_RATE,
          bonus: 0,
          qaAdjustment: 0,
          status: "pending",
          createdAt: Date.now(),
          qaStatus: "Not Reviewed",
          note: "Awaiting QA review of this conversation.",
        },
        ...prev,
      ]);
    }
    setMessages((prev) => {
      const list = prev[messagePrincipalId] || [];
      return {
        ...prev,
        [messagePrincipalId]: list.filter((m) => m.id !== currentThread.id),
      };
    });
    const remaining = (messages[messagePrincipalId] || []).filter((m) => m.id !== currentThread.id && !m.handled);
    if (remaining.length > 0) {
      setSelectedThreadId(remaining[0].id);
    } else {
      setSelectedThreadId(null);
    }
    if (editorRef.current) editorRef.current.innerHTML = "";
    setAttachments([]);
    setReplyImages([]);
    setSentConfirmation(true);
    setTimeout(() => setSentConfirmation(false), 2500);
  };

  return (
    <div className="app-shell" data-theme={theme} style={(view === "active-call" || view === "in-queue" || view === "after-call-note" || view === "wrap-up-complete") ? { height: "100vh", maxHeight: "100vh", overflow: "hidden" } : undefined}>
      {/* ═══ SIDEBAR ════════════════════════════════════════════════════════ */}
      {view !== "in-queue" && view !== "active-call" && view !== "after-call-note" && view !== "wrap-up-complete" && view !== "outbound-call" && !(navItem === "messages" && messagesView === "inbox") && (
        <aside className="sidebar">
        <div className="sidebar-logo">
          <Headphones size={26} style={{ color: "var(--color-primary-color)" }} />
          <span className="sidebar-logo-text">Connectdesk</span>
        </div>

        <nav className="sidebar-nav">
          {[
            { id: "calls", label: "Calls", icon: <Phone size={17} /> },
            { id: "messages", label: "Messages", icon: <MessageSquare size={17} /> },
            { id: "earning", label: "Earning History", icon: <Clock size={17} /> },
            { id: "rates", label: "Rates", icon: <Landmark size={17} /> },
            { id: "payout", label: "Payout", icon: <CreditCard size={17} /> },
            { id: "leaderboard", label: "Leaderboard", icon: <Trophy size={17} /> },
            { id: "profile", label: "Profile", icon: <User size={17} /> },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => handleNav(item.id as typeof navItem)}
              className={`nav-item ${navItem === item.id ? "active" : ""}`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div style={{ marginTop: "var(--spacing-4)", borderTop: "1px solid var(--color-outline-variant-color)", paddingTop: "var(--spacing-4)" }}>
          <button type="button" onClick={handleSignOut} className="nav-item" style={{ color: "var(--color-error-color)", width: "100%" }}>
            <LogOut size={17} /> Log Out
          </button>
        </div>
        </aside>
      )}

      {/* ═══ MAIN CONTENT ═════════════════════════════════════════════════ */}
      <div className="main-content" style={(view === "active-call" || view === "in-queue" || view === "after-call-note" || view === "wrap-up-complete") ? { height: "100vh", maxHeight: "100vh", overflow: "hidden" } : undefined}>
        {/* ─── TOP BAR ─── */}
        <header className="topbar">
          <div className="topbar-left">
            {navItem === "messages" ? (
              selectedThread ? (
                <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-4)" }}>
                  <button
                    onClick={() => handleNav("calls")}
                    title="Home"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      fontSize: "15px",
                      fontWeight: 500,
                      color: "var(--color-on-background-color)",
                    }}
                  >
                    <ArrowLeft size={18} /> Home
                  </button>
                  {messagePrincipal ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)" }}>
                      <PrincipalLogo principal={messagePrincipal} size={28} />
                      <div>
                        <h2 style={{ fontSize: "16px", fontWeight: 700, margin: 0 }}>{messagePrincipal.name} — Messages</h2>
                        <p style={{ fontSize: "12px", color: "var(--color-on-surface-variant-color)", margin: 0 }}>{principalMessages.filter((m) => !m.handled).length} available message{principalMessages.filter((m) => !m.handled).length === 1 ? "" : "s"}</p>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)" }}>
                      <PrincipalLogo principal={PRINCIPALS[0]} size={28} />
                      <div>
                        <h2 style={{ fontSize: "16px", fontWeight: 700, margin: 0 }}>Chowdeck — Messages</h2>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <h2>Messages</h2>
              )
            ) : navItem === "calls" && view === "choose-call-mode" && activePrincipal ? (
              <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-4)" }}>
                <button className="nav-item" style={{ width: "auto" }} onClick={backToCallPrincipals}>
                  <ArrowLeft size={15} /> Principals
                </button>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)" }}>
                  <PrincipalLogo principal={activePrincipal} size={28} />
                  <span style={{ fontWeight: 500 }}>{activePrincipal.name}</span>
                </div>
              </div>
            ) : navItem === "calls" && (view === "in-queue" || view === "active-call" || view === "outbound-call") && activePrincipal ? (
              <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-4)" }}>
                <button className="nav-item" style={{ width: "auto" }} onClick={backToCallMode}>
                  <ArrowLeft size={15} /> Call Mode
                </button>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)" }}>
                  <PrincipalLogo principal={activePrincipal} size={28} />
                  <span style={{ fontWeight: 500 }}>{activePrincipal.name}</span>
                </div>
              </div>
            ) : navItem === "calls" && view === "after-call-note" ? (
              <h2>After Call Note</h2>
            ) : (
              <h2>{NAV_LABELS[navItem]}</h2>
            )}
          </div>

          <div className="topbar-right">
            <div style={{ position: "relative", display: "flex", gap: "var(--spacing-3)" }}>
              <button
                className="icon-btn notification-dot"
                onClick={() => toggleTopbarPanel("notifications")}
                title="Notifications"
                style={topbarPanel === "notifications" ? { backgroundColor: "var(--color-surface-container-highest-color)" } : undefined}
              >
                <Bell size={17} />
              </button>

              {topbarPanel === "notifications" && (
                <div style={{ position: "absolute", top: "44px", right: "0", width: 380, maxHeight: "min(560px, calc(100vh - 90px))", backgroundColor: "var(--color-surface-color)", border: "1px solid var(--color-outline-variant-color)", borderRadius: "16px", boxShadow: "0 12px 32px rgba(0,0,0,0.14)", zIndex: 1200, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                  <>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: "1px solid var(--color-outline-variant-color)" }}>
                        <h4 style={{ fontSize: "15px", fontWeight: 500, margin: 0 }}>Notifications</h4>
                        {notifications.some((n) => !n.read) && (
                          <button type="button" onClick={markAllNotifsRead} style={{ background: "none", border: "none", padding: 0, fontSize: "12px", fontWeight: 500, color: "var(--color-primary-color)", cursor: "pointer" }}>
                            Mark all as read
                          </button>
                        )}
                      </div>
                      <div style={{ overflowY: "auto", flex: 1 }}>
                        {notifications.length === 0 ? (
                          <p style={{ padding: "24px 16px", textAlign: "center", fontSize: "13px", color: "var(--color-on-surface-variant-color)", margin: 0 }}>You're all caught up.</p>
                        ) : (
                          notifications.map((n) => (
                            <div key={n.id} style={{ display: "flex", gap: "10px", padding: "12px 16px", borderBottom: "1px solid var(--color-outline-variant-color)", backgroundColor: n.read ? "transparent" : "var(--color-surface-container-low-color)" }}>
                              <div style={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: n.read ? "var(--color-surface-container-high-color)" : "#e8f0fe", color: n.read ? "var(--color-on-surface-variant-color)" : "#1B6EF3", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, flexShrink: 0 }}>
                                {n.icon}
                              </div>
                              <div style={{ minWidth: 0 }}>
                                <p style={{ fontSize: "13px", fontWeight: 500, margin: 0 }}>{n.title}</p>
                                <p style={{ fontSize: "12px", color: "var(--color-on-surface-variant-color)", margin: "2px 0 4px", lineHeight: 1.4 }}>{n.desc}</p>
                                <p style={{ fontSize: "11px", color: "var(--color-outline-color)", margin: 0 }}>{n.time}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                  </>
                </div>
              )}
            </div>

            <div className="theme-toggle" onClick={toggleTheme} role="button" tabIndex={0}>
              <Sun size={15} style={{ color: theme === "light" ? "var(--color-primary-color)" : "var(--color-outline-color)" }} />
              <Moon size={15} style={{ color: theme === "dark" ? "var(--color-primary-color)" : "var(--color-outline-color)" }} />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)", paddingLeft: "var(--spacing-3)", borderLeft: "1px solid var(--color-outline-variant-color)" }}>
              <div className="avatar">JD</div>
              <div>
                <p style={{ fontWeight: 500, fontSize: "14px", lineHeight: 1.2 }}>Jane Doe</p>
                <p style={{ fontSize: "11px", color: "var(--color-on-surface-variant-color)", fontWeight: 500 }}>Earnings: {fmtUsd(availableBalance)}</p>
              </div>
            </div>
          </div>
        </header>

        {/* ─── PAGE BODY ─── */}
        <main className="page-content" style={(view === "active-call" || view === "in-queue" || view === "after-call-note" || view === "wrap-up-complete") ? { flex: 1, height: "calc(100vh - 64px)", maxHeight: "calc(100vh - 64px)", overflow: "hidden", padding: "var(--spacing-4) var(--spacing-6)", boxSizing: "border-box" } : undefined}>

          {/* ═══════════════════ VIEW: CALLS — CHOOSE PRINCIPAL ═══════════════════ */}
          {navItem === "calls" && view === "principals" && (
            <div className="card" style={{ backgroundColor: "var(--color-on-primary-color)" }}>
              <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "4px" }}>Choose a Principal</h3>
              <p style={{ color: "var(--color-on-surface-variant-color)", marginBottom: "var(--spacing-6)" }}>Select the principal whose calls you want to handle</p>
              <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
                {PRINCIPALS.map((p) => (
                  <div key={p.id} className="principal-card" style={{ backgroundColor: "var(--color-on-primary-color)" }}>
                    <PrincipalLogo principal={p} />
                    <div className="principal-info">
                      <h4>{p.name}</h4>
                      <p>{p.description}</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => selectPrincipal(p)}>
                      Select <ArrowRight size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════════════════ VIEW: CHOOSE CALL MODE ═══════════════════ */}
          {navItem === "calls" && view === "choose-call-mode" && activePrincipal && (
            <div className="card" style={{ backgroundColor: "var(--color-on-primary-color)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--spacing-8)" }}>
                <div>
                  <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "4px" }}>Choose Call Mode</h2>
                  <p style={{ color: "var(--color-on-surface-variant-color)" }}>Select what type of call you would like to handle today</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)", padding: "var(--spacing-2) var(--spacing-3)", borderRadius: "var(--radius-full)", backgroundColor: "var(--color-surface-container-high-color)", border: "1px solid var(--color-outline-variant-color)" }}>
                  <span style={{ fontSize: "13px", color: "var(--color-on-surface-variant-color)" }}>Off Queue</span>
                  <div style={{ width: 36, height: 20, borderRadius: "var(--radius-full)", backgroundColor: "var(--color-outline-variant-color)", position: "relative", cursor: "pointer" }}>
                    <div style={{ width: 16, height: 16, borderRadius: "50%", backgroundColor: "white", position: "absolute", top: 2, left: 2, boxShadow: "0 1px 3px rgba(0,0,0,0.3)" }} />
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-5)", maxWidth: 720, marginBottom: "var(--spacing-8)" }}>
                {/* Inbound */}
                <div
                  onClick={() => setCallMode("inbound")}
                  style={{ border: `2px solid ${callMode === "inbound" ? "var(--color-primary-color)" : "var(--color-outline-variant-color)"}`, borderRadius: "var(--radius-xl)", padding: "var(--spacing-6)", cursor: "pointer", transition: "all 0.15s ease", backgroundColor: callMode === "inbound" ? "var(--color-on-primary-color)" : "transparent" }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: "50%", backgroundColor: callMode === "inbound" ? "var(--color-primary-color)" : "var(--color-surface-container-high-color)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "var(--spacing-4)" }}>
                    <PhoneIncoming size={20} style={{ color: callMode === "inbound" ? "#fff" : "var(--color-primary-color)" }} />
                  </div>
                  <h4 style={{ fontWeight: 700, fontSize: "16px", marginBottom: "var(--spacing-2)" }}>Inbound Calls</h4>
                  <p style={{ fontSize: "13px", color: "var(--color-on-surface-variant-color)", marginBottom: "var(--spacing-4)" }}>Join the queue and receive incoming calls from customers</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--spacing-2)" }}>
                    {[{ val: "6", label: "In Queue" }, { val: "12", label: "Avg Wait" }, { val: "6", label: "Agents Online" }].map((s) => (
                      <div key={s.label}>
                        <p style={{ fontSize: "20px", fontWeight: 500, color: "var(--color-primary-color)" }}>{s.val}</p>
                        <p style={{ fontSize: "11px", color: "var(--color-on-surface-variant-color)" }}>{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Outbound */}
                <div
                  onClick={() => setCallMode("outbound")}
                  style={{ border: `2px solid ${callMode === "outbound" ? "var(--color-primary-color)" : "var(--color-outline-variant-color)"}`, borderRadius: "var(--radius-xl)", padding: "var(--spacing-6)", cursor: "pointer", transition: "all 0.15s ease", backgroundColor: callMode === "outbound" ? "var(--color-on-primary-color)" : "transparent" }}
                >
                  <div style={{ width: 44, height: 44, borderRadius: "50%", backgroundColor: callMode === "outbound" ? "var(--color-primary-color)" : "var(--color-surface-container-high-color)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "var(--spacing-4)" }}>
                    <PhoneOutgoing size={20} style={{ color: callMode === "outbound" ? "#fff" : "var(--color-primary-color)" }} />
                  </div>
                  <h4 style={{ fontWeight: 700, fontSize: "16px", marginBottom: "var(--spacing-2)" }}>Outbound Calls</h4>
                  <p style={{ fontSize: "13px", color: "var(--color-on-surface-variant-color)", marginBottom: "var(--spacing-4)" }}>Place cold calls to leads from your contact list</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--spacing-2)" }}>
                    {[{ val: "24", label: "Contacts" }, { val: "8", label: "Calls Made" }, { val: "67%", label: "Connect Rate" }].map((s) => (
                      <div key={s.label}>
                        <p style={{ fontSize: "20px", fontWeight: 500, color: "var(--color-primary-color)" }}>{s.val}</p>
                        <p style={{ fontSize: "11px", color: "var(--color-on-surface-variant-color)" }}>{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button
                className="btn btn-primary"
                disabled={!callMode}
                onClick={() => callMode && selectCallMode(callMode)}
                style={{ opacity: callMode ? 1 : 0.55, cursor: callMode ? "pointer" : "not-allowed" }}
              >
                Continue <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* ═══════════════════ VIEW: IN QUEUE ═══════════════════ */}
          {navItem === "calls" && view === "in-queue" && activePrincipal && (
            <div style={{ display: "flex", gap: "var(--spacing-6)", flex: 1, minHeight: 0 }}>
              {/* Agent status panel */}
              <div className="card" style={{ width: 260, flexShrink: 0, alignSelf: "start", backgroundColor: "var(--color-on-primary-color)", paddingTop: "calc(var(--spacing-6) + 16px)", paddingBottom: "calc(var(--spacing-6) + 16px)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-3)", marginBottom: "var(--spacing-4)" }}>
                  <div className="avatar" style={{ width: 42, height: 42, fontSize: 15, position: "relative" }}>
                    JD
                    <span style={{ position: "absolute", bottom: 0, right: 0, width: 10, height: 10, borderRadius: "50%", backgroundColor: "#00875A", border: "2px solid var(--color-surface-color)" }} />
                  </div>
                  <div>
                    <p style={{ fontWeight: 500, fontSize: "14px" }}>Jane Doe</p>
                    <p style={{ fontSize: "11px", color: "#00875A", fontWeight: 500 }}>Active - On Call</p>
                  </div>
                </div>
                <p style={{ fontSize: "11px", fontWeight: 500, letterSpacing: "0.5px", color: "var(--color-on-surface-variant-color)", marginBottom: "var(--spacing-2)" }}>AGENT STATUS</p>
                <AgentStatusDropdown status={agentStatus} onChange={setAgentStatus} />
              </div>

              {/* Queue waiting UI */}
              <div className="card" style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative", overflow: "hidden", backgroundColor: "var(--color-on-primary-color)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--spacing-6)" }}>
                  <button className="text-link" onClick={() => setView("choose-call-mode")}>
                    <ArrowLeft size={14} /> Change Call Mode
                  </button>
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)", padding: "var(--spacing-2) var(--spacing-4)", borderRadius: "var(--radius-full)", backgroundColor: currentAgentStatus.bg, border: `1px solid ${currentAgentStatus.color}` }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: currentAgentStatus.color, display: "inline-block" }} />
                    <span style={{ color: currentAgentStatus.color, fontWeight: 500, fontSize: "13px" }}>{currentAgentStatus.label}</span>
                  </div>
                </div>

                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "var(--spacing-10)" }}>
                  {agentStatus === "online" ? (
                    <>
                      <h3 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "var(--spacing-3)" }}>You are in the Queue</h3>
                      <p style={{ color: "var(--color-on-surface-variant-color)", textAlign: "center", maxWidth: 420, marginBottom: "var(--spacing-8)", lineHeight: 1.6 }}>
                        Stay on the screen. When a customer calls in, you will see a modal to accept or decline. Calls are distributed in order
                      </p>

                      <div style={{ display: "flex", gap: "var(--spacing-12)" }}>
                        {[{ val: "6", label: "waiting" }, { val: "4", label: "Agents on call" }, { val: "3:12", label: "Avg wait time" }].map((s) => (
                          <div key={s.label} style={{ textAlign: "center" }}>
                            <p style={{ fontSize: "28px", fontWeight: 500, color: "var(--color-primary-color)" }}>{s.val}</p>
                            <p style={{ fontSize: "13px", color: "var(--color-on-surface-variant-color)" }}>{s.label}</p>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "var(--spacing-3)" }}>{STATUS_TITLES[agentStatus]}</h3>
                      <p style={{ color: "var(--color-on-surface-variant-color)", textAlign: "center", maxWidth: 420, lineHeight: 1.6 }}>
                        You are no longer in the queue for incoming calls. Switch your status back to "Online - Ready for Calls" to start receiving calls again.
                      </p>
                    </>
                  )}
                </div>

                {/* Incoming call modal — centered within the queue section */}
                {incomingCallOpen && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      backgroundColor: "rgba(0, 0, 0, 0.45)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 10,
                    }}
                    onClick={() => setIncomingCallOpen(false)}
                  >
                    <div
                      style={{
                        backgroundColor: "var(--color-surface-color)",
                        borderRadius: "var(--radius-2xl)",
                        padding: "var(--spacing-8)",
                        width: 380,
                        maxWidth: "90%",
                        boxShadow: "var(--elevation-4)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "var(--spacing-4)",
                        textAlign: "center",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div style={{ width: 64, height: 64, borderRadius: "50%", backgroundColor: "#e8f5ef", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <PhoneIncoming size={30} style={{ color: "#00875A" }} />
                      </div>
                      <h3 style={{ fontSize: "20px", fontWeight: 700, margin: 0 }}>Incoming Call</h3>
                      <p style={{ fontSize: "15px", fontWeight: 500, margin: 0 }}>John Doe</p>
                      <p style={{ fontSize: "13px", color: "var(--color-on-surface-variant-color)", margin: 0 }}>+234 708 948 8172</p>
                      <div style={{ display: "flex", gap: "var(--spacing-4)", marginTop: "var(--spacing-4)" }}>
                        <button className="btn btn-danger" onClick={() => { setIncomingCallOpen(false); setDeclineReason(null); setDeclineReasonOpen(true); }}>
                          <X size={15} /> Decline
                        </button>
                        <button className="btn btn-primary" onClick={() => { setIncomingCallOpen(false); acceptCall(); }}>
                          <PhoneIncoming size={15} /> Accept
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Decline reason modal — centered within the queue section */}
                {declineReasonOpen && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      backgroundColor: "rgba(0, 0, 0, 0.45)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 20,
                    }}
                    onClick={() => setDeclineReasonOpen(false)}
                  >
                    <div
                      style={{
                        backgroundColor: "var(--color-surface-color)",
                        borderRadius: "var(--radius-2xl)",
                        padding: "var(--spacing-8)",
                        width: 400,
                        maxWidth: "90%",
                        boxShadow: "var(--elevation-4)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "var(--spacing-5)",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div style={{ textAlign: "left" }}>
                        <h3 style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>Reason for Declining</h3>
                        <p style={{ fontSize: "13px", color: "var(--color-on-surface-variant-color)", margin: "4px 0 0 0" }}>
                          Select a reason — your supervisor will be notified.
                        </p>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)" }}>
                        {DECLINE_REASONS.map((r) => (
                          <button
                            key={r}
                            onClick={() => setDeclineReason(r)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                              width: "100%",
                              padding: "12px 14px",
                              borderRadius: "var(--radius-md)",
                              border: declineReason === r ? "2px solid var(--color-primary-color)" : "1px solid var(--color-outline-variant-color)",
                              backgroundColor: declineReason === r ? "var(--color-on-primary-color)" : "var(--color-surface-color)",
                              cursor: "pointer",
                              fontSize: "13px",
                              color: "var(--color-on-surface-color)",
                              textAlign: "left",
                            }}
                          >
                            <span style={{ width: 14, height: 14, borderRadius: "50%", flexShrink: 0, border: declineReason === r ? "5px solid var(--color-primary-color)" : "2px solid var(--color-outline-color)" }} />
                            {r}
                          </button>
                        ))}
                      </div>

                      <div style={{ display: "flex", gap: "var(--spacing-3)", justifyContent: "flex-start" }}>
                        <button className="btn btn-ghost" onClick={() => setDeclineReasonOpen(false)}>Cancel</button>
                        <button
                          className="btn btn-primary"
                          disabled={!declineReason}
                          onClick={handleDeclineSubmit}
                          style={{ opacity: declineReason ? 1 : 0.5, cursor: declineReason ? "pointer" : "not-allowed" }}
                        >
                          Submit
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══════════════════ VIEW: OUTBOUND CALL WORKSPACE ═══════════════════ */}
          {navItem === "calls" && view === "outbound-call" && activePrincipal && (
            <div style={{ display: "flex", gap: "var(--spacing-6)", flex: 1, minHeight: 0 }}>
              {/* Left — agent status */}
              <div className="card" style={{ width: 260, flexShrink: 0, alignSelf: "start", backgroundColor: "var(--color-on-primary-color)", paddingTop: "calc(var(--spacing-6) + 16px)", paddingBottom: "calc(var(--spacing-6) + 16px)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-3)", marginBottom: "var(--spacing-4)" }}>
                  <div className="avatar" style={{ width: 42, height: 42, fontSize: 15, position: "relative" }}>
                    JD
                    <span style={{ position: "absolute", bottom: 0, right: 0, width: 10, height: 10, borderRadius: "50%", backgroundColor: agentStatus === "online" ? "#00875A" : currentAgentStatus.color, border: "2px solid var(--color-surface-color)" }} />
                  </div>
                  <div>
                    <p style={{ fontWeight: 500, fontSize: "14px" }}>Jane Doe</p>
                    <p style={{ fontSize: "11px", color: agentStatus === "online" ? "#00875A" : currentAgentStatus.color, fontWeight: 500 }}>{currentAgentStatus.label}</p>
                  </div>
                </div>
                <p style={{ fontSize: "11px", fontWeight: 500, letterSpacing: "0.5px", color: "var(--color-on-surface-variant-color)", marginBottom: "var(--spacing-2)" }}>AGENT STATUS</p>
                <AgentStatusDropdown status={agentStatus} onChange={setAgentStatus} hideOnline />
              </div>

              {/* Right — outbound workspace */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "var(--spacing-4)", minHeight: 0 }}>

                {/* ─── Dial Pad + Context Box Row ─── */}
                <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "var(--spacing-4)", flexShrink: 0 }}>

                  {/* Dial Pad with search/select input */}
                  <div className="card" style={{ backgroundColor: "var(--color-on-primary-color)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "var(--spacing-6) var(--spacing-4)" }}>
                    <h4 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "var(--spacing-2)", alignSelf: "flex-start" }}>Dial Pad</h4>

                    {/* Search / type / select input with caret-down */}
                    <div ref={outboundDropdownRef} style={{ position: "relative", width: "100%", marginBottom: "var(--spacing-2)" }}>
                      <div style={{ position: "relative" }}>
                        <input
                          type="text"
                          value={outboundSearch}
                          onChange={(e) => {
                            setOutboundSearch(e.target.value);
                            setOutboundDropdownOpen(true);
                            setSelectedOutboundContact(null);
                          }}
                          onFocus={() => setOutboundDropdownOpen(true)}
                          placeholder="Search, type or select number"
                          style={{
                            width: "100%",
                            height: 36,
                            padding: "0 36px 0 var(--spacing-3)",
                            border: "1.5px solid var(--color-outline-variant-color)",
                            borderRadius: "var(--radius-md)",
                            fontSize: "13px",
                            backgroundColor: "var(--color-surface-container-low-color)",
                          }}
                        />
                        <button
                          onClick={() => setOutboundDropdownOpen((o) => !o)}
                          style={{
                            position: "absolute",
                            right: 0,
                            top: 0,
                            height: 36,
                            width: 36,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "var(--color-on-surface-variant-color)",
                          }}
                        >
                          <ChevronDown size={18} />
                        </button>
                      </div>

                      {/* Dropdown */}
                      {outboundDropdownOpen && (
                        <div
                          style={{
                            position: "absolute",
                            top: "calc(100% + 4px)",
                            left: 0,
                            right: 0,
                            backgroundColor: "var(--color-surface-color)",
                            border: "1px solid var(--color-outline-variant-color)",
                            borderRadius: "8px",
                            boxShadow: "var(--elevation-3)",
                            zIndex: 20,
                            maxHeight: 200,
                            overflowY: "auto",
                          }}
                        >
                          {OUTBOUND_CALL_HISTORY.filter(
                            (c) =>
                              outboundSearch === "" ||
                              c.customerName.toLowerCase().startsWith(outboundSearch.toLowerCase()) ||
                              c.phone.includes(outboundSearch)
                          ).length === 0 ? (
                            <div style={{ padding: "var(--spacing-4)", textAlign: "center", color: "var(--color-on-surface-variant-color)", fontSize: "13px" }}>
                              No contacts found
                            </div>
                          ) : (
                            OUTBOUND_CALL_HISTORY.filter(
                              (c) =>
                                outboundSearch === "" ||
                                c.customerName.toLowerCase().startsWith(outboundSearch.toLowerCase()) ||
                                c.phone.includes(outboundSearch)
                            ).map((c) => (
                              <button
                                key={c.id}
                                onClick={() => {
                                  setSelectedOutboundContact(c);
                                  setOutboundDialNumber(c.phone);
                                  setOutboundSearch(c.customerName);
                                  setOutboundDropdownOpen(false);
                                }}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "var(--spacing-3)",
                                  width: "100%",
                                  padding: "var(--spacing-3)",
                                  border: "none",
                                  background: selectedOutboundContact?.id === c.id ? "var(--color-surface-container-high-color)" : "transparent",
                                  cursor: "pointer",
                                  fontSize: "13px",
                                  color: "var(--color-on-surface-color)",
                                  textAlign: "left",
                                }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--color-surface-container-high-color)")}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = selectedOutboundContact?.id === c.id ? "var(--color-surface-container-high-color)" : "transparent")}
                              >
                                <div style={{ width: 30, height: 30, borderRadius: "50%", backgroundColor: "var(--color-primary-container-color)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                  <User size={14} style={{ color: "var(--color-primary-color)" }} />
                                </div>
                                <div style={{ minWidth: 0, flex: 1 }}>
                                  <p style={{ fontWeight: 500, fontSize: "13px", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.customerName}</p>
                                  <p style={{ fontSize: "11px", color: "var(--color-on-surface-variant-color)", margin: 0, fontFamily: "monospace" }}>{c.phone}</p>
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>

                    {/* Dialed number display */}
                    <input
                      type="text"
                      readOnly
                      value={outboundDialNumber}
                      placeholder="No number selected"
                      style={{
                        width: "100%",
                        height: 36,
                        padding: "0 var(--spacing-3)",
                        border: "1.5px solid var(--color-outline-variant-color)",
                        borderRadius: "var(--radius-md)",
                        fontSize: "15px",
                        fontFamily: "monospace",
                        backgroundColor: "var(--color-surface-container-low-color)",
                        textAlign: "center",
                        letterSpacing: "2px",
                        marginBottom: "var(--spacing-2)",
                      }}
                    />

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", width: "100%", marginBottom: "var(--spacing-4)" }}>
                      {[
                        { key: "1", sub: "" }, { key: "2", sub: "ABC" }, { key: "3", sub: "DEF" },
                        { key: "4", sub: "GHI" }, { key: "5", sub: "JKL" }, { key: "6", sub: "MNO" },
                        { key: "7", sub: "PQRS" }, { key: "8", sub: "TUV" }, { key: "9", sub: "WXYZ" },
                        { key: "*", sub: "" }, { key: "0", sub: "+" }, { key: "#", sub: "" },
                      ].map(({ key, sub }) => (
                        <button
                          key={key}
                          onClick={() => {
                            setOutboundDialNumber((n) => n + key);
                            setOutboundSearch("");
                            setSelectedOutboundContact(null);
                          }}
                          style={{
                            height: 38,
                            borderRadius: "var(--radius-md)",
                            border: "1px solid var(--color-outline-variant-color)",
                            backgroundColor: "var(--color-surface-container-high-color)",
                            cursor: "pointer",
                            transition: "background 0.1s",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            lineHeight: 1,
                          }}
                          onMouseDown={(e) => (e.currentTarget.style.backgroundColor = "var(--color-primary-container-color)")}
                          onMouseUp={(e) => (e.currentTarget.style.backgroundColor = "var(--color-surface-container-high-color)")}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--color-surface-container-high-color)")}
                        >
                          <span style={{ fontSize: "16px", fontWeight: 500 }}>{key}</span>
                          {sub && <span style={{ fontSize: "8px", fontWeight: 500, letterSpacing: "1px", color: "var(--color-on-surface-variant-color)" }}>{sub}</span>}
                        </button>
                      ))}
                    </div>

                    <div style={{ display: "flex", gap: "var(--spacing-2)", width: "100%" }}>
                      <button
                        onClick={() => {
                          setOutboundDialNumber((n) => n.slice(0, -1));
                          if (outboundDialNumber.length <= 1) {
                            setOutboundSearch("");
                            setSelectedOutboundContact(null);
                          }
                        }}
                        style={{
                          flex: 1,
                          height: 34,
                          borderRadius: "var(--radius-md)",
                          border: "1px solid var(--color-outline-variant-color)",
                          backgroundColor: "var(--color-surface-container-high-color)",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Delete size={16} />
                      </button>
                      <button
                        className="btn btn-primary"
                        style={{ flex: 3, height: 34, fontSize: "13px", fontWeight: 500 }}
                        disabled={!outboundDialNumber}
                        onClick={() => {
                          setCallTab("suggested");
                          setIsMuted(false);
                          setIsOnHold(false);
                          setLiveStage(0);
                          setView("active-call");
                        }}
                      >
                        <Phone size={15} /> Call
                      </button>
                    </div>
                  </div>

                  {/* ─── Context Box ─── */}
                  <div className="card" style={{ backgroundColor: "var(--color-on-primary-color)", display: "flex", flexDirection: "column" }}>
                    <h4 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "var(--spacing-4)" }}>Customer Context</h4>

                    {selectedOutboundContact ? (
                      <div style={{ flex: 1, overflowY: "auto" }}>
                        {/* Customer header */}
                        <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-3)", marginBottom: "var(--spacing-4)" }}>
                          <User size={24} style={{ color: "var(--color-primary-color)", flexShrink: 0 }} />
                          <div>
                            <p style={{ fontWeight: 500, fontSize: "15px", margin: 0 }}>{selectedOutboundContact.customerName}</p>
                            <p style={{ fontSize: "12px", color: "var(--color-on-surface-variant-color)", margin: "2px 0 0" }}>{selectedOutboundContact.customerId}</p>
                          </div>
                          <span
                            style={{
                              marginLeft: "auto",
                              fontSize: "11px",
                              fontWeight: 500,
                              color: selectedOutboundContact.accountStatus === "active" ? "#00875A" : selectedOutboundContact.accountStatus === "suspended" ? "var(--color-error-color)" : "var(--color-on-surface-variant-color)",
                              backgroundColor: selectedOutboundContact.accountStatus === "active" ? "#e8f5ef" : selectedOutboundContact.accountStatus === "suspended" ? "var(--color-error-container-color)" : "var(--color-surface-container-high-color)",
                              padding: "3px 10px",
                              borderRadius: "var(--radius-full)",
                              textTransform: "capitalize",
                            }}
                          >
                            {selectedOutboundContact.accountStatus}
                          </span>
                        </div>

                        <div className="divider" style={{ marginBottom: "var(--spacing-4)" }} />

                        {/* Info rows */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-4)", marginBottom: "var(--spacing-4)" }}>
                          <div>
                            <p style={{ fontSize: "11px", fontWeight: 500, color: "var(--color-on-surface-variant-color)", letterSpacing: "0.05em", marginBottom: "4px" }}>Phone Number</p>
                            <p style={{ fontSize: "13px", fontWeight: 500, fontFamily: "monospace", margin: 0 }}>{selectedOutboundContact.phone}</p>
                          </div>
                          <div>
                            <p style={{ fontSize: "11px", fontWeight: 500, color: "var(--color-on-surface-variant-color)", letterSpacing: "0.05em", marginBottom: "4px" }}>Email</p>
                            <p style={{ fontSize: "13px", fontWeight: 500, margin: 0 }}>{selectedOutboundContact.email}</p>
                          </div>
                        </div>

                        <div className="divider" style={{ marginBottom: "var(--spacing-4)" }} />

                        {/* Previous interactions */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "var(--spacing-4)", marginBottom: "var(--spacing-4)" }}>
                          <div>
                            <p style={{ fontSize: "11px", fontWeight: 500, color: "var(--color-on-surface-variant-color)", letterSpacing: "0.05em", marginBottom: "4px" }}>Previous Calls</p>
                            <p style={{ fontSize: "20px", fontWeight: 500, color: "var(--color-primary-color)", margin: 0 }}>{selectedOutboundContact.previousInteractions}</p>
                          </div>
                          <div>
                            <p style={{ fontSize: "11px", fontWeight: 500, color: "var(--color-on-surface-variant-color)", letterSpacing: "0.05em", marginBottom: "4px" }}>Last Call</p>
                            <p style={{ fontSize: "13px", fontWeight: 500, margin: 0 }}>{selectedOutboundContact.lastCallDate}</p>
                          </div>
                          <div>
                            <p style={{ fontSize: "11px", fontWeight: 500, color: "var(--color-on-surface-variant-color)", letterSpacing: "0.05em", marginBottom: "4px" }}>Last Disposition</p>
                            <span
                              style={{
                                fontSize: "11px",
                                fontWeight: 500,
                                color: selectedOutboundContact.lastDisposition === "Escalated to Supervisor" ? "var(--color-error-color)" : selectedOutboundContact.lastDisposition === "Callback Required" ? "#F68B1E" : "#00875A",
                                backgroundColor: selectedOutboundContact.lastDisposition === "Escalated to Supervisor" ? "var(--color-error-container-color)" : selectedOutboundContact.lastDisposition === "Callback Required" ? "#fdf1e0" : "#e8f5ef",
                                padding: "2px 10px",
                                borderRadius: "var(--radius-full)",
                              }}
                            >
                              {selectedOutboundContact.lastDisposition}
                            </span>
                          </div>
                        </div>

                        <div className="divider" style={{ marginBottom: "var(--spacing-4)" }} />

                        {/* Notes */}
                        <div>
                          <p style={{ fontSize: "11px", fontWeight: 500, color: "var(--color-on-surface-variant-color)", letterSpacing: "0.05em", marginBottom: "6px" }}>Reason for Call Back</p>
                          <p style={{ fontSize: "13px", color: "var(--color-on-surface-color)", margin: 0, lineHeight: 1.6, backgroundColor: "var(--color-surface-container-low-color)", padding: "var(--spacing-4)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-outline-variant-color)", minHeight: 60 }}>
                            {selectedOutboundContact.reasonForCallback}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--color-on-surface-variant-color)", padding: "var(--spacing-8)" }}>
                        <User size={36} style={{ marginBottom: "var(--spacing-3)", opacity: 0.3 }} />
                        <p style={{ fontSize: "14px", fontWeight: 500, marginBottom: "var(--spacing-1)" }}>No customer selected</p>
                        <p style={{ fontSize: "12px", color: "var(--color-on-surface-variant-color)", textAlign: "center" }}>Select a contact from the dropdown or dial a number to view customer context</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* ─── Call History ─── */}
                <div className="card" style={{ backgroundColor: "var(--color-on-primary-color)", display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--spacing-4)", flexShrink: 0 }}>
                    <div>
                      <h4 style={{ fontSize: "14px", fontWeight: 700, margin: 0 }}>Outbound Call History</h4>
                      <p style={{ fontSize: "12px", color: "var(--color-on-surface-variant-color)", margin: "2px 0 0" }}>Calls made to {activePrincipal.name} customers</p>
                    </div>
                    <button className="btn btn-ghost" style={{ padding: "var(--spacing-1) var(--spacing-3)", fontSize: "12px" }}>
                      <RefreshCw size={13} /> Refresh
                    </button>
                  </div>

                  {/* Table wrapper — fixed height when expanded, auto when collapsed */}
                  <div style={outboundHistoryExpanded ? { maxHeight: 420, overflowY: "auto" } : undefined}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                      <thead style={{ position: "sticky", top: 0, backgroundColor: "var(--color-on-primary-color)", zIndex: 1 }}>
                        <tr style={{ borderBottom: "1px solid var(--color-outline-variant-color)" }}>
                          <th style={{ textAlign: "left", padding: "var(--spacing-2) var(--spacing-3)", fontSize: "11px", fontWeight: 500, letterSpacing: "0.05em", color: "var(--color-on-surface-variant-color)" }}>Customer</th>
                          <th style={{ textAlign: "left", padding: "var(--spacing-2) var(--spacing-3)", fontSize: "11px", fontWeight: 500, letterSpacing: "0.05em", color: "var(--color-on-surface-variant-color)" }}>Phone</th>
                          <th style={{ textAlign: "left", padding: "var(--spacing-2) var(--spacing-3)", fontSize: "11px", fontWeight: 500, letterSpacing: "0.05em", color: "var(--color-on-surface-variant-color)" }}>Time</th>
                          <th style={{ textAlign: "left", padding: "var(--spacing-2) var(--spacing-3)", fontSize: "11px", fontWeight: 500, letterSpacing: "0.05em", color: "var(--color-on-surface-variant-color)" }}>Duration</th>
                          <th style={{ textAlign: "left", padding: "var(--spacing-2) var(--spacing-3)", fontSize: "11px", fontWeight: 500, letterSpacing: "0.05em", color: "var(--color-on-surface-variant-color)" }}>Status</th>
                          <th style={{ textAlign: "left", padding: "var(--spacing-2) var(--spacing-3)", fontSize: "11px", fontWeight: 500, letterSpacing: "0.05em", color: "var(--color-on-surface-variant-color)" }}>Disposition</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(outboundHistoryExpanded ? OUTBOUND_CALL_HISTORY : OUTBOUND_CALL_HISTORY.slice(0, 5)).map((call) => (
                          <tr key={call.id} style={{ borderBottom: "1px solid var(--color-outline-variant-color)" }}>
                            <td style={{ padding: "var(--spacing-3)", fontWeight: 500 }}>{call.customerName}</td>
                            <td style={{ padding: "var(--spacing-3)", color: "var(--color-on-surface-variant-color)", fontFamily: "monospace", fontSize: "12px" }}>{call.phone}</td>
                            <td style={{ padding: "var(--spacing-3)", color: "var(--color-on-surface-variant-color)" }}>{call.time}</td>
                            <td style={{ padding: "var(--spacing-3)" }}>{call.duration}</td>
                            <td style={{ padding: "var(--spacing-3)" }}>
                              <span
                                style={{
                                  fontSize: "11px",
                                  fontWeight: 500,
                                  color: call.status === "completed" ? "#00875A" : call.status === "no-answer" ? "#F68B1E" : "var(--color-on-surface-variant-color)",
                                  backgroundColor: call.status === "completed" ? "#e8f5ef" : call.status === "no-answer" ? "#fdf1e0" : "var(--color-surface-container-high-color)",
                                  padding: "2px 10px",
                                  borderRadius: "var(--radius-full)",
                                  textTransform: "capitalize",
                                }}
                              >
                                {call.status === "no-answer" ? "No Answer" : call.status === "completed" ? "Connected" : call.status === "busy" ? "Busy" : call.status}
                              </span>
                            </td>
                            <td style={{ padding: "var(--spacing-3)" }}>
                              {call.disposition !== "—" ? (
                                <span
                                  style={{
                                    fontSize: "11px",
                                    fontWeight: 500,
                                    color: call.disposition === "Escalated to Supervisor" ? "var(--color-error-color)" : call.disposition === "Callback Required" ? "#F68B1E" : "#00875A",
                                    backgroundColor: call.disposition === "Escalated to Supervisor" ? "var(--color-error-container-color)" : call.disposition === "Callback Required" ? "#fdf1e0" : "#e8f5ef",
                                    padding: "2px 10px",
                                    borderRadius: "var(--radius-full)",
                                  }}
                                >
                                  {call.disposition}
                                </span>
                              ) : (
                                <span style={{ color: "var(--color-on-surface-variant-color)" }}>—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                  </table>
                </div>

                  {/* See more / See less link */}
                  {OUTBOUND_CALL_HISTORY.length > 5 && (
                    <div style={{ flexShrink: 0, borderTop: "1px solid var(--color-outline-variant-color)", padding: "var(--spacing-3) 0 0", marginTop: "var(--spacing-3)", textAlign: "center" }}>
                      <button
                        className="text-link"
                        onClick={() => setOutboundHistoryExpanded((e) => !e)}
                        style={{ fontSize: "13px", fontWeight: 500, display: "inline-flex", alignItems: "center", gap: "6px" }}
                      >
                        {outboundHistoryExpanded ? (
                          <>Show Less</>
                        ) : (
                          <>See More Call History <ArrowRight size={14} /></>
                        )}
                      </button>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* ═══════════════════ VIEW: ACTIVE CALL ═══════════════════ */}
          {navItem === "calls" && (view === "active-call" || view === "after-call-note") && activePrincipal && (
            <div style={{ display: "flex", gap: "var(--spacing-4)", flex: 1, minHeight: 0, height: "100%", overflow: "hidden" }}>
              {/* Left — agent status */}
              <div className="card" style={{ width: 260, flexShrink: 0, alignSelf: "start", backgroundColor: "var(--color-on-primary-color)", paddingTop: "calc(var(--spacing-6) + 16px)", paddingBottom: "calc(var(--spacing-6) + 16px)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-3)", marginBottom: "var(--spacing-4)" }}>
                  <div className="avatar" style={{ width: 42, height: 42, fontSize: 15, position: "relative" }}>
                    JD
                    <span style={{ position: "absolute", bottom: 0, right: 0, width: 10, height: 10, borderRadius: "50%", backgroundColor: "#00875A", border: "2px solid var(--color-surface-color)" }} />
                  </div>
                  <div>
                    <p style={{ fontWeight: 500, fontSize: "14px" }}>Jane Doe</p>
                    <p style={{ fontSize: "11px", color: "#00875A", fontWeight: 500 }}>Active - On Call</p>
                  </div>
                </div>
                <p style={{ fontSize: "11px", fontWeight: 500, letterSpacing: "0.5px", color: "var(--color-on-surface-variant-color)", marginBottom: "var(--spacing-2)" }}>AGENT STATUS</p>
                <AgentStatusDropdown status={agentStatus} onChange={setAgentStatus} />
              </div>

              {/* Right — session workspace */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "var(--spacing-3)", minHeight: 0, height: "100%", overflow: "hidden", position: "relative" }}>
                {/* Customer info + call controls */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-3)", flexShrink: 0 }}>
                  {/* Customer info */}
                  <div className="card" style={{ backgroundColor: "var(--color-on-primary-color)", padding: "16px var(--spacing-4)" }}>
                    <h4 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "var(--spacing-2)" }}>Customer Information</h4>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--spacing-2)" }}>
                      <div>
                        <p style={{ fontSize: "11px", color: "var(--color-on-surface-variant-color)", marginBottom: "2px" }}>Caller Name</p>
                        <p style={{ fontWeight: 500, fontSize: "13px", margin: 0 }}>{callMode === "outbound" && selectedOutboundContact ? selectedOutboundContact.customerName : "John Doe"}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: "11px", color: "var(--color-on-surface-variant-color)", marginBottom: "2px" }}>Phone Number</p>
                        <p style={{ fontWeight: 500, fontSize: "13px", margin: 0 }}>{callMode === "outbound" && selectedOutboundContact ? selectedOutboundContact.phone : "+234 708 948 8172"}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: "11px", color: "var(--color-on-surface-variant-color)", marginBottom: "2px" }}>Ticket ID</p>
                        <p style={{ fontWeight: 500, fontSize: "13px", color: "var(--color-primary-color)", margin: 0 }}>{callMode === "outbound" && selectedOutboundContact ? selectedOutboundContact.customerId : "CUST-8821"}</p>
                      </div>
                    </div>
                    <div className="divider" style={{ margin: "var(--spacing-4) 0" }} />
                    <p style={{ fontSize: "11px", color: "var(--color-on-surface-variant-color)", margin: 0 }}>
                      {callMode === "outbound" && selectedOutboundContact
                        ? <>Previous Calls: {selectedOutboundContact.previousInteractions} &nbsp;|&nbsp; Last Call: {selectedOutboundContact.lastCallDate}</>
                        : <>Previous Calls: 3 &nbsp;|&nbsp; Last Call: May 16, 2025</>
                      }
                    </p>
                  </div>

                  {/* Call controls */}
                  <div className="card" style={{ textAlign: "center", backgroundColor: "var(--color-on-primary-color)", padding: "16px var(--spacing-4)" }}>
                    <h4 style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-on-surface-variant-color)", marginBottom: "var(--spacing-1)" }}>Call Controls</h4>
                    <div className="call-timer" style={{ marginBottom: "var(--spacing-2)", fontSize: "18px" }}>{fmtCallTime(callSeconds)}</div>
                    <div className="call-controls" style={{ display: "flex", justifyContent: "center", gap: "var(--spacing-3)" }}>
                      <button className="call-btn" onClick={() => setIsMuted(!isMuted)}>
                        <div className={`call-btn-circle ${isMuted ? "active" : ""}`}>
                          {isMuted ? <MicOff size={16} style={{ color: "var(--color-error-color)" }} /> : <Mic size={16} />}
                        </div>
                        <span style={isMuted ? { color: "var(--color-error-color)" } : undefined}>{isMuted ? "Unmute" : "Mute"}</span>
                      </button>
                      <button className="call-btn" onClick={() => setIsOnHold(!isOnHold)}>
                        <div className={`call-btn-circle ${isOnHold ? "active" : ""}`}>
                          <Pause size={16} style={isOnHold ? { color: "var(--color-error-color)" } : undefined} />
                        </div>
                        <span style={isOnHold ? { color: "var(--color-error-color)" } : undefined}>{isOnHold ? "Resume" : "Hold"}</span>
                      </button>
                      <div style={{ position: "relative" }} ref={dialPadRef}>
                        <button className="call-btn dialpad-btn" onClick={() => setDialPadOpen(!dialPadOpen)}>
                          <div className="call-btn-circle"><Grid2x2 size={16} /></div>
                          <span>Dial Pad</span>
                        </button>
                        {dialPadOpen && (
                          <div style={{ position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)", marginTop: "var(--spacing-2)", backgroundColor: "var(--color-on-primary-color)", border: "1px solid var(--color-outline-variant-color)", borderRadius: "var(--radius-lg)", padding: "var(--spacing-4)", boxShadow: "var(--elevation-3)", zIndex: 50, width: 240 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)", marginBottom: "var(--spacing-3)" }}>
                              <input type="text" readOnly value={dialedNumber} style={{ flex: 1, height: 36, padding: "0 var(--spacing-2)", border: "1px solid var(--color-outline-variant-color)", borderRadius: "var(--radius-md)", fontSize: "14px", fontFamily: "monospace", backgroundColor: "var(--color-surface-container-low-color)", textAlign: "center", letterSpacing: "1px" }} placeholder="Number" />
                              <button onClick={() => setDialedNumber((n) => n.slice(0, -1))} style={{ width: 36, height: 36, borderRadius: "var(--radius-md)", border: "1px solid var(--color-outline-variant-color)", backgroundColor: "var(--color-surface-container-high-color)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>
                                <Delete size={14} />
                              </button>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "var(--spacing-2)" }}>
                              {[
                                { key: "1", sub: "" },
                                { key: "2", sub: "ABC" },
                                { key: "3", sub: "DEF" },
                                { key: "4", sub: "GHI" },
                                { key: "5", sub: "JKL" },
                                { key: "6", sub: "MNO" },
                                { key: "7", sub: "PQRS" },
                                { key: "8", sub: "TUV" },
                                { key: "9", sub: "WXYZ" },
                                { key: "*", sub: "" },
                                { key: "0", sub: "+" },
                                { key: "#", sub: "" },
                              ].map(({ key, sub }) => (
                                <button key={key} onClick={() => setDialedNumber((n) => n + key)} style={{ height: 48, borderRadius: "var(--radius-md)", border: "1px solid var(--color-outline-variant-color)", backgroundColor: "var(--color-surface-container-high-color)", cursor: "pointer", transition: "background 0.1s", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", lineHeight: 1 }} onMouseDown={(e) => (e.currentTarget.style.backgroundColor = "var(--color-primary-container-color)")} onMouseUp={(e) => (e.currentTarget.style.backgroundColor = "var(--color-surface-container-high-color)")} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--color-surface-container-high-color)")}>
                                  <span style={{ fontSize: "18px", fontWeight: 500 }}>{key}</span>
                                  {sub && <span style={{ fontSize: "8px", fontWeight: 500, letterSpacing: "1px", color: "var(--color-on-surface-variant-color)" }}>{sub}</span>}
                                </button>
                              ))}
                            </div>
                            <button className="btn btn-primary" style={{ width: "100%", marginTop: "var(--spacing-3)", padding: "var(--spacing-2)" }}>
                              <Phone size={14} /> Call
                            </button>
                          </div>
                        )}
                      </div>
                      <button className="call-btn transfer-btn" onClick={(e) => { e.stopPropagation(); setIsTransferring(true); setTransferSent(false); setTransferMessage(""); setTransferSupervisor(""); setTransferError(null); }}>
                        <div className="call-btn-circle"><CornerUpRight size={16} /></div>
                        <span>Transfer</span>
                      </button>
                      <button className="call-btn" onClick={endCall}>
                        <div className="call-btn-circle danger">
                          <PhoneOff size={16} style={{ color: "#fff" }} />
                        </div>
                        <span style={{ color: "var(--color-error-color)" }}>End Call</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* AI workspace tabs card */}
                <div className="card" style={{ backgroundColor: "var(--color-on-primary-color)", flex: 1, minHeight: 0, display: "flex", flexDirection: "column", padding: "var(--spacing-4)", overflow: "hidden" }}>
                  {liveListening && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: "var(--spacing-3)", padding: "8px 12px", borderRadius: "var(--radius-md)", backgroundColor: "#e8f5ef", flexShrink: 0 }}>
                      <span className="live-dot" />
                      <Sparkles size={14} style={{ color: "#00875A" }} />
                      <span style={{ fontSize: "12px", fontWeight: 500, color: "#00875A" }}>AI is listening to this call &middot; suggestions update automatically</span>
                    </div>
                  )}
                  <div className="tabs" style={{ marginBottom: "var(--spacing-3)", flexShrink: 0, gap: "40px" }}>
                    {(["suggested", "notes", "message"] as const).map((t) => (
                      <button key={t} className={`tab ${callTab === t ? "active" : ""}`} style={{ paddingLeft: 0, paddingRight: 0 }} onClick={() => setCallTab(t)}>
                        {t === "suggested" ? "Suggested Responses" : t === "notes" ? "Notes" : "Send Message"}
                      </button>
                    ))}
                  </div>

                  {/* Suggested Responses */}
                  {callTab === "suggested" && (
                    <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                      <div style={{ flexShrink: 0, marginBottom: "var(--spacing-3)" }}>
                        <div style={{ display: "flex", gap: "var(--spacing-3)", marginBottom: "var(--spacing-3)" }}>
                          <div className="search-input-wrap" style={{ flex: 1 }}>
                            <Search size={15} className="search-icon" />
                            <input type="text" placeholder="Search responses" />
                          </div>
                          <button className="btn btn-primary" style={{ padding: "var(--spacing-2) var(--spacing-4)" }}>Search</button>
                        </div>
                        <div className="chip-group" style={{ marginBottom: 0 }}>
                          {FILTER_CHIPS.map((chip) => (
                            <button key={chip} className={`chip ${activeChip === chip ? "active" : ""}`} onClick={() => setActiveChip(chip)}>{chip}</button>
                          ))}
                        </div>
                      </div>

                      {/* Suggested Response List - ONLY THIS ELEMENT SCROLLS */}
                      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", paddingRight: "6px" }}>
                        {aiLoading ? (
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "var(--spacing-2)" }}>
                            <RefreshCw size={18} className="spin" style={{ color: "var(--color-primary-color)" }} />
                            <p style={{ fontSize: "12px", color: "var(--color-on-surface-variant-color)" }}>Generating suggestions...</p>
                          </div>
                        ) : aiError ? (
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "var(--spacing-2)" }}>
                            <AlertTriangle size={18} style={{ color: "var(--color-error-color, #dc3545)" }} />
                            <p style={{ fontSize: "12px", color: "var(--color-on-surface-variant-color)" }}>{aiError}</p>
                            <button className="text-link" onClick={() => fetchAiSuggestions("Customer calling about order status")}>Retry</button>
                          </div>
                        ) : (
                          shownSuggestions.map((s, i) => (
                            <div key={i} style={{ padding: "var(--spacing-3) 0", borderBottom: i < shownSuggestions.length - 1 ? "1px solid var(--color-outline-variant-color)" : "none" }}>
                              <p style={{ fontSize: "11px", fontWeight: 500, color: "var(--color-on-surface-variant-color)", marginBottom: "4px", display: "flex", alignItems: "center", gap: 6 }}>
                                {s.label}
                                {s.live && <span style={{ display: "inline-flex", alignItems: "center", fontSize: "10px", fontWeight: 700, color: "#00875A", backgroundColor: "#e8f5ef", borderRadius: 999, padding: "1px 8px" }}>LIVE</span>}
                              </p>
                              <p style={{ fontSize: "13px", margin: 0 }}>{s.text}</p>
                            </div>
                          ))
                        )}
                      </div>

                      <div style={{ flexShrink: 0, paddingTop: "var(--spacing-3)", borderTop: "1px solid var(--color-outline-variant-color)" }}>
                        <button className="btn btn-primary" style={{ padding: "var(--spacing-2) var(--spacing-4)" }} onClick={() => fetchAiSuggestions("Customer calling about order status and delivery timeline")}>
                          {aiLoading ? <RefreshCw size={15} className="spin" /> : <><RefreshCw size={15} /> Refresh</>}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {callTab === "notes" && (
                    <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                      <textarea
                        value={callNotes}
                        onChange={(e) => setCallNotes(e.target.value)}
                        placeholder="Start typing your call notes here..."
                        style={{ flex: 1, width: "100%", minHeight: 0, padding: "var(--spacing-3)", border: "1.5px solid var(--color-outline-variant-color)", borderRadius: "var(--radius-md)", backgroundColor: "var(--color-surface-container-low-color)", fontSize: "13px", marginBottom: "var(--spacing-3)", resize: "none" }}
                      />
                      <div style={{ flexShrink: 0, display: "flex", gap: "var(--spacing-3)" }}>
                        <button className="btn btn-primary">Save</button>
                        <button className="btn btn-ghost" onClick={() => setCallNotes("")}>Clear</button>
                      </div>
                    </div>
                  )}

                  {/* Send message */}
                  {callTab === "message" && (
                    <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                      {messageSent ? (
                        <div style={{ padding: "var(--spacing-6)", textAlign: "center" }}>
                          <CheckCircle size={36} style={{ color: "#00875A", marginBottom: "var(--spacing-2)" }} />
                          <h4 style={{ fontWeight: 700, marginBottom: "var(--spacing-2)" }}>Message Sent!</h4>
                          <button className="btn btn-secondary" onClick={() => setMessageSent(false)}>Send Another</button>
                        </div>
                      ) : (
                        <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
                          <div className="chip-group" style={{ marginBottom: "var(--spacing-3)", flexShrink: 0 }}>
                            <button className="chip active">SMS</button>
                            <button className="chip">In-App</button>
                          </div>
                          <div style={{ flex: 1, minHeight: 0, border: "1.5px solid var(--color-outline-variant-color)", borderRadius: "var(--radius-md)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                            <div style={{ flex: 1, overflowY: "auto", padding: "var(--spacing-3)", display: "flex", flexDirection: "column", gap: "var(--spacing-3)", backgroundColor: "var(--color-surface-container-low-color)" }}>
                              <div style={{ alignSelf: "flex-end" }} className="chat-bubble-outbound">Thank you for calling. Here is your Order ID: #KD2349.</div>
                              <div className="chat-bubble-inbound">I can't seem to track the package.</div>
                            </div>
                            <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: "var(--spacing-3)", padding: "var(--spacing-3)", backgroundColor: "var(--color-surface-color)", borderTop: "1px solid var(--color-outline-variant-color)" }}>
                              <input type="text" value={messageText} onChange={(e) => setMessageText(e.target.value)} placeholder="Type your message..." style={{ flex: 1, border: "none", backgroundColor: "transparent", fontSize: "13px" }} />
                              <button className="btn btn-primary" style={{ padding: "var(--spacing-2)", borderRadius: "50%", width: 34, height: 34 }} onClick={() => { setMessageSent(true); setMessageText(""); }}>
                                <Send size={15} />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Transfer overlay + modal */}
                {isTransferring && (
                  <>
                    <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.35)", zIndex: 90, borderRadius: "8px" }} />
                    <div ref={transferModalRef} style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 100, backgroundColor: "var(--color-on-primary-color)", border: "1px solid var(--color-outline-variant-color)", borderRadius: "var(--radius-lg)", padding: "var(--spacing-5)", boxShadow: "var(--elevation-3)", width: 320 }}>
                      {transferSent ? (
                        <div style={{ textAlign: "center", padding: "var(--spacing-3) 0" }}>
                          <CheckCircle size={28} style={{ color: "var(--color-primary-color)", marginBottom: "var(--spacing-3)" }} />
                          <p style={{ fontSize: "14px", fontWeight: 500, margin: 0 }}>Transfer request sent</p>
                          <p style={{ fontSize: "12px", color: "var(--color-on-surface-variant-color)", marginTop: "6px" }}>The supervisor has been notified.</p>
                          <button className="btn btn-primary" style={{ marginTop: "var(--spacing-4)", width: "100%", padding: "var(--spacing-2)" }} onClick={handleTransferDone}>Done</button>
                        </div>
                      ) : (
                        <>
                          <p style={{ fontSize: "14px", fontWeight: 500, marginBottom: "var(--spacing-3)" }}>Transfer to Supervisor</p>
                          <div style={{ position: "relative", marginBottom: "var(--spacing-3)" }}>
                            <select value={transferSupervisor} onChange={(e) => setTransferSupervisor(e.target.value)} className="transfer-field" style={{ width: "100%", height: 38, padding: "0 var(--spacing-3) 0 var(--spacing-2)", border: "1px solid var(--color-outline-variant-color)", borderRadius: "var(--radius-md)", fontSize: "13px", backgroundColor: "var(--color-surface-container-low-color)", cursor: "pointer", outline: "none", boxShadow: "none", appearance: "none" }}>
                              <option value="">Select supervisor</option>
                              {SUPERVISORS.map((s) => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                              ))}
                            </select>
                            <ChevronDown size={16} style={{ position: "absolute", right: "var(--spacing-2)", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--color-on-surface-variant-color)" }} />
                          </div>
                          <textarea value={transferMessage} onChange={(e) => setTransferMessage(e.target.value)} className="transfer-field" placeholder="Why are you transferring this call?" style={{ width: "100%", height: 80, padding: "var(--spacing-3)", border: "1px solid var(--color-outline-variant-color)", borderRadius: "var(--radius-md)", fontSize: "13px", backgroundColor: "var(--color-surface-container-low-color)", resize: "none", marginBottom: "var(--spacing-3)", fontFamily: "inherit", outline: "none", boxShadow: "none" }} />
                          {transferError && (
                            <p style={{ fontSize: "12px", color: "var(--color-error-color)", margin: "0 0 var(--spacing-3)" }}>{transferError}</p>
                          )}
                          <div style={{ display: "flex", gap: "var(--spacing-2)" }}>
                            <button className="btn" style={{ padding: "var(--spacing-2)", border: "1px solid var(--color-outline-variant-color)", borderRadius: "var(--radius-md)" }} onClick={() => setIsTransferring(false)}>Cancel</button>
                            <button className="btn btn-primary" style={{ flex: 1, padding: "var(--spacing-2)" }} disabled={!transferSupervisor || !transferMessage || transferLoading} onClick={handleTransferSubmit}>{transferLoading ? "Transferring..." : "Send to Supervisor"}</button>
                          </div>
                        </>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Right — current earnings + live call transcript */}
              <div style={{ width: 240, flexShrink: 0, alignSelf: "start", display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
                <div className="card" style={{ backgroundColor: "var(--color-on-primary-color)", padding: "var(--spacing-5)" }}>
                  <h4 style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.5px", color: "var(--color-on-surface-variant-color)", marginBottom: "var(--spacing-3)" }}>Current Earning</h4>
                  <p style={{ fontSize: "26px", fontWeight: 500, marginBottom: "var(--spacing-3)" }}>{fmtMoney(availableBalance)}</p>
                  <div className="progress-bar-track" style={{ marginBottom: "6px" }}>
                    <div className="progress-bar-fill" style={{ width: `${Math.min(100, (availableBalance / PAYOUT_TARGET) * 100)}%` }} />
                  </div>
                  <p style={{ fontSize: "11px", color: "var(--color-on-surface-variant-color)", marginBottom: "var(--spacing-3)" }}>{fmtMoney(PAYOUT_TARGET)} payout target</p>
                  <button onClick={() => setNavItem("earning")} style={{ display: "flex", alignItems: "center", gap: "4px", background: "none", border: "none", color: "var(--color-primary-color)", fontSize: "12px", fontWeight: 500, cursor: "pointer", padding: 0 }}>
                    <RefreshCw size={12} /> View Earning History
                  </button>
                </div>

                {/* Live AI assistant - listens to the call and proposes what the agent can reply */}
                {liveAssistantReplies.length > 0 && (
                  <div className="card" style={{ backgroundColor: "var(--color-on-primary-color)", padding: "var(--spacing-4)", maxHeight: 320, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                    <p style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "10px", fontWeight: 700, letterSpacing: "0.5px", color: "var(--color-on-surface-variant-color)", margin: "0 0 var(--spacing-2)" }}>
                      <span className="live-dot" />
                      AI Suggested Reply
                    </p>
                    <div style={{ overflowY: "auto", minHeight: 0, display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
                      {liveAssistantReplies.map((item) => (
                        <div key={item.id}>
                          <p style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "10px", fontWeight: 600, color: "var(--color-primary-color)", margin: "0 0 2px" }}>
                            {item.label}
                            {item.current && <span style={{ fontSize: "9px", fontWeight: 700, color: "#00875A", backgroundColor: "#e8f5ef", borderRadius: 999, padding: "1px 8px" }}>LIVE</span>}
                          </p>
                          <p style={{ fontSize: "12px", margin: 0, lineHeight: 1.4 }}>{item.reply}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══════════════════ VIEW: AFTER CALL NOTE ═══════════════════ */}
          {navItem === "calls" && view === "after-call-note" && !showScheduleCallback && (
            <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "var(--spacing-4)" }}>
              <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.45)" }} />
              <div className="card" style={{ position: "relative", zIndex: 1, width: 640, maxWidth: "100%", maxHeight: "100%", overflowY: "auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--spacing-6)" }}>
                  <h2 style={{ fontSize: "22px", fontWeight: 700, margin: 0 }}>After Call Note</h2>
                  <p style={{ fontSize: "13px", color: "var(--color-on-surface-variant-color)", margin: 0 }}>Call with John Doe ended</p>
                </div>

                {/* Timer */}
                <div style={{ textAlign: "center", marginBottom: "var(--spacing-6)" }}>
                  <p style={{ fontSize: "44px", fontWeight: 500, color: "var(--color-primary-color)", marginBottom: "4px" }}>{fmtAcTime(acSecondsLeft)}</p>
                  <p style={{ fontSize: "13px", color: "var(--color-on-surface-variant-color)" }}>seconds remaining to complete notes</p>
                  <div className="progress-bar-track" style={{ marginTop: "var(--spacing-3)", height: 10 }}>
                    <div className="progress-bar-fill" style={{ width: `${(acSecondsLeft / 180) * 100}%` }} />
                  </div>
                </div>

                {/* Disposition */}
                <div className="form-field" style={{ marginBottom: "var(--spacing-4)" }}>
                  <label className="form-label">Disposition</label>
                  <DispositionDropdown value={disposition} onChange={setDisposition} />
                </div>

                {/* Call summary notes */}
                <textarea
                  rows={7}
                  value={acNotes}
                  onChange={(e) => setAcNotes(e.target.value)}
                  placeholder="Summary of call. What was discussed? Any action items?"
                  style={{ width: "100%", padding: "var(--spacing-4)", border: "1.5px solid var(--color-outline-variant-color)", borderRadius: "var(--radius-md)", backgroundColor: "var(--color-surface-container-low-color)", fontSize: "13px", marginBottom: "var(--spacing-4)", resize: "vertical" }}
                />

                {/* Callback scheduled card */}
                {callbackScheduled && (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "var(--spacing-3)", padding: "var(--spacing-4)", border: "1px solid var(--color-outline-variant-color)", borderRadius: "var(--radius-md)", backgroundColor: "var(--color-surface-container-low-color)", marginBottom: "var(--spacing-6)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-3)", minWidth: 0 }}>
                      <Calendar size={18} color="var(--color-primary-color)" style={{ flexShrink: 0 }} />
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontWeight: 500, fontSize: "13px", margin: 0 }}>Callback Scheduled</p>
                        <p style={{ fontSize: "12px", color: "var(--color-on-surface-variant-color)", margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {callbackDate ? (() => { const [y, m, d] = callbackDate.split("-").map(Number); return `${d.toString().padStart(2, "0")}/${m.toString().padStart(2, "0")}/${y}`; })() : ""} · {callbackTime} · {ASSIGN_OPTIONS.find((o) => o.value === callbackAssignTo)?.label ?? callbackAssignTo}
                        </p>
                      </div>
                    </div>
                    <button
                      title="Edit callback"
                      style={{ background: "none", border: "none", cursor: "pointer", padding: "6px", color: "var(--color-on-surface-variant-color)", display: "flex", alignItems: "center", flexShrink: 0 }}
                      onClick={() => setShowScheduleCallback(true)}
                    >
                      <Pencil size={16} />
                    </button>
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <button
                    className="btn btn-ghost"
                    style={{ fontSize: "13px" }}
                    onClick={() => setAcSecondsLeft(prev => prev + 30)}
                  >
                    +30s
                  </button>
                  <div style={{ display: "flex", gap: "var(--spacing-3)" }}>
                    <button className="btn btn-secondary" onClick={() => setShowScheduleCallback(true)}>
                      <Calendar size={15} /> Schedule Callback
                    </button>
                    <button className="btn btn-primary" onClick={handleAcSaveAndClose}>
                      Save and Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════ VIEW: SCHEDULE CALLBACK ═══════════════════ */}
          {navItem === "calls" && view === "after-call-note" && showScheduleCallback && (
            <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: "var(--spacing-4)" }}>
              <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.45)" }} />
              <div className="card" style={{ position: "relative", zIndex: 1, width: 560, maxWidth: "100%", maxHeight: "100%", overflowY: "auto" }}>
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--spacing-6)" }}>
                  <div>
                    <h2 style={{ fontSize: "22px", fontWeight: 700, margin: 0 }}>Schedule Callback</h2>
                    <p style={{ fontSize: "13px", color: "var(--color-on-surface-variant-color)", margin: "4px 0 0" }}>Set up a follow-up call for this customer</p>
                  </div>
                  <button className="btn btn-ghost" style={{ padding: "6px" }} onClick={() => setShowScheduleCallback(false)}>
                    <X size={18} />
                  </button>
                </div>

                <>
                  {/* Customer Phone Number */}
                  <div className="form-field" style={{ marginBottom: "var(--spacing-4)" }}>
                    <label className="form-label">Customer Phone Number</label>
                    <input
                      type="tel"
                      className="form-input"
                      value={callbackPhone}
                      onChange={(e) => setCallbackPhone(e.target.value)}
                      placeholder="+234 xxx xxx xxxx"
                    />
                  </div>

                    {/* Date + Time side by side */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-3)", marginBottom: "var(--spacing-4)" }}>
                      <div className="form-field">
                        <label className="form-label">Call Back Date</label>
                        <DatePicker
                          value={callbackDate}
                          onChange={setCallbackDate}
                          min={new Date().toISOString().split("T")[0]}
                        />
                      </div>
                      <div className="form-field">
                        <label className="form-label" style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
                          Call Back Time
                          <span style={{ fontSize: "11px", color: "var(--color-on-surface-variant-color)", fontWeight: 400 }}>24-hour format (e.g. 14:30)</span>
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          value={callbackTime}
                          onChange={(e) => setCallbackTime(e.target.value)}
                          placeholder="HH:MM"
                          maxLength={5}
                        />
                      </div>
                    </div>

                    {/* Reason for Callback */}
                    <div className="form-field" style={{ marginBottom: "var(--spacing-4)" }}>
                      <label className="form-label">Reason for Callback</label>
                      <textarea
                        rows={3}
                        className="form-input"
                        value={callbackReason}
                        onChange={(e) => setCallbackReason(e.target.value)}
                        placeholder="Why is this callback needed?"
                        style={{ resize: "vertical" }}
                      />
                    </div>

                    {/* Assign To */}
                    <div className="form-field" style={{ marginBottom: "var(--spacing-6)" }}>
                      <label className="form-label">Assign To</label>
                      <AssignToDropdown value={callbackAssignTo} onChange={setCallbackAssignTo} />
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", justifyContent: "flex-start", gap: "var(--spacing-3)" }}>
                      <button className="btn btn-ghost" onClick={() => setShowScheduleCallback(false)}>
                        Back to Notes
                      </button>
                      <button
                        className="btn btn-primary"
                        disabled={!callbackDate || !callbackTime || !callbackAssignTo}
                        onClick={handleScheduleCallbackSave}
                      >
                        <Calendar size={15} /> Schedule Callback
                      </button>
                    </div>
                  </>
                </div>
              </div>
          )}

          {/* ═══════════════════ CONFIRMATION: CALLBACK SCHEDULED ═══════════════════ */}
          {navItem === "calls" && view === "after-call-note" && callbackConfirmVisible && (
            <div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: "var(--spacing-4)" }}>
              <div style={{ position: "absolute", inset: 0, backgroundColor: "rgba(0,0,0,0.45)" }} />
              <div className="card" style={{ position: "relative", zIndex: 1, width: 360, maxWidth: "100%", textAlign: "center", padding: "var(--spacing-8) var(--spacing-6)" }}>
                <CheckCircle size={48} style={{ color: "var(--color-primary-color)", marginBottom: "var(--spacing-4)", display: "inline-block" }} />
                <h3 style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>Call Back Scheduled Successfully</h3>
              </div>
            </div>
          )}

          {/* ═══════════════════ VIEW: EARNING HISTORY ═══════════════════ */}
          {navItem === "earning" && (
            <div style={{ flex: "0 0 auto", minHeight: "100vh", backgroundColor: "var(--color-background-color)", padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Summary KPIs */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "16px" }}>
                <div className="card" style={{ margin: 0, backgroundColor: "var(--color-on-primary-color)" }}>
                  <p className="kpi-label">Total Earnings</p>
                  <p className="kpi-value">{fmtMoney(lifetimeEarnings)}</p>
                  <p className="kpi-meta">{earnings.length} earning event{earnings.length === 1 ? "" : "s"} all time</p>
                </div>
                <div className="card" style={{ margin: 0, backgroundColor: "var(--color-on-primary-color)" }}>
                  <p className="kpi-label">Pending Earnings</p>
                  <p className="kpi-value">{fmtMoney(pendingEarningsAmount)}</p>
                  <p className="kpi-meta">{pendingEarnings.length} earning{pendingEarnings.length === 1 ? "" : "s"} not yet paid</p>
                </div>
                <div className="card" style={{ margin: 0, backgroundColor: "var(--color-on-primary-color)" }}>
                  <p className="kpi-label">Paid Earnings</p>
                  <p className="kpi-value">{fmtMoney(paidEarnings)}</p>
                  <p className="kpi-meta">Credited to your balance</p>
                </div>
                <button
                  type="button"
                  className="card"
                  onClick={() => setNavItem("payout")}
                  style={{ margin: 0, backgroundColor: "var(--color-on-primary-color)", textAlign: "left", width: "100%", cursor: "pointer", fontFamily: "inherit", display: "block" }}
                >
                  <p className="kpi-label">Current Available Balance</p>
                  <p className="kpi-value" style={{ color: "var(--color-primary-color)" }}>{fmtMoney(availableBalance)}</p>
                  <div className="progress-bar-track" style={{ marginBottom: "6px" }}>
                    <div className="progress-bar-fill" style={{ width: `${Math.min(100, (availableBalance / PAYOUT_TARGET) * 100)}%` }} />
                  </div>
                  <p className="kpi-meta">{fmtMoney(Math.max(0, PAYOUT_TARGET - availableBalance))} left to {fmtMoney(PAYOUT_TARGET)} target</p>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", fontWeight: 500, color: "var(--color-primary-color)", marginTop: "10px" }}>
                    Manage payouts <ArrowRight size={13} />
                  </span>
                </button>
              </div>

              {/* Breakdown by work type */}
              <div className="card" style={{ margin: 0, backgroundColor: "var(--color-on-primary-color)" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 16px" }}>Earnings by Work Type</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                  {workTypeSummary.map((w) => (
                    <div key={w.workType} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px", borderRadius: "12px", border: "1px solid var(--color-outline-variant-color)", backgroundColor: "var(--color-surface-container-low-color)" }}>
                      <div style={{ width: 44, height: 44, borderRadius: "10px", backgroundColor: WORK_TYPE_META[w.workType].bg, color: WORK_TYPE_META[w.workType].color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {workTypeIcon(w.workType, 20)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: "13px", fontWeight: 500, margin: 0 }}>{WORK_TYPE_META[w.workType].label}</p>
                        <p style={{ fontSize: "12px", color: "var(--color-on-surface-variant-color)", margin: 0 }}>{w.count} event{w.count === 1 ? "" : "s"}</p>
                      </div>
                      <p style={{ fontSize: "16px", fontWeight: 500, margin: 0 }}>{fmtMoney(w.total)}</p>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: "12px", color: "var(--color-on-surface-variant-color)", margin: "14px 0 0" }}>
                  Earnings are released only after the associated work passes quality assurance review.
                </p>
              </div>
            </div>
          )}

          {/* ═══════════════════ VIEW: RATES ═══════════════════ */}
          {navItem === "rates" && (
            <div style={{ flex: "0 0 auto", minHeight: "100vh", backgroundColor: "var(--color-background-color)", padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Page header */}
              <div>
                <h2 style={{ fontSize: "22px", fontWeight: 700, margin: 0 }}>Rates</h2>
                <p style={{ fontSize: "13px", color: "var(--color-on-surface-variant-color)", margin: "4px 0 0" }}>
                  What each Client Company pays Connectdesk per unit of work you handle.
                </p>
              </div>

              {/* Clarifier: inbound revenue, not specialist payout */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "14px 16px", borderRadius: "12px", border: "1px solid var(--color-outline-variant-color)", backgroundColor: "var(--color-surface-container-low-color)" }}>
                <Landmark size={16} style={{ color: "var(--color-primary-color)", flexShrink: 0, marginTop: "1px" }} />
                <p style={{ fontSize: "13px", color: "var(--color-on-surface-color)", margin: 0, lineHeight: 1.5 }}>
                  These are the Client Company&rsquo;s charges to Connectdesk. Your own specialist payout per unit is shown on the Earning History page.
                </p>
              </div>

              {/* Rate matrix */}
              <div className="card" style={{ margin: 0, padding: 0, overflow: "hidden", backgroundColor: "var(--color-on-primary-color)" }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--color-outline-variant-color)" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0 }}>Rate by Client Company</h3>
                </div>

                {ratePrincipals.length === 0 ? (
                  <div style={{ padding: "48px 20px", textAlign: "center" }}>
                    <p style={{ fontSize: "15px", fontWeight: 500, margin: 0 }}>No rates available</p>
                    <p style={{ fontSize: "13px", color: "var(--color-on-surface-variant-color)", margin: "6px 0 0" }}>
                      Rates have not been published for any Client Company yet.
                    </p>
                  </div>
                ) : (
                  <div className="table-container" style={{ border: "none", borderRadius: 0 }}>
                    <table className="table-compact">
                      <thead>
                        <tr>
                          <th style={{ width: "34%" }}>Unit of Work</th>
                          {ratePrincipals.map((p) => (
                            <th key={p.id} style={{ textAlign: "right" }}>{p.name}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rateGroupOrder.map((group) => (
                          <React.Fragment key={group}>
                            <tr>
                              <td
                                colSpan={ratePrincipals.length + 1}
                                style={{
                                  padding: "10px 16px",
                                  fontSize: "11px",
                                  fontWeight: 700,
                                  letterSpacing: "0.5px",
                                  textTransform: "uppercase",
                                  color: "var(--color-on-surface-variant-color)",
                                  backgroundColor: "var(--color-surface-container-low-color)",
                                }}
                              >
                                {group}
                              </td>
                            </tr>
                            {RATE_UNITS.filter((u) => RATE_UNIT_META[u].group === group).map((unit) => (
                              <tr key={unit}>
                                <td>
                                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <div
                                      style={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: "8px",
                                        backgroundColor: RATE_UNIT_META[unit].bg,
                                        color: RATE_UNIT_META[unit].color,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                      }}
                                    >
                                      {rateUnitIcon(unit)}
                                    </div>
                                    <div style={{ minWidth: 0 }}>
                                      <p style={{ fontSize: "13px", fontWeight: 500, margin: 0 }}>{RATE_UNIT_META[unit].label}</p>
                                      <p style={{ fontSize: "11px", color: "var(--color-on-surface-variant-color)", margin: 0 }}>{RATE_UNIT_META[unit].desc}</p>
                                    </div>
                                  </div>
                                </td>
                                {ratePrincipals.map((p) => {
                                  const rate = rateFor(p.id, unit);
                                  const isTop = rate !== null && rate === highestRate(unit);
                                  return (
                                    <td key={p.id} style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                                      {rate === null ? (
                                        <span style={{ color: "var(--color-on-surface-variant-color)" }}>-</span>
                                      ) : (
                                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                                          <span style={{ fontSize: "14px", fontWeight: 500 }}>{fmtMoney(rate)}</span>
                                          {isTop && (
                                            <span className="badge" style={{ backgroundColor: "#fdf1e0", color: "#F68B1E" }}>
                                              Top
                                            </span>
                                          )}
                                        </span>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <p style={{ fontSize: "12px", color: "var(--color-on-surface-variant-color)", margin: 0 }}>
                Rates are set per Client Company and apply to work that passes quality assurance review. Changes are published by Connectdesk.
              </p>
            </div>
          )}

          {/* ═══════════════════ VIEW: PAYOUT ═══════════════════ */}
          {navItem === "payout" && (
            <div style={{ flex: "0 0 auto", minHeight: "100vh", backgroundColor: "var(--color-background-color)", padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Page header */}
              <div>
                <h2 style={{ fontSize: "22px", fontWeight: 700, margin: 0 }}>Payouts</h2>
                <p style={{ fontSize: "13px", color: "var(--color-on-surface-variant-color)", margin: "4px 0 0" }}>
                  Your earnings are paid out automatically on the {PAYOUT_DAY_OF_MONTHOrdinal} of every month. No action is needed from you.
                </p>
              </div>

              {/* Automatic payout schedule */}
              <div className="card" style={{ margin: 0, backgroundColor: "var(--color-on-primary-color)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                  <div style={{ width: 40, height: 40, borderRadius: "10px", backgroundColor: "#e8f1fe", color: "var(--color-primary-color)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Landmark size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0 }}>Automatic Monthly Payout</h3>
                    <p style={{ fontSize: "12px", color: "var(--color-on-surface-variant-color)", margin: 0 }}>Deducted from your balance on the {PAYOUT_DAY_OF_MONTHOrdinal} of each month</p>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
                  {[
                    { label: "Next Payout Date", value: fmtDate(nextPayoutDate.getTime()) },
                    { label: "Amount Scheduled", value: fmtMoney(availableBalance) },
                    { label: "Paid To", value: payoutAccount ? payoutAccount.bankName : "Not assigned yet" },
                  ].map((f) => (
                    <div key={f.label} style={{ padding: "14px 16px", borderRadius: "12px", border: "1px solid var(--color-outline-variant-color)", backgroundColor: "var(--color-surface-container-low-color)" }}>
                      <p style={{ fontSize: "11px", color: "var(--color-on-surface-variant-color)", letterSpacing: "0.5px", fontWeight: 500, margin: "0 0 4px" }}>{f.label}</p>
                      <p style={{ fontSize: "15px", fontWeight: 500, margin: 0 }}>{f.value}</p>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: "12px", color: "var(--color-on-surface-variant-color)", margin: "14px 0 0", display: "flex", alignItems: "center", gap: "6px" }}>
                  <ShieldCheck size={14} /> Only earnings that pass quality assurance review are included in a payout.
                </p>
              </div>

              {/* Summary cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
                <div className="card" style={{ margin: 0, backgroundColor: "var(--color-on-primary-color)", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <p className="kpi-label">Available Balance</p>
                  <p className="kpi-value" style={{ color: "var(--color-primary-color)" }}>{fmtMoney(availableBalance)}</p>
                  <p className="kpi-meta">Scheduled for {fmtDate(nextPayoutDate.getTime())}</p>
                </div>
                <div className="card" style={{ margin: 0, backgroundColor: "var(--color-on-primary-color)", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <p className="kpi-label">Pending Balance</p>
                  <p className="kpi-value">{fmtMoney(pendingEarningsAmount)}</p>
                  <p className="kpi-meta">Awaiting QA approval</p>
                </div>
                <div className="card" style={{ margin: 0, backgroundColor: "var(--color-on-primary-color)", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <p className="kpi-label">Total Paid Out</p>
                  <p className="kpi-value">{fmtMoney(totalPaidOut)}</p>
                  <p className="kpi-meta">Lifetime payouts</p>
                </div>
                <div className="card" style={{ margin: 0, backgroundColor: "var(--color-on-primary-color)", display: "flex", flexDirection: "column", gap: "8px" }}>
                  <p className="kpi-label">Last Payout</p>
                  <p className="kpi-value">{lastPayout ? fmtMoney(lastPayout.netAmount) : fmtMoney(0)}</p>
                  <p className="kpi-meta">{lastPayout?.completedAt ? `Paid on ${fmtDate(lastPayout.completedAt)}` : lastPayout ? "Processing" : "No payouts yet"}</p>
                </div>
              </div>

              {/* Payout account (read-only) */}
              <div className="card" style={{ margin: 0, backgroundColor: "var(--color-on-primary-color)" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 4px" }}>Payout Account</h3>
                <p style={{ fontSize: "12px", color: "var(--color-on-surface-variant-color)", margin: "0 0 16px" }}>The account your monthly payout is sent to</p>

                {payoutAccount ? (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", border: "1px solid var(--color-outline-variant-color)", borderRadius: "var(--radius-md)", padding: "14px 16px", backgroundColor: "var(--color-surface-container-low-color)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                      <div style={{ width: 42, height: 42, borderRadius: "8px", backgroundColor: "var(--color-surface-container-high-color)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--color-on-surface-variant-color)", flexShrink: 0 }}>
                        <CreditCard size={20} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontSize: "14px", fontWeight: 500, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{payoutAccount.bankName}</p>
                        <p style={{ fontSize: "13px", color: "var(--color-on-surface-variant-color)", margin: 0 }}>{payoutAccount.accountName}</p>
                        <p style={{ fontSize: "13px", color: "var(--color-on-surface-variant-color)", margin: 0 }}>{maskAccount(payoutAccount.accountNumber)}</p>
                      </div>
                    </div>
                    <span className="badge" style={{ backgroundColor: "#e8f5ef", color: "#00875A", flexShrink: 0 }}>Verified</span>
                  </div>
                ) : (
                  <div style={{ border: "1px dashed var(--color-outline-variant-color)", borderRadius: "var(--radius-md)", padding: "16px", fontSize: "13px", color: "var(--color-on-surface-variant-color)" }}>
                    No payout account has been assigned yet. Your supervisor will set this up before your first payout.
                  </div>
                )}

                <p style={{ fontSize: "12px", color: "var(--color-on-surface-variant-color)", marginTop: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <ShieldCheck size={14} /> Payout accounts are managed by Connectdesk. Contact your supervisor to make changes.
                </p>
              </div>
            </div>
          )}

          {/* ═══════════════════ VIEW: LEADERBOARD ═══════════════════ */}
          {navItem === "leaderboard" && (
            <div style={{ flex: "0 0 auto", minHeight: "100vh", backgroundColor: "var(--color-background-color)", padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Header + period selector */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <h2 style={{ fontSize: "22px", fontWeight: 700, margin: 0 }}>Leaderboard</h2>
                  <p style={{ fontSize: "13px", color: "var(--color-on-surface-variant-color)", margin: "4px 0 0" }}>
                    See how you rank against your team on call quality and resolution.
                  </p>
                </div>
                <div style={{ display: "flex", gap: "4px", padding: "4px", backgroundColor: "var(--color-surface-container-low-color)", borderRadius: "999px", border: "1px solid var(--color-outline-variant-color)" }}>
                  {LEADERBOARD_PERIODS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setLeaderboardPeriod(p.id)}
                      style={{
                        height: 34,
                        padding: "0 16px",
                        borderRadius: "999px",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "13px",
                        fontWeight: 500,
                        backgroundColor: leaderboardPeriod === p.id ? "var(--color-primary-color)" : "transparent",
                        color: leaderboardPeriod === p.id ? "var(--color-on-primary-color)" : "var(--color-on-surface-variant-color)",
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <>
                  {/* Top 3 podium */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1.15fr 1fr", gap: "16px", alignItems: "end" }}>
                    {podiumOrder.map((r) => {
                      const rank = rankedAgents.indexOf(r) + 1;
                      const medal = rank === 1 ? "#F6B01E" : rank === 2 ? "#9BA3AF" : "#C07A4B";
                      const medalLabel = rank === 1 ? "Gold" : rank === 2 ? "Silver" : "Bronze";
                      const isFirst = rank === 1;
                      return (
                        <div
                          key={r.agentId}
                          className="card"
                          style={{
                            margin: 0,
                            backgroundColor: "var(--color-on-primary-color)",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            textAlign: "center",
                            padding: isFirst ? "28px 20px" : "24px 20px",
                            border: isFirst ? "2px solid #F6B01E" : "1px solid var(--color-outline-variant-color)",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
                            <Trophy size={16} style={{ color: medal }} />
                            <span style={{ fontSize: "12px", fontWeight: 500, color: medal, letterSpacing: "0.5px" }}>{medalLabel}</span>
                          </div>
                          <div style={{ width: isFirst ? 64 : 52, height: isFirst ? 64 : 52, borderRadius: "50%", backgroundColor: r.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 500, fontSize: isFirst ? 22 : 18, marginBottom: "10px" }}>
                            {r.initials}
                          </div>
                          <p style={{ fontSize: "14px", fontWeight: 500, margin: 0 }}>{r.name}{r.isYou ? " (You)" : ""}</p>
                          <div style={{ margin: "8px 0 0" }}>
                            <StarRating value={r.qualityRating} size={18} />
                          </div>
                          <p style={{ fontSize: "12px", color: "var(--color-on-surface-variant-color)", margin: "2px 0 0" }}>Quality Rating</p>
                          <p style={{ fontSize: "12px", color: "var(--color-on-surface-variant-color)", margin: "8px 0 0" }}>{r.callsResolved} calls resolved</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Your standing + how score works */}
                  <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "16px" }}>
                    <div className="card" style={{ margin: 0, backgroundColor: "var(--color-on-primary-color)" }}>
                      <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 16px" }}>Your Standing</h3>
                      {youRow ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
                          <div style={{ textAlign: "center", minWidth: 110 }}>
                            <p style={{ fontSize: "44px", fontWeight: 500, lineHeight: 1, color: "var(--color-primary-color)", margin: 0 }}>#{yourRank}</p>
                            <p style={{ fontSize: "12px", color: "var(--color-on-surface-variant-color)", margin: "4px 0 0" }}>of {rankedAgents.length} specialists</p>
                          </div>
                          <div style={{ flex: 1, minWidth: 220 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px" }}>
                              <span style={{ color: "var(--color-on-surface-variant-color)" }}>Quality Score</span>
                              <span style={{ fontWeight: 500 }}>{youRow.qualityScore}</span>
                            </div>
                            <div className="progress-bar-track" style={{ marginBottom: "16px" }}>
                              <div className="progress-bar-fill" style={{ width: `${youRow.qualityScore}%` }} />
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                              <div style={{ border: "1px solid var(--color-outline-variant-color)", borderRadius: "10px", padding: "12px" }}>
                                <p style={{ fontSize: "11px", color: "var(--color-on-surface-variant-color)", letterSpacing: "0.5px", fontWeight: 500, margin: "0 0 4px" }}>Top Strength</p>
                                <p style={{ fontSize: "14px", fontWeight: 500, margin: 0 }}>{youStrengthLabel || "—"}</p>
                              </div>
                              <div style={{ border: "1px solid var(--color-outline-variant-color)", borderRadius: "10px", padding: "12px" }}>
                                <p style={{ fontSize: "11px", color: "var(--color-on-surface-variant-color)", letterSpacing: "0.5px", fontWeight: 500, margin: "0 0 4px" }}>Focus Area</p>
                                <p style={{ fontSize: "14px", fontWeight: 500, margin: "0 0 4px" }}>{youFocusLabel || "—"}</p>
                                <p style={{ fontSize: "12px", color: "var(--color-on-surface-variant-color)", margin: 0 }}>{youFocusHint}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p style={{ color: "var(--color-on-surface-variant-color)" }}>No standing available.</p>
                      )}
                    </div>

                    <div className="card" style={{ margin: 0, backgroundColor: "var(--color-on-primary-color)" }}>
                      <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 12px" }}>How the Quality Score Works</h3>
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {[
                          { label: "QA Score", pct: 50, desc: "Average QA review score (0–100)" },
                          { label: "CSAT", pct: 20, desc: "Customer satisfaction rating (0–100)" },
                          { label: "SLA Compliance", pct: 20, desc: "Interactions handled within SLA (%)" },
                          { label: "Resolution Volume", pct: 10, desc: "Calls resolved vs. top performer" },
                        ].map((w) => (
                          <div key={w.label}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px" }}>
                              <span style={{ fontWeight: 500 }}>{w.label}</span>
                              <span style={{ color: "var(--color-on-surface-variant-color)" }}>{w.pct}%</span>
                            </div>
                            <div style={{ height: 6, backgroundColor: "var(--color-surface-container-high-color)", borderRadius: "999px", overflow: "hidden" }}>
                              <div style={{ height: "100%", width: `${w.pct * 1.5}%`, backgroundColor: "var(--color-primary-color)" }} />
                            </div>
                            <p style={{ fontSize: "11px", color: "var(--color-on-surface-variant-color)", margin: "3px 0 0" }}>{w.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Full ranking table */}
                  <div className="card" style={{ margin: 0, padding: 0, overflow: "hidden", backgroundColor: "var(--color-on-primary-color)" }}>
                    <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--color-outline-variant-color)" }}>
                      <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0 }}>Full Ranking</h3>
                    </div>
                    <div className="table-container" style={{ border: "none", borderRadius: 0, overflowX: "hidden" }}>
                      <table className="table-compact">
                        <colgroup>
                          <col style={{ width: "8%" }} />
                          <col style={{ width: "34%" }} />
                          <col style={{ width: "16%" }} />
                          <col style={{ width: "16%" }} />
                          <col style={{ width: "26%" }} />
                        </colgroup>
                        <thead>
                          <tr>
                            <th>Rank</th>
                            <th>Name</th>
                            <th>Calls Resolved</th>
                            <th>Tickets Resolved</th>
                            <th>Quality Rating</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rankedAgents.map((r, i) => {
                            const rank = i + 1;
                            return (
                              <tr key={r.agentId} style={r.isYou ? { backgroundColor: "var(--color-surface-container-low-color)" } : undefined}>
                                <td>
                                  <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, borderRadius: "50%", fontWeight: 500, fontSize: "12px", backgroundColor: rank === 1 ? "#F6B01E" : rank === 2 ? "#9BA3AF" : rank === 3 ? "#C07A4B" : "transparent", color: rank <= 3 ? "#fff" : "var(--color-on-surface-color)" }}>
                                    {rank}
                                  </span>
                                </td>
                                <td>
                                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <div style={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: r.color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 500, fontSize: "12px", flexShrink: 0 }}>
                                      {r.initials}
                                    </div>
                                    <span style={{ fontWeight: r.isYou ? 700 : 500 }}>{r.name}{r.isYou ? " (You)" : ""}</span>
                                  </div>
                                </td>
                                <td style={{ fontWeight: 500 }}>{r.callsResolved}</td>
                                <td style={{ color: r.ticketsResolved === null ? "var(--color-on-surface-variant-color)" : undefined }}>
                                  {r.ticketsResolved === null ? "-" : r.ticketsResolved}
                                </td>
                                <td><StarRating value={r.qualityRating} /></td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
              </>
            </div>
          )}

          {/* ═══════════════════ VIEW: PROFILE ═══════════════════ */}
          {navItem === "profile" && (
            <div style={{ flex: "0 0 auto", minHeight: "100vh", backgroundColor: "var(--color-background-color)", padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Page header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <h2 style={{ fontSize: "22px", fontWeight: 700, margin: 0 }}>Profile</h2>
                  <p style={{ fontSize: "13px", color: "var(--color-on-surface-variant-color)", margin: "4px 0 0" }}>
                    Manage your personal details, preferences, and account security.
                  </p>
                </div>
              </div>

              {/* Identity card */}
              <div className="card" style={{ margin: 0, backgroundColor: "var(--color-on-primary-color)", padding: "24px", display: "flex", alignItems: "flex-start", gap: "20px", flexWrap: "wrap" }}>
                <div style={{ width: 54, height: 54, borderRadius: "50%", backgroundColor: "#00875A", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 500, fontSize: 26, flexShrink: 0 }}>
                  {AGENT_PROFILE.initials}
                </div>
                <div style={{ flex: 1, minWidth: 260 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                    <h3 style={{ fontSize: "20px", fontWeight: 700, margin: 0 }}>{CURRENT_AGENT_NAME}</h3>
                    <span className="badge" style={{ backgroundColor: "#e8f0fe", color: "#1B6EF3" }}>CRM Agent</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", maxWidth: 620, width: "100%", marginTop: 16 }}>
                    {[
                      { label: "Employee ID", value: AGENT_PROFILE.employeeId },
                      { label: "Supervisor", value: AGENT_PROFILE.supervisor },
                      { label: "Date Joined", value: AGENT_PROFILE.joined },
                      { label: "Timezone", value: AGENT_PROFILE.timezone },
                    ].map((f) => (
                      <div key={f.label}>
                        <p style={{ fontSize: "11px", color: "var(--color-on-surface-variant-color)", letterSpacing: "0.5px", fontWeight: 500, margin: "0 0 3px" }}>{f.label}</p>
                        <p style={{ fontSize: "13px", fontWeight: 500, margin: 0 }}>{f.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Personal details + assigned principals */}
              <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "16px" }}>
                <div className="card" style={{ margin: 0, backgroundColor: "var(--color-on-primary-color)" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 4px" }}>Personal Details</h3>
                  <p style={{ fontSize: "12px", color: "var(--color-on-surface-variant-color)", margin: "0 0 16px" }}>Your contact and language information.</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div>
                      <label className="form-label">Email Address</label>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <input
                          type="email"
                          value={profileContact.email}
                          readOnly
                          style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--color-outline-variant-color)", borderRadius: "8px", fontSize: "13px", outline: "none", color: "var(--color-on-surface-color)", background: "var(--color-surface-container-color)" }}
                        />
                      </div>
                      <p style={{ fontSize: "11px", color: "var(--color-on-surface-variant-color)", margin: "4px 0 0" }}>Managed by your supervisor.</p>
                    </div>
                    <div>
                      <label className="form-label">Phone Number</label>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <input
                          type="tel"
                          value={profileContact.phone}
                          readOnly
                          style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--color-outline-variant-color)", borderRadius: "8px", fontSize: "13px", outline: "none", color: "var(--color-on-surface-color)", background: "var(--color-surface-container-color)" }}
                        />
                      </div>
                      <p style={{ fontSize: "11px", color: "var(--color-on-surface-variant-color)", margin: "4px 0 0" }}>Managed by your supervisor.</p>
                    </div>
                    <div>
                      <label className="form-label">Languages Spoken (comma separated)</label>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <input
                          type="text"
                          value={profileContact.languages}
                          onChange={(e) => setProfileContact({ ...profileContact, languages: e.target.value })}
                          style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--color-outline-variant-color)", borderRadius: "8px", fontSize: "13px", outline: "none" }}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="form-label">Supervisor</label>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <input
                          type="text"
                          value={AGENT_PROFILE.supervisor}
                          readOnly
                          style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--color-outline-variant-color)", borderRadius: "8px", fontSize: "13px", outline: "none", color: "var(--color-on-surface-color)", background: "var(--color-surface-container-color)" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card" style={{ margin: 0, backgroundColor: "var(--color-on-primary-color)" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 4px" }}>Assigned Principals</h3>
                  <p style={{ fontSize: "12px", color: "var(--color-on-surface-variant-color)", margin: "0 0 16px" }}>The client companies you support.</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    {AGENT_PROFILE.assignedPrincipalIds.map((id) => {
                      const p = PRINCIPALS.find((x) => x.id === id);
                      return p ? (
                        <div key={p.id} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <PrincipalLogo principal={p} size={38} />
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontSize: "13px", fontWeight: 500, margin: 0 }}>{p.name}</p>
                            <p style={{ fontSize: "11px", color: "var(--color-on-surface-variant-color)", margin: "2px 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.description.slice(0, 48)}&hellip;</p>
                          </div>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>

              {/* Performance snapshot */}
              <div className="card" style={{ margin: 0, backgroundColor: "var(--color-on-primary-color)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                  <div>
                    <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0 }}>Performance Snapshot</h3>
                    <p style={{ fontSize: "12px", color: "var(--color-on-surface-variant-color)", margin: "2px 0 0" }}>This week at a glance</p>
                  </div>
                  <button type="button" className="btn btn-ghost" onClick={() => handleNav("leaderboard")}>
                    <Trophy size={15} /> View Leaderboard
                  </button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
                  <div className="card" style={{ margin: 0, backgroundColor: "var(--color-surface-container-low-color)" }}>
                    <p className="kpi-label">Quality Score</p>
                    <p className="kpi-value">{yourWeekQuality ?? "—"}</p>
                    <p className="kpi-meta">out of 100</p>
                  </div>
                  <div className="card" style={{ margin: 0, backgroundColor: "var(--color-surface-container-low-color)" }}>
                    <p className="kpi-label">CSAT</p>
                    <p className="kpi-value">{yourWeekMetric?.csat ?? "—"}</p>
                    <p className="kpi-meta">customer satisfaction</p>
                  </div>
                  <div className="card" style={{ margin: 0, backgroundColor: "var(--color-surface-container-low-color)" }}>
                    <p className="kpi-label">SLA Compliance</p>
                    <p className="kpi-value">{yourWeekMetric ? `${yourWeekMetric.sla}%` : "—"}</p>
                    <p className="kpi-meta">within target</p>
                  </div>
                  <div className="card" style={{ margin: 0, backgroundColor: "var(--color-surface-container-low-color)" }}>
                    <p className="kpi-label">Calls Resolved</p>
                    <p className="kpi-value">{yourWeekMetric?.callsResolved ?? "—"}</p>
                    <p className="kpi-meta">this week</p>
                  </div>
                </div>
              </div>

              {/* Earnings & payout summary */}
              <div className="card" style={{ margin: 0, backgroundColor: "var(--color-on-primary-color)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                  <div>
                    <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0 }}>Earnings &amp; Payout</h3>
                    <p style={{ fontSize: "12px", color: "var(--color-on-surface-variant-color)", margin: "2px 0 0" }}>A summary of your income and payout account.</p>
                  </div>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    <button type="button" className="btn btn-ghost" onClick={() => handleNav("earning")}>Earning History</button>
                    <button type="button" className="btn btn-ghost" onClick={() => handleNav("payout")}>Payout Portal</button>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
                  <div className="card" style={{ margin: 0, backgroundColor: "var(--color-surface-container-low-color)" }}>
                    <p className="kpi-label">Lifetime Earnings</p>
                    <p className="kpi-value" style={{ color: "var(--color-primary-color)" }}>{fmtMoney(lifetimeEarnings)}</p>
                    <p className="kpi-meta">across all principals</p>
                  </div>
                  <div className="card" style={{ margin: 0, backgroundColor: "var(--color-surface-container-low-color)" }}>
                    <p className="kpi-label">Available Balance</p>
                    <p className="kpi-value">{fmtMoney(availableBalance)}</p>
                    <p className="kpi-meta">scheduled for next payout</p>
                  </div>
                  <div className="card" style={{ margin: 0, backgroundColor: "var(--color-surface-container-low-color)" }}>
                    <p className="kpi-label">Total Paid Out</p>
                    <p className="kpi-value">{fmtMoney(totalPaidOut)}</p>
                    <p className="kpi-meta">lifetime payouts</p>
                  </div>
                  <div className="card" style={{ margin: 0, backgroundColor: "var(--color-surface-container-low-color)" }}>
                    <p className="kpi-label">Payout Account</p>
                    <p className="kpi-value" style={{ fontSize: "20px" }}>{payoutAccount ? payoutAccount.bankName : "—"}</p>
                    <p className="kpi-meta">{payoutAccount ? maskAccount(payoutAccount.accountNumber) : "No account linked yet"}</p>
                  </div>
                </div>
              </div>

              {/* Preferences */}
              <div className="card" style={{ margin: 0, backgroundColor: "var(--color-on-primary-color)" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 4px" }}>Notifications &amp; Preferences</h3>
                <p style={{ fontSize: "12px", color: "var(--color-on-surface-variant-color)", margin: "0 0 16px" }}>Choose what you want to be notified about.</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  {PROFILE_PREF_TITLES.map((item) => (
                    <div key={item.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", padding: "12px 0", borderBottom: "1px solid var(--color-outline-variant-color)" }}>
                      <div>
                        <p style={{ fontSize: "13px", fontWeight: 500, margin: 0 }}>{item.label}</p>
                        <p style={{ fontSize: "12px", color: "var(--color-on-surface-variant-color)", margin: "2px 0 0" }}>{item.desc}</p>
                      </div>
                      <button
                        type="button"
                        aria-pressed={prefs[item.key]}
                        onClick={() => togglePref(item.key)}
                        style={{ width: 40, height: 22, borderRadius: 999, border: "none", cursor: "pointer", flexShrink: 0, position: "relative", backgroundColor: prefs[item.key] ? "var(--color-primary-color)" : "var(--color-outline-variant-color)", transition: "background-color 0.15s ease" }}
                      >
                        <span style={{ position: "absolute", top: 3, left: prefs[item.key] ? 21 : 3, width: 16, height: 16, borderRadius: "50%", backgroundColor: "#fff", boxShadow: "0 1px 2px rgba(0,0,0,0.2)", transition: "left 0.15s ease" }} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security & account */}
              <div className="card" style={{ margin: 0, backgroundColor: "var(--color-on-primary-color)" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "0 0 4px" }}>Security &amp; Account</h3>
                <p style={{ fontSize: "12px", color: "var(--color-on-surface-variant-color)", margin: "0 0 16px" }}>Manage your password and session.</p>
                {pwSuccess && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 16px", borderRadius: "var(--radius-md)", backgroundColor: "#e8f5ef", color: "#00875A", fontSize: "13px", fontWeight: 500, marginBottom: "14px" }}>
                    <CheckCircle size={16} /> {pwSuccess}
                  </div>
                )}
                {pwOpen ? (
                  <div style={{ border: "1px solid var(--color-outline-variant-color)", borderRadius: "var(--radius-md)", padding: "16px", display: "flex", flexDirection: "column", gap: "12px", marginBottom: "14px" }}>
                    <div>
                      <label className="form-label">Current Password</label>
                      <input type="password" value={pwForm.current} onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })} style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--color-outline-variant-color)", borderRadius: "8px", fontSize: "13px", outline: "none" }} />
                    </div>
                    <div>
                      <label className="form-label">New Password</label>
                      <input type="password" value={pwForm.next} onChange={(e) => setPwForm({ ...pwForm, next: e.target.value })} style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--color-outline-variant-color)", borderRadius: "8px", fontSize: "13px", outline: "none" }} />
                    </div>
                    <div>
                      <label className="form-label">Confirm New Password</label>
                      <input type="password" value={pwForm.confirm} onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })} style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--color-outline-variant-color)", borderRadius: "8px", fontSize: "13px", outline: "none" }} />
                    </div>
                    {pwError && <p style={{ fontSize: "12px", color: "var(--color-error-color)", margin: 0 }}>{pwError}</p>}
                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-start", marginTop: "12px" }}>
                      <button type="button" className="btn btn-ghost" onClick={() => { setPwOpen(false); setPwError(null); }}>Cancel</button>
                      <button type="button" className="btn btn-primary" onClick={submitPassword}>Update Password</button>
                    </div>
                  </div>
                ) : (
                  <button type="button" className="btn btn-ghost" onClick={() => { setPwOpen(true); setPwError(null); }}>
                    <KeyRound size={15} /> Change Password
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ═══════════════════ VIEW: MESSAGES — PRINCIPALS ═══════════════════ */}
          {navItem === "messages" && messagesView === "principals" && (
            <div style={{ flex: "0 0 auto", minHeight: "100vh", backgroundColor: "var(--color-background-color)", display: "flex", flexDirection: "column" }}>
              <div className="card" style={{ backgroundColor: "var(--color-on-primary-color)" }}>
                <h3 style={{ fontSize: "20px", fontWeight: 700, marginBottom: "4px" }}>Choose a Principal</h3>
                <p style={{ color: "var(--color-on-surface-variant-color)", marginBottom: "var(--spacing-6)" }}>Select the principal whose messages you want to handle</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
                  {PRINCIPALS.map((p) => {
                    const count = (messages[p.id] || []).filter((m) => !m.handled).length;
                    return (
                      <div key={p.id} className="principal-card" style={{ backgroundColor: "var(--color-on-primary-color)" }}>
                        <PrincipalLogo principal={p} />
                        <div className="principal-info">
                          <h4>{p.name}</h4>
                          <p>{count > 0 ? `${count} message${count === 1 ? "" : "s"} awaiting reply` : p.description}</p>
                        </div>
                        <button className="btn btn-primary" onClick={() => selectMessagePrincipal(p)}>
                          Answer Messages <ArrowRight size={15} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════ VIEW: MESSAGES — INBOX ═══════════════════ */}
          {navItem === "messages" && messagesView === "inbox" && (
            <div style={{ flex: "0 0 auto", minHeight: "100vh", backgroundColor: "var(--color-background-color)", display: "flex", flexDirection: "column" }}>
              {/* ── 3-Column Workspace ── */}
              <div style={{ padding: "8px 24px 24px 24px", display: "grid", gridTemplateColumns: "240px 1fr 340px", gap: "20px", flex: 1, alignItems: "start" }}>
                {/* ── Column 1: Available Principals ── */}
                <div style={{ backgroundColor: "hsl(0, 0%, 100%)", borderRadius: "12px", border: "1px solid var(--color-outline-variant-color)", padding: "16px", display: "flex", flexDirection: "column", gap: "14px" }}>
                  <h3 style={{ fontSize: "15px", fontWeight: 700, margin: 0, color: "var(--color-on-background-color)" }}>Available Principals</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {PRINCIPALS.map((p) => {
                      const isSelected = messagePrincipalId === p.id || (!messagePrincipalId && p.id === "p1");
                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            setMessagePrincipalId(p.id);
                            setMessagesView("inbox");
                            const msgs = messages[p.id] || [];
                            if (msgs.length > 0) setSelectedThreadId(msgs[0].id);
                          }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "10px 12px",
                            borderRadius: "10px",
                            backgroundColor: isSelected ? "var(--color-surface-container-lowest-color)" : "transparent",
                            border: isSelected ? "2px solid #3080ff" : "1px solid var(--color-outline-variant-color)",
                            boxShadow: isSelected ? "0 2px 8px rgba(48,128,255,0.15)" : "none",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <PrincipalLogo principal={p} size={36} />
                            <span style={{ fontSize: "13px", fontWeight: 500, letterSpacing: "0.5px", color: "var(--color-on-background-color)" }}>
                              {p.name}
                            </span>
                          </div>
                          <div
                            style={{
                              width: "28px",
                              height: "28px",
                              borderRadius: "50%",
                              border: "1px solid var(--color-outline-color)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "12px",
                              fontWeight: 500,
                              color: "var(--color-on-surface-color)",
                            }}
                          >
                            {(messages[p.id] || []).filter((m) => !m.handled).length}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ── Column 2: Middle Conversation Queue & Reply ── */}
                {selectedPrincipalQueueEmpty ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginLeft: "40px" }}>
                    <div style={{ backgroundColor: "hsl(0, 0%, 100%)", borderRadius: "12px", border: "1px solid var(--color-outline-variant-color)", padding: "40px 20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px", minHeight: "300px", textAlign: "center" }}>
                      <Inbox size={40} style={{ color: "var(--color-outline-color)" }} />
                      <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: "var(--color-on-background-color)" }}>There is no more message for this principal</h3>
                      <p style={{ fontSize: "13px", color: "var(--color-on-surface-variant-color)", margin: 0 }}>All messages in the queue have been handled.</p>
                    </div>
                  </div>
                ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ backgroundColor: "hsl(0, 0%, 100%)", borderRadius: "12px", border: "1px solid var(--color-outline-variant-color)", padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
                    {/* Customer Ticket Header */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--color-outline-variant-color)", paddingBottom: "14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "var(--color-primary-container-color)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 500, fontSize: "15px", color: "var(--color-on-primary-container-color)" }}>
                          {selectedThread ? selectedThread.customerName.split(" ").map(n=>n[0]).join("") : "MS"}
                        </div>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "6px", fontSize: "15px", fontWeight: 500, color: "var(--color-on-background-color)" }}>
                            {selectedThread ? selectedThread.customerName : "Michael Smith"}
                            {selectedThread?.email && (
                              <span style={{ fontWeight: 400, color: "var(--color-on-surface-variant-color)", fontSize: "13px" }}>&lt;{selectedThread.email}&gt;</span>
                            )}
                            {selectedThread?.username && (
                              <span style={{ fontWeight: 400, color: "var(--color-on-surface-variant-color)", fontSize: "13px" }}>&lt;{selectedThread.username}&gt;</span>
                            )}
                            {selectedThread?.app && (
                              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontWeight: 500, color: "var(--color-on-surface-variant-color)", fontSize: "12px", backgroundColor: "var(--color-surface-container-low-color)", border: "1px solid var(--color-outline-variant-color)", borderRadius: "999px", padding: "2px 8px" }}>
                                <Share size={11} /> {selectedThread.app}
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: "12px", color: "var(--color-on-surface-variant-color)", marginTop: "2px" }}>
                            Source: {selectedThread ? selectedThread.source.toUpperCase() : "EMAIL"}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px", fontSize: "12px", textAlign: "right" }}>
                        <span style={{ fontWeight: 500, fontSize: "12px" }}>Ticket ID: 1234BC</span>
                        <button className="icon-btn" style={{ width: "30px", height: "30px" }} title="Download ticket details"><Download size={14} /></button>
                      </div>
                    </div>

                    {/* Customer Message Thread */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                      {(selectedThread ? selectedThread.thread : []).map((msg, idx) => (
                        <div key={msg.id} style={{ display: "flex", gap: "12px", justifyContent: msg.sender === "agent" ? "flex-end" : "flex-start" }}>
                          {msg.sender !== "agent" && (
                            <div style={{ width: "36px", height: "36px", borderRadius: "50%", backgroundColor: "var(--color-surface-container-high-color)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 500, fontSize: "13px", flexShrink: 0 }}>
                              {selectedThread ? selectedThread.customerName.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase() : "MS"}
                            </div>
                          )}
                          <div style={{ flex: 1, maxWidth: "80%" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px", flexDirection: msg.sender === "agent" ? "row-reverse" : "row" }}>
                              <span style={{ fontSize: "13px", fontWeight: 500 }}>{msg.sender === "agent" ? "Specialist (You)" : selectedThread ? selectedThread.customerName : msg.name}</span>
                              <span style={{ fontSize: "12px", color: "var(--color-on-surface-variant-color)" }}>{msg.time}</span>
                            </div>
                            <div style={{
                              fontSize: "13px",
                              lineHeight: 1.6,
                              color: "var(--color-on-background-color)",
                              whiteSpace: "pre-line",
                              backgroundColor: msg.sender === "agent" ? "#e8f5ef" : "var(--color-surface-container-low-color)",
                              border: "1px solid var(--color-outline-variant-color)",
                              borderRadius: "10px",
                              padding: "10px 12px",
                            }}>
                              {msg.text.split(/(\[[^\]]+\]\([^)]+\))/g).map((part, i) => {
                                const m = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
                                if (m) {
                                  return <a key={i} href={m[2]} target="_blank" rel="noreferrer" style={{ color: "#3080ff", textDecoration: "underline" }}>{m[1]}</a>;
                                }
                                return <span key={i}>{part}</span>;
                              })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <hr style={{ border: "none", borderTop: "1px solid var(--color-outline-variant-color)", margin: "4px 0" }} />

                    {/* Agent Reply Box */}
                    <div style={{ border: "1px solid var(--color-outline-variant-color)", borderRadius: "10px", padding: "14px", backgroundColor: "#fff", marginTop: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--color-on-surface-variant-color)" }}>
                          <div style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "#3080ff", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 500, fontSize: "11px" }}>C</div>
                          <span>To: {selectedThread?.email || selectedThread?.username || (selectedThread ? selectedThread.customerName : "Recipient")}</span>
                        </div>
                        <button style={{ border: "none", background: "transparent", color: "#3080ff", fontSize: "12px", fontWeight: 500, cursor: "pointer" }}>
                          Select response from Macros
                        </button>
                      </div>
                      {sentConfirmation && (
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#e8f5ef", border: "1px solid #00875A", color: "#00875A", borderRadius: "8px", padding: "8px 12px", fontSize: "13px", fontWeight: 500, marginBottom: "8px" }}>
                          <CheckCircle size={16} /> Reply sent. Moving to the next message in queue.
                        </div>
                      )}
                      <div
                        ref={editorRef}
                        contentEditable
                        suppressContentEditableWarning
                        onMouseUp={captureSelection}
                        onKeyUp={captureSelection}
                        data-placeholder="Type your response here..."
                        className="reply-editor"
                        style={{
                          width: "100%",
                          border: "none",
                          outline: "none",
                          minHeight: "60px",
                          fontSize: "13px",
                          fontFamily: "inherit",
                          color: "var(--color-on-background-color)",
                          padding: "4px 0",
                          fontWeight: fontStyle === "bold" ? 700 : 400,
                          fontStyle: fontStyle === "italic" ? "italic" : "normal",
                          textDecoration: fontStyle === "underline" ? "underline" : "none",
                        }}
                      />
                      {replyImages.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px" }}>
                          {replyImages.map((src, idx) => (
                            <div key={idx} style={{ position: "relative", width: "72px", height: "72px", borderRadius: "8px", overflow: "hidden", border: "1px solid var(--color-outline-variant-color)" }}>
                              <img src={src} alt={`attachment-${idx}`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                              <button onClick={() => {
                                setReplyImages((prev) => prev.filter((_, i) => i !== idx));
                              }} style={{ position: "absolute", top: "4px", right: "4px", width: "20px", height: "20px", borderRadius: "50%", border: "none", cursor: "pointer", backgroundColor: "rgba(0,0,0,0.6)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }} title="Remove image"><X size={12} /></button>
                            </div>
                          ))}
                        </div>
                      )}
                      {attachments.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px" }}>
                          {attachments.map((att, idx) => (
                            <div key={idx} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", backgroundColor: "var(--color-surface-container-low-color)", border: "1px solid var(--color-outline-variant-color)", borderRadius: "6px", padding: "4px 8px" }}>
                              <Paperclip size={12} style={{ color: "var(--color-on-surface-variant-color)", flexShrink: 0 }} />
                              <span style={{ maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{att.name}</span>
                              <button onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== idx))} style={{ border: "none", background: "none", padding: 0, cursor: "pointer", color: "var(--color-on-surface-variant-color)", display: "inline-flex" }} title="Remove attachment"><X size={12} /></button>
                            </div>
                          ))}
                        </div>
                      )}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "10px", borderTop: "1px solid var(--color-outline-variant-color)", marginTop: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--color-on-surface-variant-color)" }}>
                          <input ref={attachmentInputRef} type="file" multiple style={{ display: "none" }} onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            setAttachments((prev) => [...prev, ...files.map((f) => ({ name: f.name, size: f.size }))]);
                            e.target.value = "";
                          }} />
                          <button onClick={() => attachmentInputRef.current?.click()} style={{ border: "none", background: "none", padding: 0, cursor: "pointer", color: "var(--color-on-surface-variant-color)", display: "inline-flex" }} title="Attach a file"><Paperclip size={16} /></button>
                          <div ref={fontDropdownRef} style={{ position: "relative", display: "inline-flex" }}>
                            <button onClick={() => setFontDropdownOpen((o) => !o)} style={{ border: "none", background: "none", padding: 0, cursor: "pointer", color: fontStyle === "normal" ? "var(--color-on-surface-variant-color)" : "#3080ff", display: "inline-flex" }} title="Change font style"><Type size={16} /></button>
                            {fontDropdownOpen && (
                              <div style={{ position: "absolute", top: "100%", left: 0, marginTop: "6px", zIndex: 30, backgroundColor: "#fff", borderRadius: "8px", border: "1px solid var(--color-outline-variant-color)", boxShadow: "0 6px 18px rgba(0,0,0,0.12)", padding: "6px", display: "flex", flexDirection: "column", gap: "2px", minWidth: 140 }}>
                                {([["normal", "Normal"], ["bold", "Bold"], ["italic", "Italic"], ["underline", "Underline"]] as const).map(([value, label]) => (
                                  <button key={value} onClick={() => { setFontStyle(value); setFontDropdownOpen(false); }} style={{ display: "flex", alignItems: "center", gap: "8px", border: "none", background: fontStyle === value ? "var(--color-surface-container-lowest-color)" : "transparent", cursor: "pointer", fontSize: "13px", textAlign: "left", padding: "6px 10px", borderRadius: "6px", fontWeight: value === "bold" ? 700 : 400, fontStyle: value === "italic" ? "italic" : "normal", textDecoration: value === "underline" ? "underline" : "none", color: "var(--color-on-background-color)" }}>
                                    {label}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <div ref={emojiPickerRef} style={{ position: "relative", display: "inline-flex" }}>
                            <button onClick={() => setEmojiOpen((o) => !o)} style={{ border: "none", background: "none", padding: 0, cursor: "pointer", color: "var(--color-on-surface-variant-color)", display: "inline-flex" }} title="Insert emoji"><Smile size={16} /></button>
                            {emojiOpen && (
                              <div style={{ position: "absolute", bottom: "100%", left: 0, marginBottom: "6px", zIndex: 30, backgroundColor: "#fff", borderRadius: "8px", border: "1px solid var(--color-outline-variant-color)", boxShadow: "0 6px 18px rgba(0,0,0,0.12)", padding: "8px", width: 240 }}>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(8, 1fr)", gap: "2px" }}>
                                  {["😀","😁","😂","🤣","😊","😍","😘","😉","😎","🤔","😅","🙃","🙂","😇","🥳","😢","😭","😡","😴","👍","👎","👏","🙏","💪","🤝","👋","❤️","💯","✨","🎉","⭐","🔥"].map((emoji) => (
                                    <button key={emoji} onClick={() => { appendToEditor(emoji); setEmojiOpen(false); }} style={{ border: "none", background: "none", cursor: "pointer", fontSize: "18px", padding: "2px", borderRadius: "4px", lineHeight: 1 }}>{emoji}</button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                          <button onClick={openLinkModal} style={{ border: "none", background: "none", padding: 0, cursor: "pointer", color: "var(--color-on-surface-variant-color)", display: "inline-flex" }} title="Insert link"><Link size={16} /></button>
                          <input ref={imageInputRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            setReplyImages((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
                            e.target.value = "";
                          }} />
                          <button onClick={() => imageInputRef.current?.click()} style={{ border: "none", background: "none", padding: 0, cursor: "pointer", color: "var(--color-on-surface-variant-color)", display: "inline-flex" }} title="Attach an image"><Image size={16} /></button>
                          <span style={{ color: "#3080ff", fontSize: "12px", fontWeight: 500, marginLeft: "6px", cursor: "pointer" }}>Suggested Responses</span>
                        </div>
                        <button
                          className="btn btn-primary"
                          onClick={sendMessageReply}
                          style={{ padding: "8px 20px", fontSize: "13px", fontWeight: 500, borderRadius: "6px" }}
                        >
                          Send
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons below middle container */}
                  <div style={{ display: "flex", gap: "12px" }}>
                    <button className="btn btn-primary" style={{ padding: "10px 24px", fontSize: "14px", fontWeight: 500 }}>
                      View More
                    </button>
                    <button
                      className="btn btn-outline"
                      onClick={() => setShowCannotResolveModal(true)}
                      style={{ padding: "10px 24px", fontSize: "14px", fontWeight: 500, backgroundColor: "#fff", border: "1px solid var(--color-outline-color)" }}
                    >
                      Cannot Resolve
                    </button>
                  </div>
                </div>
                )}

                {/* ── Column 3: Suggested Responses (AI RAG) ── */}
                {!selectedPrincipalQueueEmpty && (
                <div style={{ backgroundColor: "hsl(0, 0%, 100%)", borderRadius: "12px", border: "1px solid var(--color-outline-variant-color)", padding: "16px", display: "flex", flexDirection: "column", gap: "14px" }}>
                  <h3 style={{ fontSize: "15px", fontWeight: 700, margin: 0, color: "var(--color-on-background-color)" }}>Suggested Responses</h3>

                  {/* Search Bar */}
                  <div style={{ display: "flex", gap: "8px" }}>
                    <div style={{ flex: 1, display: "flex", alignItems: "center", border: "1px solid var(--color-outline-variant-color)", borderRadius: "6px", padding: "0 10px", backgroundColor: "#fff" }}>
                      <Search size={14} style={{ color: "var(--color-on-surface-variant-color)", marginRight: "6px" }} />
                      <input
                        type="text"
                        value={suggestedSearch}
                        onChange={(e) => setSuggestedSearch(e.target.value)}
                        placeholder="Search responses..."
                        style={{ border: "none", outline: "none", width: "100%", fontSize: "12px", padding: "8px 0" }}
                      />
                    </div>
                    <button className="btn btn-primary" style={{ padding: "0 14px", fontSize: "12px" }}>Search</button>
                  </div>

                  {/* Suggested Response Cards List */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {[
                      {
                        id: 1,
                        label: "Suggested Response 1 of 20",
                        text: "Hello there, thank you unfortunately, I am unable to locate this order. To help me assist you better. Can you provide the email address or full name associated with this order",
                      },
                      {
                        id: 2,
                        label: "Suggested Response 1 of 20",
                        text: "Did you email our team to find your Order Number or are you looking for it",
                      },
                      {
                        id: 3,
                        label: "Suggested Response 1 of 20",
                        text: "Did you email our team to find your Order Number or are you looking for it",
                      },
                      {
                        id: 4,
                        label: "Suggested Response 1 of 20",
                        text: "Did you email our team to find your Order Number or are you looking for it",
                      },
                    ].map((item) => (
                      <div key={item.id} style={{ borderBottom: "1px solid var(--color-outline-variant-color)", paddingBottom: "12px" }}>
                        <div style={{ fontSize: "11px", color: "var(--color-on-surface-variant-color)", marginBottom: "6px" }}>{item.label}</div>
                        <div style={{ fontSize: "12px", lineHeight: 1.5, color: "var(--color-on-background-color)", marginBottom: "8px" }}>{item.text}</div>
                        <button
                          onClick={() => appendToEditor(item.text, true)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            border: "none",
                            background: "transparent",
                            color: "#3080ff",
                            fontSize: "12px",
                            fontWeight: 500,
                            cursor: "pointer",
                            padding: 0,
                          }}
                        >
                          Copy <Copy size={13} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Pagination Footer */}
                  <div style={{ display: "flex", gap: "10px", marginTop: "auto", paddingTop: "8px" }}>
                    <button className="btn btn-outline" style={{ flex: 1, padding: "8px", fontSize: "12px" }}><ArrowLeft size={12} /> Previous</button>
                    <button className="btn btn-primary" style={{ flex: 1, padding: "8px", fontSize: "12px" }}>Next <ArrowRight size={12} /></button>
                  </div>
                </div>
                )}
              </div>
            </div>
          )}

          {/* ═══════════════════ VIEW: WRAP-UP COMPLETE ═══════════════════ */}
          {navItem === "calls" && view === "wrap-up-complete" && (
            <div
              style={{
                height: "100vh",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "var(--spacing-8) var(--spacing-6)",
                textAlign: "center",
              }}
            >
              <div style={{ width: 56, height: 56, marginBottom: "var(--spacing-6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CheckCircle size={56} style={{ color: "var(--color-primary-color)" }} />
              </div>

              {/* Title & subtitle */}
              <h2 style={{ fontSize: "22px", fontWeight: 700, margin: "0 0 var(--spacing-2)" }}>Wrap-Up Complete</h2>
              <p style={{ fontSize: "14px", color: "var(--color-on-surface-variant-color)", margin: "0 0 var(--spacing-6)", lineHeight: 1.6 }}>
                Call with {wrapUpCustomerName} has been logged and saved.<br />
                You are now available for the next call.
              </p>

              {/* Call summary card */}
              <div
                style={{
                  width: "100%",
                  maxWidth: 520,
                  backgroundColor: "var(--color-surface-container-low-color)",
                  border: "1px solid var(--color-outline-variant-color)",
                  borderRadius: "var(--radius-lg)",
                  padding: "var(--spacing-5)",
                  marginBottom: "var(--spacing-6)",
                  textAlign: "left",
                }}
              >
                <p style={{ fontSize: "12px", fontWeight: 500, color: "var(--color-on-surface-variant-color)", letterSpacing: "0.08em", margin: "0 0 var(--spacing-4)" }}>Call Summary</p>

                {/* Call duration */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--spacing-3)", paddingBottom: "var(--spacing-3)", borderBottom: "1px solid var(--color-outline-variant-color)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)" }}>
                    <Clock size={14} style={{ color: "var(--color-on-surface-variant-color)", flexShrink: 0 }} />
                    <span style={{ fontSize: "13px", color: "var(--color-on-surface-variant-color)" }}>Call Duration</span>
                  </div>
                  <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--color-on-surface-color)" }}>{wrapUpCallDuration || "00:00"}</span>
                </div>

                {/* Principal & call mode */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--spacing-3)", paddingBottom: "var(--spacing-3)", borderBottom: "1px solid var(--color-outline-variant-color)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)" }}>
                    <Phone size={14} style={{ color: "var(--color-on-surface-variant-color)", flexShrink: 0 }} />
                    <span style={{ fontSize: "13px", color: "var(--color-on-surface-variant-color)" }}>Principal</span>
                  </div>
                  <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--color-on-surface-color)" }}>{activePrincipal?.name ?? "—"}</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--spacing-3)", paddingBottom: "var(--spacing-3)", borderBottom: "1px solid var(--color-outline-variant-color)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)" }}>
                    <PhoneIncoming size={14} style={{ color: "var(--color-on-surface-variant-color)", flexShrink: 0 }} />
                    <span style={{ fontSize: "13px", color: "var(--color-on-surface-variant-color)" }}>Call Type</span>
                  </div>
                  <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--color-on-surface-color)", textTransform: "capitalize" }}>{callMode ?? "—"}</span>
                </div>

                {/* Disposition */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--spacing-3)", paddingBottom: "var(--spacing-3)", borderBottom: "1px solid var(--color-outline-variant-color)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)" }}>
                    <CheckCircle size={14} style={{ color: "var(--color-on-surface-variant-color)", flexShrink: 0 }} />
                    <span style={{ fontSize: "13px", color: "var(--color-on-surface-variant-color)" }}>Disposition</span>
                  </div>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 500,
                      color: wrapUpDisposition === "Escalated to Supervisor" ? "var(--color-error-color)" : wrapUpDisposition === "Callback Required" ? "#F68B1E" : "#00875A",
                      backgroundColor: wrapUpDisposition === "Escalated to Supervisor" ? "var(--color-error-container-color)" : wrapUpDisposition === "Callback Required" ? "#fdf1e0" : "#e8f5ef",
                      padding: "2px 10px",
                      borderRadius: "var(--radius-full)",
                    }}
                  >
                    {wrapUpDisposition || "Resolved"}
                  </span>
                </div>

                {/* Call notes */}
                {wrapUpNotes && (
                  <div style={{ marginBottom: wrapUpCallbackScheduled ? "var(--spacing-3)" : 0, paddingBottom: wrapUpCallbackScheduled ? "var(--spacing-3)" : 0, borderBottom: wrapUpCallbackScheduled ? "1px solid var(--color-outline-variant-color)" : "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)", marginBottom: "var(--spacing-2)" }}>
                      <Mail size={14} style={{ color: "var(--color-on-surface-variant-color)", flexShrink: 0 }} />
                      <span style={{ fontSize: "13px", color: "var(--color-on-surface-variant-color)" }}>Call Notes</span>
                    </div>
                    <p style={{ fontSize: "13px", color: "var(--color-on-surface-color)", margin: 0, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{wrapUpNotes}</p>
                  </div>
                )}

                {/* Scheduled callback */}
                {wrapUpCallbackScheduled && (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)" }}>
                      <Calendar size={14} style={{ color: "var(--color-on-surface-variant-color)", flexShrink: 0 }} />
                      <span style={{ fontSize: "13px", color: "var(--color-on-surface-variant-color)" }}>Callback Scheduled</span>
                    </div>
                    <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--color-on-surface-color)" }}>
                      {wrapUpCallbackDate
                        ? (() => { const [y, m, d] = wrapUpCallbackDate.split("-").map(Number); return `${d.toString().padStart(2, "0")}/${m.toString().padStart(2, "0")}/${y}`; })()
                        : ""} · {wrapUpCallbackTime}
                    </span>
                  </div>
                )}
              </div>

              {/* Callback confirmation card */}
              {wrapUpCallbackScheduled && (
                <div
                  style={{
                    width: "100%",
                    maxWidth: 520,
                    backgroundColor: "var(--color-surface-container-low-color)",
                    border: "1px solid var(--color-outline-variant-color)",
                    borderRadius: "var(--radius-lg)",
                    padding: "var(--spacing-5)",
                    marginBottom: "var(--spacing-6)",
                    textAlign: "left",
                  }}
                >
                  <p style={{ fontSize: "12px", fontWeight: 500, color: "var(--color-on-surface-variant-color)", letterSpacing: "0.08em", margin: "0 0 var(--spacing-4)" }}>Callback Confirmation</p>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--spacing-3)", paddingBottom: "var(--spacing-3)", borderBottom: "1px solid var(--color-outline-variant-color)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)" }}>
                      <Phone size={14} style={{ color: "var(--color-on-surface-variant-color)", flexShrink: 0 }} />
                      <span style={{ fontSize: "13px", color: "var(--color-on-surface-variant-color)" }}>Phone Number</span>
                    </div>
                    <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--color-on-surface-color)" }}>{wrapUpCallbackPhone || "—"}</span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--spacing-3)", paddingBottom: "var(--spacing-3)", borderBottom: "1px solid var(--color-outline-variant-color)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)" }}>
                      <Calendar size={14} style={{ color: "var(--color-on-surface-variant-color)", flexShrink: 0 }} />
                      <span style={{ fontSize: "13px", color: "var(--color-on-surface-variant-color)" }}>Date & Time</span>
                    </div>
                    <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--color-on-surface-color)" }}>
                      {wrapUpCallbackDate
                        ? (() => { const [y, m, d] = wrapUpCallbackDate.split("-").map(Number); return `${d.toString().padStart(2, "0")}/${m.toString().padStart(2, "0")}/${y}`; })()
                        : "—"} · {wrapUpCallbackTime || "—"}
                    </span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: wrapUpCallbackReason ? "var(--spacing-3)" : 0, paddingBottom: wrapUpCallbackReason ? "var(--spacing-3)" : 0, borderBottom: wrapUpCallbackReason ? "1px solid var(--color-outline-variant-color)" : "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)" }}>
                      <User size={14} style={{ color: "var(--color-on-surface-variant-color)", flexShrink: 0 }} />
                      <span style={{ fontSize: "13px", color: "var(--color-on-surface-variant-color)" }}>Assigned To</span>
                    </div>
                    <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--color-on-surface-color)" }}>
                      {ASSIGN_OPTIONS.find((o) => o.value === wrapUpCallbackAssignTo)?.label ?? "—"}
                    </span>
                  </div>

                  {wrapUpCallbackReason && (
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)", marginBottom: "var(--spacing-2)" }}>
                        <Mail size={14} style={{ color: "var(--color-on-surface-variant-color)", flexShrink: 0 }} />
                        <span style={{ fontSize: "13px", color: "var(--color-on-surface-variant-color)" }}>Reason</span>
                      </div>
                      <p style={{ fontSize: "13px", color: "var(--color-on-surface-color)", margin: 0, lineHeight: 1.6 }}>{wrapUpCallbackReason}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div style={{ display: "flex", gap: "var(--spacing-4)" }}>
                <button
                  className="btn btn-secondary"
                  style={{ minWidth: 140, fontSize: "14px", fontWeight: 500 }}
                  onClick={() => {
                    setAgentStatus("offline");
                    setCallMode(null);
                    setView("principals");
                  }}
                >
                  Go Offline
                </button>
                <button
                  className="btn btn-primary"
                  style={{ minWidth: 140, fontSize: "14px", fontWeight: 500 }}
                  onClick={() => {
                    if (callMode === "outbound") {
                      setAgentStatus("offline");
                      setView("outbound-call");
                    } else {
                      setAgentStatus("online");
                      setView("in-queue");
                    }
                  }}
                >
                  {callMode === "outbound" ? "Back to Outbound Call Dashboard" : "Back to Queue"}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ═══════════════════ CANNOT RESOLVE MODAL ═══════════════════ */}
      {showCannotResolveModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 80, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ backgroundColor: "var(--color-surface-color)", borderRadius: "12px", border: "1px solid var(--color-outline-variant-color)", width: "460px", maxWidth: "90vw", padding: "24px", boxShadow: "0 10px 25px rgba(0,0,0,0.15)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>Cannot Resolve Options</h3>
              <button onClick={() => setShowCannotResolveModal(false)} style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--color-on-surface-variant-color)" }}>
                <X size={20} />
              </button>
            </div>
            <p style={{ fontSize: "13px", color: "var(--color-on-surface-variant-color)", marginBottom: "16px" }}>
              Select a reason why this customer issue cannot be resolved at your tier:
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
              {[
                "Customer Unresponsive (No response after multiple attempts)",
                "Out of Policy Request (Refund/Exchange period expired)",
                "Technical Integration Failure (API / System outage)",
                "Escalated to Supervisor for High-Tier Review",
              ].map((reason, idx) => (
                <label key={idx} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--color-outline-variant-color)", cursor: "pointer", fontSize: "13px" }}>
                  <input
                    type="radio"
                    name="cannotResolveReason"
                    value={reason}
                    checked={cannotResolveReason === reason}
                    onChange={(e) => setCannotResolveReason(e.target.value)}
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button className="btn btn-outline" onClick={() => setShowCannotResolveModal(false)} style={{ padding: "8px 16px", fontSize: "13px" }}>Cancel</button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setShowCannotResolveModal(false);
                  setDeclineToast("Ticket flagged as Cannot Resolve and queued for review.");
                  setTimeout(() => setDeclineToast(null), 3000);
                }}
                style={{ padding: "8px 16px", fontSize: "13px" }}
              >
                Submit Option
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════ NOTIFICATION TOAST ═══════════════════ */}
      {declineToast && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#e8f5ef",
            color: "#00875A",
            border: "1px solid #00875A",
            padding: "12px 20px",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--elevation-3)",
            zIndex: 70,
            fontSize: "13px",
            fontWeight: 500,
          }}
        >
          <CheckCircle size={15} style={{ verticalAlign: "-3px", marginRight: "6px" }} />
          {declineToast}
        </div>
      )}

      {/* ═══════════════════ PAYOUT TOAST ═══════════════════ */}
      {payoutToast && (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#e8f5ef",
            color: "#00875A",
            border: "1px solid #00875A",
            padding: "12px 20px",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--elevation-3)",
            zIndex: 70,
            fontSize: "13px",
            fontWeight: 500,
            whiteSpace: "nowrap",
          }}
        >
          <CheckCircle size={15} style={{ verticalAlign: "-3px", marginRight: "6px" }} />
          {payoutToast}
        </div>
      )}

      {/* ═══════════════════ LINK INSERT MODAL ═══════════════════ */}
      {linkModalOpen && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 90, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setLinkModalOpen(false)}>
          <div style={{ backgroundColor: "var(--color-surface-color)", borderRadius: "12px", border: "1px solid var(--color-outline-variant-color)", width: "420px", maxWidth: "90vw", padding: "24px", boxShadow: "0 10px 25px rgba(0,0,0,0.15)" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>Insert Link</h3>
              <button onClick={() => setLinkModalOpen(false)} style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--color-on-surface-variant-color)" }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
              <div>
                <label className="form-label">Link Text</label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Text to display (e.g. Visit our help centre)"
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--color-outline-variant-color)", borderRadius: "8px", fontSize: "13px", outline: "none" }}
                />
              </div>
              <div>
                <label className="form-label">URL</label>
                <input
                  type="text"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://example.com"
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--color-outline-variant-color)", borderRadius: "8px", fontSize: "13px", outline: "none" }}
                />
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button className="btn btn-ghost" onClick={() => setLinkModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={insertLink} disabled={!linkUrl.trim()} style={{ opacity: linkUrl.trim() ? 1 : 0.5, cursor: linkUrl.trim() ? "pointer" : "not-allowed" }}>
                Insert
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
