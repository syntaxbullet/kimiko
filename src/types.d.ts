import { Client } from "discord.js";

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

interface Plugin {
    name: string;
    path: string;
    enabled: boolean;
    config: Record<string, any>;
    dependencies: string[];
    onLoad: (client: Client<true>) => void;
    onDestroy: () => void;
}

export { KimikoRC, PluginEntry, Plugin };