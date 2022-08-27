import YAML = require('yaml');
import { readFileSync } from 'fs';
import { fileExists, getAbsolutePath } from '../utils/files';
import {
  ConfigFile,
  configSchema,
  nonPopulatedConfigSchema,
  CommandOptions,
} from '../models/config';
import gitlabApiOptionsSchema from '../models/gitlabApiOptions';
import { configFilePathValidationSchema } from '../models/others';

class Conf {
  readonly commands: Map<string, CommandOptions[]>;

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
    const [token] = conf.token.split('\n');
    this.token = token;
    this.allowInsecureCertificates = conf.allow_insecure_certificates;
    this.logLevel = conf.logLevel;
    this.lang = conf.lang;
    this.warningAction = conf.warningAction;
    this.protocole = conf.protocole;
    this.commands = new Map<string, CommandOptions[]>();
    const commands = Object.keys(conf.commands);
    commands.forEach((command) => {
      this.commands.set(command, conf.commands[command]);
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
      commands: Object.fromEntries(populatedCustomCommands) as unknown,
    };
    return configSchema.parse(unparsedConfig);
  };

  static populateFromFilesPath = (configFile: unknown): unknown => {
    const parsedConfigFile = configFilePathValidationSchema.safeParse(configFile);
    if (parsedConfigFile.success) {
      const path = getAbsolutePath(parsedConfigFile.data);
      return Conf.readConfigFile(path);
    }
    return configFile;
  };

  static readConfigFile = (path: string) => {
    if (path.match(/\.txt$|\.txt$/)) {
      const configFile = Conf.findConfigFile(path, 'txt');
      if (configFile) return configFile;
    }
    if (path.match(/\.yaml$|\.yml$/)) {
      const configFile = Conf.findConfigFile(path, 'yaml');
      if (configFile) return configFile;

      const otherPath = path.match(/\.yaml$/) ? path.replace(/\.yaml$/, '.yml') : path.replace(/\.yml$/, '.yaml');
      const retryConfigFile = Conf.findConfigFile(otherPath, 'yaml');
      if (retryConfigFile) return retryConfigFile;
    }
    if (path.match(/\.json$/)) {
      const configFile = Conf.findConfigFile(path, 'json');
      if (configFile) return configFile;
    }
    throw new Error(`File: ${path} does not exist`);
  };

  static findConfigFile = (path: string, extension: string) : unknown => {
    if (!fileExists(path)) return undefined;
    switch (extension) {
      case 'txt':
        return readFileSync(path, 'utf8');
      case 'json':
        return JSON.parse(readFileSync(path, 'utf8'));
      case 'yaml':
      case 'yml':
        return YAML.parse(readFileSync(path, 'utf8'));
      default:
        return undefined;
    }
  };
}

export default Conf;
