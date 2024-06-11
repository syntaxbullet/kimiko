import {
  KimikoClient,
  KimikoLogger,
  KimikoPlugin,
  PluginExport,
  logColors,
  logType,
} from '@kimikobot/types';
import { Events, Message } from 'discord.js';

const examplePlugin: KimikoPlugin = {
  onLoad: (
    client: KimikoClient,
    logger: KimikoLogger,
    ..._dependencies: PluginExport[]
  ) => {
    client.on(Events.MessageCreate, (message: Message) => {
      logger.log(
        logType.INFO,
        logColors.CYAN,
        'Message received!:',
        message.content,
      );
    });
  },

  onUnload: () => {},
};

export default examplePlugin;
