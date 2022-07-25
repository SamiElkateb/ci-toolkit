import { z } from 'zod';

export const packageSchema = z.object({
    version: z.string({
        required_error: 'package.version is required',
        invalid_type_error: 'package.version must be a string',
    }),
});

export const versionIncrement = z
    .string({
        required_error: 'version increment is required',
        invalid_type_error: 'version increment must be a string',
    })
    .regex(
        /^(major|minor|patch)$/,
        'version increment must be major|minor|patch'
    );

export const versionValidation = z
    .string({
        required_error: 'version number is required',
        invalid_type_error: 'version number must be a string',
    })
    .regex(/^\d+\.\d+\.\d+$/, 'version number must be in the format x.x.x');
