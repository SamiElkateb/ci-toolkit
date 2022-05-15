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
	fetch_last_tag: {
		project: string;
		store: string;
		protocole?: protocole;
		domain?: string;
	};
	read_current_version: {
		file: string;
		store: string;
	};
	write_version: {
		files: string[];
		new_version: string;
	};
	increment_version: {
		increment_from: string;
		increment_by: string;
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
