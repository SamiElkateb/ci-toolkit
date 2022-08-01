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
        getDiffs: {
            file: 'required',
            sourceBranch: 'required',
            targetBranch: 'required',
            store: 'required',
        },
        promptDiffs: {
            diffs: 'required',
            store: 'required',
        },
        applyDiffs: {
            diffs: 'required',
            files: 'required',
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
        createTag: {
            project: 'required',
            tagName: 'required',
            targetBranch: 'required',
            awaitPipeline: 'optional',
        },
        writeVersion: {
            files: 'required',
            newVersion: 'required',
        },
        startPipeline: {
            project: 'required',
            ref: 'required',
            retries: 'optional',
            awaitPipeline: 'optional',
            variables: 'optional',
        },
        startJob: {
            project: 'required',
            pipeline: 'required',
            retries: 'optional',
            awaitJob: 'optional',
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
