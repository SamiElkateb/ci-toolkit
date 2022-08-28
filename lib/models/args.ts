import { z } from 'zod';

export const cliArgsSchema = z.object({
  run: z.string({
    required_error: 'package.version is required',
    invalid_type_error: 'package.version must be a string',
  }),
  config: z.string({
    required_error: ' is required',
    invalid_type_error: 'package.version must be a string',
  }),
});

export type CLIArgs = z.infer<typeof cliArgsSchema>;

export const initSchema = z.object({
  init: z.boolean({
    required_error: 'package.version is required',
    invalid_type_error: 'package.version must be a string',
  }),
});
