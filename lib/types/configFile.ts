type logLevel = 'error' | 'warn' | 'info' | 'debug';
type version = `${number}.${number}.${number}`;
type path = `${string}/${string}`;
type varKey = `$_${string}`;
type configExtension = 'json' | 'yaml' | 'yml';
type protocole = 'http' | 'https';
interface configFile {
	protocole: protocole;
	project_id?: string;
	domain?: string;
	token: string;
	log_level: logLevel;
	commands: custom_commands;
	aggregated_commands?: aggregated_commands;
}

type baseCommands = commandOptions[];
type base_commands = command_options[];

interface custom_commands {
	[key: string]: base_commands;
}

interface aggregated_commands {
	[key: string]: custom_commands[];
}
type customCommands = SnakeToCamelCaseObjectKeys<custom_commands>;
type aggregatedCommands = SnakeToCamelCaseObjectKeys<aggregated_commands>;
