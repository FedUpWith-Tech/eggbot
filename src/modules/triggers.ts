import {
  Channel,
  Message,
  Role,
  Snowflake,
} from 'discord.js';
import { getGuild, safeLoad, safeWrite } from './botUtils';

export const triggers: Trigger = safeLoad('triggers.json', './data', {})! as Trigger;

interface Trigger {
  [key: string]: {
    enabled: boolean
    regex: string,
    response: string
    ignored_role?: Snowflake,
    custom_logic?: Function,
    ignored_channels?: Snowflake,
    send_deletable: boolean
  },
}

export async function addTrigger(
  name: string,
  regex: string,
  response: string,
  send_deletable: boolean,
  ignored_role?: Role | null,
  ignored_channels?: Channel | null,
) {
  if (triggers[name]) return `Trigger with name: ${name} already exists. Please delete existing trigger or pick a different name.`;
  triggers[name] = {
    enabled: true,
    regex,
    response,
    send_deletable,
  };
  if (ignored_role) triggers[name].ignored_role = ignored_role.id;
  if (ignored_channels) triggers[name].ignored_channels = ignored_channels.id;
  safeWrite('triggers.json', triggers);
  return `Trigger: ${name} successfully added.`;
}

export async function rmTrigger(name: string) {
  if (!triggers[name]) return `Error: Trigger \`${name}\` not found.`;
  delete triggers[name];
  safeWrite('triggers.json', triggers);
  return `Successfully deleted trigger: ${name}`;
}

export async function editTrigger(
  name: string,
  regex?: string | null,
  response?: string | null,
  deletable?: boolean | null,
  ignored_role?: Role | null,
  ignored_channels?: Channel | null,
  enabled?: boolean | null,
) {
  if (!triggers[name]) return `Error: Trigger \`${name}\` not found.`;
  if (regex) triggers[name].regex = regex;
  if (response) triggers[name].response = response;
  if (deletable !== null && deletable !== undefined) triggers[name].send_deletable = deletable;
  if (ignored_role) triggers[name].ignored_role = ignored_role.id;
  if (ignored_channels) triggers[name].ignored_channels = ignored_channels.id;
  if (enabled !== null && enabled !== undefined) triggers[name].enabled = enabled;
  safeWrite('triggers.json', triggers);
  return `Trigger: ${name} successfully updated.`;
}

export async function checkTrigger(msg: Message, callback: Function) {
  const force = msg.cleanContent.includes('@trigger@');

  Object.values(triggers).forEach((trigger) => {
    if (!trigger.enabled) return;
    const regex = new RegExp(trigger.regex, 'i');
    if (regex.test(msg.cleanContent)) {
      if (force) {
        callback(trigger.response);
        return;
      }
      if (trigger.ignored_channels && trigger.ignored_channels.includes(msg.channel.id)) return;
      if (trigger.ignored_role) {
        const role = getGuild().roles.cache.get(trigger.ignored_role)!;
        if (msg.member!.roles.highest.position > role.position) return;
      }
      if (trigger.custom_logic && trigger.custom_logic(msg)) return;
      callback(trigger.response);
    }
  });
}
