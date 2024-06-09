import path from "path";
import fs from "fs";
import { KimikoClient } from "./KimikoClient";
import { KimikoLogger, LogType } from "./KimikoLogger";
import { KimikoRC, PluginEntry } from "./types";

export class KimikoPluginManager {
    private static instance: KimikoPluginManager;
    private readonly client: KimikoClient;
    private readonly logger: KimikoLogger;
    private readonly config: KimikoRC;

    private loadedPlugins: PluginEntry[] = [];

    private constructor() {
        this.client = KimikoClient.getInstance();
        this.logger = this.client.logger;
        this.config = this.client.getConfig();
    }

    public static getInstance(): KimikoPluginManager {
        if (!KimikoPluginManager.instance) {
            KimikoPluginManager.instance = new KimikoPluginManager();
        }
        return KimikoPluginManager.instance;
    }

    public loadPlugin(plugin: PluginEntry): any {
        // 1. obtain the default export of the plugin entry by requiring the path
        if (!plugin.enabled) {
            this.logger.log(LogType.INFO, `Plugin ${plugin.name} is disabled and will not be loaded`);
            return;
        }
        // move out of the src directory and find the plugins directory
        const pluginPath = path.join(__dirname, "..", "plugins", plugin.path);

        const pluginModule = require(pluginPath);
        // build a custom logger for the plugin
        const instance = new pluginModule.default(this.client, this.logger);
        const loadedDependencies = [];



        // 2. check if the plugin has dependencies and run this method recursively for each dependency
        if (instance.dependencies && instance.dependencies.length > 0) {
            // 1. check if the loaded plugins array contains the dependencies and load them if they are not loaded
            for (const dependency of instance.dependencies) { // checks if the loaded plugins array contains the dependencies and load them if they are not loaded
                const dep = this.loadedPlugins.find((p) => p.name === dependency);
                if (!dep) {
                    const pluginToLoad = this.config.plugins.find((p) => p.name === dependency); // find the plugin entry in the config
                    if (pluginToLoad) {
                        loadedDependencies.push(this.loadPlugin(pluginToLoad)); // load the plugin and push it to the loaded dependencies array
                    } else {
                        this.logger.log(LogType.ERROR, `Could not find plugin ${dependency} for plugin ${plugin.name}`);
                    }
                }
            }
            // 2. check if all dependencies are loaded
            if (loadedDependencies.length !== instance.dependencies.length) {
                this.logger.log(LogType.ERROR, `Could not load all dependencies for plugin ${plugin.name}`);
                return;
            }
        }
        // 3. check if the plugin has an onLoad method and call it, passing it the client and the loaded dependencies
        if (instance.onLoad) {
            instance.onLoad(...loadedDependencies);
        }
        this.loadedPlugins.push(plugin);
        return instance;
    }

    public loadPlugins(): void {
        this.config.plugins.forEach((plugin) => {
            if (plugin.enabled) {
                this.loadPlugin(plugin);
            }
        });
    }
}   