import {
	SnakeToCamelCase,
	SnakeToCamelCaseArray,
} from '../utils/snakeToCamelCase';

const command_names = [
	'get_current_branch_name',
	'prompt',
	'get_current_project_name',
	'create_merge_request',
	'fetch_last_tag',
	'read_current_version',
	'write_version',
	'commit',
	'pull',
	'push',
	'increment_version',
	// 'tag',
	// 'copy_env_diffs',
	// 'start_pipeline',
] as const;
const commandNames = SnakeToCamelCaseArray([...command_names]);
export { command_names, commandNames };
