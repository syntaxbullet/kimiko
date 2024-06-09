import fs from "fs";
import path from "path";
import { KimikoRC } from "./types";

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
                KimikoLogger.config = JSON.parse(fs.readFileSync(path.join(__dirname, "../kimikorc.json"), "utf-8"));
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

       if (KimikoLogger.config.logging.logToConsole) {
           console.log(`${LogColor[type]}[${type.toUpperCase()}]${LogColor.RESET} ${messages.join(" ")}`);
       }
         if (KimikoLogger.config.logging.logToFile) {
              fs.appendFile(KimikoLogger.config.logging.logFilePath, `[${type.toUpperCase()}] ${messages.join(" ")}\n`, (err) => {
                if (err) {
                     console.error("Failed to write to log file:", err);
                }
              });
         }
    }
    
    private constructor() {}
}

export { KimikoLogger, LogType };