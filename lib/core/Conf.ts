import Git from './Git';
import YAML = require('yaml');
import fs = require('fs');
import {
	checkIsObject,
	hasOwnProperty,
} from '../utils/validations/basicTypeValidations';
import { checkIsConfigFilePath } from '../utils/validations/customTypeValidation';
import { defaultConfig } from './defaultConfig';
import { fileExists, getAbsolutePath } from '../utils/files';
import { SnakeToCamelCase } from '../utils/snakeToCamelCase';
import { assertPathExists } from '../utils/assertions/customTypesAssertions';
import {
	assertArray,
	assertObject,
	assertString,
	assertProperty,
	assertExists,
} from '../utils/assertions/baseTypeAssertions';

class Conf {
	readonly commands: SnakeToCamelCaseObjectKeys<customCommands>;
	readonly protocole: protocole;
	readonly domain?: string;
	readonly project?: string;
	readonly token: string;
	readonly allowInsecureCertificate: boolean;
	readonly logLevel: logLevel;
	readonly lang: string;
	readonly warningAction: warningAction;
	constructor(conf: configFile) {
		this.domain = conf.domain;
		this.project = conf.project;
		this.token = conf.token;
		this.allowInsecureCertificate = conf.allow_insecure_certificate;
		this.logLevel = conf.log_level;
		this.lang = conf.lang;
		this.warningAction = conf.warning_action;
		this.protocole = conf.protocole;
		for (const command in conf.commands) {
			conf.commands[command] = SnakeToCamelCase(conf.commands[command]);
		}
		this.commands = conf.commands;
	}

	getApiOptions = (options: Partial<gitlabApiOptions>) => {
		let project, domain, protocole;
		if (checkIsObject(options)) {
			if (hasOwnProperty(options, 'project')) {
				project = options.project as string;
			}
			if (hasOwnProperty(options, 'domain')) {
				domain = options.domain as string;
			}
			if (hasOwnProperty(options, 'protocole')) {
				protocole = options.protocole as protocole;
			}
		}
		const apiOptions = {
			allowInsecureCertificate: this.allowInsecureCertificate,
			project: project || this.project,
			domain: domain || this.domain,
			protocole: protocole || this.protocole,
			token: this.token,
		};
		assertString(apiOptions.project, 'Project name is not defined');
		assertString(apiOptions.domain, 'Domain name is not defined');
		assertString(apiOptions.protocole, 'Protocole is not defined');
		assertString(apiOptions.token, 'Token is not defined');
		return apiOptions as gitlabApiOptions;
	};

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
			lang: 'en',
			warning_action: 'prompt',
			allow_insecure_certificate: false,
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
		if (path.match(/\.txt$|\.txt$/)) {
			const configFile = Conf.findConfigFile(path, 'txt');
			if (configFile) return configFile;
		}
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
			case 'txt':
				return fs.readFileSync(path, 'utf8');
			case 'json':
				return JSON.parse(fs.readFileSync(path, 'utf8'));
			case 'yaml':
			case 'yml':
				return YAML.parse(fs.readFileSync(path, 'utf8'));
		}
	};
}

export default Conf;
