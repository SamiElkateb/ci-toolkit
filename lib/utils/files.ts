import path = require('path');
import {
  assertPath,
  assertPathExists,
} from './assertions/customTypesAssertions';

import { readFileSync, existsSync, writeFileSync } from "fs";

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

export { writeVersion, fileExists, getAbsolutePath };
