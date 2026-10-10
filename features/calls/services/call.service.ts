import { TelephonyProvider, CallSession, CallDialInput } from "../contracts/telephony.interface";
import { TwilioProvider } from "../providers/twilio.provider";

export class CallService {
  private static provider: TelephonyProvider = new TwilioProvider();

  static async dialCustomer(input: CallDialInput): Promise<CallSession> {
    return this.provider.initiateCall(input);
  }

  static async terminateCall(callId: string) {
    return this.provider.endCall(callId);
  }

  static async holdCall(callId: string, hold: boolean) {
    return this.provider.toggleHold(callId, hold);
  }

  static async transferCall(callId: string, targetAgentId: string) {
    return this.provider.transferCall(callId, targetAgentId);
  }
}
