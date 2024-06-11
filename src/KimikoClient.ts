import { Client } from 'discord.js';
import { KimikoLogger } from './KimikoLogger';
import { KimikoRC } from '@kimikobot/types';
import { config } from './kimikorc';

/**
 * Represents a client for the Kimiko application.
 */
class KimikoClient extends Client<true> {
  private config: KimikoRC;
  public logger: KimikoLogger = new KimikoLogger(null);

  private static instance: KimikoClient;

  public static getInstance(): KimikoClient {
    if (!KimikoClient.instance) {
      KimikoClient.instance = new KimikoClient(config);
    }
    return KimikoClient.instance;
  }

  public getConfig(): KimikoRC {
    return { ...this.config };
  }

  private constructor(config: KimikoRC) {
    super({
      intents: config.intents,
    });
    this.config = { ...config };
  }
}

export { KimikoClient };
