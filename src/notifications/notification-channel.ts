import type { VoiceTransition } from "../domain/voice-transition.js";

export interface VoiceNotification {
  transition: VoiceTransition;
  userId: string;
  displayName: string;
  voiceChannelId: string;
  occurredAt: Date;
  alertRoleId?: string;
}

export interface NotificationChannel {
  send(notification: VoiceNotification): Promise<void>;
}
