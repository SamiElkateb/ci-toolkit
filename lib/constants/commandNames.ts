import {
	SnakeToCamelCase,
	SnakeToCamelCaseArray,
} from '../utils/snakeToCamelCase';

const command_names = [
	'get_current_branch_name',
	'prompt',
	'get_current_project_name',
	// 'create_merge_request',
	'get_last_tag',
	// 'get_current_version',
	// 'increment_version',
	// 'tag',
	// 'copy_env_diffs',
	// 'start_pipeline',
] as const;
const commandNames = SnakeToCamelCaseArray([...command_names]);
export { command_names, commandNames };
