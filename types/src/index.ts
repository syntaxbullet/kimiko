import { Client, GatewayIntentBits } from 'discord.js';

export type KimikoRC = {
  logging_default: {
    logToFile: boolean;
    logToConsole: boolean;
    logFilePath: string;
    defaultLogTypes: logType[];
  };
  plugin_log_options?: {
    [pluginName: string]: {
      logToFile: boolean;
      logToConsole: boolean;
      enableLogTypes: logType[];
      disableLogTypes: logType[];
    };
  };
  intents: GatewayIntentBits[];
};

export enum logColors {
  RED = '\x1b[31m',
  GREEN = '\x1b[32m',
  YELLOW = '\x1b[33m',
  BLUE = '\x1b[34m',
  MAGENTA = '\x1b[35m',
  CYAN = '\x1b[36m',
  WHITE = '\x1b[37m',
  RESET = '\x1b[0m',
}

export enum logType {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG',
  LOG = 'LOG',
}

export type KimikoLogger = {
  log(logType: logType, color?: logColors, ...messages: string[]): void;
};

export type KimikoClient = Client<true> & {
  logger: KimikoLogger;
  getConfig(): KimikoRC;
  getInstance?(): KimikoClient;
};

export interface KimikoPlugin {
  onLoad(client: KimikoClient, logger: KimikoLogger): void;
  onUnload(): void;
}
