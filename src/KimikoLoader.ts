import path from "path";
import { KimikoRC, PluginEntry } from "./types";
import { KimikoClient } from "./KimikoClient";
import { LogType } from "./KimikoLogger";

/**
 * The `KimikoLoader` class is responsible for loading and managing plugins in the Kimiko application.
 */
class KimikoLoader {
    private static instance: KimikoLoader;
    private static config: KimikoRC;
    private static client: KimikoClient;
    private plugins: any[] = [];

    /**
     * Returns the singleton instance of the `KimikoLoader` class.
     * @returns The singleton instance of `KimikoLoader`.
     */
    public static getInstance(): KimikoLoader {
        if (!KimikoLoader.instance) {
            try {
                KimikoLoader.client = KimikoClient.getInstance();
                KimikoLoader.config = KimikoLoader.client.getConfig();
                KimikoLoader.instance = new KimikoLoader();
            } catch (error) {
                console.error("Failed to load configuration:", error);
                process.exit(1);
            }
        }
        return KimikoLoader.instance;
    }

    private constructor() {}

    /**
     * Checks if all dependencies of a plugin are present in the plugins array.
     * @param plugin - The plugin entry to check dependencies for.
     * @returns A boolean indicating whether all dependencies are present.
     */
    public checkDependencies(plugin: PluginEntry): boolean {
        const pluginsToLoad: PluginEntry[] = Object.values(KimikoLoader.config.plugins);
        const dependencies = plugin.dependencies;
        const missingDependencies = dependencies.filter((dependency) => {
            return !pluginsToLoad.some((plugin) => plugin.name === dependency);
        });
        if (missingDependencies.length > 0) {
            KimikoLoader.client.logger.log(LogType.ERROR, `Plugin ${plugin.name} has missing dependencies: ${missingDependencies.join(", ")}`);
        }
        return missingDependencies.length === 0;
    }

    /**
     * Loads the plugins specified in the configuration.
     */
    public async loadPlugins() {
        const pluginsToLoad: PluginEntry[] = Object.values(KimikoLoader.config.plugins);
        pluginsToLoad.forEach((plugin) => {
			// TODO: Check that dependencies are loaded first
            if (plugin.enabled && this.checkDependencies(plugin)) {
                try {
                    const pluginPath = path.join(__dirname, plugin.path);
                    const pluginModule = require(pluginPath);
                    const pluginInstance = new pluginModule.default(KimikoLoader.client, plugin.config);
                    this.plugins.push(pluginInstance);
                    KimikoLoader.client.logger.log(LogType.INFO, `Loaded plugin ${plugin.name}`);
                    if (pluginInstance.onLoad) {
                        pluginInstance.onLoad(KimikoLoader.client);
                    } else {
                        KimikoLoader.client.logger.log(LogType.WARN, `Plugin ${plugin.name} does not have an onLoad function, emitting event instead.`);
                        KimikoLoader.client.emit(`${plugin.name}:onload`, KimikoLoader.client);
                    }
                } catch (error: any) {
                    KimikoLoader.client.logger.log(LogType.ERROR, `Failed to load plugin ${plugin.name}: ${error.message}`);
                }
            }
        });
    }
}

export { KimikoLoader };
