import { KimikoRC } from '@kimikobot/types';
import { GatewayIntentBits } from 'discord.js';

const config: KimikoRC = {
  logging_default: {
    logToFile: false,
    logToConsole: true,
    logFilePath: 'logs/',
  },
  plugins: [
    {
      name: 'example-plugin',
      path: 'example-plugin',
      enabled: true,
      log_overrides: {
        logToFile: false,
        logToConsole: true,
      },
    },
  ],
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
  ],
};

export { config };
