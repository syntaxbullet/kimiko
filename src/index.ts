import { KimikoClient } from './KimikoClient';
import { KimikoPluginManager } from './KimikoPluginManager';
import { logType, logColors } from '@kimikobot/types';
import dotenv from 'dotenv';
import { Events } from 'discord.js';
import { KimikoLogger } from './KimikoLogger';

dotenv.config();

const pluginManager = KimikoPluginManager.getInstance();
const logger = new KimikoLogger('Kimiko');

const client = KimikoClient.getInstance(pluginManager.loadedPlugins);

client.once(Events.ClientReady, () => {
  logger.log(logType.INFO, logColors.GREEN, 'Kimiko is ready');
  pluginManager.loadPlugins();
});

client.login(process.env.DISCORD_TOKEN);
