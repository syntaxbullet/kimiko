import fs from 'fs';
import path from 'path';
import { KimikoLogger } from './KimikoLogger.js';
import { KimikoClient } from './KimikoClient.js';
import dotenv from 'dotenv';

dotenv.config();

const ROOT_DIR = process.env.KIMIKO_ROOT_DIR || process.cwd();
const PLUGINS_DIR = path.resolve(ROOT_DIR, 'plugins');
const logger = new KimikoLogger('PluginManager');

type PluginRegistry = Map<string, PluginExports>;
type PluginExports = Record<string, any> & {
  default: (client: KimikoClient, logger: KimikoLogger, pluginRegistry: PluginRegistry) => void;
};

type PluginFileMap = {
  path: string;
  packageJSON: Record<string, any> & {
    main?: string;
    name: string;
    version: string;
    dependencies: string[];
  };
  kimikoPluginRC: Record<string, any> & { dependencies: string[] };
};

const pluginRegistry: PluginRegistry = new Map<string, PluginExports>();

async function getPlugins() {
  const plugins = new Map<string, PluginFileMap>();

  function isDir(dir: string) {
    return fs.lstatSync(dir).isDirectory();
  }

  function hasRC(pluginPath: string) {
    return fs.existsSync(path.resolve(pluginPath, 'kimiko.pluginrc.json'));
  }

  function isPlugin(pluginPath: string) {
    return isDir(pluginPath) && hasRC(pluginPath);
  }

  const pluginDirs = fs.readdirSync(PLUGINS_DIR);
  const pluginPaths = pluginDirs.map((dir) => path.resolve(PLUGINS_DIR, dir));
  const pluginPathsFiltered = pluginPaths.filter(isPlugin);

  function getJSON(pluginPath: string, fileName: string) {
    return JSON.parse(fs.readFileSync(path.resolve(pluginPath, fileName), 'utf-8'));
  }

  pluginPathsFiltered.map((pluginPath) => {
    const packageJSON = getJSON(pluginPath, 'package.json');
    const kimikoPluginRC = getJSON(pluginPath, 'kimiko.pluginrc.json');
    plugins.set(packageJSON.name, { path: pluginPath, packageJSON, kimikoPluginRC });
  });

  if (plugins.size === 0) {
    throw new Error('No plugins found.');
  }

  logger.debug(`Found ${plugins.size} plugins.`);

  return plugins;
}

function checkDependencies(plugins: Map<string, PluginFileMap>) {
  logger.debug('Checking plugin dependencies...');
  const list = Array.from(plugins.keys());

  function getDependencies(plugin: string) {
    return plugins.get(plugin)!.kimikoPluginRC.dependencies;
  }

  function isMissingDependency(plugin: string) {
    return getDependencies(plugin).some(function (dep) {
      return !list.includes(dep);
    });
  }

  const missingDependencies = list.filter((plugin) => isMissingDependency(plugin));

  if (missingDependencies.length > 0) {
    logger.error(
      `The following plugins have missing dependencies: ${missingDependencies.join(', ')}`,
    );
    process.exit(1);
  }

  return plugins;
}

function topologicalSort(plugins: Map<string, PluginFileMap>) {
  logger.debug('Sorting plugins...');
  const list = Array.from(plugins.keys());
  const dependencies = list.map((plugin) => plugins.get(plugin)!.kimikoPluginRC.dependencies);
  const order: string[] = [];
  const visited: Set<string> = new Set();

  function isCyclic(plugin: string) {
    return dependencies[list.indexOf(plugin)].includes(plugin);
  }

  const cyclicDependencies = list.filter(isCyclic);

  if (cyclicDependencies.length > 0) {
    logger.error(`Cannot resolve cyclic dependencies: ${cyclicDependencies.join(', ')}`);
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
}

async function loadPlugin(plugin: string, plugins: Map<string, PluginFileMap>) {
  logger.debug(`Loading plugin: ${plugin}`);
  const pluginPath = plugins.get(plugin)!.path;
  const entryPoint = plugins.get(plugin)!.packageJSON.main || 'index.js';

  const pluginExports = (await import(path.resolve(pluginPath, entryPoint))) as PluginExports;

  pluginRegistry.set(plugin, pluginExports);
  logger.debug(`Plugin ${plugin} loaded.`);

  pluginExports.default(
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

  getPlugins()
    .then((plugins) => checkDependencies(plugins))
    .then((plugins) => topologicalSort(plugins))
    .then(({ order, plugins }) => loadPluginsInOrder(order, plugins))
    .catch((err) => {
      logger.error('Failed to load plugins', err.stack);
    });
}
