import { CallService } from "@/features/calls/services/call.service";

export type TransferInput = {
  callId: string;
  tenantId: string;
  supervisorId: string;
  supervisorName: string;
  reason: string;
  customerInfo?: string;
};

export type TransferRecord = {
  transferId: string;
  callId: string;
  supervisorId: string;
  supervisorName: string;
  reason: string;
  customerInfo?: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED" | "COMPLETED";
  createdAt: string;
};

/**
 * Handles the business logic of transferring an active call to a supervisor:
 * 1. Executes the telephony transfer
 * 2. Records the transfer for audit + supervisor notification
 */
export class TransferService {
  static async transferToSupervisor(input: TransferInput): Promise<TransferRecord> {
    // 1. Execute the actual call transfer via the telephony provider
    const transferResult = await CallService.transferCall(input.callId, input.supervisorId);

    if (!transferResult.success) {
      throw new Error("Failed to transfer call via telephony provider");
    }

    // 2. Persist the transfer record (in-memory for now; DB-backed once supervisor view is built)
    const record: TransferRecord = {
      transferId: `transfer-${Date.now()}`,
      callId: input.callId,
      supervisorId: input.supervisorId,
      supervisorName: input.supervisorName,
      reason: input.reason,
      customerInfo: input.customerInfo,
      status: "PENDING",
      createdAt: new Date().toISOString(),
    };

    // 3. Notify the supervisor (e.g., via realtime/notification channel once available)
    await this.notifySupervisor(record);

    return record;
  }

  private static async notifySupervisor(record: TransferRecord): Promise<void> {
    // Placeholder for supervisor notification (Supabase Realtime / in-app notification)
    // e.g., push to a "supervisor-notifications" channel keyed by supervisorId
    console.log(`[Transfer] Notifying supervisor ${record.supervisorName} (${record.supervisorId}): ${record.reason}`);
  }
}
