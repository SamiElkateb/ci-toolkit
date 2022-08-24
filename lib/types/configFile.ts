type logLevel = 'error' | 'warn' | 'info' | 'debug';
type warningAction = 'prompt' | 'standby' | 'skip';
type version = `${number}.${number}.${number}`;
type path = `${string}/${string}`;
type varKey = `$_${string}`;
type configExtension = 'json' | 'yaml' | 'yml' | 'txt';
type protocole = 'http' | 'https';
// interface configFile {
//   protocole: string;
//   project?: string;
//   domain: string;
//   allow_insecure_certificates: boolean;
//   token: string;
//   log_level: string;
//   lang: string;
//   warning_action: string;
//   commands: custom_commands;
//   aggregated_commands?: aggregated_commands;
// }

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
