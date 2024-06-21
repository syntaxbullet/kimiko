import { Client, GatewayIntentBits } from 'discord.js';
import { parse } from './KimikoConfigManager.js';
import { KimikoLogger } from './KimikoLogger.js';

type KimikoClient = Client & {
  logger: KimikoLogger;
};

const config = parse();
const logger = new KimikoLogger('Kimiko');
const client = new Client({
  intents: [config.intents.map((intent: any) => (GatewayIntentBits[intent] as any))],
});

const KimikoClient = client as KimikoClient;
KimikoClient.logger = logger;

export { KimikoClient };

