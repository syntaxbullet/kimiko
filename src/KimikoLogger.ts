import { config } from './kimikorc';
import { KimikoRC, logColors, logType } from '@kimikobot/types';
import fs from 'fs';

class KimikoLogger {
  private readonly config: KimikoRC;
  private readonly pluginTarget: string | null;
  private isConsoleEnabled: boolean;
  private isFileEnabled: boolean;
  private suffix: string;

  constructor(pluginTarget: string | null) {
    this.config = config;
    this.pluginTarget = pluginTarget;
    this.suffix = this.pluginTarget ? `[${this.pluginTarget}]` : '';
    this.isConsoleEnabled = this.getConsoleEnabled();
    this.isFileEnabled = this.getFileEnabled();
  }

  public log(logType: logType, color?: logColors, ...messages: string[]): void {
    if (this.isConsoleEnabled) {
      console.log(
        `${color || ''}[${logType}] ${this.suffix} ${messages.join(' ')}${logColors.RESET}`,
      );
    }
    if (this.isFileEnabled) {
      this.logToFile(logType, ...messages);
    }
  }

  private getOption(option: 'logToConsole' | 'logToFile'): boolean {
    if (this.pluginTarget) {
      const matchingPlugin = this.config.plugins.find(
        (plugin) => plugin.name === this.pluginTarget,
      );
      return (
        matchingPlugin?.log_overrides?.[option] ??
        this.config.logging_default[option]
      );
    }
    return this.config.logging_default[option];
  }

  private getConsoleEnabled(): boolean {
    return this.getOption('logToConsole');
  }

  private getFileEnabled(): boolean {
    return this.getOption('logToFile');
  }

  private logToFile(logType: logType, ...messages: string[]): void {
    const logFilePath = this.getLogFilePath();
    const logMessage = `[${logType}] [${this.suffix}] ${messages.join(' ')}\n`;
    fs.appendFile(logFilePath, logMessage, (err) => {
      if (err) {
        console.error(`Error writing to log file: ${err}`);
      }
    });
  }

  private getLogFilePath(): string {
    return this.pluginTarget
      ? `${this.config.logging_default.logFilePath}/${this.pluginTarget}.log`
      : `${this.config.logging_default.logFilePath}/kimiko.log`;
  }
}

export { KimikoLogger };
