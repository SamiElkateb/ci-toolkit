import { z } from 'zod';

export const packageSchema = z.object({
  version: z.string({
    required_error: 'package.version is required',
    invalid_type_error: 'package.version must be a string',
  }),
});

export const versionIncrementSchema = z
  .string({
    required_error: 'version increment is required',
    invalid_type_error: 'version increment must be a string',
  })
  .regex(
    /^(major|minor|patch)$/,
    'version increment must be major|minor|patch',
  );
export type VersionIncrement = z.infer<typeof versionIncrementSchema>;

export const versionValidationSchema = z
  .string({
    required_error: 'version number is required',
    invalid_type_error: 'version number must be a string',
  })
  .regex(/^\d+\.\d+\.\d+$/, 'version number must be in the format x.x.x');

export const pathValidationSchema = z
  .string({
    required_error: 'path is required',
    invalid_type_error: 'path must be a string',
  })
  .regex(/^(\.{1,2}\/)?(\/|\w|_|-|\.)+$/, 'path does not seem valid');

export const commitMessageValidationSchema = z
  .string({
    required_error: 'commit message is required',
    invalid_type_error: 'commit mesage must be a string',
  })
  .min(1, 'commit message must be at least 1 character')
  .max(80, 'commit message must be less than 80 characters')
  .regex(/^[\w|\d|_|\-|,|:| ]+$/, 'commit message contains invalid characters');

export const configFilePathValidationSchema = z
  .string({
    required_error: 'config file path is required',
    invalid_type_error: 'config file path must be a string',
  })
  .regex(/^(\.{1,2}\/)?(\/|\w|_|-|\.)+\.json$|\.yaml$|\.yml$|\.txt$/, 'config file path doesn\'t seem valid');
