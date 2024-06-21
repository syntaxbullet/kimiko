import z from 'zod';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./kimikorc.json', 'utf-8'));

const ConfigSchema = z.object({
  logging_defaults: z.object({
    log_to_console: z.boolean().optional(),
    log_to_file: z.boolean().optional(),
    log_file_path: z.string().optional(),
    log_file_name: z.string().optional(),
    include_timestamps: z.boolean().optional(),
    timestamp_format: z.string().optional(),
    include_log_level: z.boolean().optional(),
    enabled_log_levels: z.array(z.string()).optional(),
    log_level_colors: z.record(z.string()).optional(),
  }),
  intents: z.array(z.string()),
});

const parse = () => {
  try {
    return ConfigSchema.parse(config);
  } catch (error: any) {
    console.error('Failed to parse config', error.errors);
    process.exit(1);
  }
};

export { parse };
