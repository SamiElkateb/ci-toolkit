const defaultConfig = {
	commands: {
		prompt: {
			question: 'required',
			store: 'required',
		},
		getCurrentBranchName: {
			store: 'required',
		},
		getCurrentProjectName: {
			store: 'required',
		},
		createMergeRequest: {
			title: 'required',
			project: 'required',
			sourceBranch: 'required',
			targetBranch: 'required',
			awaitPipeline: 'optional',
			minApprovals: 'optional',
			assignToMe: 'optional',
			deleteSourceBranch: 'optional',
			squashCommits: 'optional',
			reviewers: 'optional',
			label: 'optional',
		},
		mergeMergeRequest: {
			project: 'required',
			sourceBranch: 'required',
			targetBranch: 'required',
			awaitPipeline: 'optional',
			minUpvotes: 'optional',
			maxDownvotes: 'optional',
			deleteSourceBranch: 'optional',
			squashCommits: 'optional',
		},
		fetchLastTag: {
			project: 'required',
			store: 'required',
			protocole: 'optional',
			domain: 'optional',
		},
		readCurrentVersion: {
			file: 'required',
			store: 'required',
		},
		writeVersion: {
			files: 'required',
			newVersion: 'required',
		},
		incrementVersion: {
			incrementFrom: 'required',
			incrementBy: 'required',
			store: 'required',
		},
		commit: {
			message: 'optional',
			add: 'optional',
		},
		pull: {
			branch: 'optional',
		},
		push: {
			branch: 'optional',
			awaitPipeline: 'optional',
		},
	},
};

export { defaultConfig };
