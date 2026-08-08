import { escapeMarkdown, type Client } from "discord.js";
import type {
  NotificationChannel,
  VoiceNotification,
} from "./notification-channel.js";

export class DiscordNotificationChannel implements NotificationChannel {
  public constructor(
    private readonly client: Client,
    private readonly textChannelId: string,
  ) {}

  public async send(notification: VoiceNotification): Promise<void> {
    const channel = await this.client.channels.fetch(this.textChannelId);

    if (!channel?.isSendable()) {
      throw new Error(
        `O canal ${this.textChannelId} não existe ou não aceita mensagens.`,
      );
    }

    const timestamp = Math.floor(notification.occurredAt.getTime() / 1_000);
    const displayName = escapeMarkdown(notification.displayName);
    const isEntry = notification.transition === "entered";
    const title = notification.alertRoleId
      ? "📣 TATA SITUATION!!!"
      : isEntry
        ? "🔊 ENTROU PRA RESENHA"
        : "🔴 SAIU DA RESENHA";
    const action = isEntry ? "entrou" : "saiu";
    const roleAlert = notification.alertRoleId
      ? [`🔔 <@&${notification.alertRoleId}>`, ""]
      : [];

    await channel.send({
      content: [
        `**${title}**`,
        "",
        ...roleAlert,
        `👤 **${displayName}** ${action} do canal <#${notification.voiceChannelId}>.`,
        `🕐 Horário: <t:${timestamp}:T>`,
      ].join("\n"),
      allowedMentions: {
        parse: [],
        roles: notification.alertRoleId ? [notification.alertRoleId] : [],
      },
    });
  }
}
