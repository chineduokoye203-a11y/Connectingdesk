"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Headphones,
  MessageSquare,
  Mail,
  Send,
  Sparkles,
  Search,
  Filter,
  User,
  ShieldCheck,
  Building,
  CheckCircle2,
  Clock,
  ArrowRight,
  ChevronRight,
  PhoneCall,
  FileText,
  AlertTriangle,
  Bot,
  RefreshCw,
  ExternalLink,
  ThumbsUp,
  Paperclip
} from "lucide-react";

type ChannelType = "ALL" | "CHAT" | "EMAIL" | "SOCIAL";

type MessageItem = {
  id: string;
  sender: "customer" | "agent" | "system";
  senderName: string;
  text: string;
  timestamp: string;
  channel: ChannelType;
};

type Conversation = {
  id: string;
  customerName: string;
  companyName: string;
  crmSource: string;
  channel: ChannelType;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  status: "OPEN" | "IN_PROGRESS" | "WAITING" | "RESOLVED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  sentiment: "Positive" | "Neutral" | "Frustrated";
  email?: string;
  phone?: string;
  messages: MessageItem[];
};

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "conv-101",
    customerName: "Sarah Jenkins",
    companyName: "Acme Logistics",
    crmSource: "Salesforce Service Cloud",
    channel: "CHAT",
    lastMessage: "I need to change the delivery address for order #FCE-9402.",
    timestamp: "10:42 AM",
    unreadCount: 2,
    status: "OPEN",
    priority: "HIGH",
    sentiment: "Frustrated",
    email: "sarah.j@acmelogistics.com",
    phone: "+1 (555) 234-5678",
    messages: [
      {
        id: "m-1",
        sender: "customer",
        senderName: "Sarah Jenkins",
        text: "Hello! My shipment #FCE-9402 was supposed to ship to Austin, but the portal says Dallas.",
        timestamp: "10:40 AM",
        channel: "CHAT"
      },
      {
        id: "m-2",
        sender: "customer",
        senderName: "Sarah Jenkins",
        text: "I need to change the delivery address for order #FCE-9402 urgently before it dispatches.",
        timestamp: "10:42 AM",
        channel: "CHAT"
      }
    ]
  },
  {
    id: "conv-102",
    customerName: "Marcus Vance",
    companyName: "Apex Retail",
    crmSource: "Zendesk",
    channel: "EMAIL",
    lastMessage: "Re: Request for bulk subscription discount renewal.",
    timestamp: "09:15 AM",
    unreadCount: 0,
    status: "IN_PROGRESS",
    priority: "MEDIUM",
    sentiment: "Neutral",
    email: "m.vance@apexretail.io",
    phone: "+1 (555) 876-5432",
    messages: [
      {
        id: "m-3",
        sender: "customer",
        senderName: "Marcus Vance",
        text: "Hi support team, we are extending our tier-2 enterprise contract for another 12 months. Can you send over the updated order form?",
        timestamp: "09:15 AM",
        channel: "EMAIL"
      }
    ]
  },
  {
    id: "conv-103",
    customerName: "Elena Rostova",
    companyName: "FinTech Global",
    crmSource: "HubSpot",
    channel: "SOCIAL",
    lastMessage: "Sent a DM via WhatsApp regarding API rate limit extension.",
    timestamp: "Yesterday",
    unreadCount: 1,
    status: "WAITING",
    priority: "URGENT",
    sentiment: "Positive",
    email: "elena@fintechglobal.com",
    phone: "+44 20 7946 0912",
    messages: [
      {
        id: "m-4",
        sender: "customer",
        senderName: "Elena Rostova",
        text: "Hey! Our webhook calls are hitting 429 errors during high load. Could you bump our API quota?",
        timestamp: "Yesterday 4:30 PM",
        channel: "SOCIAL"
      }
    ]
  }
];

