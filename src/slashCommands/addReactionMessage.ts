import {
  APIEmbed, ChatInputCommandInteraction, JSONEncodable, Role, SlashCommandBuilder,
} from 'discord.js';
import { addReactionMessage } from '../modules/reactionRoles';

export const data = new SlashCommandBuilder()
  .setName('addreactionmessage')
  .setDescription('Adds a reaction to a given message to give users roles.')
  .setDefaultMemberPermissions(0)
  .addStringOption((msg) => msg
    .setName('msg')
    .setDescription('The message link you want to add a reaction to.')
    .setRequired(true))
  .addStringOption((emoji) => emoji
    .setName('emoji')
    .setDescription(
      'The emoji you want users to react to, must be default or on this server.',
    )
    .setRequired(true))
  .addRoleOption((role) => role
    .setName('role')
    .setDescription('The role you want to give users')
    .setRequired(true));

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply({ ephemeral: true });
  let emoji = interaction.options.getString('emoji')!;
  if (emoji.length > 1) {
    const emojiArray = emoji.split(':', 3);
    // eslint-disable-next-line no-param-reassign
    emoji = emojiArray[2].substr(0, 18);
  }
  await addReactionMessage(
    interaction.options.getString('msg')!,
    emoji,
    interaction.options.getRole('role') as Role,
    (result: APIEmbed | JSONEncodable<APIEmbed>) => {
      interaction.editReply({ embeds: [result] });
    },
  );
}
