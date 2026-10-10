import { TelephonyProvider, CallSession, CallDialInput } from "../contracts/telephony.interface";

export class TwilioProvider implements TelephonyProvider {
  readonly providerName = "Twilio";

  async initiateCall(input: CallDialInput): Promise<CallSession> {
    return {
      callId: `tw-call-${Date.now()}`,
      tenantId: input.tenantId,
      agentId: input.agentId,
      customerNumber: input.customerNumber,
      direction: "OUTBOUND",
      status: "CONNECTED",
      startTime: new Date().toISOString(),
      durationSeconds: 0,
      providerName: "Twilio",
      recordingUrl: `https://storage.connectdesk.io/recordings/tw-call-${Date.now()}.mp3`
    };
  }

  async toggleHold(callId: string, hold: boolean): Promise<{ success: boolean; isHeld: boolean }> {
    return { success: true, isHeld: hold };
  }

  async setMute(callId: string, mute: boolean): Promise<{ success: boolean; isMuted: boolean }> {
    return { success: true, isMuted: mute };
  }

  async transferCall(callId: string, targetAgentId: string): Promise<{ success: boolean; transferredTo: string }> {
    return { success: true, transferredTo: targetAgentId };
  }

  async endCall(callId: string): Promise<{ success: boolean; durationSeconds: number; recordingUrl: string }> {
    return {
      success: true,
      durationSeconds: 145,
      recordingUrl: `https://storage.connectdesk.io/recordings/${callId}.mp3`
    };
  }
}
