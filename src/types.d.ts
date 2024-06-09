import { Client } from "discord.js";
import { KimikoClient } from "./KimikoClient";

enum LogType {
    INFO = "INFO",
    WARN = "WARN",
    ERROR = "ERROR",
    DEBUG = "DEBUG"
}

type KimikoRC = {
    logging_default: {
        logToFile: boolean;
        logToConsole: boolean;
        logFilePath: string;
    };
    plugins: PluginEntry[];
    intents: string[];
};

type PluginEntry = {
    name: string;
    path: string;
    enabled: boolean;
	log_overrides?: {
		logToFile?: boolean;
		logToConsole?: boolean;
	};
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
// TODO: Plugin interface/class
export { KimikoRC, PluginEntry };
