export type VoiceTransition = "entered" | "left";

/**
 * Classifica somente a mudança de canal. Alterações de mute, deafen,
 * câmera ou transmissão mantêm o mesmo channelId e são ignoradas.
 */
export function classifyVoiceTransition(
  oldChannelId: string | null,
  newChannelId: string | null,
  monitoredChannelId: string,
): VoiceTransition | null {
  if (
    oldChannelId !== monitoredChannelId &&
    newChannelId === monitoredChannelId
  ) {
    return "entered";
  }

  if (
    oldChannelId === monitoredChannelId &&
    newChannelId !== monitoredChannelId
  ) {
    return "left";
  }

  return null;
}

export function shouldSendFirstEntryAlert(
  transition: VoiceTransition,
  humanMemberCount: number,
): boolean {
  return transition === "entered" && humanMemberCount === 1;
}
