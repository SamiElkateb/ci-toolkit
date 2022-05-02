import Git from './Git';
import YAML = require('yaml');
import fs = require('fs');
import { hasOwnProperty } from '../utils/validation';
import defaultConfig from './default';
import { fileExists } from '../utils/files';
import { SnakeToCamelCase } from '../utils/snakeToCamelCase';

class Conf {
	readonly mergeRequests: SnakeToCamelCaseObjectKeys<merge_requests>;
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
	}
	static parseConfig = async (configFile: unknown): Promise<configFile> => {
		const conf = Conf.parseThroughConfig(defaultConfig, configFile);
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

	static getConfigFile = (): unknown => {
		const extensions = ['json', 'yml', 'yaml'] as configExtension[];
		for (let i = 0, c = extensions.length; i < c; i++) {
			const config = Conf.findConfigFile(extensions[i]);
			if (config) return config;
		}
	};
	static findConfigFile = (extension: configExtension) => {
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
}

export default Conf;
