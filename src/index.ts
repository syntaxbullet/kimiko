import { KimikoClient } from './KimikoClient';
import { KimikoPluginManager } from './KimikoPluginManager';
import { logType, logColors } from '@kimikobot/types';
import dotenv from 'dotenv';
import { Events } from 'discord.js';

dotenv.config();

const pluginManager = KimikoPluginManager.getInstance();

const client = KimikoClient.getInstance(pluginManager.loadedPlugins);

client.once(Events.ClientReady, () => {
  client.logger.log(logType.INFO, logColors.GREEN, 'Kimiko is ready!');
  pluginManager.loadPlugins();
});

client.login(process.env.DISCORD_TOKEN);
