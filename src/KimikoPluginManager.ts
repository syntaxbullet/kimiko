import fs from 'fs';
import path from 'path';
import { KimikoLogger } from './KimikoLogger.js';
import { KimikoClient } from './KimikoClient.js';
import dotenv from 'dotenv';

dotenv.config();

const ROOT_DIR = process.env.KIMIKO_ROOT_DIR || process.cwd();
const PLUGINS_DIR = path.resolve(ROOT_DIR, 'plugins');
const logger = new KimikoLogger('PluginManager');

const unpackNodeModules = () => {
  const pluginModules = path.resolve(PLUGINS_DIR, 'node_modules');
  if (fs.existsSync(pluginModules)) {
    logger.debug('Unpacking plugins installed via npm...');
    fs.readdirSync(pluginModules).forEach((plugin) => {
      fs.renameSync(path.resolve(pluginModules, plugin), path.resolve(PLUGINS_DIR, plugin));
    });
    fs.rmdirSync(pluginModules);
  }
};

const createPluginDirectory = () => {
  if (!fs.existsSync(PLUGINS_DIR)) {
    logger.info('No plugins directory found, creating one...');
    fs.mkdirSync(PLUGINS_DIR);
  } else if (!fs.lstatSync(PLUGINS_DIR).isDirectory()) {
    logger.error('Failed to create plugins directory, a file with the same name already exists');
    process.exit(1);
  }
};

const searchForPlugins = () => {
  createPluginDirectory();
  unpackNodeModules();

  const directories = fs
    .readdirSync(PLUGINS_DIR)
    .filter((file) => fs.lstatSync(path.resolve(PLUGINS_DIR, file)).isDirectory());

  const pluginDirectories = directories.filter((dir) =>
    fs.existsSync(path.resolve(PLUGINS_DIR, dir, 'kimiko.pluginrc.json')),
  );

  const plugins = new Map();
  pluginDirectories.forEach((dir) => {
    const packageJsonPath = path.resolve(PLUGINS_DIR, dir, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      logger.error(`Plugin ${dir} is missing package.json`);
      return;
    }
    const pluginName = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8')).name;
    plugins.set(pluginName, path.resolve(PLUGINS_DIR, dir));
  });
  return plugins;
};

const getPluginConfig = (pluginPath: any) => {
  const pluginConfigPath = path.resolve(pluginPath, 'kimiko.pluginrc.json');
  if (!fs.existsSync(pluginConfigPath)) {
    logger.error(`Plugin ${pluginPath} is missing kimiko.pluginrc.json`);
    return null;
  }
  return JSON.parse(fs.readFileSync(pluginConfigPath, 'utf-8'));
};

const loadPlugin = async (pluginName: string) => {
  const pluginPath = searchForPlugins().get(pluginName);
  if (!pluginPath) {
    logger.error(`Failed to load plugin ${pluginName}, plugin not found`);
    return;
  }

  const pluginConfig = getPluginConfig(pluginPath);
  if (!pluginConfig) {
    logger.error(`Failed to load plugin ${pluginName}, plugin config not found`);
    return;
  }
  const entrypoint = pluginConfig.entrypoint || 'index.js';
  try {
    await loadDependencies(pluginName);
    const module = await import(path.resolve(pluginPath, entrypoint));
    logger.debug(`Loaded plugin ${pluginName}`);

    if (module.default) {
      module.default(KimikoClient, new KimikoLogger(pluginName));
    } else if (module.main) {
      logger.warn(`Plugin ${pluginName} has no default export, attempting to call main()`);
      module.main(KimikoClient, new KimikoLogger(pluginName));
    } else {
      logger.error(`Plugin ${pluginName} has no default export or main() function`);
    }
  } catch (error: any) {
    logger.error(`Failed to load plugin ${pluginName}`, error);
  }
};

const loadDependencies = async (pluginName: string) => {
  const pluginPath = searchForPlugins().get(pluginName);
  if (!pluginPath) {
    logger.error(`Failed to load dependencies for ${pluginName}, plugin not found`);
    return;
  }

  const pluginConfig = getPluginConfig(pluginPath);
  if (!pluginConfig) {
    logger.error(`Failed to load dependencies for ${pluginName}, plugin config not found`);
    return;
  }

  if (!pluginConfig.plugin_dependencies) return;

  const dependencies = pluginConfig.plugin_dependencies;
  logger.debug(`Loading dependencies for ${pluginName}`);

  for (const dependency of dependencies) {
    await loadPlugin(dependency);
  }
};

export const loadPlugins = () => {
  if (!fs.existsSync(PLUGINS_DIR)) {
    logger.error('No plugins directory found, skipping plugin search');
    return;
  }

  const loadedPlugins: string[] = [];
  const plugins = searchForPlugins();

  if (!plugins) {
    logger.error('No plugins found');
    return;
  }

  plugins.forEach((_, pluginName) => {
    if (loadedPlugins.includes(pluginName)) {
      logger.warn(`Plugin ${pluginName} already loaded, skipping...`);
      return;
    }

    logger.debug(`Loading plugin ${pluginName}`);
    loadedPlugins.push(pluginName);
    loadPlugin(pluginName);
  });
};
