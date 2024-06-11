import path from 'path';
import { KimikoClient } from './KimikoClient';
import { KimikoLogger } from './KimikoLogger';
import {
  KimikoRC,
  KimikoPlugin,
  PluginExport,
  PluginEntry,
  logColors,
  logType,
} from '@kimikobot/types';

type LoadedPlugin = PluginEntry & { plugin: KimikoPlugin };

export class KimikoPluginManager {
  private static instance: KimikoPluginManager;
  private readonly client: KimikoClient;
  private readonly logger: KimikoLogger;
  private readonly config: KimikoRC;
  private loadedPlugins: LoadedPlugin[] = [];

  private constructor() {
    this.client = KimikoClient.getInstance();
    this.logger = new KimikoLogger('PluginManager');
    this.config = this.client.getConfig();
  }

  public static getInstance(): KimikoPluginManager {
    if (!KimikoPluginManager.instance) {
      KimikoPluginManager.instance = new KimikoPluginManager();
    }
    return KimikoPluginManager.instance;
  }

  public loadPlugin(entry: PluginEntry): LoadedPlugin | undefined {
    // Double enabled check? `loadPlugins` also checks.
    if (!entry.enabled) {
      this.logger.log(
        logType.INFO,
        logColors.BLUE,
        `Plugin ${entry.name} is disabled`,
      );
      return;
    }

    const pluginPath = this.getPluginPath(entry);
    const pluginModule: KimikoPlugin = require(pluginPath).default;
    const dependencies = require(path.join(pluginPath, 'package.json'))
      .pluginDependencies as string[];
    const loadedDependencies: PluginExport[] | null = this.loadDependencies(
      dependencies,
      entry,
    );

    if (loadedDependencies === null) {
      this.logger.log(
        logType.ERROR,
        logColors.RED,
        `Failed to load dependencies for plugin ${entry.name}`,
      );
      return;
    }

    this.callOnLoad(pluginModule, loadedDependencies, entry.name);
    this.loadedPlugins.push({ ...entry, plugin: pluginModule });
    return { ...entry, plugin: pluginModule };
  }

  private getPluginPath(plugin: PluginEntry): string {
    return path.join(__dirname, '..', 'plugins', plugin.path);
  }

  // Do we need a seperate function for loading dependencies?
  // It seems like the load function could just be recursive and check if something was already loaded.
  private loadDependencies(
    dependencies: string[] | undefined,
    plugin: PluginEntry,
  ): PluginExport[] | null {
    if (!dependencies || dependencies.length === 0) {
      return [];
    }

    const loadedDependencies: PluginExport[] = [];

    for (const dependencyName of dependencies) {
      const loadedDependency = this.getLoadedDependency(dependencyName);

      if (loadedDependency) {
        loadedDependencies.push({
          name: dependencyName,
          exports: loadedDependency.plugin.exports ?? [],
        });
        continue;
      }

      const pluginToLoad = this.config.plugins.find(
        (p) => p.name === dependencyName,
      );
      if (!pluginToLoad) {
        this.logger.log(
          logType.ERROR,
          logColors.RED,
          `Dependency ${dependencyName} not found for plugin ${plugin.name}`,
        );
        return null;
      }

      const newlyLoadedDependency = this.loadPlugin(pluginToLoad);
      if (newlyLoadedDependency) {
        loadedDependencies.push({
          name: dependencyName,
          exports: newlyLoadedDependency.plugin.exports ?? [],
        });
      }
    }

    return loadedDependencies.length === dependencies.length
      ? loadedDependencies
      : null;
  }

  private getLoadedDependency(
    dependencyName: string,
  ): LoadedPlugin | undefined {
    return this.loadedPlugins.find((p) => p.name === dependencyName);
  }

  private callOnLoad(
    instance: KimikoPlugin,
    loadedDependencies: PluginExport[],
    name: string,
  ): void {
    if (instance.onLoad) {
      this.logger.log(
        logType.DEBUG,
        logColors.MAGENTA,
        `Loaded plugin ${name}`,
      );
      instance.onLoad(
        this.client,
        new KimikoLogger(name),
        ...loadedDependencies,
      );
    }
  }

  public loadPlugins(): void {
    this.config.plugins.forEach((plugin) => {
      this.loadPlugin(plugin);
    });
  }
}
