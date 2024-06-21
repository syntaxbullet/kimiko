import { KimikoLogger } from './KimikoLogger.js';
import { KimikoClient } from './KimikoClient.js';
import { Client } from 'discord.js';
import dotenv from 'dotenv';
import { loadPlugins, searchForPlugins } from './KimikoPluginManager.js';

dotenv.config();

const logger = new KimikoLogger('Kimiko');

const lp = loadPlugins();

KimikoClient.on('ready', (client: Client) => {
  logger.info(`Logged in as ${client.user?.tag}!`);
});

KimikoClient.login(process.env.DISCORD_TOKEN);
