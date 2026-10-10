export type CallSession = {
  callId: string;
  tenantId: string;
  agentId: string;
  customerNumber: string;
  direction: "INBOUND" | "OUTBOUND";
  status: "RINGING" | "CONNECTED" | "ON_HOLD" | "ENDED";
  startTime: string;
  durationSeconds: number;
  providerName: "Twilio" | "Amazon Connect" | "Vonage" | "Genesys";
  recordingUrl?: string;
};

export type CallDialInput = {
  tenantId: string;
  agentId: string;
  customerNumber: string;
  clientCompanyId: string;
};

export interface TelephonyProvider {
  readonly providerName: string;

  /**
   * Initiates an outbound voice call or accepts an inbound WebRTC session
   */
  initiateCall(input: CallDialInput): Promise<CallSession>;

  /**
   * Toggles call hold state
   */
  toggleHold(callId: string, hold: boolean): Promise<{ success: boolean; isHeld: boolean }>;

  /**
   * Mutes specialist microphone
   */
  setMute(callId: string, mute: boolean): Promise<{ success: boolean; isMuted: boolean }>;

  /**
   * Transfers active call session to another specialist or supervisor
   */
  transferCall(callId: string, targetAgentId: string): Promise<{ success: boolean; transferredTo: string }>;

  /**
   * Ends active call session and generates call recording payload
   */
  endCall(callId: string): Promise<{ success: boolean; durationSeconds: number; recordingUrl: string }>;
}
