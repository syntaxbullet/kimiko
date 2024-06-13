import path from 'path';
import fs from 'fs';

import { KimikoClient } from './KimikoClient';
import { KimikoLogger } from './KimikoLogger';
import { logColors, logType, KimikoRC } from '@kimikobot/types';

class KimikoPluginManager {
  private static instance: KimikoPluginManager;
  private static readonly PLUGIN_DIR = path.join(__dirname, '..', 'plugins', 'node_modules');
  private static readonly client = KimikoClient.getInstance();
  private static readonly logger = new KimikoLogger('PluginManager');
  public loadedPlugins: Map<string, any> = new Map();

  private constructor() {}

  public static getInstance(): KimikoPluginManager {
    if (!KimikoPluginManager.instance) {
      KimikoPluginManager.instance = new KimikoPluginManager();
    }

    return KimikoPluginManager.instance;
  }

  private async loadPlugin(pluginName: string): Promise<void> {
    if (this.loadedPlugins.has(pluginName)) return;

    const pluginPath = path.join(KimikoPluginManager.PLUGIN_DIR, pluginName);
    const packageJSONPath = path.join(pluginPath, 'package.json');

    if (!fs.existsSync(path.join(KimikoPluginManager.PLUGIN_DIR, pluginName, 'package.json'))) {
      throw new Error(`Plugin ${pluginName} is not installed or does not exist`);
    }
    try {
      const unloadedDependencies = new Set<string>();

      const packageJSON = JSON.parse(fs.readFileSync(packageJSONPath, 'utf-8'));

      for (const dep in packageJSON.dependencies) {
        const pkg = packageJSON.dependencies[dep];
        if (pkg.startsWith('file:../')) {
          unloadedDependencies.add(pkg.split('file:../')[1]);
          await this.loadPlugin(pkg.split('file:../')[1]).then(() => {
            unloadedDependencies.delete(pkg.split('file:../')[1]);
          });
        }
      }
      const pluginExports = require(pluginPath);
      this.loadedPlugins.set(pluginName, { name: packageJSON.name, exports: pluginExports });
      KimikoPluginManager.logger.log(logType.INFO, logColors.GREEN, `Loaded plugin ${pluginName}`);
      pluginExports.onLoad(KimikoPluginManager.client, new KimikoLogger(pluginName));
    } catch (error: any) {
      KimikoPluginManager.logger.log(
        logType.ERROR,
        logColors.RED,
        `Error loading plugin ${pluginName}: ${error.message}`,
      );
    }
  }

  public async loadPlugins(): Promise<Map<string, any>> {
    const pluginDirectories = fs.readdirSync(KimikoPluginManager.PLUGIN_DIR);
    // for each subdirectory in the plugins directory load the plugin
    for (const plugin of pluginDirectories) {
      await this.loadPlugin(plugin);
    }
    return this.loadedPlugins;
  }
}

export { KimikoPluginManager };
