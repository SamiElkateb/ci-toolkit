type configExtension = 'json' | 'yaml' | 'yml';
type protocole = 'http' | 'https';
interface configFile {
	token: string;
	protocole: protocole;
	domain: string;
	project_id: string;
	log_level: logLevel;
	merge_requests: merge_requests;
	versioning: versioning;
	deployment: deployment;
}
interface versioning {
	verify_package: boolean;
	verify_package_lock: boolean;
}
interface merge_requests {
	target_branch: string;
	requirements: requirements;
	options: options;
	creation: creation;
}
interface deployment {
	environnements: environnement[];
}
interface environnement {
	name: string;
	project_id: string;
	create_mr: boolean;
	changes: changes[];
	pipeline: pipeline;
}
interface pipeline {
	await: boolean;
	retry: number;
	variables: variables[];
}
interface variables {
	key: string;
	value: string;
	type: string;
}
interface changes {
	from_file: string;
	to_files: string[];
	values: string;
}
interface requirements {
	min_approvals: number;
	min_upvotes: number;
	max_downvotes: number;
}
interface options {
	delete_source_branch: boolean;
	squash_commits: boolean;
}
interface creation {
	assign_to_me: boolean;
	approvals_before_merge: number;
	reviewers: string[];
	title: string;
}
