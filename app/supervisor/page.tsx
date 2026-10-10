"use client";

import React, { useState } from "react";
import {
  Headphones, LayoutDashboard, Users,
  BarChart2, Bell, Sun, Moon, ChevronDown,
  CheckCircle, XCircle, AlertTriangle, TrendingUp, TrendingDown,
  Star, PhoneCall, Search, Eye, Flag, ChevronRight, Filter,
  Mic, Pause, Play, FileText, BookOpen,
  UserPlus, Zap, Volume2, Download, LogOut,
  GraduationCap, Timer, Headset, BrainCircuit,
} from "lucide-react";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={17} /> },
  { id: "agents", label: "Agents", icon: <Users size={17} /> },
  { id: "queues", label: "Queues", icon: <PhoneCall size={17} /> },
  { id: "live", label: "Live Monitor", icon: <Headset size={17} /> },
  { id: "qa", label: "QA Review", icon: <Star size={17} /> },
  { id: "escalations", label: "Escalations", icon: <Flag size={17} /> },
  { id: "sla", label: "SLA Monitor", icon: <Timer size={17} /> },
  { id: "kb", label: "Knowledge Base", icon: <BookOpen size={17} /> },
  { id: "ai", label: "AI Supervision", icon: <BrainCircuit size={17} /> },
  { id: "reports", label: "Reports", icon: <BarChart2 size={17} /> },
] as const;

type NavId = (typeof NAV_ITEMS)[number]["id"];

const PRINCIPAL_COLORS: Record<string, string> = {
  CHOWDECK: "#00875A",
  JUMIA: "#F68B1E",
  "JIJI NIGERIA": "#008CDB",
};

const SUPERVISOR = { name: "Sam Vu", initials: "SV", role: "Supervisor" };

type AgentStatus = "On Call" | "Available" | "On Break" | "Offline";

const TEAM: { id: string; name: string; initials: string; color: string; status: AgentStatus; principal: string; callsToday: number; tickets: number; csat: number; sla: number; quality: number; workload: number; onCallFor: string; talkPct: number }[] = [
  { id: "ag-1", name: "Jane Doe", initials: "JD", color: "#7A5CFF", status: "On Call", principal: "CHOWDECK", callsToday: 14, tickets: 3, csat: 4.8, sla: 98, quality: 86, workload: 6, onCallFor: "02:34", talkPct: 72 },
  { id: "ag-2", name: "David Kim", initials: "DK", color: "#3080ff", status: "Available", principal: "JUMIA", callsToday: 11, tickets: 5, csat: 4.5, sla: 94, quality: 81, workload: 4, onCallFor: "-", talkPct: 0 },
  { id: "ag-3", name: "Amara Nwosu", initials: "AN", color: "#E5484D", status: "On Break", principal: "JUMIA", callsToday: 9, tickets: 7, csat: 4.2, sla: 90, quality: 74, workload: 3, onCallFor: "-", talkPct: 0 },
  { id: "ag-4", name: "Carlos Rivera", initials: "CR", color: "#00875A", status: "Available", principal: "JIJI NIGERIA", callsToday: 16, tickets: 2, csat: 4.9, sla: 99, quality: 92, workload: 5, onCallFor: "-", talkPct: 0 },
  { id: "ag-5", name: "Chiamaka Okafor", initials: "CO", color: "#F68B1E", status: "On Call", principal: "CHOWDECK", callsToday: 12, tickets: 4, csat: 4.7, sla: 97, quality: 95, workload: 7, onCallFor: "05:12", talkPct: 64 },
  { id: "ag-6", name: "Adewale Bello", initials: "AB", color: "#8F4E9B", status: "Available", principal: "CHOWDECK", callsToday: 15, tickets: 3, csat: 4.6, sla: 96, quality: 92, workload: 5, onCallFor: "-", talkPct: 0 },
  { id: "ag-7", name: "Emeka Obi", initials: "EO", color: "#12A594", status: "On Break", principal: "JIJI NIGERIA", callsToday: 8, tickets: 8, csat: 4.1, sla: 88, quality: 72, workload: 6, onCallFor: "-", talkPct: 0 },
  { id: "ag-8", name: "Fatima Abubakar", initials: "FA", color: "#D6409F", status: "Available", principal: "JUMIA", callsToday: 10, tickets: 6, csat: 4.4, sla: 93, quality: 84, workload: 4, onCallFor: "-", talkPct: 0 },
  { id: "ag-9", name: "Ibrahim Bello", initials: "IB", color: "#805AD5", status: "Offline", principal: "CHOWDECK", callsToday: 0, tickets: 0, csat: 4.3, sla: 91, quality: 78, workload: 0, onCallFor: "-", talkPct: 0 },
];

const QUEUES = [
  { principal: "CHOWDECK", waiting: 12, avgWait: "1m 40s", longest: "4m 20s", staffed: 3, depth: 78 },
  { principal: "JUMIA", waiting: 7, avgWait: "2m 10s", longest: "5m 05s", staffed: 2, depth: 55 },
  { principal: "JIJI NIGERIA", waiting: 4, avgWait: "1m 05s", longest: "2m 48s", staffed: 2, depth: 40 },
];

const LIVE_CALLS = [
  { id: "lc-1", agent: "Jane Doe", initials: "JD", principal: "CHOWDECK", customer: "Emeka Nwankwo", duration: "02:34", talkPct: 72, hold: false, muted: false, escalated: false },
  { id: "lc-2", agent: "Chiamaka Okafor", initials: "CO", principal: "CHOWDECK", customer: "Tunde Akinola", duration: "05:12", talkPct: 64, hold: true, muted: false, escalated: false },
  { id: "lc-3", agent: "Carlos Rivera", initials: "CR", principal: "JIJI NIGERIA", customer: "Obinna Nnaemeke", duration: "01:05", talkPct: 88, hold: false, muted: false, escalated: true },
] as const;

type QaStatus = "Queued" | "Scored";
type QaVerdict = "Pass" | "Flag" | "Escalate" | null;

const QA_ITEMS: { id: string; type: "Call" | "Ticket"; agent: string; principal: string; customer: string; score: number | null; verdict: QaVerdict; categories: { name: string; weight: number }[]; }[] = [
  { id: "qc-4411", type: "Call", agent: "Jane Doe", principal: "JUMIA", customer: "Sade Okafor", score: null, verdict: null, categories: [{ name: "Greeting & Setup", weight: 15 }, { name: "Empathy", weight: 20 }, { name: "Accuracy", weight: 30 }, { name: "Compliance", weight: 25 }, { name: "Resolution", weight: 10 }] },
  { id: "qc-4412", type: "Call", agent: "Chiamaka Okafor", principal: "CHOWDECK", customer: "Kunle Adesanya", score: 87, verdict: "Pass", categories: [{ name: "Greeting & Setup", weight: 15 }, { name: "Empathy", weight: 20 }, { name: "Accuracy", weight: 30 }, { name: "Compliance", weight: 25 }, { name: "Resolution", weight: 10 }] },
  { id: "qt-5531", type: "Ticket", agent: "David Kim", principal: "JUMIA", customer: "Fatima Abubakar", score: null, verdict: null, categories: [{ name: "Clarity", weight: 20 }, { name: "Accuracy", weight: 30 }, { name: "Compliance", weight: 25 }, { name: "Resolution", weight: 25 }] },
  { id: "qt-5532", type: "Ticket", agent: "Emeka Obi", principal: "JIJI NIGERIA", customer: "Uche Okonkwo", score: null, verdict: null, categories: [{ name: "Clarity", weight: 20 }, { name: "Accuracy", weight: 30 }, { name: "Compliance", weight: 25 }, { name: "Resolution", weight: 25 }] },
  { id: "qt-5533", type: "Ticket", agent: "Amara Nwosu", principal: "CHOWDECK", customer: "Ada Okonkwo", score: 62, verdict: "Flag", categories: [{ name: "Clarity", weight: 20 }, { name: "Accuracy", weight: 30 }, { name: "Compliance", weight: 25 }, { name: "Resolution", weight: 25 }] },
];

