import path from 'path';
import fs from 'fs';

import { KimikoClient } from './KimikoClient';
import { KimikoLogger } from './KimikoLogger';
import { logColors, logType } from '@kimikobot/types';

class KimikoPluginManager {
  private static instance: KimikoPluginManager;
  private static readonly BOT_ROOT_DIR = path.join(__dirname, '..');
  private static readonly client = KimikoClient.getInstance();
  private static readonly logger = new KimikoLogger('PluginManager');
  private pluginPaths: Map<string, string> = new Map();
  public loadedPlugins: Map<string, any> = new Map();

  private constructor() {}

  public static getInstance(): KimikoPluginManager {
    if (!KimikoPluginManager.instance) {
      KimikoPluginManager.instance = new KimikoPluginManager();
    }

    return KimikoPluginManager.instance;
  }

  private findPlugins() {
    KimikoPluginManager.logger.log(logType.INFO, logColors.GREEN, 'Searching for plugins...');
    // Check all downloaded npm dependencies for plugins
    const packageLock = JSON.parse(
      fs.readFileSync(path.join(KimikoPluginManager.BOT_ROOT_DIR, 'package-lock.json'), 'utf-8'),
    );
    const npmPackages = Object.keys(packageLock.packages);

    const plugins = new Map<string, string>(); // name, path
    for (const pkg of npmPackages) {
      if (fs.existsSync(path.join(KimikoPluginManager.BOT_ROOT_DIR, pkg, 'pluginrc.ts'))) {
        const pluginPackageJSON = JSON.parse(
          fs.readFileSync(path.join(pkg, 'package.json'), 'utf-8'),
        );
        plugins.set(pluginPackageJSON.name, path.join(KimikoPluginManager.BOT_ROOT_DIR, pkg));
      }
    }

    KimikoPluginManager.logger.log(logType.INFO, logColors.GREEN, `Found ${plugins.size} plugins`);
    plugins.forEach((path, name) => {
      KimikoPluginManager.logger.log(
        logType.INFO,
        logColors.GREEN,
        `Found plugin ${name} at ${path}`,
      );
    });

    this.pluginPaths = plugins;
  }

  private async loadPlugin(pluginName: string, pluginPath: string): Promise<void> {
    if (this.loadedPlugins.has(pluginName)) return;

    const packageJSONPath = path.join(pluginPath, 'package.json');

    if (!fs.existsSync(packageJSONPath)) {
      throw new Error(`Plugin ${pluginName} is not installed or does not exist`);
    }
    try {
      const packageJSON = JSON.parse(fs.readFileSync(packageJSONPath, 'utf-8'));

      for (const dep in packageJSON.dependencies) {
        if (this.pluginPaths.has(dep)) {
          await this.loadPlugin(dep, this.pluginPaths.get(dep) as string);
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
    this.findPlugins();
    for (const [pluginName, pluginPath] of this.pluginPaths) {
      await this.loadPlugin(pluginName, pluginPath);
    }
    return this.loadedPlugins;
  }
}

export { KimikoPluginManager };
