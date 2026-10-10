export type CRMConversation = {
  externalId: string;
  crmType: "Salesforce" | "Zendesk" | "HubSpot" | "Freshdesk";
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  subject: string;
  channel: "CALL" | "CHAT" | "EMAIL" | "SOCIAL";
  status: "OPEN" | "IN_PROGRESS" | "WAITING" | "RESOLVED";
  messages: Array<{
    id: string;
    sender: "customer" | "agent" | "system";
    body: string;
    timestamp: string;
  }>;
};

export type CRMResolutionPayload = {
  externalId: string;
  resolutionNotes: string;
  resolvedByAgentId: string;
  resolvedByAgentName: string;
  status: "RESOLVED" | "CLOSED";
  timestamp: string;
};

export type CRMHealthStatus = {
  crmType: string;
  isConnected: boolean;
  lastSyncTimestamp: string;
  activeWebhooks: boolean;
  latencyMs: number;
};

export interface CRMAdapter {
  readonly crmType: string;

  /**
   * Pulls incoming customer conversations from client's external CRM via API / webhook sync
   */
  pullConversations(tenantId: string): Promise<CRMConversation[]>;

  /**
   * Pushes specialist resolution notes and status updates back to client CRM
   */
  pushResolution(tenantId: string, payload: CRMResolutionPayload): Promise<{ success: boolean; remoteTicketId: string }>;

  /**
   * Checks health and connection latency for external CRM integration endpoint
   */
  checkHealth(tenantId: string): Promise<CRMHealthStatus>;
}
