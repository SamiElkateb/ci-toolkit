const lang = {
	help: `npx ci-toolkit <command>
Commands:
        help
        config
        create-mr   create a merge request for the current branch
        deploy      merge the merge request associated with the current branch`,
	currentBranchIs: (branch: string) => `current branch is ${branch}`,
	noMergeRequest: (branch: string) =>
		`no merge request associated with branch ${branch}`,
	foundMr: (mergeRequest: string) =>
		`found merge request titled ${mergeRequest} associated with current branch`,
	mrMeetsRequirements: (mergeRequest: string) =>
		`${mergeRequest} meets merging requirements`,
	merging: (sourceBranch: string, targetBranch: string) =>
		`merging ${sourceBranch} to ${targetBranch}`,
	currentTag: (tag: string) => `current tag is ${tag}`,
	newTag: (tag: string) => `new tag is ${tag}`,
	noUser: (username: string) => `user ${username} does not exist`,
};

export default lang;
