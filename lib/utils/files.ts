import prompt = require('prompt');
import { z } from 'zod';
import path = require('path');
import { readFileSync, existsSync, writeFileSync } from 'fs';
import {
  assertPath,
  assertPathExists,
} from './assertions/customTypesAssertions';

const fileExists = (path: string) => {
  try {
    if (existsSync(path)) return true;
  } catch (err) {
    console.error(err);
  }
  return false;
};

const getAbsolutePath = (filePath: string): path => {
  assertPath(filePath);
  if (path.isAbsolute(filePath)) return filePath;
  return path.resolve(process.cwd(), filePath) as path;
};

const writeVersion = async (path: string, version: string) => {
  const absolutePath = getAbsolutePath(path);
  assertPathExists(absolutePath);
  const packageJson = JSON.parse(readFileSync(absolutePath, 'utf8'));
  packageJson.version = version;
  const packageString = `${JSON.stringify(packageJson, null, '\t')}\n`;
  writeFileSync(absolutePath, packageString, { encoding: 'utf-8' });
};

const safeWriteFileSync = async (path: string, content: string) => {
  const absolutePath = getAbsolutePath(path);
  if (existsSync(absolutePath)) {
    const question = `${path} already exists. Do you want to overwrite it ? (Y/n)?`;
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
      await safeWriteFileSync(path, content);
      return;
    }
    if (validatedValue.data.match(/^(n|no)$/i)) {
      return;
    }
    if (!validatedValue.data.match(/^(Y|Yes|yes)$/)) {
      await safeWriteFileSync(path, content);
      return;
    }
  }
  writeFileSync(absolutePath, content);
};

export {
  writeVersion, fileExists, getAbsolutePath, safeWriteFileSync,
};
