import Git from './Git';
import YAML = require('yaml');
import fs = require('fs');
import { fileExists } from '../utils/utils';

class Conf {
	readonly mergeRequirements: mergeRequirements;
	readonly mergeOptions: mergeOptions;
	readonly protocole: 'http' | 'https';
	readonly domain: string;
	readonly projectId: string;
	readonly token: string;
	readonly logLevel: logLevel;
	constructor(configFile: configFile) {
		this.domain = configFile.domain as string;
		this.projectId = configFile.project_id as string;
		this.token = configFile.token as string;
		this.logLevel = configFile.log_level as logLevel;

		this.mergeRequirements = {
			minApprovals: configFile?.merge_requirements?.min_approvals || 0,
			minUpvotes: configFile?.merge_requirements?.min_upvotes || 0,
			maxDownvotes: configFile?.merge_requirements?.max_downvotes || 0,
			targetBranch:
				configFile?.merge_requirements?.target_branch || undefined,
		};

		this.mergeOptions = {
			deleteSourceBranch:
				configFile?.merge_options?.delete_source_branch || false,
			squashCommits: configFile?.merge_options?.squash_commits || false,
		};

		const protocole = configFile?.protocole;
		if (protocole === 'http' || protocole === 'https') {
			this.protocole = protocole;
		} else {
			this.protocole = 'https';
		}
	}
	static parseConfig = async (configFile: unknown) => {
		if (!Conf.checkIsConfig(configFile)) throw 'Config File Error';
		const conf = { ...configFile };
		conf.protocole = conf.protocole || 'https';

		const isDomainDefault = !conf.domain || conf.domain === 'default';
		if (isDomainDefault) conf.domain = await Git.getOriginDomain();

		const isProjectIdDefault = conf.project_id === 'default';
		if (!conf.project_id || isProjectIdDefault) {
			conf.project_id = await Git.getCurrentProjectName();
		}

		conf.project_id = encodeURIComponent(conf.project_id);
		return conf;
	};

	static checkIsConfig = (configFile: unknown): configFile is configFile => {
		if (
			typeof configFile !== 'object' ||
			Array.isArray(configFile) ||
			configFile === null
		)
			throw 'Config file: should be an object';

		Conf.assertProperty({
			toCheck: configFile,
			property: 'token',
			type: 'string',
		});
		Conf.assertProperty({
			toCheck: configFile,
			property: 'protocole',
			type: 'string',
		});
		Conf.assertProperty({
			toCheck: configFile,
			property: 'domain',
			type: 'string',
		});
		Conf.assertProperty({
			toCheck: configFile,
			property: 'project_id',
			type: 'string',
		});

		return true;
	};
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
	static assertProperty = (data: any) => {
		const { toCheck, property, type } = data;
		if (!toCheck.hasOwnProperty(property)) return;
		if (typeof toCheck[property] === type) return;
		throw `Config file: ${property} should be a ${type}`;
	};
}

export default Conf;
