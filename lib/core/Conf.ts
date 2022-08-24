import YAML = require('yaml');
import fs = require('fs');
import { checkIsConfigFilePath } from '../utils/validations/customTypeValidation';
import { fileExists, getAbsolutePath } from '../utils/files';
import { ConfigFile, configSchema, nonPopulatedConfigSchema } from '../models/config';
import gitlabApiOptionsSchema from '../models/gitlabApiOptions';

class Conf {
  readonly commands: Map<string, commandOptions[]>;

  readonly protocole: string;

  readonly domain: string;

  readonly project?: string;

  readonly token: string;

  readonly allowInsecureCertificates: boolean;

  readonly logLevel: string;

  readonly lang: string;

  readonly warningAction: string;

  constructor(userConf: ConfigFile) {
    const conf = { ...userConf };
    this.domain = conf.domain;
    this.project = conf.project;
    this.token = conf.token;
    this.allowInsecureCertificates = conf.allow_insecure_certificates;
    this.logLevel = conf.logLevel;
    this.lang = conf.lang;
    this.warningAction = conf.warningAction;
    this.protocole = conf.protocole;
    this.commands = new Map<string, commandOptions[]>();
    const commands = Object.keys(conf.commands);
    commands.forEach((command) => {
      this.commands.set(command, conf.commands[command] as any);
    });
  }

  getApiOptions = (options: Partial<gitlabApiOptions>):gitlabApiOptions => {
    const parsedOptions = gitlabApiOptionsSchema.partial().parse(options);
    const apiOptions = {
      allowInsecureCertificates: this.allowInsecureCertificates,
      project: parsedOptions.project || this.project,
      domain: parsedOptions.domain || this.domain,
      protocole: parsedOptions.protocole || this.protocole,
      token: this.token,
    };
    return gitlabApiOptionsSchema.parse(apiOptions);
  };

  static parseConfig = async (configFile: unknown) => {
    const nonPopulatedConfig = nonPopulatedConfigSchema.parse(configFile);
    const populatedToken = Conf.populateFromFilesPath(nonPopulatedConfig.token);
    const customCommands = Object.keys(nonPopulatedConfig.commands);
    const populatedCustomCommands = new Map<unknown, unknown>();
    customCommands.forEach((key) => {
      const populatedCustomCommand = Conf.populateFromFilesPath(
        nonPopulatedConfig.commands[key],
      );
      populatedCustomCommands.set(key, populatedCustomCommand);
    });

    const unparsedConfig = {
      ...nonPopulatedConfig,
      token: populatedToken,
      commands: Object.fromEntries(populatedCustomCommands),
    };
    return configSchema.parse(unparsedConfig);
  };

  static populateFromFilesPath = (configFile: unknown): unknown => {
    if (checkIsConfigFilePath(configFile)) {
      const path = getAbsolutePath(configFile);
      return Conf.getLinkedFile(path);
    }
    return configFile;
  };

  static getLinkedFile = (path: string): unknown => {
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
    throw new Error(`File: ${path} does not exist`);
  };

  static readConfigFile = (): unknown => {
    const extensions = ['yml', 'yaml', 'json'] as configExtension[];
    for (let i = 0, c = extensions.length; i < c; i += 1) {
      const currentPath = process.cwd();
      const filePath = `${currentPath}/ci-toolkit.${extensions[i]}`;
      const config = Conf.findConfigFile(filePath, extensions[i]);
      if (config) return config;
    }
    return undefined;
  };

  static findConfigFile = (path: string, extension: configExtension) => {
    if (!fileExists(path)) return undefined;
    switch (extension) {
      case 'txt':
        return fs.readFileSync(path, 'utf8');
      case 'json':
        return JSON.parse(fs.readFileSync(path, 'utf8'));
      case 'yaml':
      case 'yml':
        return YAML.parse(fs.readFileSync(path, 'utf8'));
      default:
        return undefined;
    }
  };
}

export default Conf;
