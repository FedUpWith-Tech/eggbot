import { EmbedBuilder, TextChannel } from 'discord.js';
import { rmReactionMessage } from './reactionRoles';
import { getGuild } from './botUtils';
import { config } from './config';

/**
 * Function to handle deleted messages
 * @param packet {any} Raw Message packet
 */
export async function deletedMessageHandler(packet: any) {
  rmReactionMessage(packet.d.id);
}

/**
 * Function to handle editted messages
 * @param packet {any} Raw Message packet
 */
export async function updatedMessageHandler(packet: any) {
  if (packet.d.embeds.length > 0) return;
}
