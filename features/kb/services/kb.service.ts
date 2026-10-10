export type KBArticle = {
  id: string;
  tenantId: string;
  title: string;
  category: string;
  content: string;
  tags: string[];
  updatedAt: string;
};

const mockArticles: KBArticle[] = [
  {
    id: "kb-01",
    tenantId: "default-tenant",
    title: "Shipping & Delivery Modification SLA",
    category: "Logistics",
    content: "Address changes for orders in processing stage are permitted within 2 hours of order creation. Specialists must verify order ownership before applying changes in the client CRM portal.",
    tags: ["shipping", "address", "sla"],
    updatedAt: new Date().toISOString()
  },
  {
    id: "kb-02",
    tenantId: "default-tenant",
    title: "API Rate Limits & Enterprise Quotas",
    category: "Developer Platform",
    content: "Tier-2 enterprise plans include 10,000 req/min. If customer hits 429 status code, specialists can trigger temporary 48-hour quota extensions via the developer portal dashboard.",
    tags: ["api", "rate-limit", "quota"],
    updatedAt: new Date().toISOString()
  }
];

export class KnowledgeBaseService {
  /**
   * Performs tenant-isolated semantic RAG document retrieval
   */
  static async searchRelevantDocs(tenantId: string, query: string): Promise<KBArticle[]> {
    const tenantDocs = mockArticles.filter((a) => a.tenantId === tenantId);
    const keywords = query.toLowerCase().split(" ");
    return tenantDocs.filter((doc) =>
      keywords.some(
        (kw) =>
          doc.title.toLowerCase().includes(kw) ||
          doc.content.toLowerCase().includes(kw) ||
          doc.tags.some((t) => t.toLowerCase().includes(kw))
      )
    );
  }
}
