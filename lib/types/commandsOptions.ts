interface command_options {
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
}
type commandOptions = SnakeToCamelCaseObjectKeys<command_options>;
