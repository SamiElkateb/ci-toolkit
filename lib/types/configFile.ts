type configExtension = 'json' | 'yaml' | 'yml';

interface configFile {
	token?: string;
	protocole?: string;
	domain?: string;
	project_id?: string;
	merge_requirements?: {
		target_branch?: string;
		min_approvals?: number;
		min_upvotes?: number;
		max_downvotes?: number;
	};
	merge_options?: {
		delete_source_branch?: boolean;
		squash_commits?: boolean;
	};
}

interface merge_requirements {
	target_branch?: string;
	min_approvals?: number;
	min_upvotes?: number;
	max_downvotes?: number;
}
interface merge_options {
	delete_source_branch?: boolean;
	squash_commits?: boolean;
}

interface mergeRequirements {
	targetBranch?: string;
	minApprovals: number;
	minUpvotes: number;
	maxDownvotes: number;
}
interface mergeOptions {
	deleteSourceBranch: boolean;
	squashCommits: boolean;
}
