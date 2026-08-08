import { Client, Events, GatewayIntentBits } from "discord.js";
import { loadConfig } from "../config.js";

async function main(): Promise<void> {
  const config = loadConfig();
  const client = new Client({ intents: [GatewayIntentBits.Guilds] });

  const avatarUpdated = new Promise<void>((resolve, reject) => {
    client.once(Events.ClientReady, async (readyClient) => {
      try {
        await readyClient.user.setAvatar(config.botAvatarFile);
        console.log(`Avatar atualizado para ${config.botAvatarFile}.`);
        resolve();
      } catch (error) {
        reject(error);
      } finally {
        readyClient.destroy();
      }
    });

    client.once(Events.Error, reject);
  });

  await client.login(config.discordToken);
  await avatarUpdated;
}

main().catch((error: unknown) => {
  console.error("Não foi possível atualizar o avatar do bot:", error);
  process.exitCode = 1;
});
