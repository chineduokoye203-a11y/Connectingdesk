"use client";

import React, { useState } from "react";
import {
  Headphones, LayoutDashboard, Building2, Users, BarChart2,
  Settings, Bell, Sun, Moon, ChevronDown, Search, Filter,
  Plus, TrendingUp, TrendingDown, Clock, CheckCircle,
  AlertTriangle, Star, Download, Calendar, MoreHorizontal,
} from "lucide-react";

const TICKETS = [
  { id: "T-1121", customer: "John Doe", type: "Billing Issue", agent: "Jane Doe", status: "In Progress", priority: "High", created: "10:24 AM", sla: "1h 30m", satisfaction: 4.5 },
  { id: "T-1122", customer: "Ada Okonkwo", type: "Delivery Delay", agent: "David Kim", status: "Open", priority: "Medium", created: "09:52 AM", sla: "3h 10m", satisfaction: null },
  { id: "T-1123", customer: "Emeka Chukwu", type: "Payment Failed", agent: "Amara Nwosu", status: "Escalated", priority: "High", created: "09:15 AM", sla: "OVERDUE", satisfaction: 2.5 },
  { id: "T-1124", customer: "Fatima Abubakar", type: "Product Damaged", agent: "Carlos Rivera", status: "Resolved", priority: "Low", created: "08:50 AM", sla: "—", satisfaction: 5.0 },
  { id: "T-1125", customer: "Dele Oduya", type: "Wrong Item", agent: "Priya Patel", status: "Waiting", priority: "Medium", created: "08:30 AM", sla: "4h 00m", satisfaction: null },
];

const AGENTS = [
  { name: "Jane Doe", calls: 14, resolved: 12, csat: 4.8, sla: 98, earnings: "$140.00" },
  { name: "David Kim", calls: 11, resolved: 9, csat: 4.5, sla: 94, earnings: "$110.00" },
  { name: "Amara Nwosu", calls: 9, resolved: 7, csat: 4.2, sla: 90, earnings: "$90.00" },
  { name: "Carlos Rivera", calls: 16, resolved: 15, csat: 4.9, sla: 99, earnings: "$160.00" },
];

