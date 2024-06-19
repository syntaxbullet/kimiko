import { KimikoClient, KimikoLogger, KimikoPlugin, logColors, logType } from '@kimikobot/types';

import events from './events';
import commands from './commands';

class ExamplePlugin implements KimikoPlugin {
  public onLoad(client: KimikoClient, logger: KimikoLogger): void {
    logger.log(logType.INFO, logColors.GREEN, 'Example plugin loaded');
  }
  public onUnload(): void {
    // this code runs when the plugin is unloaded or disabled
  }
}

export default new ExamplePlugin();
