import fs from 'fs';
import path from 'path';
import { KimikoLogger } from './KimikoLogger.js';
import { KimikoClient } from './KimikoClient.js';
import dotenv from 'dotenv';

dotenv.config();

const ROOT_DIR = process.env.KIMIKO_ROOT_DIR as string;
const PLUGINS_DIR = path.resolve(ROOT_DIR, 'plugins');
const logger = new KimikoLogger('PluginManager');

const unpackNodeModules = () => {
  if (fs.existsSync(path.resolve(PLUGINS_DIR, 'node_modules'))) {
    logger.debug('Unpacking plugins installed via npm...');
    fs.readdirSync(path.resolve(PLUGINS_DIR, 'node_modules')).forEach((file) => {
      fs.renameSync(
        path.resolve(PLUGINS_DIR, 'node_modules', file),
        path.resolve(PLUGINS_DIR, file),
      );
    });
    fs.rmdirSync(path.resolve(PLUGINS_DIR, 'node_modules'));
  }
};

const searchForPlugins = () => {
  if (!fs.existsSync(PLUGINS_DIR)) {
    fs.mkdirSync(PLUGINS_DIR);
    logger.debug('Created plugins directory');
  }

  unpackNodeModules();

  if (fs.readdirSync(PLUGINS_DIR).length === 0) {
    logger.warn('No plugins found in plugins directory, exiting...');
    return;
  }

  const directories = fs
    .readdirSync(PLUGINS_DIR)
    .filter((file) => fs.statSync(path.resolve(PLUGINS_DIR, file)).isDirectory());

  const pluginDirs = directories.filter((dir) =>
    fs.existsSync(path.resolve(PLUGINS_DIR, dir, 'kimiko.pluginrc.json')),
  );

  const plugins = new Map<string, string>();
  pluginDirs.forEach((plugin) => {
    plugins.set(plugin, path.resolve(PLUGINS_DIR, plugin));
  });

  logger.debug(`Found ${plugins.size} plugins...`);
  return plugins;
};

const listDependencies = (plugin: string) => {
  const pluginConfig = JSON.parse(
    fs.readFileSync(path.resolve(PLUGINS_DIR, plugin, 'kimiko.pluginrc.json'), 'utf-8'),
  );
  return pluginConfig.pluginDependencies;
};

const getEntryPoint = (plugin: string) => {
  const pluginConfig = JSON.parse(
    fs.readFileSync(path.resolve(PLUGINS_DIR, plugin, 'kimiko.pluginrc.json'), 'utf-8'),
  );
  return pluginConfig.entrypoint;
};

const loadPlugin = (plugin: string) => {
  const pluginName = plugin.split(path.sep).pop() as string;
  try {
    loadDependencies(plugin);
  } catch (error: any) {
    logger.error(`Failed to load dependencies for plugin ${plugin}`, error);
    return;
  }

  const entryPoint = getEntryPoint(plugin);
  import(path.resolve(PLUGINS_DIR, plugin, entryPoint))
    .then((module) => {
      logger.info(`Loaded plugin ${plugin}`);
      if (module.default) {
        module.default(KimikoClient, new KimikoLogger(pluginName));
      } else if (module.main) {
        logger.warn(`Plugin ${plugin} has no default export, attempting to call main()`);
        module.main(KimikoClient, new KimikoLogger(pluginName));
      } else {
        logger.error(`Plugin ${plugin} has no default export or main() function`);
      }
    })
    .catch((error) => {
      logger.error(`Failed to load plugin ${plugin}`, error, error.stack);
      throw error;
    });
};

const loadDependencies = (plugin: string) => {
  const dependencies = listDependencies(plugin);
  dependencies.forEach((dependency: string) => {
    loadPlugin(dependency);
  });
};

const loadPlugins = () => {
  const loadedPlugins: string[] = [];
  const pluginsToLoad = searchForPlugins();
  if (!pluginsToLoad) return;

  pluginsToLoad.forEach((plugin) => {
    if (loadedPlugins.includes(plugin)) return;
    try {
      loadPlugin(plugin);
      loadedPlugins.push(plugin);
    } catch (error: any) {
      logger.error(`Failed to load plugin ${plugin}`, error);
    }
  });
  return loadedPlugins;
};

export {
  loadPlugins,
  searchForPlugins,
  listDependencies,
  getEntryPoint,
  loadPlugin,
  loadDependencies,
  unpackNodeModules,
  ROOT_DIR,
  PLUGINS_DIR,
};
