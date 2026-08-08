import {
  ActivityType,
  Client,
  Events,
  GatewayIntentBits,
} from "discord.js";
import { loadConfig } from "./config.js";
import { createVoiceStateUpdateHandler } from "./events/voice-state-update.js";
import { DiscordNotificationChannel } from "./notifications/discord-notification-channel.js";
import { DiscordEntryAudioPlayer } from "./services/entry-audio-player.js";
import { validateDiscordSetup } from "./validate-discord-setup.js";

async function main(): Promise<void> {
  const config = loadConfig();
  const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
    presence: {
      status: "online",
      activities: [
        {
          name: config.botPresenceName,
          state: config.botPresenceState,
          type: ActivityType.Playing,
        },
      ],
    },
  });

  const notifications = new DiscordNotificationChannel(
    client,
    config.textChannelId,
  );
  const entryAudioPlayer = config.entryAudioEnabled
    ? new DiscordEntryAudioPlayer(
        config.entryAudioFile,
        config.entryAudioDurationMs,
      )
    : undefined;
  const handleVoiceStateUpdate = createVoiceStateUpdateHandler(
    config,
    notifications,
    entryAudioPlayer,
  );

  client.on(Events.VoiceStateUpdate, (oldState, newState) => {
    void handleVoiceStateUpdate(oldState, newState).catch((error: unknown) => {
      console.error("Falha ao processar atualização de voz:", error);
    });
  });

  client.on(Events.Error, (error) => {
    console.error("Erro no cliente do Discord:", error);
  });

  client.once(Events.ClientReady, async (readyClient) => {
    try {
      await validateDiscordSetup(readyClient, config);
      console.log(`Bot conectado como ${readyClient.user.tag}.`);
      console.log(`Monitorando o canal de voz ${config.voiceChannelId}.`);
    } catch (error) {
      console.error("Configuração do Discord inválida:", error);
      readyClient.destroy();
      process.exitCode = 1;
    }
  });

  registerShutdown("SIGINT", client);
  registerShutdown("SIGTERM", client);

  await client.login(config.discordToken);
}

function registerShutdown(
  signal: NodeJS.Signals,
  client: Client,
): void {
  process.once(signal, () => {
    console.log(`Recebido ${signal}; encerrando o bot.`);
    client.destroy();
  });
}

main().catch((error: unknown) => {
  console.error("Não foi possível iniciar o bot:", error);
  process.exitCode = 1;
});