export default function MessagesPage() {
  const [activeChannel, setActiveChannel] = useState<ChannelType>("ALL");
  const [selectedConvId, setSelectedConvId] = useState<string>("conv-101");
  const [inputText, setInputText] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [showAIBox, setShowAIBox] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const selectedConv = conversations.find((c) => c.id === selectedConvId) || conversations[0];

  const filteredConversations = conversations.filter((c) => {
    const matchesChannel = activeChannel === "ALL" || c.channel === activeChannel;
    const matchesSearch =
      c.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesChannel && matchesSearch;
  });

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const newMsg: MessageItem = {
      id: `msg-${Date.now()}`,
      sender: "agent",
      senderName: "Specialist (You)",
      text: inputText,
      timestamp: "Just now",
      channel: selectedConv.channel
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === selectedConvId) {
          return {
            ...c,
            lastMessage: inputText,
            status: "IN_PROGRESS",
            messages: [...c.messages, newMsg]
          };
        }
        return c;
      })
    );

    setInputText("");
  };

  const handleApplyAISuggestion = (suggestionText: string) => {
    setInputText(suggestionText);
  };

  const handleAction = (message: string) => {
    setActionSuccess(message);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "var(--color-background-color)", display: "flex", flexDirection: "column" }}>
      {/* Top Bar */}
      <header
        style={{
          borderBottom: "1px solid var(--color-outline-variant-color)",
          backgroundColor: "var(--color-surface-color)",
          padding: "0 var(--spacing-6)",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-3)" }}>
          <Link href="/" style={{ textDecoration: "none", color: "inherit", display: "flex", alignItems: "center", gap: "var(--spacing-2)" }}>
            <Headphones size={24} style={{ color: "var(--color-primary-color)" }} />
            <span style={{ fontWeight: 500, fontSize: "18px" }}>Connectdesk</span>
          </Link>
          <span style={{ color: "var(--color-outline-color)", fontSize: "18px" }}>|</span>
          <span style={{ fontWeight: 500, fontSize: "14px", color: "var(--color-on-surface-variant-color)" }}>
            Unified Messages Inbox
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-3)" }}>
          {actionSuccess && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--color-tertiary-container-color)",
                color: "var(--color-on-tertiary-container-color)",
                fontSize: "12px",
                fontWeight: 500
              }}
            >
              <CheckCircle2 size={14} /> {actionSuccess}
            </div>
          )}

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 12px",
              borderRadius: "var(--radius-full)",
              backgroundColor: "var(--color-surface-container-high-color)",
              border: "1px solid var(--color-outline-variant-color)",
              fontSize: "12px",
              fontWeight: 500
            }}
          >
            <Building size={14} style={{ color: "var(--color-primary-color)" }} />
            <span>Active Tenant: First Connect Edge Hub</span>
          </div>

          <Link href="/agent" className="btn btn-outline btn-sm">
            Call Workspace
          </Link>
          <Link href="/supervisor" className="btn btn-ghost btn-sm">
            Supervisor QA
          </Link>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "320px 1fr 340px", overflow: "hidden" }}>
        {/* Left Column: Inbox List */}
        <aside
          style={{
            borderRight: "1px solid var(--color-outline-variant-color)",
            backgroundColor: "var(--color-surface-color)",
            display: "flex",
            flexDirection: "column"
          }}
        >
          {/* Filters & Search */}
          <div style={{ padding: "var(--spacing-4)", borderBottom: "1px solid var(--color-outline-variant-color)" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 12px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-outline-variant-color)",
                backgroundColor: "var(--color-background-color)",
                marginBottom: "var(--spacing-3)"
              }}
            >
              <Search size={16} style={{ color: "var(--color-on-surface-variant-color)" }} />
              <input
                type="text"
                placeholder="Search messages or customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: "none",
                  outline: "none",
                  backgroundColor: "transparent",
                  width: "100%",
                  fontSize: "13px",
                  color: "var(--color-on-surface-color)"
                }}
              />
            </div>

            {/* Channel Tabs */}
            <div style={{ display: "flex", gap: "4px" }}>
              {(
                [
                  { id: "ALL", label: "All", icon: <Filter size={13} /> },
                  { id: "CHAT", label: "Chat", icon: <MessageSquare size={13} /> },
                  { id: "EMAIL", label: "Email", icon: <Mail size={13} /> },
                  { id: "SOCIAL", label: "Social", icon: <PhoneCall size={13} /> }
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveChannel(tab.id)}
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "4px",
                    padding: "6px 0",
                    borderRadius: "var(--radius-sm)",
                    border: "none",
                    fontSize: "12px",
                    fontWeight: activeChannel === tab.id ? 700 : 500,
                    backgroundColor: activeChannel === tab.id ? "var(--color-primary-container-color)" : "transparent",
                    color: activeChannel === tab.id ? "var(--color-on-primary-container-color)" : "var(--color-on-surface-variant-color)",
                    cursor: "pointer"
                  }}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Conversation List */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {filteredConversations.length === 0 ? (
              <div style={{ padding: "var(--spacing-6)", textAlign: "center", color: "var(--color-on-surface-variant-color)", fontSize: "13px" }}>
                No messages found for this filter.
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = conv.id === selectedConvId;
                return (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConvId(conv.id)}
                    style={{
                      padding: "var(--spacing-4)",
                      borderBottom: "1px solid var(--color-outline-variant-color)",
                      backgroundColor: isSelected ? "var(--color-surface-container-high-color)" : "transparent",
                      cursor: "pointer",
                      transition: "background-color 0.15s ease",
                      borderLeft: isSelected ? "4px solid var(--color-primary-color)" : "4px solid transparent"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                      <div style={{ fontWeight: 500, fontSize: "14px", color: "var(--color-on-surface-color)" }}>
                        {conv.customerName}
                      </div>
                      <span style={{ fontSize: "11px", color: "var(--color-on-surface-variant-color)" }}>{conv.timestamp}</span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 500,
                          padding: "2px 6px",
                          borderRadius: "var(--radius-xs)",
                          backgroundColor:
                            conv.channel === "CHAT"
                              ? "var(--color-primary-container-color)"
                              : conv.channel === "EMAIL"
                              ? "var(--color-secondary-container-color)"
                              : "var(--color-tertiary-container-color)",
                          color:
                            conv.channel === "CHAT"
                              ? "var(--color-on-primary-container-color)"
                              : conv.channel === "EMAIL"
                              ? "var(--color-on-secondary-container-color)"
                              : "var(--color-on-tertiary-container-color)"
                        }}
                      >
                        {conv.channel}
                      </span>
                      <span style={{ fontSize: "11px", color: "var(--color-on-surface-variant-color)" }}>• {conv.companyName}</span>
                    </div>

                    <div
                      style={{
                        fontSize: "12px",
                        color: "var(--color-on-surface-variant-color)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis"
                      }}
                    >
                      {conv.lastMessage}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* Middle Column: Active Chat / Email Window */}
        <main style={{ display: "flex", flexDirection: "column", backgroundColor: "var(--color-surface-container-lowest-color)" }}>
          {/* Header of Active Thread */}
          <div
            style={{
              padding: "var(--spacing-4) var(--spacing-6)",
              borderBottom: "1px solid var(--color-outline-variant-color)",
              backgroundColor: "var(--color-surface-color)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h2 style={{ fontSize: "16px", fontWeight: 700, margin: 0 }}>{selectedConv.customerName}</h2>
                <span
                  style={{
                    fontSize: "11px",
                    padding: "2px 8px",
                    borderRadius: "var(--radius-full)",
                    backgroundColor: "var(--color-surface-variant-color)",
                    color: "var(--color-on-surface-variant-color)"
                  }}
                >
                  {selectedConv.companyName}
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    padding: "2px 8px",
                    borderRadius: "var(--radius-full)",
                    backgroundColor: "var(--color-surface-container-high-color)",
                    fontWeight: 500
                  }}
                >
                  CRM: {selectedConv.crmSource}
                </span>
              </div>
              <p style={{ fontSize: "12px", color: "var(--color-on-surface-variant-color)", margin: "2px 0 0 0" }}>
                {selectedConv.email} • Priority: <strong style={{ color: "var(--color-error-color)" }}>{selectedConv.priority}</strong>
              </p>
            </div>

            {/* Quick Action Toolbar */}
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={() => handleAction("Escalated to Supervisor QA")}
                className="btn btn-outline btn-sm"
                style={{ fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "4px" }}
              >
                <ShieldCheck size={14} /> Escalate
              </button>
              <button
                onClick={() => handleAction("Converted to Support Ticket #TCK-8819")}
                className="btn btn-outline btn-sm"
                style={{ fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "4px" }}
              >
                <FileText size={14} /> Create Ticket
              </button>
              <button
                onClick={() => handleAction("Thread marked as Resolved and synced to CRM")}
                className="btn btn-primary btn-sm"
                style={{ fontSize: "12px", display: "inline-flex", alignItems: "center", gap: "4px" }}
              >
                <CheckCircle2 size={14} /> Resolve & Push CRM
              </button>
            </div>
          </div>

          {/* Message Stream */}
          <div style={{ flex: 1, padding: "var(--spacing-6)", overflowY: "auto", display: "flex", flexDirection: "column", gap: "var(--spacing-4)" }}>
            <div style={{ textAlign: "center", margin: "var(--spacing-2) 0" }}>
              <span
                style={{
                  fontSize: "11px",
                  color: "var(--color-on-surface-variant-color)",
                  backgroundColor: "var(--color-surface-variant-color)",
                  padding: "4px 12px",
                  borderRadius: "var(--radius-full)"
                }}
              >
                Conversation pulled from {selectedConv.crmSource} • Encrypted Tenant Channel
              </span>
            </div>

            {selectedConv.messages.map((m) => {
              const isAgent = m.sender === "agent";
              return (
                <div
                  key={m.id}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: isAgent ? "flex-end" : "flex-start",
                    maxWidth: "75%",
                    alignSelf: isAgent ? "flex-end" : "flex-start"
                  }}
                >
                  <div style={{ fontSize: "11px", color: "var(--color-on-surface-variant-color)", marginBottom: "4px", padding: "0 4px" }}>
                    {m.senderName} • {m.timestamp}
                  </div>
                  <div
                    style={{
                      padding: "var(--spacing-4)",
                      borderRadius: isAgent ? "16px 16px 2px 16px" : "16px 16px 16px 2px",
                      backgroundColor: isAgent ? "var(--color-primary-color)" : "var(--color-surface-color)",
                      color: isAgent ? "#fff" : "var(--color-on-surface-color)",
                      border: isAgent ? "none" : "1px solid var(--color-outline-variant-color)",
                      boxShadow: "var(--elevation-1)",
                      fontSize: "14px",
                      lineHeight: 1.6
                    }}
                  >
                    {m.text}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Message Input Controls */}
          <div style={{ padding: "var(--spacing-4) var(--spacing-6)", borderTop: "1px solid var(--color-outline-variant-color)", backgroundColor: "var(--color-surface-color)" }}>
            <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
              <div style={{ flex: 1, position: "relative" }}>
                <textarea
                  rows={3}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type your response to the customer..."
                  style={{
                    width: "100%",
                    padding: "var(--spacing-3)",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--color-outline-variant-color)",
                    backgroundColor: "var(--color-background-color)",
                    color: "var(--color-on-surface-color)",
                    fontSize: "14px",
                    resize: "none",
                    fontFamily: "inherit"
                  }}
                />
              </div>

              <button
                onClick={handleSendMessage}
                className="btn btn-primary"
                style={{ padding: "var(--spacing-3) var(--spacing-5)", height: 80, borderRadius: "var(--radius-md)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "4px" }}
              >
                <Send size={18} />
                <span style={{ fontSize: "11px" }}>Send</span>
              </button>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "var(--spacing-2)" }}>
              <div style={{ display: "flex", gap: "12px" }}>
                <button type="button" style={{ border: "none", background: "none", color: "var(--color-on-surface-variant-color)", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px", fontSize: "12px" }}>
                  <Paperclip size={14} /> Attach File (Max 5MB)
                </button>
              </div>
              <span style={{ fontSize: "11px", color: "var(--color-on-surface-variant-color)" }}>
                Press Send to push message directly to {selectedConv.crmSource}
              </span>
            </div>
          </div>
        </main>

        {/* Right Column: AI Assistant & Customer CRM Context Drawer */}
        <aside
          style={{
            borderLeft: "1px solid var(--color-outline-variant-color)",
            backgroundColor: "var(--color-surface-color)",
            display: "flex",
            flexDirection: "column",
            overflowY: "auto"
          }}
        >
          {/* AI Drawer Header */}
          <div style={{ padding: "var(--spacing-4)", borderBottom: "1px solid var(--color-outline-variant-color)", backgroundColor: "var(--color-primary-container-color)", color: "var(--color-on-primary-container-color)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <Sparkles size={18} style={{ color: "var(--color-primary-color)" }} />
              <h3 style={{ fontSize: "14px", fontWeight: 700, margin: 0 }}>Connectdesk AI Assistant</h3>
            </div>
            <p style={{ fontSize: "11px", margin: 0, opacity: 0.9 }}>
              Human-in-the-Loop • Verified RAG suggestions grounded in client docs
            </p>
          </div>

          {/* AI Suggestions Box */}
          <div style={{ padding: "var(--spacing-4)", borderBottom: "1px solid var(--color-outline-variant-color)" }}>
            <div style={{ fontSize: "12px", fontWeight: 500, color: "var(--color-on-surface-color)", marginBottom: "var(--spacing-2)", display: "flex", alignItems: "center", gap: "6px" }}>
              <Bot size={15} style={{ color: "var(--color-primary-color)" }} /> Recommended Reply Drafts
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}>
              <div
                style={{
                  padding: "var(--spacing-3)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--color-outline-variant-color)",
                  backgroundColor: "var(--color-surface-container-high-color)",
                  fontSize: "12px",
                  lineHeight: 1.5
                }}
              >
                <p style={{ margin: "0 0 8px 0", color: "var(--color-on-surface-color)" }}>
                  "Hello {selectedConv.customerName}, I have checked order #FCE-9402. I can update the shipping address to your Austin location right now before dispatch."
                </p>
                <button
                  onClick={() =>
                    handleApplyAISuggestion(
                      `Hello ${selectedConv.customerName}, I have checked order #FCE-9402. I can update the shipping address to your Austin location right now before dispatch.`
                    )
                  }
                  className="btn btn-outline btn-sm"
                  style={{ width: "100%", fontSize: "11px", justifyContent: "center" }}
                >
                  Insert Draft to Composer
                </button>
              </div>

              <div
                style={{
                  padding: "var(--spacing-3)",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--color-outline-variant-color)",
                  backgroundColor: "var(--color-surface-container-high-color)",
                  fontSize: "12px",
                  lineHeight: 1.5
                }}
              >
                <p style={{ margin: "0 0 8px 0", color: "var(--color-on-surface-color)" }}>
                  "Thank you for contacting support! Our shipping SLA allows address modifications within 2 hours of placement. Let me verify your account security first."
                </p>
                <button
                  onClick={() =>
                    handleApplyAISuggestion(
                      `Thank you for contacting support! Our shipping SLA allows address modifications within 2 hours of placement. Let me verify your account security first.`
                    )
                  }
                  className="btn btn-outline btn-sm"
                  style={{ width: "100%", fontSize: "11px", justifyContent: "center" }}
                >
                  Insert Draft to Composer
                </button>
              </div>
            </div>

            {/* RAG Sources */}
            <div style={{ marginTop: "var(--spacing-3)", paddingTop: "var(--spacing-2)", borderTop: "1px border var(--color-outline-variant-color)" }}>
              <div style={{ fontSize: "11px", fontWeight: 500, color: "var(--color-on-surface-variant-color)", marginBottom: "4px" }}>
                Retrieved KB Sources (Tenant Scoped):
              </div>
              <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "11px", color: "var(--color-on-surface-variant-color)" }}>
                <li>Policy #DOC-99: Shipping Address Modification Window</li>
                <li>SLA #SLA-04: Order Dispatch & Fulfillment SLA</li>
              </ul>
            </div>
          </div>

          {/* Customer CRM Information Sidebar */}
          <div style={{ padding: "var(--spacing-4)" }}>
            <h4 style={{ fontSize: "13px", fontWeight: 700, marginBottom: "var(--spacing-3)", color: "var(--color-on-surface-color)" }}>
              Customer CRM Profile
            </h4>

            <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-2)", fontSize: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--color-on-surface-variant-color)" }}>Full Name:</span>
                <strong style={{ color: "var(--color-on-surface-color)" }}>{selectedConv.customerName}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--color-on-surface-variant-color)" }}>Client Company:</span>
                <span>{selectedConv.companyName}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--color-on-surface-variant-color)" }}>External CRM:</span>
                <span style={{ color: "var(--color-primary-color)", fontWeight: 500 }}>{selectedConv.crmSource}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--color-on-surface-variant-color)" }}>Customer Sentiment:</span>
                <span
                  style={{
                    fontWeight: 500,
                    color:
                      selectedConv.sentiment === "Frustrated"
                        ? "var(--color-error-color)"
                        : selectedConv.sentiment === "Positive"
                        ? "var(--color-tertiary-color)"
                        : "var(--color-on-surface-color)"
                  }}
                >
                  {selectedConv.sentiment}
                </span>
              </div>
            </div>

            <hr style={{ margin: "var(--spacing-4) 0", borderColor: "var(--color-outline-variant-color)" }} />

            {/* SLA Status */}
            <h4 style={{ fontSize: "13px", fontWeight: 700, marginBottom: "var(--spacing-2)" }}>SLA Tracking</h4>
            <div
              style={{
                padding: "var(--spacing-3)",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--color-surface-variant-color)",
                fontSize: "12px",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <Clock size={16} style={{ color: "var(--color-primary-color)" }} />
              <div>
                <div style={{ fontWeight: 500 }}>First Response SLA</div>
                <div style={{ fontSize: "11px", color: "var(--color-on-surface-variant-color)" }}>14 mins remaining (Target: 30m)</div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
