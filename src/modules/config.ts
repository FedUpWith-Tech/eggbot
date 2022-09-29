/* eslint-disable no-console */
import { existsSync, readFileSync, writeFileSync } from 'fs';

// Default Bot Configuration
const defaultConfig = {
  BOT_CONFIG: {
    CLIENT_ID: '',
    GUILD_ID: '',
    CLIENT_TOKEN: '',
    CLIENT_SECRET: '',
  },
  CHANNELS: {},
  ROLES: {
    ADMIN: ''
  },
};

/**
 * Function to safely load and check for valid config
 *
 * @returns Valid Bot Configuration
 */
function loadConfig() {
  if (!existsSync('./config.json')) {
    console.warn('Config file not found, writing one now.');
    writeFileSync('./config.json', JSON.stringify(defaultConfig, null, 2));
    console.info('Successfully created config file. Please fill it out and restart the bot.');
    process.exit(1);
  }
  const data = JSON.parse(readFileSync('./config.json', { encoding: 'utf-8' }));
  let upToDate = 1;
  Object.keys(defaultConfig).forEach((prop) => {
    if (!Object.prototype.hasOwnProperty.call(data, prop)) {
      upToDate = 0;
      data[prop] = defaultConfig[prop as keyof typeof defaultConfig];
    }
  });
  if (upToDate) return data;
  console.error('Your config file is out of date or malformed. I will attempt to update your config.');
  try {
    writeFileSync('./config.json', JSON.stringify(data, null, 2));
  } finally {
    console.info('Config file has been updated, please reconfigure the bot then restart.');
    process.exit(1);
  }
  return data;
}

const config = loadConfig();

// eslint-disable-next-line import/prefer-default-export
export { config };
