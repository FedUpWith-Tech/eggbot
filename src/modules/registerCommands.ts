import { REST, SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder } from 'discord.js';
import { Routes } from 'discord-api-types/v9';
import { config } from './config';
import * as slashCommands from '../slashCommands';

/**
 * This script should only be run once or when commands change, it likely will
 * not need to be edited unless we update to a new API version.
 */

type Command = {
  data: SlashCommandBuilder | Omit<SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder, 'addSubcommand' | 'addSubcommandGroup' >
};

const commands = [];

// eslint-disable-next-line no-restricted-syntax
for (const module of Object.values<Command>(slashCommands)) {
  commands.push(module.data);
}

const rest = new REST({ version: '10' }).setToken(config.BOT_CONFIG.CLIENT_TOKEN);

try {
  rest.put(Routes
    .applicationGuildCommands(config.BOT_CONFIG.CLIENT_ID, config.BOT_CONFIG.GUILD_ID), {
    body: commands,
  });
} catch (e) {
  // eslint-disable-next-line no-console
  console.error(e);
}
