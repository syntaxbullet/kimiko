import { KimikoClient } from "./KimikoClient";
import { KimikoLogger } from "./KimikoLogger";
import { KimikoPluginManager } from "./KimikoPluginManager";

enum logColors {
    RED = "\x1b[31m",
    GREEN = "\x1b[32m",
    YELLOW = "\x1b[33m",
    BLUE = "\x1b[34m",
    MAGENTA = "\x1b[35m",
    CYAN = "\x1b[36m",
    WHITE = "\x1b[37m",
    RESET = "\x1b[0m"
}

enum logType {
    INFO = "INFO",
    WARN = "WARN",
    ERROR = "ERROR",
    DEBUG = "DEBUG",
    LOG = "LOG"
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


// TODO: Plugin interface/class
export { logColors, logType, KimikoRC, PluginEntry, KimikoClient, KimikoLogger, KimikoPluginManager };