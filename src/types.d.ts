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
// What do plugins need to do?
// They may need to know when they are initialized so that they can perform initial setup
// At initialization, they should receive their dependencies' exports
// They may need to offer a set of configuration options that can be used to build the web interface
//   In this situation, they must also implement a function to receive configurations
// They may need to list their exports, so to speak

// TODO: These configs are rather inflexible, disallowing things like "toggling this enables the choice of these"
// and other nesting options. They serve as a baseline for now. We don't even have any place to allow the user
// to configure these properly yet, so these will go unused for some time.
enum ConfigType {
	Integer = "integer",
	Real = "real",
	Toggle = "toggle",
	Radio = "radio",
}
type IntegerConfig = {
	type: ConfigType.Integer;
	label: string;
	cur_val: number;
	description?: string;
	min_val?: number;
	max_val?: number;
}
type RealConfig = {
	type: ConfigType.Real;
	label: string;
	cur_val: number;
	description?: string;
	min_val?: number;
	max_val?: number;
}
type ToggleConfig = {
	type: ConfigType.Toggle;
	label: string;
	cur_val: boolean;
	description?: string;
}
type RadioConfig = {
	type: ConfigType.Radio;
	label: string;
	cur_val: number;
	options: { label: string; state: boolean }[];
}

type ConfigSpec = IntegerConfig | RealConfig | ToggleConfig | RadioConfig;

type PluginExport = {
	name: string;
	exports: {[key: string]: any};
}
interface KimikoPlugin {
	init(client: Client, logger: KimikoLogger);
	config?: {
		configParameters: ConfigSpec[];
		setConfig(options: ConfigSpec[]);
	};
	exports?: {[key: string]: any};
	onLoad?(dependencies: PluginExport[]);
}

export { KimikoRC, PluginEntry, PluginExport, KimikoPlugin, ConfigSpec, ConfigType };
