import path = require('path');
import { assertPath } from './assertions/customTypesAssertions';

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

const updatePackageJson = async () => {
	const currentPath = process.cwd();
	const filePath = `${currentPath}/package.json`;
	if (!fileExists(filePath)) throw 'package.json does not exist';
	const packageJson = JSON.parse(fs.readFileSync(filePath, 'utf8'));
	packageJson.version = '0.0.1';
	const packageString = JSON.stringify(packageJson, null, '\t') + '\n';
	fs.writeFileSync(filePath, packageString, { encoding: 'utf-8' });
};

export { updatePackageJson, fileExists, getAbsolutePath };
