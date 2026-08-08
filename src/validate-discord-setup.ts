import { PermissionFlagsBits, type Client } from "discord.js";
import type { AppConfig } from "./config.js";

export async function validateDiscordSetup(
  client: Client<true>,
  config: AppConfig,
): Promise<void> {
  const guild = await client.guilds.fetch(config.guildId);
  const voiceChannel = await guild.channels.fetch(config.voiceChannelId);

  if (!voiceChannel?.isVoiceBased()) {
    throw new Error(
      `VOICE_CHANNEL_ID (${config.voiceChannelId}) não identifica um canal de voz deste servidor.`,
    );
  }

  if (
    !voiceChannel
      .permissionsFor(client.user)
      ?.has([
        PermissionFlagsBits.ViewChannel,
        ...(config.entryAudioEnabled
          ? [PermissionFlagsBits.Connect, PermissionFlagsBits.Speak]
          : []),
      ])
  ) {
    throw new Error(
      config.entryAudioEnabled
        ? `O bot precisa das permissões Ver canal, Conectar e Falar no canal de voz ${config.voiceChannelId}.`
        : `O bot não possui permissão para visualizar o canal de voz ${config.voiceChannelId}.`,
    );
  }

  const textChannel = await guild.channels.fetch(config.textChannelId);

  if (!textChannel?.isSendable()) {
    throw new Error(
      `TEXT_CHANNEL_ID (${config.textChannelId}) não identifica um canal no qual o bot possa enviar mensagens.`,
    );
  }

  const textPermissions = textChannel.permissionsFor(client.user);

  if (
    !textPermissions?.has([
      PermissionFlagsBits.ViewChannel,
      PermissionFlagsBits.SendMessages,
    ])
  ) {
    throw new Error(
      `O bot precisa das permissões Ver canal e Enviar mensagens no canal ${config.textChannelId}.`,
    );
  }

  const alertRole = await guild.roles.fetch(config.firstEntryAlertRoleId);

  if (!alertRole) {
    throw new Error(
      `FIRST_ENTRY_ALERT_ROLE_ID (${config.firstEntryAlertRoleId}) não identifica um cargo deste servidor.`,
    );
  }

  if (
    !alertRole.mentionable &&
    !textPermissions.has(PermissionFlagsBits.MentionEveryone)
  ) {
    throw new Error(
      `O cargo ${config.firstEntryAlertRoleId} precisa ser mencionável, ou o bot precisa da permissão Mencionar @everyone, @here e todos os cargos.`,
    );
  }
}
