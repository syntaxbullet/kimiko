import { Client } from 'discord.js';
import { KimikoRC } from '@kimikobot/types';
import { config } from './kimikorc';

/**
 * Represents a client for the Kimiko application.
 */
class KimikoClient extends Client<true> {
  private config: KimikoRC;

  private static instance: KimikoClient;

  public static getInstance(plugins?: Map<string, any>): KimikoClient {
    if (!KimikoClient.instance) {
      KimikoClient.instance = new KimikoClient(config, plugins);
    }
    return KimikoClient.instance;
  }

  public getConfig(): KimikoRC {
    return { ...this.config };
  }

  private constructor(config: KimikoRC, plugins?: Map<string, any>) {
    super({
      intents: config.intents,
    });
    this.config = { ...config };
  }
}

export { KimikoClient };
