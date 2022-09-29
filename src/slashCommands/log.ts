import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('log')
  .setDescription('Logs something to stdout')
  .setDefaultMemberPermissions(0)
  .addStringOption((s) => s
    .setName('content')
    .setDescription('Paste the content to be logged here.')
    .setRequired(true));

export async function execute(interaction: ChatInputCommandInteraction) {
  console.log(interaction.options.getString('content'))
  await interaction.reply({ content: 'done. :smile:', ephemeral: true });
}
