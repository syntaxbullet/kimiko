import fs from "fs";
import path from "path";
import { KimikoRC } from "./types";
import { config } from "./kimikorc";

enum LogType {
    INFO = "INFO",
    WARN = "WARN",
    ERROR = "ERROR",
    DEBUG = "DEBUG"
}

const LogColor = {
    [LogType.INFO]: "\x1b[36m",
    [LogType.WARN]: "\x1b[33m",
    [LogType.ERROR]: "\x1b[31m",
    [LogType.DEBUG]: "\x1b[35m",
    RESET: "\x1b[0m"
};

/**
 * The KimikoLogger class provides logging functionality for the Kimiko application.
 */
class KimikoLogger {
    private static instance: KimikoLogger;
    private static config: KimikoRC;
    
    /**
     * Returns the singleton instance of the KimikoLogger class.
     * @returns The singleton instance of the KimikoLogger class.
     */
    public static getInstance(): KimikoLogger {
        if (!KimikoLogger.instance) {
            try {
                KimikoLogger.config = config;
                KimikoLogger.instance = new KimikoLogger();
            } catch (error) {
                console.error("Failed to load configuration:", error);
                process.exit(1);
            }
        }
        return KimikoLogger.instance;
    }
    
    /**
     * Logs the specified messages with the given log type.
     * @param type - The log type.
     * @param messages - The messages to be logged.
     */
    public log(type: LogType, ...messages: string[]) {

        const logToFile = KimikoLogger.config.logging_default.logToFile;
        const logToConsole = KimikoLogger.config.logging_default.logToConsole;
        const logFilePath = KimikoLogger.config.logging_default.logFilePath;
       
        const logMessage = `[${new Date().toLocaleString()}] [${type}] ${messages.join(" ")}`;
        const logColor = LogColor[type];
        const logReset = LogColor.RESET;

        if (logToConsole) console.log(`${logColor}${logMessage}${logReset}`);
        if (logToFile) {
            const logFile = path.join(logFilePath, `${new Date().toLocaleDateString()}.log`);
            fs.appendFile(logFile, `${logMessage}\n`, (error) => {
                if (error) console.error("Failed to write to log file:", error);
            });

        }
            
        
    }
    
    private constructor() {}
}

export { KimikoLogger, LogType };