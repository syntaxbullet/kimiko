import { Client } from "discord.js";
import { KimikoClient } from "./KimikoClient";

type KimikoRC = {
    logging: {
        logToFile: boolean;
        logToConsole: boolean;
        logFilePath: string;
        colors: {
            info: string;
            warn: string;
            error: string;
            debug: string;
            reset: string;
        };
    };
    plugins: Record<string, PluginEntry>;
    intents: string[];
};

type PluginEntry = {
    name: string;
    path: string;
    enabled: boolean;
    config: Record<string, any>;
    dependencies: string[];
};

interface KimikoLogger {
    log(type: LogType, ...messages: string[]): void;
}

interface KimikoLoader {
    checkDependencies(plugin: PluginEntry): boolean;
    loadPlugins(): void;
}

interface KimikoClient {
    getConfig(): KimikoRC;

}
export { KimikoRC, PluginEntry, Plugin };