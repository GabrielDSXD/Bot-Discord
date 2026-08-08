import "dotenv/config";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

export interface AppConfig {
  discordToken: string;
  guildId: string;
  voiceChannelId: string;
  textChannelId: string;
  firstEntryAlertRoleId: string;
  notifyEntries: boolean;
  notifyExits: boolean;
  entryAudioEnabled: boolean;
  entryAudioFile: string;
  entryAudioDurationMs: number;
  botPresenceName: string;
  botPresenceState: string;
  botAvatarFile: string;
}

const SNOWFLAKE_PATTERN = /^\d{17,20}$/;

function required(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`A variável de ambiente ${name} é obrigatória.`);
  }

  return value;
}

function snowflake(name: string): string {
  const value = required(name);

  if (!SNOWFLAKE_PATTERN.test(value)) {
    throw new Error(`A variável ${name} deve conter um ID válido do Discord.`);
  }

  return value;
}

function booleanValue(name: string, defaultValue: boolean): boolean {
  const rawValue = process.env[name]?.trim().toLowerCase();

  if (!rawValue) {
    return defaultValue;
  }

  if (rawValue === "true") {
    return true;
  }

  if (rawValue === "false") {
    return false;
  }

  throw new Error(`A variável ${name} deve ser "true" ou "false".`);
}

function integerInRange(
  name: string,
  defaultValue: number,
  minimum: number,
  maximum: number,
): number {
  const rawValue = process.env[name]?.trim();

  if (!rawValue) {
    return defaultValue;
  }

  const value = Number(rawValue);

  if (!Number.isInteger(value) || value < minimum || value > maximum) {
    throw new Error(
      `A variável ${name} deve ser um número inteiro entre ${minimum} e ${maximum}.`,
    );
  }

  return value;
}

export function loadConfig(): AppConfig {
  const config: AppConfig = {
    discordToken: required("DISCORD_TOKEN"),
    guildId: snowflake("DISCORD_GUILD_ID"),
    voiceChannelId: snowflake("VOICE_CHANNEL_ID"),
    textChannelId: snowflake("TEXT_CHANNEL_ID"),
    firstEntryAlertRoleId: snowflake("FIRST_ENTRY_ALERT_ROLE_ID"),
    notifyEntries: booleanValue("NOTIFY_ENTRIES", true),
    notifyExits: booleanValue("NOTIFY_EXITS", true),
    entryAudioEnabled: booleanValue("ENTRY_AUDIO_ENABLED", true),
    entryAudioFile: resolve(
      process.cwd(),
      process.env.ENTRY_AUDIO_FILE?.trim() || "assets/entry-trumpet.mp3",
    ),
    entryAudioDurationMs: integerInRange(
      "ENTRY_AUDIO_DURATION_MS",
      6_000,
      1_000,
      60_000,
    ),
    botPresenceName:
      process.env.BOT_PRESENCE_NAME?.trim() || "FREE-USANDO TATA",
    botPresenceState: process.env.BOT_PRESENCE_STATE?.trim() || "TATA",
    botAvatarFile: resolve(
      process.cwd(),
      process.env.BOT_AVATAR_FILE?.trim() || "assets/gau.png",
    ),
  };

  if (config.entryAudioEnabled && !existsSync(config.entryAudioFile)) {
    throw new Error(
      `O arquivo de áudio configurado não existe: ${config.entryAudioFile}`,
    );
  }

  if (!existsSync(config.botAvatarFile)) {
    throw new Error(
      `O arquivo de avatar configurado não existe: ${config.botAvatarFile}`,
    );
  }

  return config;
}
