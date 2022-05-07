type command_options = {
	prompt: {
		store: string;
		question: string;
	};
	get_current_branch_name: {
		store: string;
		question: string;
	};
	get_current_project_name: {
		store: string;
	};
	get_last_tag: {
		project: string;
		store: string;
	};
};
type commandOptions = SnakeToCamelCaseObjectKeys<command_options>;

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

interface configFile {
	protocole: protocole;
	project_id?: string;
	domain?: string;
	token: string;
	log_level: logLevel;
	commands: custom_commands;
	aggregated_commands?: aggregated_commands;
}