type EscalationStatus = "Open" | "Assigned" | "Resolved";

const ESCALATIONS: { id: string; principal: string; agent: string; customer: string; reason: string; priority: "Low" | "Medium" | "High" | "Critical"; raised: string; status: EscalationStatus; details: string }[] = [
  { id: "ESC-901", principal: "CHOWDECK", agent: "Jane Doe", customer: "Emeka Nwankwo", reason: "Refund dispute - billing team availability", priority: "High", raised: "10:22 AM", status: "Open", details: "Customer Emeka Nwankwo disputed the delivery fee on a recent order and requested a full refund. Specialist Jane Doe escalated because refund approval requires billing team sign-off, which is unavailable until 11:00 AM. The customer expects written confirmation by end of day." },
  { id: "ESC-900", principal: "JIJI NIGERIA", agent: "Carlos Rivera", customer: "Obinna Nnaemeke", reason: "Account suspension - reinstatement approval", priority: "Critical", raised: "09:48 AM", status: "Assigned", details: "Customer Obinna Nnaemeke's account was flagged by the risk engine and suspended pending review. Specialist Carlos Rivera escalated for reinstatement approval from the JIJI NIGERIA account team. The customer has been waiting on hold for 18 minutes and needs a decision today." },
  { id: "ESC-899", principal: "JUMIA", agent: "David Kim", customer: "Bola Adeyemi", reason: "Double charge investigation", priority: "Medium", raised: "09:05 AM", status: "Open", details: "Customer Bola Adeyemi was charged twice for the same order on two payment attempts. Specialist David Kim escalated to the payments team to trace both transactions and arrange a reversal of the duplicate charge. The merchant reference and both receipt IDs have been attached to the ticket." },
  { id: "ESC-898", principal: "CHOWDECK", agent: "Chiamaka Okafor", customer: "Funke Akindele", reason: "Delivery SLA breach - compensation approval", priority: "High", raised: "08:37 AM", status: "Resolved", details: "Customer Funke Akindele's order exceeded the promised delivery window by 3 days. Specialist Chiamaka Okafor escalated for compensation approval under the delivery SLA policy. A partial refund was authorized and has been processed." },
];

const SLA_PRINCIPALS = [
  { principal: "CHOWDECK", compliance: 94, target: 95, answered: 128, abandoned: 9, atRisk: 3 },
  { principal: "JUMIA", compliance: 91, target: 95, answered: 96, abandoned: 7, atRisk: 5 },
  { principal: "JIJI NIGERIA", compliance: 98, target: 95, answered: 64, abandoned: 2, atRisk: 1 },
];

const KB_ARTICLES = [
  { id: 1, title: "Reversal & Refund Policy - CHOWDECK", category: "Billing", principal: "CHOWDECK", status: "Published", updated: "2d ago", views: 1482 },
  { id: 2, title: "Account Suspension Reinstatement Flow", category: "Accounts", principal: "JIJI NIGERIA", status: "Published", updated: "1w ago", views: 934 },
  { id: 3, title: "JUMIA Delivery SLA and Compensation", category: "Delivery", principal: "JUMIA", status: "Draft", updated: "Today", views: 0 },
  { id: 4, title: "Handling Difficult Customers - Best Practice", category: "Coaching", principal: "All", status: "Published", updated: "3d ago", views: 2210 },
  { id: 5, title: "Refund Limits and Approval Matrix", category: "Billing", principal: "All", status: "Expired", updated: "2w ago", views: 640 },
];

const AI_INSIGHTS = [
  { id: 1, type: "Sentiment", severity: "High", agent: "Amara Nwosu", text: "Customer sentiment dropped sharply mid-call (tone: frustrated). Empathy score below threshold.", action: "Review call QC-4408", status: "New" },
  { id: 2, type: "Policy Flag", severity: "Critical", agent: "Emeka Obi", text: "Agent mentioned a discount amount not in the approved policy matrix for this product.", action: "Escalate to QA review", status: "New" },
  { id: 3, type: "Compliance Gap", severity: "Medium", agent: "David Kim", text: "Security phrase not repeated during the card-on-file request.", action: "Add coaching note", status: "Reviewed" },
  { id: 4, type: "Coaching Tip", severity: "Low", agent: "Fatima Abubakar", text: "Slow wrap-up detected (avg 4m 20s). Suggest the quick-save shortcut.", action: "Send tip", status: "Reviewed" },
  { id: 5, type: "Sentiment", severity: "Medium", agent: "Jane Doe", text: "Positive sentiment detected - offer extended for product upsell context.", action: "Log in report", status: "New" },
];

const REPORTS_WEEKLY = [
  { week: "W1", quality: 71, csat: 4.1, calls: 180, sla: 90 },
  { week: "W2", quality: 74, csat: 4.2, calls: 195, sla: 92 },
  { week: "W3", quality: 78, csat: 4.4, calls: 210, sla: 93 },
  { week: "W4", quality: 82, csat: 4.5, calls: 228, sla: 95 },
  { week: "W5", quality: 84, csat: 4.6, calls: 235, sla: 94 },
];

type AppNotification = { id: number; icon: string; title: string; desc: string; time: string; read: boolean };

const NOTIFICATIONS: AppNotification[] = [
  { id: 1, icon: "FL", title: "Critical escalation raised", desc: "ESC-900 (JIJI NIGERIA) is waiting for reinstatement approval.", time: "12 min ago", read: false },
  { id: 2, icon: "QA", title: "QA score submitted", desc: "QC-4412 scored 87/100 by you - PASS.", time: "48 min ago", read: false },
  { id: 3, icon: "SL", title: "SLA at risk", desc: "JUMIA compliance has dropped to 91% - below the 95% target.", time: "1 hr ago", read: false },
  { id: 4, icon: "AI", title: "AI policy flag", desc: "Emeka Obi mentioned an unapproved discount amount.", time: "2 hr ago", read: true },
];

const PrincipalBadge = ({ principal, size = 20 }: { principal: string; size?: number }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
    <div style={{ width: size, height: size, borderRadius: 5, backgroundColor: PRINCIPAL_COLORS[principal] || "#666", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: size * 0.45, fontWeight: 700, flexShrink: 0 }}>
      {principal[0]}
    </div>
    <span>{principal}</span>
  </div>
);

const AgentPill = ({ name, initials, color, size = 30 }: { name: string; initials: string; color: string; size?: number }) => (
  <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)" }}>
    <div style={{ width: size, height: size, borderRadius: "50%", backgroundColor: color, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.38, fontWeight: 700, flexShrink: 0 }}>{initials}</div>
    <span>{name}</span>
  </div>
);

const statusBadge = (status: string) => (
  <span className={`badge ${status === "On Call" ? "badge-in-progress" : status === "Available" ? "badge-resolved" : status === "On Break" ? "badge-waiting" : "badge-closed"}`}>{status}</span>
);

