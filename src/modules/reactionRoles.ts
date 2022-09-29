import {
  EmbedBuilder,
  EmojiIdentifierResolvable,
  Role,
  RoleResolvable,
  Snowflake,
  TextChannel,
} from 'discord.js';
import {
  getGuild,
  prettyEmbed,
  safeLoad,
  safeWrite,
} from './botUtils';
import { config } from './config';

interface Packet {
  message_id: Snowflake;
  user_id: Snowflake;
  emoji: {
    name: string;
    id: Snowflake;
  }
}
interface ReactionMessages {
  [key: Snowflake]: {
    CHAN: Snowflake;
    EMOJIS: [
        EMOJI: EmojiIdentifierResolvable,
    ];
    ROLES: [
        ROLE: Snowflake,
    ]
    ;
  }
}

let reactionmessage: ReactionMessages = safeLoad('reactionmessages.json', './data/', {})! as ReactionMessages;

/**
 * Function to give users a role if they react to a saved reaction message
 * @param reaction {any} The MESSAGE_REACTION_ADD packet
 */
export async function reactionAdd(reaction: Packet) {
  if (Object.prototype.hasOwnProperty.call(reactionmessage, reaction.message_id)) {
    const baseline = reactionmessage[reaction.message_id];
    let index;
    if (reaction.emoji.id === null) {
      index = baseline.EMOJIS.indexOf(reaction.emoji.name);
    } else {
      index = baseline.EMOJIS.indexOf(reaction.emoji.id);
    }
    if (index < 0) return;
    const member = await getGuild().members.cache.get(reaction.user_id);
    const role = await getGuild().roles.cache.get(baseline.ROLES[index]);
    await member!.roles.add(role as RoleResolvable);
  }
}

/**
 * Function to remove a role from a user based on a saved reaction message
 * @param reaction {any} The MESSAGE_REACTION_REMOVE packet
 */
export async function reactionRemove(reaction: Packet) {
  if (Object.prototype.hasOwnProperty.call(reactionmessage, reaction.message_id)) {
    const baseline = reactionmessage[reaction.message_id];
    let index;
    if (!reaction.emoji.id) {
      index = baseline.EMOJIS.indexOf(reaction.emoji.name);
    } else {
      index = baseline.EMOJIS.indexOf(reaction.emoji.id);
    }
    if (index < 0) return;
    const member = getGuild().members.cache.get(reaction.user_id)!;
    const role = getGuild().roles.cache.get(baseline.ROLES[index])!;
    await member.roles.remove(role as RoleResolvable);
  }
}

/**
 * Function to save add a reaction to a message that will give users roles
 * @param MID {string} The message link of the message
 * @param emoji {EmojiIdentifierResolvable} The emoji that will give users roles
 * @param role {Role} The role to give users
 * @param callback {Function} Callback to give status of the function call
 */
export async function addReactionMessage(
  MID: Snowflake,
  emoji: EmojiIdentifierResolvable,
  role: Role,
  callback: Function,
) {
  // Validate the message link
  if (MID.substr(0, 48) !== `https://discord.com/channels/${config.BOT_CONFIG.GUILD_ID}/`) {
    callback(
      prettyEmbed(new EmbedBuilder())
        .setColor('#FF0000')
        .setDescription("I'm sorry, that message link was invalid."),
    );
    return;
  }

  // Split link to array to use parts
  const MIDArray = MID.split('/');
  // Fetch message to pass to callback
  const chan = await getGuild().channels.cache.get(MIDArray[5])! as TextChannel;
  const msg = await chan.messages.fetch(MIDArray[6]);

  if (Object.prototype.hasOwnProperty.call(reactionmessage, MIDArray[6])) {
    reactionmessage[MIDArray[6]].EMOJIS.push(emoji);
    reactionmessage[MIDArray[6]].ROLES.push(role.id);
    await msg.react(emoji);
    await safeWrite('reactionmessages.json', reactionmessage);
  } else {
    reactionmessage[MIDArray[6]] = {
      CHAN: chan.id,
      EMOJIS: [emoji],
      ROLES: [role.id],
    };
    await msg.react(emoji);
    await safeWrite('reactionmessages.json', reactionmessage);
  }
  callback(prettyEmbed(new EmbedBuilder()).setColor('#F0F0F0').setTitle('Done! :smile:'));
}

/**
 * Function to remove a stored reaction message
 * @param MID {Snowflake} The MessageID of stored reaction message
 */
export async function rmReactionMessage(MID: Snowflake) {
  if (!reactionmessage[MID]) {
    return;
  }
  delete reactionmessage[MID];
  safeWrite('reactionmessages.json', reactionmessage);
}
