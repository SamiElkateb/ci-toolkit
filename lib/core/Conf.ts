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
import defaultConfig, { environnement } from './default';
import { fileExists, getAbsolutePath } from '../utils/files';
import { SnakeToCamelCase } from '../utils/snakeToCamelCase';

class Conf {
	readonly mergeRequests: SnakeToCamelCaseObjectKeys<merge_requests>;
	readonly deployment: SnakeToCamelCaseObjectKeys<deployment>;
	readonly protocole: protocole;
	readonly domain: string;
	readonly projectId: string;
	readonly token: string;
	readonly logLevel: logLevel;
	constructor(conf: configFile) {
		this.domain = conf.domain;
		this.projectId = conf.project_id;
		this.token = conf.token;
		this.logLevel = conf.log_level;
		this.protocole = conf.protocole;
		this.mergeRequests = SnakeToCamelCase(conf.merge_requests);
		this.deployment = SnakeToCamelCase(conf.deployment);
	}
	static parseConfig = async (configFile: unknown): Promise<configFile> => {
		const populatedConfig = Conf.populateFromLinkedFiles(configFile);
		const conf = Conf.parseThroughConfig(defaultConfig, populatedConfig);
		const hasToken = conf.token !== '';
		if (!hasToken) throw 'ConfigFile: token cannot be undefined';
		const hasTargetBranch = conf.merge_requests.target_branch !== '';
		if (!hasTargetBranch)
			throw 'ConfigFile: target_branch cannot be undefined';

		const isDomainDefault = !conf.domain || conf.domain === 'default';
		if (isDomainDefault) conf.domain = await Git.getOriginDomain();

		const isProjectIdDefault = conf.project_id === 'default';
		if (!conf.project_id || isProjectIdDefault) {
			conf.project_id = await Git.getProjectName();
		}

		conf.project_id = encodeURIComponent(conf.project_id);
		return conf;
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
		if (
			checkIsArray(defaultConf) &&
			checkIsArray(customConf) &&
			propName === 'environnements'
		) {
			return customConf.map((env) =>
				Conf.parseThroughConfig(environnement, env)
			) as unknown as T;
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
	static populateFromLinkedFiles = (
		configFile: unknown,
		property?: string
	): unknown => {
		if (Conf.shouldDismissProperty(property)) return configFile;
		if (checkIsConfigFilePath(configFile)) {
			const path = getAbsolutePath(configFile);
			configFile = Conf.getLinkedFile(path);
		}
		if (!checkIsObject(configFile)) return configFile;
		for (const property in configFile) {
			if (hasOwnProperty(configFile, property)) {
				configFile[property] = Conf.populateFromLinkedFiles(
					configFile[property],
					property
				);
			}
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

	static getConfigFile = (): unknown => {
		const extensions = ['json', 'yml', 'yaml'] as configExtension[];
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
	static shouldDismissProperty = (property?: string) => {
		if (!property) return false;
		return ['from_file', 'to_file', 'token'].includes(property);
	};
}

export default Conf;
