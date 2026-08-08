import type { VoiceState } from "discord.js";
import type { AppConfig } from "../config.js";
import {
  classifyVoiceTransition,
  shouldSendFirstEntryAlert,
} from "../domain/voice-transition.js";
import type { NotificationChannel } from "../notifications/notification-channel.js";
import type { EntryAudioPlayer } from "../services/entry-audio-player.js";

export function createVoiceStateUpdateHandler(
  config: AppConfig,
  notificationChannel: NotificationChannel,
  entryAudioPlayer?: EntryAudioPlayer,
): (oldState: VoiceState, newState: VoiceState) => Promise<void> {
  return async (oldState, newState) => {
    if (newState.guild.id !== config.guildId) {
      return;
    }

    const member = newState.member ?? oldState.member;

    if (!member || member.user.bot) {
      return;
    }

    const transition = classifyVoiceTransition(
      oldState.channelId,
      newState.channelId,
      config.voiceChannelId,
    );

    if (!transition) {
      return;
    }

    const tasks: Promise<unknown>[] = [];
    const shouldNotify =
      (transition === "entered" && config.notifyEntries) ||
      (transition === "left" && config.notifyExits);
    const humanMemberCount =
      newState.channel?.members.filter((channelMember) => !channelMember.user.bot)
        .size ?? 0;
    const shouldAlertRole = shouldSendFirstEntryAlert(
      transition,
      humanMemberCount,
    );

    if (shouldNotify) {
      tasks.push(
        notificationChannel.send({
          transition,
          userId: member.id,
          displayName: member.displayName,
          voiceChannelId: config.voiceChannelId,
          occurredAt: new Date(),
          ...(shouldAlertRole
            ? { alertRoleId: config.firstEntryAlertRoleId }
            : {}),
        }),
      );
    }

    if (
      transition === "entered" &&
      config.entryAudioEnabled &&
      entryAudioPlayer &&
      newState.channel
    ) {
      tasks.push(entryAudioPlayer.play(newState.channel));
    }

    const results = await Promise.allSettled(tasks);
    const failures = results
      .filter((result) => result.status === "rejected")
      .map((result) => result.reason);

    if (failures.length > 0) {
      throw new AggregateError(
        failures,
        "Uma ou mais ações do evento de voz falharam.",
      );
    }
  };
}
