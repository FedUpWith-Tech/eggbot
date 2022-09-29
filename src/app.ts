import {
  Client, GatewayIntentBits, Guild, Message,
} from 'discord.js';
import { config } from './modules/config';
import * as slashCommands from './slashCommands';
import { getGuild, setGuild } from './modules/botUtils';
import { reactionAdd, reactionRemove } from './modules/reactionRoles';
import { deletedMessageHandler, updatedMessageHandler } from './modules/rawPacketHandler';
import { checkTrigger } from './modules/triggers';
import EmbedPageManager from './modules/embedPagesManager';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildBans,
    GatewayIntentBits.GuildEmojisAndStickers,
    GatewayIntentBits.GuildIntegrations,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMessageTyping,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.DirectMessageReactions,
    GatewayIntentBits.DirectMessageTyping,
    GatewayIntentBits.MessageContent,
  ],
});

const commands = Object(slashCommands);

client.once('ready', () => {
  setGuild(client.guilds.cache.get(config.BOT_CONFIG.GUILD_ID) as Guild);
});

client.on('interactionCreate', async (interaction) => {
  if (interaction.isButton()) {
    await EmbedPageManager.checkButtonInteraction(interaction);
  }
  if (!interaction.isCommand()) {
    return;
  }
  const { commandName } = interaction;
  commands[commandName].execute(interaction, client);
});

client.on('messageCreate', async (message: Message) => {
  // Ignore bot messages
  if (message.author.bot) return;

  // Let's get the full user since there is a high chance we will need it
  const user = (await getGuild()).members.cache.get(message.author.id);

  await checkTrigger(message, (response: string | undefined) => {
    if (!response) return;
    message.reply({ content: response });
  });

  /* Memes */
  if (message.content.toLowerCase().includes("haha") && message.content.toLowerCase().includes("egg")) {
    await message.react('1024853189289312256');
  }

  if (message.content === '.bonk') {
    await message.channel.send('https://boilercraft.com/bonk.gif');
    await message.delete();
  }

  if (message.content.toLowerCase().includes("honey") && message.content.toLowerCase().includes("baked") && message.content.toLowerCase().includes("ham")) {
    await message.react('🍯');
    await message.react('🔥');
    await message.react('🍖');
  }

  if (message.content.endsWith("?") &&  message.mentions.has(client.user!) ) {
    let botReply = ["It is certain.", "It is decidedly so.", "Without a doubt.", "Yes, Definitely", "You may rely on it.", "As I see it, Yes.", "Most likely.", "Outlook Good.", "Yes.","Signs point to yes.","Reply hazy, try again.","Ask again later.","Better not tell you now.","Cannot predict now.",,"Concentrate and ask again.","Don't count on it.","My reply is no.","My sources say no.","Outlook not so good.","Very doubtful."]

    let index = Math.floor(Math.random () * 19);
    await message.reply({ content: botReply[index] });
  }

});

client.on('guildMemberAdd', async (member) => {
  setGuild(client.guilds.cache.get(config.BOT_CONFIG.GUILD_ID)!);
});

client.on('guildMemberRemove', async (member) => {
  setGuild(client.guilds.cache.get(config.BOT_CONFIG.GUILD_ID)!);
});

client.on('channelDelete', async (channel) => {});

/*
This is god-awful raw packet handling and shouldn't be touched as it will break things
Please Discord.js add native handlers for some of these things
 */
client.on('raw', async (packet) => {
  if (packet.t === 'MESSAGE_DELETE') {
    deletedMessageHandler(packet);
  }
  if (packet.t === 'MESSAGE_UPDATE') {
    updatedMessageHandler(packet);
  }
  if (packet.t === 'MESSAGE_REACTION_ADD') {
    if (packet.d.user_id === config.CLIENT_ID) return;
    reactionAdd(packet.d);
  }
  if (packet.t === 'MESSAGE_REACTION_REMOVE') {
    if (packet.d.user_id === config.CLIENT_ID) return;
    reactionRemove(packet.d);
  }
});

client.login(config.BOT_CONFIG.CLIENT_TOKEN);

export default client;
