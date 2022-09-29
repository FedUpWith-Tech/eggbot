/* eslint-disable no-console */
import {
  EmbedBuilder,
  Guild,
  RGBTuple,
} from 'discord.js';
import {
  createReadStream, createWriteStream,
  existsSync,
  mkdirSync,
  PathLike,
  readFileSync,
  writeFileSync,
} from 'fs';
import { createGzip } from 'zlib';

let boilerCrapGuild: Guild;

/**
 * Function to get the saved cache of the Guild
 * @returns The saved cache of the Guild
 */
export function getGuild() {
  return boilerCrapGuild;
}

/**
 * Function to update the saved cache of the Guild
 * @param guild {Guild} the updated Guild Cache
 */
export function setGuild(guild: Guild) {
  boilerCrapGuild = guild;
}

/**
 * Function to safely load a data file containing non-critical configuration
 * @param file {string} Filename
 * @param path {string} Path to File
 * @param defValue {object} JSON Object to initialize the file if none found
 *
 * @returns The JSON encoded data of the file specified
 */
export function safeLoad(file: string, path: PathLike, defValue: object) {
  if (!existsSync(path)) {
    console.warn(`Path - ${path} - not found, attempting to create it now.`);
    mkdirSync(path);
  }
  if (!existsSync(`${path}/${file}`)) {
    console.warn(`File - ${file} - not found, attempting to create one now.`);
    writeFileSync(`${path}/${file}`, JSON.stringify(defValue, null, 2));
  }
  try {
    let data = readFileSync(`${path}/${file}`, { encoding: 'utf-8' });
    data = JSON.parse(data);
    return data as unknown as object;
  } catch (e) {
    console.error(e);
  }
  return undefined;
}

/**
 * Function to safely store a data file containing non-critical information.
 *
 * @param file {string} Filename
 * @param newfile {Object} JSON Object to write as data
 *
 * @returns Updates the data file and backs up the old data file
 */
export function safeWrite(file: string, newfile: object) {
  if (!existsSync('./backups')) {
    mkdirSync('./backups');
  }
  if (!existsSync(`$./data/${file}`)) {
    safeLoad(file, './data', {});
  }
  try {
    const fileInfo = file.split('.');
    const readStream = createReadStream(`./data/${file}`);
    const writeStream = createWriteStream(`./backups/${fileInfo[0]}-${Date.now()}.${fileInfo[1]}.gz`);
    const zip = createGzip();
    readStream
      .pipe(zip)
      .pipe(writeStream)
      .on('finish', (err: Error) => {
        if (err) console.error(err)
      });
    writeFileSync(`./data/${file}`, JSON.stringify(newfile, null, 2));
  } catch (e) {
    console.error(e);
  }
}


/**
 * Helper function to generate a branded Embed
 * @param embed {EmbedBuilder} Embed Partial
 * @param color {RGBTuple} Optional Color
 *
 * @returns Formatted Embed ready to be sent.
 */
export function prettyEmbed(embed: EmbedBuilder, color?: RGBTuple) {
  embed.setFooter({
    text: 'Haha Egg',
    iconURL: 'https://boilercraft.com/images/hahaegg.png',
  });
  embed.setTimestamp();
  if (color) embed.setColor(color);
  return embed;
}
