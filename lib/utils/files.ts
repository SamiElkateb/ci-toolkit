import prompt = require('prompt');
import { z } from 'zod';
import path = require('path');
import { readFileSync, existsSync, writeFileSync } from 'fs';
import { pathValidationSchema } from '../models/others';
import { JSONParse } from './parsers';
import Logger from '../core/Logger';

const logger = new Logger();

const fileExists = (filePath: string) => {
  try {
    if (existsSync(filePath)) return true;
  } catch (err) {
    const parsedError = z.object({ message: z.string() }).safeParse(err);
    if (parsedError.success) {
      logger.error(parsedError.data.message);
    }
  }
  return false;
};

type AssertPathExists = (val: unknown, message?: string) => asserts val;
const assertFileExists: AssertPathExists = (
  val: unknown,
  message?: string,
): asserts val => {
  const parsedPath = pathValidationSchema.parse(val);
  if (!fileExists(parsedPath)) throw new Error(message || `path ${parsedPath} does not exist`);
};

const getAbsolutePath = (filePath: string) => {
  const parsedPath = pathValidationSchema.parse(filePath);
  if (path.isAbsolute(parsedPath)) return parsedPath;
  return path.resolve(process.cwd(), parsedPath);
};

const writeVersion = (relativePath: string, version: string) => {
  const absolutePath = getAbsolutePath(relativePath);
  assertFileExists(absolutePath);
  const packageJson = z
    .object({ version: z.string() })
    .passthrough()
    .parse(JSONParse(readFileSync(absolutePath, 'utf8')));

  packageJson.version = version;
  const packageString = `${JSON.stringify(packageJson, null, '\t')}\n`;
  writeFileSync(absolutePath, packageString, { encoding: 'utf-8' });
};

const safeWriteFileSync = async (filePath: string, content: string) => {
  const absolutePath = getAbsolutePath(filePath);
  if (existsSync(absolutePath)) {
    const question = `${filePath} already exists. Do you want to overwrite it ? (Y/n)?`;
    prompt.start();
    const { value } = await prompt.get([
      {
        description: question,
        name: 'value',
        required: true,
      },
    ]);
    const validatedValue = z.string().safeParse(value);
    if (!validatedValue.success) {
      await safeWriteFileSync(filePath, content);
      return;
    }
    if (validatedValue.data.match(/^(n|no)$/i)) {
      return;
    }
    if (!validatedValue.data.match(/^(Y|Yes|yes)$/)) {
      await safeWriteFileSync(filePath, content);
      return;
    }
  }
  writeFileSync(absolutePath, content);
};

export {
  writeVersion,
  fileExists,
  getAbsolutePath,
  safeWriteFileSync,
  assertFileExists,
};
