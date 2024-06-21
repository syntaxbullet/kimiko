import z from 'zod';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./kimikorc.json', 'utf-8'));

const configSchema = z.object({
  loggingDefaults: z.object({
    logToConsole: z.boolean().optional(),
    logToFile: z.boolean().optional(),
    logFilePath: z.string().optional(),
    logFileName: z.string().optional(),
    includeTimestamps: z.boolean().optional(),
    timestampFormat: z.string().optional(),
    includeLogLevel: z.boolean().optional(),
    enabledLogLevels: z.array(z.string()).optional(),
    logLevelColors: z.record(z.string()).optional(),
  }),
  intents: z.array(z.string()),
});

const parse = () => {
  try {
    return configSchema.parse(config);
  } catch (error: any) {
    console.error('Failed to parse config', error.errors);
    process.exit(1);
  }
};

export { parse };
