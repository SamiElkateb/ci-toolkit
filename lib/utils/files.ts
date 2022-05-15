import path = require('path');
import {
	assertPath,
	assertPathExists,
} from './assertions/customTypesAssertions';

const fs = require('fs');
const util = require('util');
const fileExists = (path: string) => {
	try {
		if (fs.existsSync(path)) return true;
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

const writeVersion = async (path: path, version: version) => {
	const absolutePath = getAbsolutePath(path);
	assertPathExists(absolutePath);
	const packageJson = JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
	packageJson.version = version;
	const packageString = JSON.stringify(packageJson, null, '\t') + '\n';
	fs.writeFileSync(absolutePath, packageString, { encoding: 'utf-8' });
};

export { writeVersion, fileExists, getAbsolutePath };
