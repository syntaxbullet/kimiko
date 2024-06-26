import path from 'path';
import { KimikoClient } from './KimikoClient';
import { KimikoLogger } from './KimikoLogger';
import { KimikoRC, PluginEntry, logColors, logType } from '@kimikobot/types';

export class KimikoPluginManager {
  private static instance: KimikoPluginManager;
  private readonly client: KimikoClient;
  private readonly logger: KimikoLogger;
  private readonly config: KimikoRC;
  private loadedPlugins: PluginEntry[] = [];

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

  public loadPlugin(plugin: PluginEntry): any {
    if (!plugin.enabled) {
      this.logger.log(
        logType.INFO,
        logColors.BLUE,
        `Plugin ${plugin.name} is disabled`,
      );
      return;
    }

    const pluginPath = this.getPluginPath(plugin);
    const pluginModule = require(pluginPath);
    const dependencies = require(path.join(pluginPath, 'package.json'))
      .pluginDependencies as string[];
    const loadedDependencies = this.loadDependencies(dependencies, plugin);

    if (loadedDependencies === null) {
      this.logger.log(
        logType.ERROR,
        logColors.RED,
        `Failed to load dependencies for plugin ${plugin.name}`,
      );
      return;
    }

    this.callOnLoad(pluginModule, loadedDependencies, plugin.name);
    this.loadedPlugins.push(plugin);
    return;
  }

  private getPluginPath(plugin: PluginEntry): string {
    return path.join(__dirname, '..', 'plugins', plugin.path);
  }

  private loadDependencies(
    dependencies: string[] | undefined,
    plugin: PluginEntry,
  ): any[] | null {
    if (!dependencies || dependencies.length === 0) {
      return [];
    }

    const loadedDependencies: any[] = [];

    for (const dependencyName of dependencies) {
      const loadedDependency = this.getLoadedDependency(dependencyName);

      if (loadedDependency) {
        loadedDependencies.push(loadedDependency);
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
        loadedDependencies.push(newlyLoadedDependency);
      }
    }

    return loadedDependencies.length === dependencies.length
      ? loadedDependencies
      : null;
  }

  private getLoadedDependency(dependencyName: string): PluginEntry | undefined {
    return this.loadedPlugins.find((p) => p.name === dependencyName);
  }

  private callOnLoad(
    instance: any,
    loadedDependencies: any[],
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
      if (plugin.enabled) {
        this.loadPlugin(plugin);
      }
    });
  }
}
