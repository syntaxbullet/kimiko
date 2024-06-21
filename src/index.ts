import { KimikoLogger } from './KimikoLogger.js';
import { KimikoClient } from './KimikoClient.js';
import { loadPlugins } from './KimikoPluginManager.js';
import { Client } from 'discord.js';
import dotenv from 'dotenv';

const logger = new KimikoLogger('Kimiko');
dotenv.config();

if (!process.env.DISCORD_TOKEN) {
  logger.error('DISCORD_TOKEN is not defined in the environment variables');
  process.exit(1);
}

loadPlugins();

KimikoClient.on('ready', (client: Client) => {
  logger.info(`Logged in as ${client.user?.tag}!`);
});

KimikoClient.login(process.env.DISCORD_TOKEN);