export default function AdminDashboard() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [navItem, setNavItem] = useState("overview");
  const [activeTab, setActiveTab] = useState("tickets");

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
  };

  return (
    <div className="app-shell" data-theme={theme}>
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Headphones size={24} style={{ color: "var(--color-primary-color)" }} />
          <span className="sidebar-logo-text">Connectdesk</span>
        </div>

        <nav className="sidebar-nav">
          {[
            { id: "overview", label: "Overview", icon: <LayoutDashboard size={17} /> },
            { id: "company", label: "Company", icon: <Building2 size={17} /> },
            { id: "users", label: "Users", icon: <Users size={17} /> },
            { id: "reports", label: "Reports", icon: <BarChart2 size={17} /> },
            { id: "settings", label: "Settings", icon: <Settings size={17} /> },
          ].map((item) => (
            <button key={item.id} onClick={() => setNavItem(item.id)} className={`nav-item ${navItem === item.id ? "active" : ""}`}>
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: "var(--spacing-4) var(--spacing-2)", borderTop: "1px solid var(--color-outline-variant-color)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)" }}>
            <div className="avatar" style={{ width: 32, height: 32, fontSize: 12, backgroundColor: "#F68B1E" }}>CA</div>
            <div>
              <p style={{ fontWeight: 500, fontSize: "13px" }}>Chowdeck Admin</p>
              <p style={{ fontSize: "11px", color: "var(--color-on-surface-variant-color)" }}>Client Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <h2>Client Administration</h2>
            <p>Chowdeck — CUST-00142 — January 20, 2025</p>
          </div>
          <div className="topbar-right">
            <button className="icon-btn notification-dot"><Bell size={17} /></button>
            <div className="theme-toggle" onClick={toggleTheme} role="button" tabIndex={0}>
              <Sun size={15} style={{ color: theme === "light" ? "var(--color-primary-color)" : "var(--color-outline-color)" }} />
              <Moon size={15} style={{ color: theme === "dark" ? "var(--color-primary-color)" : "var(--color-outline-color)" }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)" }}>
              <div className="avatar" style={{ backgroundColor: "#F68B1E" }}>CA</div>
              <div>
                <p style={{ fontWeight: 500, fontSize: "14px" }}>Chowdeck Admin</p>
                <p style={{ fontSize: "11px", color: "var(--color-on-surface-variant-color)" }}>Client Administrator</p>
              </div>
              <ChevronDown size={14} />
            </div>
          </div>
        </header>

        <main className="page-content">
          {/* KPI row */}
          <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
            <div className="kpi-card">
              <p className="kpi-label">Total Tickets</p>
              <p className="kpi-value">247</p>
              <p className="kpi-meta" style={{ display: "flex", alignItems: "center", gap: "4px", color: "#00875A" }}>
                <TrendingUp size={12} /> +8% vs last week
              </p>
            </div>
            <div className="kpi-card">
              <p className="kpi-label">Avg CSAT</p>
              <p className="kpi-value">4.5</p>
              <div className="kpi-meta" style={{ display: "flex", alignItems: "center", gap: "4px", color: "#00875A" }}>
                <TrendingUp size={12} /> 0.3 improvement
              </div>
            </div>
            <div className="kpi-card">
              <p className="kpi-label">SLA Compliance</p>
              <p className="kpi-value">92%</p>
              <p className="kpi-meta" style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--color-error-color)" }}>
                <TrendingDown size={12} /> 3% below target
              </p>
            </div>
            <div className="kpi-card">
              <p className="kpi-label">Escalations</p>
              <p className="kpi-value" style={{ color: "var(--color-error-color)" }}>5</p>
              <p className="kpi-meta" style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--color-error-color)" }}>
                <AlertTriangle size={12} /> Needs attention
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="tabs">
            {["tickets", "agents", "sla"].map((t) => (
              <button key={t} className={`tab ${activeTab === t ? "active" : ""}`} onClick={() => setActiveTab(t)}>
                {t === "tickets" ? "Ticket Overview" : t === "agents" ? "Agent Performance" : "SLA Compliance"}
              </button>
            ))}
          </div>

          {/* Ticket table */}
          {activeTab === "tickets" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--spacing-4)" }}>
                <div className="search-input-wrap" style={{ maxWidth: 320 }}>
                  <Search size={15} className="search-icon" />
                  <input type="text" placeholder="Search tickets..." />
                </div>
                <div style={{ display: "flex", gap: "var(--spacing-3)" }}>
                  <button className="btn btn-ghost" style={{ fontSize: "13px" }}>
                    <Filter size={13} /> Filter
                  </button>
                  <button className="btn btn-ghost" style={{ fontSize: "13px" }}>
                    <Calendar size={13} /> Date Range
                  </button>
                  <button className="btn btn-ghost" style={{ fontSize: "13px" }}>
                    <Download size={13} /> Export
                  </button>
                </div>
              </div>

              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Ticket ID</th>
                      <th>Customer</th>
                      <th>Type</th>
                      <th>Agent</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>SLA</th>
                      <th>CSAT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TICKETS.map((t) => (
                      <tr key={t.id}>
                        <td><span style={{ fontWeight: 500, color: "var(--color-primary-color)" }}>{t.id}</span></td>
                        <td>{t.customer}</td>
                        <td style={{ color: "var(--color-on-surface-variant-color)" }}>{t.type}</td>
                        <td>{t.agent}</td>
                        <td>
                          <span className={`badge ${
                            t.status === "Open" ? "badge-open" :
                            t.status === "In Progress" ? "badge-in-progress" :
                            t.status === "Escalated" ? "badge-escalated" :
                            t.status === "Resolved" ? "badge-resolved" :
                            "badge-waiting"
                          }`}>{t.status}</span>
                        </td>
                        <td><span className={`badge badge-${t.priority.toLowerCase()}`}>{t.priority}</span></td>
                        <td style={{ color: t.sla === "OVERDUE" ? "var(--color-error-color)" : "var(--color-on-surface-color)", fontWeight: t.sla === "OVERDUE" ? 600 : 400 }}>
                          {t.sla === "OVERDUE" ? <><AlertTriangle size={12} style={{ verticalAlign: "middle" }} /> OVERDUE</> : t.sla}
                        </td>
                        <td>
                          {t.satisfaction ? (
                            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                              <Star size={12} style={{ color: "#F68B1E", fill: "#F68B1E" }} />
                              <strong>{t.satisfaction}</strong>
                            </div>
                          ) : <span style={{ color: "var(--color-outline-color)" }}>—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Agent performance tab */}
          {activeTab === "agents" && (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Agent</th>
                    <th>Total Calls</th>
                    <th>Resolved</th>
                    <th>CSAT</th>
                    <th>SLA</th>
                    <th>Earnings</th>
                  </tr>
                </thead>
                <tbody>
                  {AGENTS.map((a) => (
                    <tr key={a.name}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)" }}>
                          <div className="avatar" style={{ width: 30, height: 30, fontSize: 11 }}>
                            {a.name.split(" ").map(n => n[0]).join("")}
                          </div>
                          <strong>{a.name}</strong>
                        </div>
                      </td>
                      <td>{a.calls}</td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          {a.resolved}
                          <span style={{ fontSize: "11px", color: "#00875A" }}>({Math.round((a.resolved / a.calls) * 100)}%)</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <Star size={12} style={{ color: "#F68B1E", fill: "#F68B1E" }} />
                          <strong>{a.csat}</strong>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)" }}>
                          <div className="progress-bar-track" style={{ flex: 1, maxWidth: 80 }}>
                            <div className="progress-bar-fill" style={{ width: `${a.sla}%`, backgroundColor: a.sla >= 95 ? "#00875A" : a.sla >= 90 ? "#F68B1E" : "var(--color-error-color)" }} />
                          </div>
                          <span style={{ fontSize: "12px", fontWeight: 500 }}>{a.sla}%</span>
                        </div>
                      </td>
                      <td><strong style={{ color: "#00875A" }}>{a.earnings}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* SLA tab */}
          {activeTab === "sla" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-6)" }}>
              {[
                { label: "First Response Time", target: "< 5 min", current: "3m 42s", status: "Compliant", pct: 88 },
                { label: "Resolution Time", target: "< 24 hours", current: "6h 15m", status: "Compliant", pct: 92 },
                { label: "Escalation Rate", target: "< 5%", current: "7.2%", status: "Breach", pct: 72 },
                { label: "Customer Satisfaction", target: "≥ 4.5", current: "4.5", status: "Compliant", pct: 90 },
              ].map((sla) => (
                <div key={sla.label} className="card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--spacing-4)" }}>
                    <div>
                      <p style={{ fontWeight: 500, fontSize: "15px", marginBottom: "4px" }}>{sla.label}</p>
                      <p style={{ fontSize: "12px", color: "var(--color-on-surface-variant-color)" }}>Target: {sla.target}</p>
                    </div>
                    <span className={`badge ${sla.status === "Compliant" ? "badge-resolved" : "badge-escalated"}`}>
                      {sla.status === "Compliant" ? <CheckCircle size={11} /> : <AlertTriangle size={11} />}
                      {sla.status}
                    </span>
                  </div>
                  <p style={{ fontSize: "28px", fontWeight: 500, marginBottom: "var(--spacing-3)" }}>{sla.current}</p>
                  <div className="progress-bar-track">
                    <div className="progress-bar-fill" style={{ width: `${sla.pct}%`, backgroundColor: sla.status === "Compliant" ? "#00875A" : "var(--color-error-color)" }} />
                  </div>
                  <p style={{ fontSize: "11px", color: "var(--color-on-surface-variant-color)", marginTop: "4px" }}>{sla.pct}% of target met</p>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
