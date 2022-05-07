import Git from './Git';
import YAML = require('yaml');
import fs = require('fs');
import {
	checkIsArray,
	checkIsConfigFilePath,
	checkIsObject,
	checkIsPath,
	checkIsString,
	hasOwnProperty,
} from '../utils/validation';
import { defaultConfig } from './defaultConfig';
import { fileExists, getAbsolutePath } from '../utils/files';
import { SnakeToCamelCase } from '../utils/snakeToCamelCase';
import {
	assertPathExists,
	assertProperty,
} from '../utils/assertions/customTypes';
import {
	assertArray,
	assertObject,
	assertString,
} from '../utils/assertions/baseTypes';

class Conf {
	readonly commands: SnakeToCamelCaseObjectKeys<customCommands>;
	readonly protocole: protocole;
	readonly domain?: string;
	readonly projectId?: string;
	readonly token: string;
	readonly logLevel: logLevel;
	constructor(conf: configFile) {
		this.domain = conf.domain;
		this.projectId = conf.project_id;
		this.token = conf.token;
		this.logLevel = conf.log_level;
		this.protocole = conf.protocole;
		this.commands = SnakeToCamelCase(conf.commands);
	}
	static parseConfig = async (configFile: unknown): Promise<configFile> => {
		assertObject(configFile);
		assertProperty(configFile, 'token');
		assertPathExists(configFile.token);
		configFile.token = Conf.populateFromFilesPath(configFile.token);

		assertProperty(configFile, 'commands');
		assertObject(configFile.commands);
		for (const property in configFile.commands) {
			if (hasOwnProperty(configFile.commands, property)) {
				configFile.commands[property] = Conf.populateFromFilesPath(
					configFile.commands[property]
				);
				assertArray(configFile.commands[property]);
			}
		}

		for (const property in configFile.commands) {
			if (
				hasOwnProperty(configFile.commands, property) &&
				hasOwnProperty(defaultConfig, property)
			) {
				configFile.commands[property] = Conf.parseThroughConfig(
					defaultConfig[property],
					configFile.commands[property]
				);
			}
		}

		assertString(configFile.token);
		const conf = {
			protocole: 'https',
			log_level: 'info',
			...configFile,
		};

		return conf as configFile;
	};

	static parseThroughConfig<T>(
		defaultConf: T,
		customConf: unknown,
		propName?: string
	): T {
		if (typeof customConf === 'undefined') return defaultConf;
		if (typeof defaultConf !== typeof customConf) {
			const defaultConfType = typeof defaultConf;
			const customConfType = typeof customConf;
			throw `ConfigFile: ${propName} is of type ${customConfType}, should be of type ${defaultConfType} or undefined`;
		}
		if (typeof defaultConf !== 'object' || Array.isArray(defaultConf))
			return customConf as T;

		if (defaultConf === null || typeof defaultConf !== 'object')
			return defaultConf;
		if (customConf === null || typeof customConf !== 'object') {
			return defaultConf;
		}

		for (const property in defaultConf) {
			if (
				hasOwnProperty(customConf, property) &&
				hasOwnProperty(defaultConf, property)
			) {
				defaultConf[property] = Conf.parseThroughConfig(
					defaultConf[property],
					customConf[property],
					property
				);
			}
		}
		return defaultConf;
	}
	static populateFromFilesPath = (configFile: unknown): unknown => {
		if (checkIsConfigFilePath(configFile)) {
			const path = getAbsolutePath(configFile);
			return Conf.getLinkedFile(path);
		}
		return configFile;
	};
	static getLinkedFile = (path: path): unknown => {
		if (path.match(/\.yaml$|\.yml$/)) {
			const configFile = Conf.findConfigFile(path, 'yaml');
			if (configFile) return configFile;
		}
		if (path.match(/\.json$/)) {
			const configFile = Conf.findConfigFile(path, 'json');
			if (configFile) return configFile;
		}
		throw `File: ${path} does not exist`;
	};

	static readConfigFile = (): unknown => {
		const extensions = ['yml', 'yaml', 'json'] as configExtension[];
		for (let i = 0, c = extensions.length; i < c; i++) {
			const currentPath = process.cwd();
			const filePath = `${currentPath}/ci-toolkit.${extensions[i]}`;
			const config = Conf.findConfigFile(filePath, extensions[i]);
			if (config) return config;
		}
	};
	static findConfigFile = (path: string, extension: configExtension) => {
		if (!fileExists(path)) return;
		switch (extension) {
			case 'json':
				return JSON.parse(fs.readFileSync(path, 'utf8'));
			case 'yaml':
			case 'yml':
				return YAML.parse(fs.readFileSync(path, 'utf8'));
		}
	};
}

export default Conf;
