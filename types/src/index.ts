import { Client } from "discord.js";

export type KimikoRC = {
    logging_default: {
        logToFile: boolean;
        logToConsole: boolean;
        logFilePath: string;
    };
    plugins: PluginEntry[];
    intents: string[];
};

export type PluginEntry = {
    name: string;
    path: string;
    enabled: boolean;
	log_overrides?: {
		logToFile?: boolean;
		logToConsole?: boolean;
	};
};

export enum logColors {
    RED = "\x1b[31m",
    GREEN = "\x1b[32m",
    YELLOW = "\x1b[33m",
    BLUE = "\x1b[34m",
    MAGENTA = "\x1b[35m",
    CYAN = "\x1b[36m",
    WHITE = "\x1b[37m",
    RESET = "\x1b[0m"
}

export enum logType {
    INFO = "INFO",
    WARN = "WARN",
    ERROR = "ERROR",
    DEBUG = "DEBUG",
    LOG = "LOG"
}

export type KimikoLogger = {
    log(logType: logType, color?: logColors, ...messages: string[]): void;
};

export type KimikoClient = Client<true> & {
    logger: KimikoLogger;
    getConfig(): KimikoRC;
    getInstance(): KimikoClient;
};

export type KimikoPluginManager = {
    loadPlugins(): void;
    getPlugins(): PluginEntry[];
    getPlugin(name: string): PluginEntry | null;
    reloadPlugin(name: string): void;
    unloadPlugin(name: string): void;
};
