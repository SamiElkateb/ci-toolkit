interface command_options {
	prompt: {
		store: string;
		question: string;
	};
	get_current_branch_name: {
		store: string;
	};
	get_current_project_name: {
		store: string;
	};
	get_last_tag: {
		project: string;
		store: string;
		protocole?: protocole;
		domain?: string;
	};
	get_current_version: {
		file: string;
		store: string;
	};
	commit: {
		message?: string;
		add?: string;
	};
	pull: {
		branch?: string;
	};
	push: {
		branch?: string;
		await_pipeline?: boolean;
	};
}
type commandOptions = SnakeToCamelCaseObjectKeys<command_options>;
