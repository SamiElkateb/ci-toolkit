type versionIncrement = 'patch' | 'minor' | 'major';
interface mergeRequestsPostOptions extends gitlabApiOptions {
	title: string;
	targetBranch: string;
	sourceBranch: string;
	squashCommits: boolean;
	deleteSourceBranch: boolean;
	label?: string;
	assigneeId?: number;
	minApprovals: number;
	reviewerIds: number[];
}
interface mergeRequest {
	id: number;
	iid: number;
	project_id: number;
	title: string;
	description: string;
	state: string;
	target_branch: string;
	source_branch: string;
	upvotes: number;
	downvotes: number;
	merge_status: string;
	should_remove_source_branch: string;
	has_conflicts: boolean;
	blocking_discussions_resolved: boolean;
}
interface user {
	id: number;
	username: string;
	name: string;
	state: string;
	avatar_url: string;
	web_url: string;
}

interface pipeline {
	id: number;
	iid: number;
	project_id: number;
	sha: string;
	ref: string;
	status: string;
	source: string;
	created_at: string;
	updated_at: string;
	web_url: string;
}

interface gitlabApiOptions {
	allowInsecureCertificate?: boolean;
	protocole: protocole;
	domain: string;
	project: string;
	token: string;
}
interface pipelineVariable {
	key: string;
	value: string;
	type?: string;
}
