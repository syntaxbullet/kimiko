import fs from 'fs';
import path from 'path';
import { KimikoLogger } from './KimikoLogger.js';
import dotenv from 'dotenv';

dotenv.config();

const ROOT_DIR = process.env.KIMIKO_ROOT_DIR as string;
const PLUGINS_DIR = path.resolve(ROOT_DIR, 'plugins');
const logger = new KimikoLogger('PluginManager');


const unpackNodeModules = () => {
  // check if a node_modules folder exists in the plugins directory
  if (fs.existsSync(path.resolve(PLUGINS_DIR, 'node_modules'))) {
    logger.debug('Unpacking plugins installed via npm...');
    // if it does, we move all the contents of the node_modules folder to the plugins directory
    fs.readdirSync(path.resolve(PLUGINS_DIR, 'node_modules')).forEach((file) => {
      fs.renameSync(path.resolve(PLUGINS_DIR, 'node_modules', file), path.resolve(PLUGINS_DIR, file));
    });
    // then we remove the empty node_modules folder
    fs.rmdirSync(path.resolve(PLUGINS_DIR, 'node_modules'));
  }
};

const searchForPlugins = () => {
  // check if the plugins directory exists
  if (!fs.existsSync(PLUGINS_DIR)) {
    // if it doesn't, we create it
    fs.mkdirSync(PLUGINS_DIR);
    logger.debug('Created plugins directory');
  }

  unpackNodeModules();

  if (fs.readdirSync(PLUGINS_DIR).length === 0) {
    logger.warn('No plugins found in plugins directory, exiting...');
    return;
  }
  // get a list of all the subdirectories in the plugins directory
  const directories = fs.readdirSync(PLUGINS_DIR).filter((file) => fs.statSync(path.resolve(PLUGINS_DIR, file)).isDirectory());
  // filter out directories that don't contain a kimiko.pluginrc.json file
  const pluginDirs = directories.filter((dir) => fs.existsSync(path.resolve(PLUGINS_DIR, dir, 'kimiko.pluginrc.json')));
  const plugins = new Map<string, string>();
  pluginDirs.forEach((plugin) => {
    plugins.set(plugin, path.resolve(PLUGINS_DIR, plugin));
  });
  logger.debug(`Found ${plugins.size} plugins...`);
  return plugins;
};

const listDependencies = (plugin: string) => {
  // each of the plugin directories should have a kimiko.pluginrc.json file that should contain the dependencies in `plugin_dependencies`
  const pluginConfig = JSON.parse(fs.readFileSync(path.resolve(PLUGINS_DIR, plugin, 'kimiko.pluginrc.json'), 'utf-8'));
  return pluginConfig.plugin_dependencies;
}

const getEntryPoint = (plugin: string) => {
  // each of the plugin directories should have a kimiko.pluginrc.json file that should contain the entry point in `entry_point`
  const pluginConfig = JSON.parse(fs.readFileSync(path.resolve(PLUGINS_DIR, plugin, 'kimiko.pluginrc.json'), 'utf-8'));
  return pluginConfig.entrypoint;
}

const loadPlugin = (plugin: string) => {
  try {
    loadDependencies(plugin);
  } catch (error: any) {
    logger.error(`Failed to load dependencies for plugin ${plugin}`, error);
  }
  const entryPoint = getEntryPoint(plugin);
  // dynamically import the plugin
  import(path.resolve(PLUGINS_DIR, plugin, entryPoint))
  .then((module) => {
    logger.info(`Loaded plugin ${plugin}`);
    module.main(); // call the main function of the plugin
  })
  .catch((error) => {
    logger.error(`Failed to load plugin ${plugin}`, error, error.stack);
    throw error;
  });
}

const loadDependencies = (plugin: string) => {
  // get the dependencies for the plugin
  const dependencies = listDependencies(plugin);
  // load each of the dependencies
  dependencies.forEach((dependency: string) => {
    loadPlugin(dependency);
  });
}

const loadPlugins = () => {
  const loadedPlugins: string[] = []
  const pluginsToLoad = searchForPlugins();
  if (!pluginsToLoad) {
    return;
  }
  pluginsToLoad.forEach((plugin) => {
    if (loadedPlugins.includes(plugin)) {
      return;
    }
    try {
      loadPlugin(plugin);
      loadedPlugins.push(plugin);
    } catch (error: any) {
      logger.error(`Failed to load plugin ${plugin}`, error);
    }
  });
  return loadedPlugins;
}

export { loadPlugins, searchForPlugins, listDependencies, getEntryPoint, loadPlugin, loadDependencies, unpackNodeModules, ROOT_DIR, PLUGINS_DIR };
