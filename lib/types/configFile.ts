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

// camelCase
interface versioning_cC {
	verifyPackage: boolean;
	verifyPackageLock: boolean;
}
interface mergeRequests_cC {
	targetBranch: string;
	requirements: requirements_cC;
	options: options_cC;
	creation: creation_cC;
}

interface requirements_cC {
	minApprovals: number;
	minUpvotes: number;
	maxDownvotes: number;
}
interface options_cC {
	deleteSourceBranch: boolean;
	squashCommits: boolean;
}
interface creation_cC {
	assignToMe: boolean;
	approvalsBeforeMerge: number;
	reviewers: string[];
	title: string;
}
