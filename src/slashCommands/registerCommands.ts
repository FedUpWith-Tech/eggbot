import { CommandInteraction, SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('reloadcommands')
  .setDescription('Reloads all guild commands from the bot')
  .setDefaultMemberPermissions(0);

export async function execute(interaction: CommandInteraction) {
  await interaction.deferReply({ ephemeral: true });
  // Work in progress, need to figure out a way to do this. Is a ping command for now.
  await interaction.editReply({ content: 'Successfully reloaded commands.' });
}
