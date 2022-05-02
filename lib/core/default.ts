const defaultConfig: configFile = {
	token: '',
	log_level: 'info',
	protocole: 'https',
	domain: 'default',
	project_id: 'default',
	merge_requests: {
		target_branch: '',
		requirements: {
			min_approvals: 0,
			min_upvotes: 0,
			max_downvotes: 1,
		},
		options: {
			delete_source_branch: true,
			squash_commits: false,
		},
		creation: {
			assign_to_me: true,
			approvals_before_merge: 0,
			reviewers: [],
			title: '[branch_name]',
		},
	},
	versioning: {
		verify_package: false,
		verify_package_lock: false,
	},
	deployment: {
		environments: [],
	},
};

export default defaultConfig;
export { notify, defaultConfig, environnement };

const notify = {
	sound: {
		when_merged: false,
		when_deployed: false,
		on_error: false,
	},
	console: {
		when_merged: false,
		when_deployed: false,
		on_error: false,
	},
	email: {
		when_merged: false,
		when_deployed: false,
		on_error: false,
		email_location: './secret/email',
		message: 'Deployment finished',
	},
};
const environnement = {
	name: '',
	project_id: '',
	create_mr: true,
	changes: [
		{
			from_file: '',
			to_files: [],
			values: '',
		},
	],
	pipeline: {
		await: true,
		retry: 0,
		variables: [{ key: '', value: '', type: '' }],
	},
};
