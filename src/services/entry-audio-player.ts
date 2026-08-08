import {
  AudioPlayerStatus,
  VoiceConnectionStatus,
  createAudioPlayer,
  createAudioResource,
  entersState,
  joinVoiceChannel,
} from "@discordjs/voice";
import type { VoiceBasedChannel } from "discord.js";

export interface EntryAudioPlayer {
  play(channel: VoiceBasedChannel): Promise<void>;
}

export class DiscordEntryAudioPlayer implements EntryAudioPlayer {
  private isPlaying = false;

  public constructor(
    private readonly audioFile: string,
    private readonly durationMs: number,
  ) {}

  public async play(channel: VoiceBasedChannel): Promise<void> {
    if (this.isPlaying) {
      console.log("Áudio de entrada já está tocando; nova reprodução ignorada.");
      return;
    }

    this.isPlaying = true;
    const player = createAudioPlayer();
    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
      selfDeaf: true,
      selfMute: false,
    });

    player.on("error", (error) => {
      console.error("Erro durante a reprodução do áudio:", error);
    });

    let stopTimer: NodeJS.Timeout | undefined;

    try {
      await entersState(connection, VoiceConnectionStatus.Ready, 15_000);

      const subscription = connection.subscribe(player);

      if (!subscription) {
        throw new Error("Não foi possível associar o player ao canal de voz.");
      }

      player.play(createAudioResource(this.audioFile));
      await entersState(player, AudioPlayerStatus.Playing, 10_000);

      stopTimer = setTimeout(() => {
        player.stop(true);
      }, this.durationMs);

      await entersState(
        player,
        AudioPlayerStatus.Idle,
        this.durationMs + 10_000,
      );
    } finally {
      if (stopTimer) {
        clearTimeout(stopTimer);
      }

      player.stop(true);
      connection.destroy();
      this.isPlaying = false;
    }
  }
}
