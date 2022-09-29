import {
  Channel, ChatInputCommandInteraction, EmbedField, Role, SlashCommandBuilder,
} from 'discord.js';
import {
  addTrigger, editTrigger, rmTrigger, triggers,
} from '../modules/triggers';
import EmbedPageManager from '../modules/embedPagesManager';
import { getGuild } from '../modules/botUtils';

function testRegex(regexString: string) {
  try {
    if (!regexString) throw new Error();
    return new RegExp(regexString, 'i');
  } catch (e) {
    return `I'm sorry but \`${regexString}\` is not a valid regex `;
  }
}

export const data = new SlashCommandBuilder()
  .setName('trigger')
  .setDescription('Command to manage autmod triggers')
  .setDefaultMemberPermissions(0)
  .addSubcommand((add) => add
    .setName('add')
    .setDescription('Add a new Trigger')
    .addStringOption((name) => name
      .setName('name')
      .setDescription('Short name of trigger')
      .setRequired(true))
    .addStringOption((regex) => regex
      .setName('regex')
      .setDescription('The regex pattern to look for')
      .setRequired(true))
    .addStringOption((response) => response
      .setName('response')
      .setDescription('What the should be sent if the trigger is valid')
      .setRequired(true))
    .addBooleanOption((deletable) => deletable
      .setName('deletable')
      .setDescription('Should the user be able to delete the response?')
      .setRequired(true))
    .addRoleOption((role) => role
      .setName('ignore-role')
      .setDescription('The role and above which this trigger should ignore'))
    .addChannelOption((channel) => channel
      .setName('ignore-channel')
      .setDescription('A channel you don\'t want this trigger to respond in')))
  .addSubcommand((edit) => edit
    .setName('edit')
    .setDescription('Edit an existing Trigger')
    .addStringOption((name) => name
      .setName('name')
      .setDescription('The short name of the trigger you want to edit')
      .setRequired(true))
    .addStringOption((regex) => regex
      .setName('regex')
      .setDescription('The regex pattern to look for'))
    .addStringOption((response) => response
      .setName('response')
      .setDescription('What the should be sent if the trigger is valid'))
    .addBooleanOption((deletable) => deletable
      .setName('deletable')
      .setDescription('Should the user be able to delete the response?'))
    .addRoleOption((role) => role
      .setName('ignore-role')
      .setDescription('The role and above which this trigger should ignore'))
    .addChannelOption((channel) => channel
      .setName('ignore-channel')
      .setDescription('A channel you don\'t want this trigger to respond in'))
    .addBooleanOption((enabled) => enabled
      .setName('enabled')
      .setDescription('Is this trigger enabled?')))
  .addSubcommand((remove) => remove
    .setName('remove')
    .setDescription('Remove and existing Trigger')
    .addStringOption((name) => name
      .setName('name')
      .setDescription('The short name of the trigger you want to delete')
      .setRequired(true)))
  .addSubcommand((list) => list
    .setName('list')
    .setDescription('List all triggers'));

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();
  const name = interaction.options.getString('name')!;
  const regexString = interaction.options.getString('regex');
  const response = interaction.options.getString('response');
  const deletable = interaction.options.getBoolean('deletable');
  const enabled = interaction.options.getBoolean('enabled');
  const role = interaction.options.getRole('ignore-role');
  const channel = interaction.options.getChannel('ignore-channel');

  switch (interaction.options.getSubcommand()) {
    case 'add': {
      const regex = testRegex(regexString!);
      if (typeof regex === 'string') {
        await interaction.editReply(regex);
        break;
      }
      const reply = await addTrigger(
        name,
        regexString!,
        response!,
        deletable!,
        role as Role | null,
        channel as Channel | null,
      );
      await interaction.editReply({ content: reply });
      break;
    }
    case 'edit': {
      let regex: string | RegExp | undefined;
      if (regexString) {
        regex = await testRegex(regexString);
        if (typeof regex === 'string') {
          await interaction.editReply(regex);
          break;
        }
      }
      const reply = await editTrigger(
        name,
        regexString,
        response,
        deletable,
        role as Role | null,
        channel as Channel | null,
        enabled,
      );
      await interaction.editReply({ content: reply });
      break;
    }
    case 'remove': {
      const reply = await rmTrigger(name);
      await interaction.editReply({ content: reply });
      break;
    }
    case 'list': {
      /* eslint-disable prefer-const */
      let fields: Array<EmbedField> = [];
      Object.entries(triggers).forEach((trigger) => {
        fields.push({
          name: trigger[0],
          value: `**Regex:** ${trigger[1].regex}\n**Response:** ${trigger[1].response}\n**Enabled:** ${trigger[1].enabled}\n**Deletable:** ${trigger[1].send_deletable}\n**Ignored Role:** ${trigger[1].ignored_role ? getGuild().roles.cache.get(trigger[1].ignored_role) : undefined}\n**Ignored Channel:** ${trigger[1].ignored_channels ? getGuild().channels.cache.get(trigger[1].ignored_channels) : undefined}\n`,
          inline: false,
        });
      });
      await new EmbedPageManager(interaction, fields, 'Trigger List').send();
      break;
    }
    default: {
      break;
    }
  }
}
