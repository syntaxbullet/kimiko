import { config } from "./kimikorc";
import { KimikoRC, logColors, logType } from "kimiko-types";
import fs from "fs";



class KimikoLogger {
    private readonly config: KimikoRC = config;
    private readonly pluginTarget: string | null = null;
    private isConsoleEnabled: boolean = this.config.logging_default.logToConsole;
    private isFileEnabled: boolean = this.config.logging_default.logToFile;
    private suffix = this.pluginTarget;

    constructor(pluginTarget: string | null) {

        this.pluginTarget = pluginTarget;
        this.suffix = this.pluginTarget ? `[${this.pluginTarget}]` : "";
        if (this.pluginTarget) {
            const matchingPlugin = this.config.plugins.find((plugin) => plugin.name === this.pluginTarget);
            if (matchingPlugin) {
                this.isConsoleEnabled = matchingPlugin.log_overrides?.logToConsole ?? this.config.logging_default.logToConsole;
                this.isFileEnabled = matchingPlugin.log_overrides?.logToFile ?? this.config.logging_default.logToFile;
            }
        }
    }
    public log(logType: logType, color?: logColors, ...messages: string[]): void {
        if (this.isConsoleEnabled) {
            console.log(`${color || ""}[${logType}] ${this.suffix} ${messages.join(" ")}${logColors.RESET}`);
        }
        if (this.isFileEnabled) {
            this.logToFile(logType, ...messages);
        }
    }
    private logToFile(logType: logType, ...messages: string[]): void {
        const logFilePath = this.pluginTarget ? `${this.config.logging_default.logFilePath}/${this.pluginTarget}.log` : `${this.config.logging_default.logFilePath}/kimiko.log`;
        const logMessage = `[${logType}] [${this.suffix}] ${messages.join(" ")}\n`;
        fs.appendFile(logFilePath, logMessage, (err) => {
            if (err) {
                console.error(`Error writing to log file: ${err}`);
            }
        });
    }
}

export { KimikoLogger };