import {
  KimikoClient,
  KimikoLogger,
  logColors,
  logType,
} from '@kimikobot/types';
import { Events, Message } from 'discord.js';

const onLoad = (
  client: KimikoClient,
  logger: KimikoLogger,
  ...dependencies: any
) => {
  client.on(Events.MessageCreate, (message: Message) => {
    logger.log(
      logType.INFO,
      logColors.CYAN,
      'Message received!:',
      message.content,
    );
  });
};

const onUnload = () => {};

export { onLoad, onUnload };
