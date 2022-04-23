const fs = require('fs');
import { log } from '../core';
const YAML = require('yaml');

const increaseTag = (params) => {
	const { tag, type } = params;
	let [, major, minor, patch] = tag.match(/(\d*)\.(\d*)\.(\d*)/);
	switch (type) {
		case 'patch':
			patch = +patch + 1;
			break;
		case 'minor':
			patch = 0;
			minor = +minor + 1;
		case 'major':
			patch = 0;
			minor = 0;
			major = +major + 1;
		default:
			throw 'Error while increasing tag number';
	}
	return `${major}.${minor}.${patch}`;
};

const fileExists = (path: string) => {
	try {
		if (fs.existsSync(path)) return true;
	} catch (err) {
		console.error(err);
	}
	return false;
};

const findConfig = (extension: configExtension) => {
	const currentPath = process.cwd();
	const filePath = `${currentPath}/ci-toolkit.${extension}`;
	if (!fileExists(filePath)) return;
	switch (extension) {
		case 'json':
			return JSON.parse(fs.readFileSync(filePath, 'utf8'));
		case 'yaml':
		case 'yml':
			return YAML.parse(fs.readFileSync(filePath, 'utf8'));
	}
};

const getConfig = () => {
	const extensions = ['json', 'yml', 'yaml'] as configExtension[];
	for (let i = 0, c = extensions.length; i < c; i++) {
		const config = findConfig(extensions[i]);
		if (config) return config;
	}
};

const errorBoundary = async (callback) => {
	try {
		await callback();
	} catch (error) {
		log.error(error);
	}
};

export { increaseTag, getConfig, errorBoundary };