const Card = ({ title, sub, children, action }: { title: string; sub?: string; children: React.ReactNode; action?: React.ReactNode }) => (
  <div className="card" style={{ margin: 0 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--spacing-4)" }}>
      <div>
        <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0 }}>{title}</h3>
        {sub && <p style={{ fontSize: "12px", color: "var(--color-on-surface-variant-color)", margin: "2px 0 0" }}>{sub}</p>}
      </div>
      {action}
    </div>
    {children}
  </div>
);

const CountChip = ({ n, tone }: { n: number; tone?: "error" | "warn" | "ok" }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 22, height: 22, padding: "0 6px", borderRadius: 999,
    fontSize: 12, fontWeight: 700, backgroundColor: tone === "error" ? "var(--color-error-container-color)" : tone === "warn" ? "#fdf1e0" : "var(--color-surface-container-high-color)",
    color: tone === "error" ? "var(--color-error-color)" : tone === "warn" ? "#F68B1E" : "var(--color-on-surface-color)",
  }}>{n}</span>
);

export default function SupervisorDashboard() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [navItem, setNavItem] = useState<NavId>("dashboard");
  const [agentSearch, setAgentSearch] = useState("");
  const [qaTab, setQaTab] = useState<"Call" | "Ticket">("Call");
  const [qaItems, setQaItems] = useState(QA_ITEMS);
  const [scoreItem, setScoreItem] = useState<typeof QA_ITEMS[number] | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [coachingNote, setCoachingNote] = useState("");
  const [escalations, setEscalations] = useState(ESCALATIONS);
  const [viewEscalation, setViewEscalation] = useState<typeof ESCALATIONS[number] | null>(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [toast, setToast] = useState<string | null>(null);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const openScore = (item: typeof QA_ITEMS[number]) => {
    setScoreItem(item);
    setScores({});
    setCoachingNote("");
  };

  const saveScore = () => {
    if (!scoreItem) return;
    const values = scoreItem.categories.map((c) => scores[c.name] ?? 0);
    const total = values.reduce((a, b) => a + b, 0) / scoreItem.categories.length;
    const verdict: QaVerdict = total >= 80 ? "Pass" : total >= 60 ? "Flag" : "Escalate";
    setQaItems((items) => items.map((i) => (i.id === scoreItem.id ? { ...i, score: Math.round(total), verdict } : i)));
    showToast(`${scoreItem.id} scored ${Math.round(total)}/100 - ${verdict}.${coachingNote ? " Coaching note saved." : ""}`);
    setScoreItem(null);
  };

  const statusOf = (i: typeof QA_ITEMS[number]) => (i.score === null ? "Queued" : "Scored") as QaStatus;

  const toggleEscalation = (id: string) => {
    setEscalations((es) => es.map((e) => (e.id === id ? { ...e, status: e.status === "Assigned" ? "Resolved" : "Assigned" } : e)));
    showToast(`Escalation ${id} updated.`);
  };

  const markNotifsRead = () => setNotifications((n) => n.map((x) => ({ ...x, read: true })));
  const activeAgents = TEAM.filter((a) => a.status !== "Offline");
  const onCallAgents = TEAM.filter((a) => a.status === "On Call");
  const openEscalations = escalations.filter((e) => e.status !== "Resolved");
  const queuedQa = qaItems.filter((i) => i.type === qaTab && i.score === null);
  const nowLabel = "Monday, September 25, 2026";

  const pageTitle = (id: NavId) => {
    const item = NAV_ITEMS.find((n) => n.id === id);
    return item ? item.label : "Dashboard";
  };

  return (
    <div className="app-shell" data-theme={theme}>
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Headphones size={26} style={{ color: "var(--color-primary-color)" }} />
          <span className="sidebar-logo-text">Connectdesk</span>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => { setNavItem(item.id); }}
              className={`nav-item ${navItem === item.id ? "active" : ""}`}
            >
              {item.icon}
              {item.label}
              {item.id === "escalations" && openEscalations.length > 0 && <CountChip n={openEscalations.length} tone="error" />}
              {item.id === "qa" && queuedQa.length > 0 && <CountChip n={queuedQa.length} tone="warn" />}
            </button>
          ))}
        </nav>

        <div style={{ marginTop: "var(--spacing-4)", borderTop: "1px solid var(--color-outline-variant-color)", paddingTop: "var(--spacing-4)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)" }}>
              <div className="avatar" style={{ width: 32, height: 32, fontSize: 12 }}>{SUPERVISOR.initials}</div>
              <div>
                <p style={{ fontWeight: 500, fontSize: "13px", lineHeight: 1.2 }}>{SUPERVISOR.name}</p>
                <p style={{ fontSize: "11px", color: "var(--color-on-surface-variant-color)" }}>{SUPERVISOR.role}</p>
              </div>
            </div>
            <button type="button" onClick={() => showToast("You have been signed out.")} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--color-error-color)", padding: 6, display: "inline-flex" }} title="Log Out">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <h2>{pageTitle(navItem)}</h2>
            <p>{nowLabel} &middot; {SUPERVISOR.name}</p>
          </div>
          <div className="topbar-right">
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <button className="icon-btn notification-dot" onClick={() => setNotifOpen((o) => !o)} title="Notifications">
                <Bell size={17} />
              </button>
              {notifOpen && (
                <div style={{ position: "absolute", top: "44px", right: "0", width: 360, maxHeight: "480px", backgroundColor: "var(--color-on-primary-color)", border: "1px solid var(--color-outline-variant-color)", borderRadius: "14px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", zIndex: 1200, display: "flex", flexDirection: "column", overflow: "hidden" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: "1px solid var(--color-outline-variant-color)" }}>
                    <h4 style={{ fontSize: "15px", fontWeight: 500, margin: 0 }}>Notifications</h4>
                    {notifications.some((n) => !n.read) && (
                      <button type="button" onClick={markNotifsRead} style={{ background: "none", border: "none", padding: 0, fontSize: "12px", fontWeight: 500, color: "var(--color-primary-color)", cursor: "pointer" }}>Mark all as read</button>
                    )}
                  </div>
                  <div style={{ overflowY: "auto" }}>
                    {notifications.map((n) => (
                      <div key={n.id} style={{ display: "flex", gap: "10px", padding: "12px 16px", borderBottom: "1px solid var(--color-outline-variant-color)", backgroundColor: n.read ? "transparent" : "var(--color-surface-container-low-color)" }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: n.read ? "var(--color-surface-container-high-color)" : "#e8f0fe", color: n.read ? "var(--color-on-surface-variant-color)" : "#1B6EF3", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{n.icon}</div>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontSize: "13px", fontWeight: 500, margin: 0 }}>{n.title}</p>
                          <p style={{ fontSize: "12px", color: "var(--color-on-surface-variant-color)", margin: "2px 0 4px", lineHeight: 1.4 }}>{n.desc}</p>
                          <p style={{ fontSize: "11px", color: "var(--color-outline-color)", margin: 0 }}>{n.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="theme-toggle" onClick={toggleTheme} role="button" tabIndex={0}>
              <Sun size={15} style={{ color: theme === "light" ? "var(--color-primary-color)" : "var(--color-outline-color)" }} />
              <Moon size={15} style={{ color: theme === "dark" ? "var(--color-primary-color)" : "var(--color-outline-color)" }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)", paddingLeft: "var(--spacing-3)", borderLeft: "1px solid var(--color-outline-variant-color)" }}>
              <div className="avatar">{SUPERVISOR.initials}</div>
              <div>
                <p style={{ fontWeight: 500, fontSize: "14px", lineHeight: 1.2 }}>{SUPERVISOR.name}</p>
                <p style={{ fontSize: "11px", color: "var(--color-on-surface-variant-color)" }}>{SUPERVISOR.role}</p>
              </div>
              <ChevronDown size={14} />
            </div>
          </div>
        </header>

        {toast && (
          <div style={{ position: "fixed", top: "76px", right: "24px", zIndex: 1300, display: "flex", alignItems: "center", gap: "8px", padding: "12px 16px", borderRadius: "var(--radius-md)", backgroundColor: "#e8f5ef", color: "#00875A", fontSize: "13px", fontWeight: 500, boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}>
            <CheckCircle size={16} /> {toast}
          </div>
        )}

        <main className="page-content supervisor-main" style={{ backgroundColor: "var(--color-background-color)" }}>
          {/* ═══════════════ DASHBOARD ═══════════════ */}
          {navItem === "dashboard" && (
            <>
              <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
                <div className="kpi-card">
                  <p className="kpi-label">Active Agents</p>
                  <p className="kpi-value" style={{ color: "#00875A" }}>{activeAgents.length}</p>
                  <p className="kpi-meta">{onCallAgents.length} on call</p>
                </div>
                <div className="kpi-card">
                  <p className="kpi-label">Calls Today</p>
                  <p className="kpi-value">84</p>
                  <p className="kpi-meta" style={{ color: "#00875A", display: "flex", alignItems: "center", gap: 4 }}><TrendingUp size={12} /> +12% vs yesterday</p>
                </div>
                <div className="kpi-card">
                  <p className="kpi-label">Open Tickets</p>
                  <p className="kpi-value" style={{ color: "var(--color-primary-color)" }}>23</p>
                  <p className="kpi-meta">{openEscalations.length} escalated</p>
                </div>
                <div className="kpi-card">
                  <p className="kpi-label">Avg CSAT</p>
                  <p className="kpi-value">4.6</p>
                  <p className="kpi-meta" style={{ color: "#00875A", display: "flex", alignItems: "center", gap: 4 }}><TrendingUp size={12} /> ↑ 0.2 this week</p>
                </div>
                <div className="kpi-card">
                  <p className="kpi-label">SLA Compliance</p>
                  <p className="kpi-value">94%</p>
                  <p className="kpi-meta" style={{ color: "var(--color-error-color)", display: "flex", alignItems: "center", gap: 4 }}><TrendingDown size={12} /> ↓ 1% below target</p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "var(--spacing-6)", marginTop: "var(--spacing-6)" }}>
                <Card title="Live Activity" sub="Calls in progress right now">
                  <div className="table-container" style={{ maxHeight: 320 }}>
                    <table>
                      <thead>
                        <tr>
                          <th>Agent</th>
                          <th>Principal</th>
                          <th>Customer</th>
                          <th>Duration</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {onCallAgents.length === 0 ? (
                          <tr><td colSpan={5} style={{ textAlign: "center", color: "var(--color-on-surface-variant-color)", padding: "24px" }}>No active calls right now.</td></tr>
                        ) : onCallAgents.map((a) => {
                          const lc = LIVE_CALLS.find((c) => c.agent === a.name);
                          return (
                            <tr key={a.id}>
                              <td><AgentPill name={a.name} initials={a.initials} color={a.color} size={28} /></td>
                              <td><PrincipalBadge principal={a.principal} size={18} /></td>
                              <td>{lc?.customer ?? "—"}</td>
                              <td>{a.onCallFor}</td>
                              <td>
                                <span className="badge badge-in-progress">Live</span>
                                {a.onCallFor === "05:12" && <span className="badge badge-escalated" style={{ marginLeft: 6 }}>Escalated</span>}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <button type="button" className="btn btn-ghost" style={{ marginTop: "var(--spacing-3)" }} onClick={() => setNavItem("live")}>
                    Open Live Monitor <ChevronRight size={14} />
                  </button>
                </Card>

                <Card title="Escalations" sub="Needing your attention" action={<CountChip n={openEscalations.length} tone="error" />}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
                    {openEscalations.slice(0, 3).map((e) => (
                      <div key={e.id} style={{ display: "flex", alignItems: "center", gap: "var(--spacing-3)", padding: "12px", border: "1px solid var(--color-outline-variant-color)", borderRadius: "var(--radius-md)" }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: "13px", fontWeight: 500, margin: 0 }}>{e.customer}</p>
                          <p style={{ fontSize: "11px", color: "var(--color-on-surface-variant-color)", margin: "2px 0 0", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" } as React.CSSProperties}>{e.reason}</p>
                        </div>
                        <span className={`badge ${e.priority === "Critical" || e.priority === "High" ? "badge-high" : "badge-medium"}`}>{e.priority}</span>
                        <button type="button" className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 11 }} onClick={() => setViewEscalation(e)}><Eye size={12} /> View</button>
                      </div>
                    ))}
                  </div>
                  <button type="button" className="btn btn-ghost" style={{ marginTop: "var(--spacing-3)" }} onClick={() => setNavItem("escalations")}>
                    View all escalations <ChevronRight size={14} />
                  </button>
                </Card>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-6)", marginTop: "var(--spacing-6)" }}>
                <Card title="Queue Monitor" sub="Customers waiting per principal">
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
                    {QUEUES.map((q) => (
                      <div key={q.principal} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "var(--spacing-3)" }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                            <span style={{ fontSize: 13, fontWeight: 500 }}>{q.principal}</span>
                            <span style={{ fontSize: 12, fontWeight: 500, color: q.waiting > 7 ? "var(--color-error-color)" : "var(--color-on-surface-color)" }}>{q.waiting} waiting</span>
                          </div>
                          <div className="progress-bar-track">
                            <div className="progress-bar-fill" style={{ width: `${q.depth}%`, backgroundColor: q.waiting > 7 ? "var(--color-error-color)" : "var(--color-primary-color)" }} />
                          </div>
                        </div>
                        <span style={{ fontSize: 11, color: "var(--color-on-surface-variant-color)", width: 84, textAlign: "right" }}>avg {q.avgWait}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card title="Quality Snapshot" sub="Last 5 scored items">
                  {qaItems.filter((i) => i.score !== null).length === 0 ? (
                    <p style={{ fontSize: 13, color: "var(--color-on-surface-variant-color)", margin: 0, padding: "12px 0" }}>No rated items yet - start scoring in QA Review.</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
                      {qaItems.filter((i) => i.score !== null).map((i) => (
                        <div key={i.id} style={{ display: "flex", alignItems: "center", gap: "var(--spacing-3)" }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: 13, fontWeight: 500, margin: 0 }}>{i.agent}</p>
                            <p style={{ fontSize: 11, color: "var(--color-on-surface-variant-color)", margin: 0 }}>{i.type} {i.id} &middot; {i.customer}</p>
                          </div>
                          <span className="badge badge-resolved">{i.score}/100</span>
                          <span className={`badge ${i.verdict === "Pass" ? "badge-resolved" : i.verdict === "Flag" ? "badge-waiting" : "badge-escalated"}`}>{i.verdict}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <button type="button" className="btn btn-ghost" style={{ marginTop: "var(--spacing-3)" }} onClick={() => setNavItem("qa")}>
                    Open QA Review <ChevronRight size={14} />
                  </button>
                </Card>
              </div>
            </>
          )}

          {/* ═══════════════ AGENTS ═══════════════ */}
          {navItem === "agents" && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "var(--spacing-3)", marginBottom: "var(--spacing-5)" }}>
                <div className="search-input-wrap" style={{ maxWidth: 320 }}>
                  <Search size={15} className="search-icon" />
                  <input type="text" placeholder="Search agents..." value={agentSearch} onChange={(e) => setAgentSearch(e.target.value)} />
                </div>
                <div style={{ display: "flex", gap: "var(--spacing-3)" }}>
                  <button className="btn btn-ghost" onClick={() => showToast("Assignee filter coming online with live data.")}><Filter size={14} /> Filter</button>
                  <button className="btn btn-primary" onClick={() => showToast("Invite flow opens when authentication is live.")}><UserPlus size={14} /> Add Agent</button>
                </div>
              </div>

              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Agent</th>
                      <th>Status</th>
                      <th>Principal</th>
                      <th>Calls Today</th>
                      <th>Open Tickets</th>
                      <th>CSAT</th>
                      <th>SLA</th>
                      <th>Quality</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(agentSearch
                      ? TEAM.filter((a) => a.name.toLowerCase().includes(agentSearch.toLowerCase()))
                      : TEAM
                    ).map((agent) => (
                      <tr key={agent.id}>
                        <td><AgentPill name={agent.name} initials={agent.initials} color={agent.color} /></td>
                        <td>{statusBadge(agent.status)}</td>
                        <td><PrincipalBadge principal={agent.principal} size={18} /></td>
                        <td><strong>{agent.callsToday}</strong></td>
                        <td><strong>{agent.tickets}</strong></td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <Star size={12} style={{ color: "#F68B1E", fill: "#F68B1E" }} />
                            <strong>{agent.csat}</strong>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)", minWidth: 100 }}>
                            <div className="progress-bar-track" style={{ flex: 1 }}>
                              <div className="progress-bar-fill" style={{ width: `${agent.sla}%`, backgroundColor: agent.sla >= 95 ? "#00875A" : agent.sla >= 90 ? "#F68B1E" : "var(--color-error-color)" }} />
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 500, width: 36 }}>{agent.sla}%</span>
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${agent.quality >= 85 ? "badge-resolved" : agent.quality >= 70 ? "badge-waiting" : "badge-escalated"}`}>{agent.quality}</span>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "var(--spacing-2)" }}>
                            <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 11 }} onClick={() => showToast(`Opening ${agent.name}'s profile.`)}><Eye size={12} /> View</button>
                            <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 11 }} onClick={() => { setNavItem("qa"); }}><Star size={12} /> Coach</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: "var(--spacing-6)" }}>
                <Card title="Workload Assignment" sub="Balance incoming work across the team">
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "var(--spacing-4)" }}>
                    {activeAgents.map((a) => (
                      <div key={a.id} style={{ padding: "var(--spacing-4)", border: "1px solid var(--color-outline-variant-color)", borderRadius: "var(--radius-md)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)", marginBottom: "var(--spacing-3)" }}>
                          <AgentPill name={a.name} initials={a.initials} color={a.color} size={28} />
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: 12, color: "var(--color-on-surface-variant-color)" }}>Workload</span>
                          <span style={{ fontSize: 12, fontWeight: 500 }}>{a.workload} active</span>
                        </div>
                        <div className="progress-bar-track">
                          <div className="progress-bar-fill" style={{ width: `${Math.min(100, (a.workload / 10) * 100)}%`, backgroundColor: a.workload >= 7 ? "#F68B1E" : a.workload >= 9 ? "var(--color-error-color)" : "var(--color-primary-color)" }} />
                        </div>
                        <button className="btn btn-ghost" style={{ width: "100%", marginTop: "var(--spacing-3)", padding: "6px 10px", fontSize: 12 }} onClick={() => showToast(`Work assigned to ${a.name}.`)}>
                          <Zap size={13} /> Assign Work
                        </button>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </>
          )}

          {/* ═══════════════ QUEUES ═══════════════ */}
          {navItem === "queues" && (
            <>
              <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
                {QUEUES.map((q) => (
                  <div className="kpi-card" key={q.principal}>
                    <p className="kpi-label">{q.principal}</p>
                    <p className="kpi-value" style={{ color: q.waiting > 7 ? "var(--color-error-color)" : "var(--color-on-surface-color)" }}>{q.waiting}</p>
                    <p className="kpi-meta">customers waiting · {q.staffed} staffed</p>
                  </div>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-6)", marginTop: "var(--spacing-6)" }}>
                <Card title="Queue Depth" sub="Waiting vs staffed capacity">
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-5)" }}>
                    {QUEUES.map((q) => (
                      <div key={q.principal}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                          <span style={{ fontSize: 13, fontWeight: 500 }}>{q.principal}</span>
                          <span style={{ fontSize: 13, fontWeight: 500 }}>{q.depth}%</span>
                        </div>
                        <div className="progress-bar-track">
                          <div className="progress-bar-fill" style={{ width: `${q.depth}%`, backgroundColor: PRINCIPAL_COLORS[q.principal] || "var(--color-primary-color)" }} />
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                          <span style={{ fontSize: 11, color: "var(--color-on-surface-variant-color)" }}>Avg wait {q.avgWait}</span>
                          <span style={{ fontSize: 11, color: q.longest.startsWith("4") || q.longest.startsWith("5") ? "var(--color-error-color)" : "var(--color-on-surface-variant-color)" }}>Longest {q.longest}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card title="Staffing" sub="Adjust staffed specialists per principal">
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
                    {QUEUES.map((q) => (
                      <div key={q.principal} style={{ display: "flex", alignItems: "center", gap: "var(--spacing-3)" }}>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 13, fontWeight: 500, margin: 0 }}>{q.principal}</p>
                          <p style={{ fontSize: 11, color: "var(--color-on-surface-variant-color)", margin: 0 }}>{q.staffed} staffed</p>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)" }}>
                          <button className="icon-btn" onClick={() => showToast(`Decreased staffing on ${q.principal}.`)}>−</button>
                          <span style={{ width: 24, textAlign: "center", fontWeight: 500 }}>{q.staffed}</span>
                          <button className="icon-btn" onClick={() => showToast(`Increased staffing on ${q.principal}.`)}>+</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p style={{ fontSize: 12, color: "var(--color-on-surface-variant-color)", margin: 0 }}>Staffing changes here flow to the queue router in real time once live.</p>
                </Card>
              </div>
            </>
          )}

          {/* ═══════════════ LIVE MONITOR ═══════════════ */}
          {navItem === "live" && (
            <>
              <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
                <div className="kpi-card"><p className="kpi-label">Live Calls</p><p className="kpi-value" style={{ color: "#00875A" }}>{LIVE_CALLS.length}</p><p className="kpi-meta">in progress now</p></div>
                <div className="kpi-card"><p className="kpi-label">On Hold</p><p className="kpi-value">{LIVE_CALLS.filter((c) => c.hold).length}</p><p className="kpi-meta">customers waiting</p></div>
                <div className="kpi-card"><p className="kpi-label">Avg Talk Ratio</p><p className="kpi-value">{Math.round(LIVE_CALLS.reduce((a, c) => a + c.talkPct, 0) / LIVE_CALLS.length)}%</p><p className="kpi-meta">target 60-80%</p></div>
                <div className="kpi-card"><p className="kpi-label">Escalated Now</p><p className="kpi-value" style={{ color: "var(--color-error-color)" }}>{LIVE_CALLS.filter((c) => c.escalated).length}</p><p className="kpi-meta">require attention</p></div>
              </div>

              <div className="table-container" style={{ marginTop: "var(--spacing-6)" }}>
                <table>
                  <thead>
                    <tr>
                      <th>Agent</th>
                      <th>Principal</th>
                      <th>Customer</th>
                      <th>Duration</th>
                      <th>Talk Ratio</th>
                      <th>State</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {LIVE_CALLS.map((c) => (
                      <tr key={c.id}>
                        <td>
                          {(() => { const a = TEAM.find((x) => x.name === c.agent); return a ? <AgentPill name={a.name} initials={a.initials} color={a.color} /> : c.agent; })()}
                        </td>
                        <td><PrincipalBadge principal={c.principal} size={18} /></td>
                        <td>{c.customer}</td>
                        <td>{c.duration}</td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)", minWidth: 110 }}>
                            <div className="progress-bar-track" style={{ flex: 1 }}>
                              <div className="progress-bar-fill" style={{ width: `${c.talkPct}%`, backgroundColor: c.talkPct >= 60 && c.talkPct <= 80 ? "var(--color-primary-color)" : "#F68B1E" }} />
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 500, width: 30 }}>{c.talkPct}%</span>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 6 }}>
                            {c.hold ? <span className="badge badge-waiting"><Pause size={11} /> Hold</span> : <span className="badge badge-resolved"><Play size={11} /> Live</span>}
                            {c.escalated && <span className="badge badge-escalated"><Flag size={11} /> Escalated</span>}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "var(--spacing-2)" }}>
                            <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 11 }} onClick={() => showToast(`Whisper to ${c.agent}...`)}><Volume2 size={12} /> Whisper</button>
                            <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 11 }} onClick={() => showToast(`Barging in on ${c.agent}'s call.`)}><Mic size={12} /> Barge</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: "var(--spacing-6)" }}>
                <Card title="Live Coaching Suggestions" sub="AI-assisted, requires your confirmation before sending">
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
                    {AI_INSIGHTS.filter((i) => i.type === "Coaching Tip").map((i) => (
                      <div key={i.id} style={{ display: "flex", alignItems: "center", gap: "var(--spacing-3)", padding: "12px", border: "1px solid var(--color-outline-variant-color)", borderRadius: "var(--radius-md)" }}>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 13, fontWeight: 500, margin: 0 }}>{i.agent}</p>
                          <p style={{ fontSize: 12, color: "var(--color-on-surface-variant-color)", margin: 0 }}>{i.text}</p>
                        </div>
                        <button className="btn btn-primary" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => showToast(`Coaching tip sent to ${i.agent}.`)}>Send Tip</button>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </>
          )}

          {/* ═══════════════ QA REVIEW ═══════════════ */}
          {navItem === "qa" && (
            <>
              <div className="tabs">
                {(["Call", "Ticket"] as const).map((t) => (
                  <button key={t} className={`tab ${qaTab === t ? "active" : ""}`} onClick={() => setQaTab(t)}>{t} QA</button>
                ))}
              </div>

              <div style={{ marginTop: "var(--spacing-5)" }}>
                <Card title={`${qaTab} QA Queue`} sub={`${queuedQa.length} item(s) awaiting review`} action={queuedQa.length > 0 ? <CountChip n={queuedQa.length} tone="warn" /> : undefined}>
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Ref</th>
                          <th>Type</th>
                          <th>Agent</th>
                          <th>Principal</th>
                          <th>Customer</th>
                          <th>Status</th>
                          <th>Score</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {qaItems.filter((i) => i.type === qaTab).map((i) => (
                          <tr key={i.id} style={i.score === null ? { backgroundColor: "var(--color-surface-container-low-color)" } : undefined}>
                            <td><span style={{ fontWeight: 500, color: "var(--color-primary-color)" }}>{i.id}</span></td>
                            <td>{i.type}</td>
                            <td>{i.agent}</td>
                            <td><PrincipalBadge principal={i.principal} size={18} /></td>
                            <td>{i.customer}</td>
                            <td><span className={`badge ${statusOf(i) === "Queued" ? "badge-waiting" : "badge-resolved"}`}>{statusOf(i)}</span></td>
                            <td>{i.score === null ? "—" : <strong>{i.score}/100</strong>}</td>
                            <td>
                              <div style={{ display: "flex", gap: "var(--spacing-2)" }}>
                                {i.score === null ? (
                                  <>
                                    <button className="btn btn-primary" style={{ padding: "4px 10px", fontSize: 11 }} onClick={() => openScore(i)}><Star size={12} /> Score</button>
                                    <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 11 }} onClick={() => showToast(`Opened ${i.id} transcript.`)}><FileText size={12} /> View</button>
                                  </>
                                ) : (
                                  <>
                                    <span className={`badge ${i.verdict === "Pass" ? "badge-resolved" : i.verdict === "Flag" ? "badge-waiting" : "badge-escalated"}`}>{i.verdict}</span>
                                    <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 11 }} onClick={() => openScore(i)}>Re-score</button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                        {qaItems.filter((i) => i.type === qaTab).length === 0 && (
                          <tr><td colSpan={8} style={{ textAlign: "center", color: "var(--color-on-surface-variant-color)", padding: "24px" }}>No {qaTab.toLowerCase()} QA items in this principal view.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </Card>

                <Card title="Quality History" sub="Recent scores across the team" >
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
                    {qaItems.filter((i) => i.score !== null).map((i) => (
                      <div key={i.id} style={{ display: "flex", alignItems: "center", gap: "var(--spacing-3)" }}>
                        <div style={{ width: 120 }}><span style={{ fontSize: 12, color: "var(--color-on-surface-variant-color)" }}>{i.type} {i.id}</span></div>
                        <div style={{ flex: 1 }}>
                          <div className="progress-bar-track">
                            <div className="progress-bar-fill" style={{ width: `${i.score}%`, backgroundColor: (i.score ?? 0) >= 80 ? "#00875A" : (i.score ?? 0) >= 60 ? "#F68B1E" : "var(--color-error-color)" }} />
                          </div>
                        </div>
                        <strong style={{ width: 40, textAlign: "right" }}>{i.score}</strong>
                        <span className={`badge ${i.verdict === "Pass" ? "badge-resolved" : i.verdict === "Flag" ? "badge-waiting" : "badge-escalated"}`}>{i.verdict}</span>
                        <button className="btn btn-ghost" style={{ padding: "4px 8px", fontSize: 11 }} onClick={() => showToast(`Coaching note for ${i.agent} saved.`)}><GraduationCap size={12} /> Coach</button>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </>
          )}

          {/* ═══════════════ ESCALATIONS ═══════════════ */}
          {navItem === "escalations" && (
            <Card title="Active Escalations" sub="Calls and tickets flagged for a supervisor" action={<CountChip n={openEscalations.length} tone="error" />}>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Ref</th>
                      <th>Principal</th>
                      <th>Agent</th>
                      <th>Customer</th>
                      <th>Reason</th>
                      <th>Priority</th>
                      <th>Raised</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {escalations.map((e) => (
                      <tr key={e.id}>
                        <td><span style={{ fontWeight: 500, color: "var(--color-primary-color)" }}>{e.id}</span></td>
                        <td><PrincipalBadge principal={e.principal} size={18} /></td>
                        <td>{e.agent}</td>
                        <td>{e.customer}</td>
                        <td style={{ maxWidth: 240 }}>{e.reason}</td>
                        <td><span className={`badge ${e.priority === "Critical" || e.priority === "High" ? "badge-high" : "badge-medium"}`}>{e.priority}</span></td>
                        <td style={{ color: "var(--color-on-surface-variant-color)" }}>{e.raised}</td>
                        <td>
                          <span className={`badge ${e.status === "Resolved" ? "badge-resolved" : e.status === "Assigned" ? "badge-in-progress" : "badge-escalated"}`}>{e.status}</span>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: "var(--spacing-2)" }}>
                            <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 11 }} onClick={() => setViewEscalation(e)}><Eye size={12} /> View</button>
                            {e.status !== "Resolved" && (
                              <button className="btn btn-primary" style={{ padding: "4px 10px", fontSize: 11 }} onClick={() => toggleEscalation(e.id)}>
                                {e.status === "Open" ? "Assign me" : "Mark Resolved"}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* ═══════════════ SLA MONITOR ═══════════════ */}
          {navItem === "sla" && (
            <>
              <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
                {SLA_PRINCIPALS.map((s) => (
                  <div className="kpi-card" key={s.principal}>
                    <p className="kpi-label">{s.principal}</p>
                    <p className="kpi-value" style={{ color: s.compliance >= 95 ? "#00875A" : s.compliance >= 90 ? "#F68B1E" : "var(--color-error-color)" }}>{s.compliance}%</p>
                    <p className="kpi-meta">{s.atRisk} at risk · {s.abandoned} abandoned</p>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: "var(--spacing-6)" }}>
                <Card title="SLA Compliance by Principal" sub="Target is 95% for every principal">
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-5)" }}>
                    {SLA_PRINCIPALS.map((s) => (
                      <div key={s.principal}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                          <span style={{ fontSize: 13, fontWeight: 500 }}>{s.principal}</span>
                          <span style={{ fontSize: 13, fontWeight: 500, color: s.compliance >= 95 ? "#00875A" : s.compliance >= 90 ? "#F68B1E" : "var(--color-error-color)" }}>{s.compliance}% / {s.target}%</span>
                        </div>
                        <div className="progress-bar-track">
                          <div className="progress-bar-fill" style={{ width: `${Math.min(100, s.compliance)}%`, backgroundColor: s.compliance >= 95 ? "#00875A" : s.compliance >= 90 ? "#F68B1E" : "var(--color-error-color)" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              <div style={{ marginTop: "var(--spacing-6)" }}>
                <Card title="At-Risk Items" sub="Breaching or close to breaching SLA">
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
                    {onCallAgents.map((a) => (
                      <div key={a.id} style={{ display: "flex", alignItems: "center", gap: "var(--spacing-3)", padding: "12px", border: "1px solid var(--color-outline-variant-color)", borderRadius: "var(--radius-md)" }}>
                        <AlertTriangle size={15} style={{ color: "#F68B1E" }} />
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 13, fontWeight: 500, margin: 0 }}>{a.name}</p>
                          <p style={{ fontSize: 11, color: "var(--color-on-surface-variant-color)", margin: 0 }}>{a.principal} · call running {a.onCallFor}</p>
                        </div>
                        <span className="badge badge-waiting">Watch</span>
                        <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 11 }} onClick={() => { setNavItem("live"); }}><Eye size={12} /> Monitor</button>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </>
          )}

          {/* ═══════════════ KNOWLEDGE BASE ═══════════════ */}
          {navItem === "kb" && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "var(--spacing-3)", marginBottom: "var(--spacing-5)" }}>
                <div className="search-input-wrap" style={{ maxWidth: 320 }}>
                  <Search size={15} className="search-icon" />
                  <input type="text" placeholder="Search articles..." />
                </div>
                <button className="btn btn-primary" onClick={() => showToast("New article editor opens when content management is live.")}><FileText size={14} /> New Article</button>
              </div>

              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Article</th>
                      <th>Category</th>
                      <th>Principal</th>
                      <th>Status</th>
                      <th>Updated</th>
                      <th>Views</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {KB_ARTICLES.map((a) => (
                      <tr key={a.id}>
                        <td><span style={{ fontWeight: 500 }}>{a.title}</span></td>
                        <td>{a.category}</td>
                        <td><PrincipalBadge principal={a.principal} size={18} /></td>
                        <td><span className={`badge ${a.status === "Published" ? "badge-resolved" : a.status === "Draft" ? "badge-waiting" : "badge-closed"}`}>{a.status}</span></td>
                        <td style={{ color: "var(--color-on-surface-variant-color)" }}>{a.updated}</td>
                        <td>{a.views.toLocaleString()}</td>
                        <td>
                          <div style={{ display: "flex", gap: "var(--spacing-2)" }}>
                            <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 11 }} onClick={() => showToast(`Previewing "${a.title}".`)}><Eye size={12} /> View</button>
                            <button className="btn btn-ghost" style={{ padding: "4px 10px", fontSize: 11 }} onClick={() => showToast("Edited in the article editor.")}><FileText size={12} /> Edit</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ═══════════════ AI SUPERVISION ═══════════════ */}
          {navItem === "ai" && (
            <>
              <Card title="AI Supervision" sub="Model-detected signals. Nothing is actioned without your review." action={<CountChip n={AI_INSIGHTS.filter((i) => i.status === "New").length} tone="error" />}>
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
                  {AI_INSIGHTS.map((i) => (
                    <div key={i.id} style={{ display: "flex", alignItems: "center", gap: "var(--spacing-3)", padding: "14px", border: "1px solid var(--color-outline-variant-color)", borderRadius: "var(--radius-md)" }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: i.severity === "Critical" ? "var(--color-error-container-color)" : i.severity === "High" ? "#fdf1e0" : "var(--color-surface-container-high-color)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <BrainCircuit size={18} style={{ color: i.severity === "Critical" ? "var(--color-error-color)" : i.severity === "High" ? "#F68B1E" : "var(--color-primary-color)" }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)", flexWrap: "wrap" }}>
                          <span className="badge badge-in-progress">{i.type}</span>
                          <span className={`badge ${i.severity === "Critical" ? "badge-escalated" : i.severity === "High" ? "badge-high" : "badge-medium"}`}>{i.severity}</span>
                          <span style={{ fontSize: 12, fontWeight: 500 }}>{i.agent}</span>
                          {i.status === "New" && <span className="badge badge-open">New</span>}
                        </div>
                        <p style={{ fontSize: 12, color: "var(--color-on-surface-variant-color)", margin: "6px 0 0", lineHeight: 1.5 }}>{i.text}</p>
                        <p style={{ fontSize: 11, color: "var(--color-primary-color)", margin: "4px 0 0" }}>{i.action}</p>
                      </div>
                      <button className="btn btn-ghost" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => showToast(`Insight reviewed - ${i.action}.`)}><CheckCircle size={13} /> Review</button>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}

          {/* ═══════════════ REPORTS ═══════════════ */}
          {navItem === "reports" && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "var(--spacing-3)", marginBottom: "var(--spacing-5)" }}>
                <div style={{ display: "flex", gap: "var(--spacing-3)" }}>
                  <button className="btn btn-ghost" onClick={() => showToast("Weekly report range selected.")}>Weekly</button>
                  <button className="btn btn-ghost" onClick={() => showToast("Monthly report range selected.")}>Monthly</button>
                </div>
                <button className="btn btn-primary" onClick={() => showToast("Report exported as PDF (mock).")}><Download size={14} /> Export</button>
              </div>

              <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
                <div className="kpi-card"><p className="kpi-label">Team Quality</p><p className="kpi-value" style={{ color: "#00875A" }}>84</p><p className="kpi-meta">+6 vs W4</p></div>
                <div className="kpi-card"><p className="kpi-label">Avg CSAT</p><p className="kpi-value">4.6</p><p className="kpi-meta" style={{ color: "#00875A" }}>+0.1 vs W4</p></div>
                <div className="kpi-card"><p className="kpi-label">Total Calls</p><p className="kpi-value">235</p><p className="kpi-meta">+7 vs W4</p></div>
                <div className="kpi-card"><p className="kpi-label">Avg ACW</p><p className="kpi-value" style={{ color: "#F68B1E" }}>2m 48s</p><p className="kpi-meta">target 2m 30s</p></div>
              </div>

              <div style={{ marginTop: "var(--spacing-6)" }}>
                <Card title="Team Performance Trend" sub="Last 5 weeks">
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "var(--spacing-4)", alignItems: "end" }}>
                    {REPORTS_WEEKLY.map((w) => (
                      <div key={w.week} style={{ textAlign: "center" }}>
                        <p style={{ fontSize: 11, color: "var(--color-on-surface-variant-color)", margin: 0 }}>Quality {w.quality}</p>
                        <div style={{ height: 120, display: "flex", alignItems: "flex-end", justifyContent: "center", margin: "8px 0" }}>
                          <div style={{ width: "60%", height: `${w.quality}%`, borderRadius: "6px 6px 0 0", backgroundColor: w.quality >= 80 ? "#00875A" : w.quality >= 70 ? "var(--color-primary-color)" : "#F68B1E" }} title={`${w.week} quality ${w.quality}`} />
                        </div>
                        <p style={{ fontSize: 12, fontWeight: 500, margin: 0 }}>{w.week}</p>
                        <p style={{ fontSize: 11, color: "var(--color-on-surface-variant-color)", margin: 0 }}>{w.calls} calls</p>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              <div style={{ marginTop: "var(--spacing-6)" }}>
                <Card title="Individual Performance" sub="Overview for the current week">
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th>Agent</th>
                          <th>Calls</th>
                          <th>Tickets</th>
                          <th>CSAT</th>
                          <th>Quality</th>
                          <th>SLA</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {TEAM.map((a) => (
                          <tr key={a.id}>
                            <td><AgentPill name={a.name} initials={a.initials} color={a.color} /></td>
                            <td><strong>{a.callsToday}</strong></td>
                            <td><strong>{a.tickets}</strong></td>
                            <td><strong>{a.csat}</strong></td>
                            <td><span className={`badge ${a.quality >= 85 ? "badge-resolved" : a.quality >= 70 ? "badge-waiting" : "badge-escalated"}`}>{a.quality}</span></td>
                            <td>{a.sla}%</td>
                            <td>{statusBadge(a.status)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            </>
          )}
        </main>
      </div>

      {/* ── QA Scorecard Modal ── */}
      {scoreItem && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.45)", zIndex: 1400, display: "flex", alignItems: "center", justifyContent: "center", padding: "var(--spacing-6)" }} onClick={() => setScoreItem(null)}>
          <div className="card" style={{ maxWidth: 560, width: "100%", maxHeight: "80vh", overflowY: "auto", margin: 0 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--spacing-4)" }}>
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>Score {scoreItem.type} {scoreItem.id}</h3>
                <p style={{ fontSize: 12, color: "var(--color-on-surface-variant-color)", margin: "2px 0 0" }}>{scoreItem.agent} &middot; <PrincipalBadge principal={scoreItem.principal} size={14} /></p>
              </div>
              <button className="icon-btn" onClick={() => setScoreItem(null)}><XCircle size={16} /></button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
              {scoreItem.categories.map((c) => {
                const val = scores[c.name] ?? 0;
                return (
                  <div key={c.name}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{c.name} <span style={{ color: "var(--color-on-surface-variant-color)", fontWeight: 400 }}>({c.weight}%)</span></span>
                      <span style={{ fontSize: 13, fontWeight: 500 }}>{val}</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={5}
                      value={val}
                      onChange={(e) => setScores((s) => ({ ...s, [c.name]: Number(e.target.value) }))}
                      style={{ width: "100%" }}
                    />
                  </div>
                );
              })}

              <div style={{ display: "flex", justifyContent: "space-between", padding: "var(--spacing-3)", borderRadius: "var(--radius-md)", backgroundColor: "var(--color-surface-container-low-color)" }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>Overall Score</span>
                <strong style={{ fontSize: 18 }}>{Math.round((scoreItem.categories.reduce((a, c) => a + (scores[c.name] ?? 0), 0)) / scoreItem.categories.length)}/100</strong>
              </div>

              <div>
                <label className="form-label">Coaching Note (optional)</label>
                <textarea
                  value={coachingNote}
                  onChange={(e) => setCoachingNote(e.target.value)}
                  rows={3}
                  placeholder="Private note to the specialist..."
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid var(--color-outline-variant-color)", borderRadius: 8, fontSize: 13, outline: "none", resize: "vertical" }}
                />
              </div>

              <div style={{ display: "flex", gap: 8, justifyContent: "flex-start" }}>
                <button className="btn btn-primary" onClick={saveScore}>Submit Score</button>
                <button className="btn btn-ghost" onClick={() => setScoreItem(null)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Escalation Detail Modal ── */}
      {viewEscalation && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.45)", zIndex: 1400, display: "flex", alignItems: "center", justifyContent: "center", padding: "var(--spacing-6)" }} onClick={() => setViewEscalation(null)}>
          <div className="card" style={{ maxWidth: 560, width: "100%", maxHeight: "80vh", overflowY: "auto", margin: 0 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--spacing-4)" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)", marginBottom: 4 }}>
                  <h3 style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>Escalation {viewEscalation.id}</h3>
                  <span className={`badge ${viewEscalation.status === "Resolved" ? "badge-resolved" : viewEscalation.status === "Assigned" ? "badge-in-progress" : "badge-escalated"}`}>{viewEscalation.status}</span>
                </div>
<div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--color-on-surface-variant-color)", margin: 0 }}>
  {viewEscalation.customer} &middot; <PrincipalBadge principal={viewEscalation.principal} size={14} /> &middot; Raised {viewEscalation.raised}
</div>
              </div>
              <button className="icon-btn" onClick={() => setViewEscalation(null)}><XCircle size={16} /></button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-3) var(--spacing-5)", marginBottom: "var(--spacing-4)", fontSize: 13 }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 500, color: "var(--color-on-surface-variant-color)", margin: "0 0 2px" }}>Agent</p>
                <p style={{ margin: 0, fontWeight: 500 }}>{viewEscalation.agent}</p>
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 500, color: "var(--color-on-surface-variant-color)", margin: "0 0 2px" }}>Priority</p>
                <span className={`badge ${viewEscalation.priority === "Critical" || viewEscalation.priority === "High" ? "badge-high" : "badge-medium"}`} style={{ margin: 0 }}>{viewEscalation.priority}</span>
              </div>
            </div>

            <div style={{ marginBottom: "var(--spacing-4)" }}>
              <p style={{ fontSize: 11, fontWeight: 500, color: "var(--color-on-surface-variant-color)", margin: "0 0 2px" }}>Reason</p>
              <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>{viewEscalation.reason}</p>
            </div>

            <div style={{ padding: "var(--spacing-4)", borderRadius: "var(--radius-md)", backgroundColor: "var(--color-surface-container-low-color)" }}>
              <p style={{ fontSize: 11, fontWeight: 500, color: "var(--color-on-surface-variant-color)", margin: "0 0 6px" }}>Details</p>
              <p style={{ fontSize: 13, margin: 0, lineHeight: 1.55 }}>{viewEscalation.details}</p>
            </div>

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: "var(--spacing-5)" }}>
              <button className="btn btn-ghost" onClick={() => setViewEscalation(null)}>Close</button>
              {viewEscalation.status !== "Resolved" && (
                <button className="btn btn-primary" onClick={() => { toggleEscalation(viewEscalation.id); }}>{viewEscalation.status === "Open" ? "Assign me" : "Mark Resolved"}</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}