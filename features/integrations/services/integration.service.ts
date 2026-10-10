import { CRMAdapter, CRMHealthStatus, CRMConversation } from "../contracts/crm-adapter.interface";
import { SalesforceAdapter } from "../adapters/salesforce.adapter";
import { ZendeskAdapter } from "../adapters/zendesk.adapter";

export class IntegrationService {
  private static adapters: Record<string, CRMAdapter> = {
    salesforce: new SalesforceAdapter(),
    zendesk: new ZendeskAdapter(),
  };

  /**
   * Fetches active CRM integration health statuses for a tenant
   */
  static async getTenantIntegrationHealth(tenantId: string): Promise<CRMHealthStatus[]> {
    const statuses = await Promise.all(
      Object.values(this.adapters).map((adapter) => adapter.checkHealth(tenantId))
    );
    return statuses;
  }

  /**
   * Pulls unified incoming conversations across all configured client CRM connectors for a tenant
   */
  static async pullUnifiedConversations(tenantId: string): Promise<CRMConversation[]> {
    const results = await Promise.all(
      Object.values(this.adapters).map((adapter) => adapter.pullConversations(tenantId))
    );
    return results.flat();
  }
}
