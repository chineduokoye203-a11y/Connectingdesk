import Link from "next/link";
import { Headphones, ArrowRight, ShieldCheck, Cpu, BarChart3, Users, BookOpen, Phone, MessageSquare, Mail } from "lucide-react";

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--color-background-color)" }}>
      {/* Nav */}
      <header style={{ borderBottom: "1px solid var(--color-outline-variant-color)", backgroundColor: "var(--color-surface-color)", padding: "0 var(--spacing-8)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-2)" }}>
            <Headphones size={28} style={{ color: "var(--color-primary-color)" }} />
            <span style={{ fontSize: "20px", fontWeight: 500 }}>Connectdesk</span>
          </div>
          <nav style={{ display: "flex", gap: "var(--spacing-3)" }}>
            <Link href="/login" className="btn btn-ghost" style={{ padding: "var(--spacing-2) var(--spacing-4)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-outline-variant-color)", fontSize: "14px", fontWeight: 500, color: "var(--color-on-surface-variant-color)", textDecoration: "none", display: "inline-flex", alignItems: "center" }}>Login</Link>
            <Link href="/agent" className="btn btn-primary" style={{ padding: "var(--spacing-2) var(--spacing-4)", borderRadius: "var(--radius-md)", backgroundColor: "var(--color-primary-color)", color: "#fff", fontSize: "14px", fontWeight: 500, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}>
              Go to App <ArrowRight size={15} />
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "var(--spacing-16) var(--spacing-8)", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 14px", borderRadius: "var(--radius-full)", backgroundColor: "var(--color-primary-container-color)", color: "var(--color-on-primary-container-color)", fontSize: "12px", fontWeight: 500, marginBottom: "var(--spacing-5)" }}>
          <Cpu size={13} /> AI-Assisted Platform
        </div>
        <h1 style={{ fontSize: "var(--font-display-medium-size)", fontWeight: 700, lineHeight: 1.1, marginBottom: "var(--spacing-5)", letterSpacing: "-2px" }}>
          Customer Support<br />
          <span style={{ color: "var(--color-primary-color)" }}>Outsourcing Platform</span>
        </h1>
        <p style={{ fontSize: "var(--font-body-large-size)", color: "var(--color-on-surface-variant-color)", maxWidth: 600, margin: "0 auto var(--spacing-8)", lineHeight: 1.7 }}>
          Connectdesk enables First Connect Edge specialists to deliver high-quality omnichannel customer support while integrating seamlessly with external client CRMs.
        </p>
        <div style={{ display: "flex", gap: "var(--spacing-4)", justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/agent" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "var(--spacing-4) var(--spacing-8)", backgroundColor: "var(--color-primary-color)", color: "#fff", borderRadius: "var(--radius-md)", fontWeight: 500, fontSize: "16px", textDecoration: "none", boxShadow: "var(--elevation-2)" }}>
            Agent Workspace <ArrowRight size={18} />
          </Link>
          <Link href="/supervisor" style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "var(--spacing-4) var(--spacing-8)", backgroundColor: "var(--color-surface-color)", color: "var(--color-on-surface-color)", borderRadius: "var(--radius-md)", fontWeight: 500, fontSize: "16px", border: "1px solid var(--color-outline-variant-color)", textDecoration: "none" }}>
            Supervisor Dashboard
          </Link>
        </div>
      </section>

      {/* Role cards */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "var(--spacing-12) var(--spacing-8)" }}>
        <h2 style={{ fontSize: "28px", fontWeight: 700, textAlign: "center", marginBottom: "var(--spacing-8)" }}>Platform Roles</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "var(--spacing-5)" }}>
          {[
            { href: "/agent", icon: <Phone size={24} />, label: "CRM Agent", desc: "Handle inbound/outbound calls, chat, email, and social messaging with AI assistance.", color: "var(--color-primary-color)" },
            { href: "/supervisor", icon: <ShieldCheck size={24} />, label: "Supervisor", desc: "Live monitoring, QA review, call scoring, agent coaching, and SLA management.", color: "var(--color-secondary-color)" },
            { href: "/admin", icon: <BarChart3 size={24} />, label: "Client Admin", desc: "Manage company users, SLA visibility, reports, knowledge base, and company settings.", color: "var(--color-tertiary-color)" },
            { href: "/messages", icon: <MessageSquare size={24} />, label: "Messages", desc: "Unified inbox for live chat, email, and social messaging across all principals.", color: "var(--color-error-color)" },
          ].map((item) => (
            <Link key={item.href} href={item.href} style={{ display: "block", padding: "var(--spacing-6)", backgroundColor: "var(--color-surface-color)", border: "1px solid var(--color-outline-variant-color)", borderRadius: "var(--radius-xl)", textDecoration: "none", transition: "all 0.15s ease" }}>
              <div style={{ width: 48, height: 48, borderRadius: "var(--radius-md)", backgroundColor: `${item.color}18`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "var(--spacing-4)", color: item.color }}>
                {item.icon}
              </div>
              <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "var(--spacing-2)", color: "var(--color-on-surface-color)" }}>{item.label}</h3>
              <p style={{ fontSize: "13px", color: "var(--color-on-surface-variant-color)", lineHeight: 1.6 }}>{item.desc}</p>
              <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "var(--spacing-4)", color: item.color, fontSize: "13px", fontWeight: 500 }}>
                Open <ArrowRight size={13} />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Feature highlights */}
      <section style={{ borderTop: "1px solid var(--color-outline-variant-color)", backgroundColor: "var(--color-surface-container-low-color)", padding: "var(--spacing-12) var(--spacing-8)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h2 style={{ fontSize: "24px", fontWeight: 700, textAlign: "center", marginBottom: "var(--spacing-8)" }}>Platform Capabilities</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "var(--spacing-5)" }}>
            {[
              { icon: <Cpu size={20} />, label: "AI-Assisted Replies", desc: "Suggested responses, intent detection & RAG-powered docs" },
              { icon: <Phone size={20} />, label: "Omnichannel Calls", desc: "Inbound & outbound calls with telephony abstraction layer" },
              { icon: <MessageSquare size={20} />, label: "Live Chat", desc: "Real-time chat via Supabase Realtime with message history" },
              { icon: <Mail size={20} />, label: "Email Support", desc: "Email thread management with AI-drafted replies" },
              { icon: <ShieldCheck size={20} />, label: "QA Scorecards", desc: "Client-specific rubrics, coaching, and quality history" },
              { icon: <BarChart3 size={20} />, label: "Analytics", desc: "SLA monitoring, CSAT, team performance reporting" },
            ].map((f) => (
              <div key={f.label} style={{ padding: "var(--spacing-5)", backgroundColor: "var(--color-surface-color)", borderRadius: "var(--radius-lg)", border: "1px solid var(--color-outline-variant-color)" }}>
                <div style={{ color: "var(--color-primary-color)", marginBottom: "var(--spacing-3)" }}>{f.icon}</div>
                <h4 style={{ fontWeight: 700, fontSize: "14px", marginBottom: "4px" }}>{f.label}</h4>
                <p style={{ fontSize: "12px", color: "var(--color-on-surface-variant-color)", lineHeight: 1.5 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid var(--color-outline-variant-color)", padding: "var(--spacing-6) var(--spacing-8)", textAlign: "center" }}>
        <p style={{ fontSize: "12px", color: "var(--color-on-surface-variant-color)" }}>
          © 2025 First Connect Edge — Connectdesk Platform v1.0
        </p>
      </footer>
    </div>
  );
}
