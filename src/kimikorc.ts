import { KimikoRC } from '@kimikobot/types';
import { GatewayIntentBits } from 'discord.js';

const config: KimikoRC = {
  logging_default: {
    logToFile: false,
    logToConsole: true,
    logFilePath: 'logs/',
  },
  plugins: [],
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
  ],
};

export { config };
