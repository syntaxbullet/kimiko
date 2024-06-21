import { parse } from './KimikoConfigManager.js';
import chalk from 'chalk';
import fs from 'fs';

type logLevels = {
  debug: 'DEBUG';
  info: 'INFO';
  warn: 'WARN';
  error: 'ERROR';
};
class KimikoLogger {
  private config: any;

  constructor(scope: string) {
    this.config = { ...parse(), scope };
  }

  private log(level: logLevels[keyof logLevels], ...messages: string[]) {
    if (!this.config.logging_defaults.enabled_log_levels.includes(level)) {
      return;
    }

    const logLevel = this.config.logging_defaults.include_log_level ? chalk.hex(this.config.logging_defaults.log_level_colors[level])(level) : '';
    const logColor = chalk.hex(this.config.logging_defaults.log_level_colors[level]);
    const timestamp = this.config.logging_defaults.include_timestamps
      ? new Date().toLocaleString(this.config.logging_defaults.timestamp_format)
      : '';
    const timestampColor = chalk.hex('222222');
    const logMessage = `${logColor(`[${this.config.scope}]`)} ${messages.join(' ')}`;

    if (this.config.logging_defaults.log_to_console) {
      switch (level) {
        case 'DEBUG':
        case 'INFO':
          console.log(`${timestampColor(timestamp)} ${logLevel} ${logMessage}`);
          break;
        case 'WARN':
          console.warn(`${timestampColor(timestamp)} ${logLevel} ${logMessage}`);
          break;
        case 'ERROR':
          console.error(`${timestampColor(timestamp)} ${logLevel} ${logMessage}`);
          break;
      }
    }

    if (this.config.logging_defaults.log_to_file) {
      fs.appendFile(
        `${this.config.logging_defaults.log_file_path}/${this.config.logging_defaults.log_file_name}`,
        `${logMessage}\n`,
        (err) => {
          if (err) {
            console.error('Failed to write to log file', err.message);
          }
        },
      );
    }
  }
  public debug(...messages: string[]) {
    this.log('DEBUG', ...messages);
  }
  public info(...messages: string[]) {
    this.log('INFO', ...messages);
  }
  public warn(...messages: string[]) {
    this.log('WARN', ...messages);
  }
  public error(...messages: string[]) {
    this.log('ERROR', ...messages);
  }
}

export { KimikoLogger };
