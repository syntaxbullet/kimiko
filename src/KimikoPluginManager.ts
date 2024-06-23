import fs from 'fs';
import path from 'path';
import { KimikoLogger } from './KimikoLogger.js';
import { KimikoClient } from './KimikoClient.js';
import dotenv from 'dotenv';

dotenv.config();

const ROOT_DIR = process.env.KIMIKO_ROOT_DIR || process.cwd();
const PLUGINS_DIR = path.resolve(ROOT_DIR, 'plugins');
const logger = new KimikoLogger('PluginManager');

type PluginMap = Map<string, PluginExports>;
type PluginExports = object & {
  default?: (client: KimikoClient, logger: KimikoLogger, pluginRegistry: PluginMap) => void;
};
type PluginFileMap = {
  path: string;
  packageJSON: Record<string, any>;
  kimikoPluginRC: Record<string, any>;
};

const pluginRegistry: PluginMap = new Map<string, PluginExports>();

async function getAllPlugins() {
  const plugins = new Map<string, PluginFileMap>();
  const isDir = (dir: string) => fs.lstatSync(dir).isDirectory();
  const hasRC = (pluginPath: string) =>
    fs.existsSync(path.resolve(pluginPath, 'kimiko.pluginrc.json'));
  const isPlugin = (pluginPath: string) => isDir(pluginPath) && hasRC(pluginPath);

  const pluginDirs = fs
    .readdirSync(PLUGINS_DIR)
    .map((dir) => path.resolve(PLUGINS_DIR, dir))
    .filter(isPlugin);

  pluginDirs.map((pluginDir) => {
    const packageJSON = JSON.parse(
      fs.readFileSync(path.resolve(pluginDir, 'package.json'), 'utf-8'),
    );
    const kimikoPluginRC = JSON.parse(
      fs.readFileSync(path.resolve(pluginDir, 'kimiko.pluginrc.json'), 'utf-8'),
    );
    plugins.set(packageJSON.name, {
      path: pluginDir,
      packageJSON,
      kimikoPluginRC,
    });
  });
  if (plugins.size === 0) {
    throw new Error('No plugins found.');
  }
  logger.debug(`Found ${plugins.size} plugins.`);
  return plugins;
}

// 1. check if all plugins have their dependencies met.
const checkDependencies = (plugins: Map<string, PluginFileMap>) => {
  logger.debug('Checking plugin dependencies...');
  const list = Array.from(plugins.keys());
  const missingDependencies = list.filter((plugin) => {
    const dependencies = plugins.get(plugin)!.kimikoPluginRC.dependencies;
    return dependencies.some((dep: string) => !list.includes(dep));
  });
  if (missingDependencies.length > 0) {
    logger.error(
      `The following plugins have missing dependencies: ${missingDependencies.join(', ')}`,
    );
    process.exit(1);
  }
  return plugins;
};
// 2. perform a topological sort on the plugins to ensure that dependencies are loaded first.
const topologicalSort = (plugins: Map<string, PluginFileMap>) => {
  logger.debug('Sorting plugins...');
  const list = Array.from(plugins.keys());
  const dependencies = list.map((plugin) => plugins.get(plugin)!.kimikoPluginRC.dependencies);
  const order: string[] = [];
  const visited: Set<string> = new Set();
  const isCyclic = (plugin: string) => dependencies[list.indexOf(plugin)].includes(plugin);
  const cyclicDependencies = list.filter(isCyclic);
  if (cyclicDependencies.length > 0) {
    logger.error(
      `The following plugins have cyclic dependencies: ${cyclicDependencies.join(', ')}`,
    );
    process.exit(1);
  }
  const visit = (plugin: string) => {
    if (visited.has(plugin)) return;
    visited.add(plugin);
    dependencies[list.indexOf(plugin)].forEach(visit);
    order.push(plugin);
  };

  list.forEach(visit);
  logger.debug(`Plugins sorted: ${order.join(' -> ')} `);

  return { order, plugins };
};

// 3. load the plugins in the correct order.
async function loadPlugin(plugin: string, plugins: Map<string, PluginFileMap>) {
  logger.debug(`Loading plugin: ${plugin}`);
  const pluginPath = plugins.get(plugin)!.path;
  const entryPoint = plugins.get(plugin)!.packageJSON.main || 'index.js';
  const pluginExports = (await import(path.resolve(pluginPath, entryPoint))) as PluginExports;
  pluginRegistry.set(plugin, pluginExports);
  logger.debug(`Plugin ${plugin} loaded.`);
  pluginExports.default?.(
    KimikoClient,
    new KimikoLogger(plugins.get(plugin)!.packageJSON.name),
    pluginRegistry,
  );
}

async function loadPluginsInOrder(order: string[], plugins: Map<string, PluginFileMap>) {
  for (const plugin of order) {
    await loadPlugin(plugin, plugins);
  }
}

export function loadPlugins() {
  if (!fs.existsSync(PLUGINS_DIR)) {
    logger.error('Plugins directory not found.');
    process.exit(1);
  }

  getAllPlugins()
    .then((plugins) => checkDependencies(plugins))
    .then((plugins) => topologicalSort(plugins))
    .then(({ order, plugins }) => loadPluginsInOrder(order, plugins))
    .catch((err) => {
      logger.error('Failed to load plugins', err.stack);
    });
}
