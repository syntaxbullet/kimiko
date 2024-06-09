import path from "path";
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
        if (!plugin.enabled) {
            this.logger.log(LogType.INFO, `Plugin ${plugin.name} is disabled and will not be loaded`);
            return;
        }

        const pluginPath = this.getPluginPath(plugin);
        const pluginModule = require(pluginPath);
        const instance = new pluginModule.default(this.client, this.logger);
        const loadedDependencies = this.loadDependencies(instance.dependencies, plugin);

        if (loadedDependencies === null) {
            this.logger.log(LogType.ERROR, `Could not load all dependencies for plugin ${plugin.name}`);
            return;
        }

        this.callOnLoad(instance, loadedDependencies);
        this.loadedPlugins.push(plugin);
        return instance;
    }

    private getPluginPath(plugin: PluginEntry): string {
        return path.join(__dirname, "..", "plugins", plugin.path);
    }

    private loadDependencies(dependencies: string[] | undefined, plugin: PluginEntry): any[] | null {
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

            const pluginToLoad = this.config.plugins.find(p => p.name === dependencyName);
            if (!pluginToLoad) {
                this.logger.log(LogType.ERROR, `Could not find plugin ${dependencyName} for plugin ${plugin.name}`);
                return null;
            }

            const newlyLoadedDependency = this.loadPlugin(pluginToLoad);
            if (newlyLoadedDependency) {
                loadedDependencies.push(newlyLoadedDependency);
            }
        }

        return loadedDependencies.length === dependencies.length ? loadedDependencies : null;
    }

    private getLoadedDependency(dependencyName: string): PluginEntry | undefined {
        return this.loadedPlugins.find(p => p.name === dependencyName);
    }

    private callOnLoad(instance: any, loadedDependencies: any[]): void {
        if (instance.onLoad) {
            instance.onLoad(...loadedDependencies);
        }
    }

    public loadPlugins(): void {
        this.config.plugins.forEach(plugin => {
            if (plugin.enabled) {
                this.loadPlugin(plugin);
            }
        });
    }
}
