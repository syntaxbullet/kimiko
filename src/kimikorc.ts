import { KimikoRC, logType } from '@kimikobot/types';
import { GatewayIntentBits } from 'discord.js';

const config: KimikoRC = {
  logging_default: {
    logToFile: false,
    logToConsole: true,
    logFilePath: 'logs/',
    defaultLogTypes: [logType.INFO, logType.WARN, logType.ERROR],
  },
  plugin_log_options: {
    'myplugindependant': {
      logToFile: false,
      logToConsole: true,
      enableLogTypes: [logType.DEBUG],
      disableLogTypes: [logType.WARN],
    },
  },
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
  ],
};

export { config };
