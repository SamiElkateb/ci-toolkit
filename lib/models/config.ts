import { z } from "zod";

const defaultConfig = z.object({
    commands: z.object({
        prompt: z.object({
            question: z.string(),
            store: z.string(),
        }),
        getCurrentBranchName: z.object({
            store: z.string(),
        }),
        getCurrentProjectName: z.object({
            store: z.string(),
        }),
        getDiffs: z.object({
            file: z.string(),
            sourceBranch: z.string(),
            targetBranch: z.string(),
            store: z.string(),
        }),
        promptDiffs: z.object({
            diffs: z.string(),
            store: z.string(),
        }),
        applyDiffs: z.object({
            diffs: z.string(),
            files: z.string(),
        }),
        createMergeRequest: z.object({
            title: z.string(),
            project: z.string(),
            sourceBranch: z.string(),
            targetBranch: z.string(),
            awaitPipeline: z.boolean().optional(),
            minApprovals: z.number().optional(),
            assignToMe: z.boolean().optional(),
            deleteSourceBranch: z.boolean().optional(),
            squashCommits: z.boolean().optional(),
            reviewers: z.string().optional(),
            label: z.string().optional(),
        }),
        mergeMergeRequest: z.object({
            project: z.string(),
            sourceBranch: z.string(),
            targetBranch: z.string(),
            awaitPipeline: z.boolean().optional(),
            minUpvotes: z.number().optional(),
            maxDownvotes: z.number().optional(),
            deleteSourceBranch: z.boolean().optional(),
            squashCommits: z.boolean().optional(),
        }),
        fetchLastTag: z.object({
            project: z.string(),
            store: z.string(),
            protocole: z.string(),
            domain: z.string(),
        }),
        readCurrentVersion: z.object({
            file: z.string(),
            store: z.string(),
        }),
        writeVersion: z.object({
            files: z.string(),
            newVersion: z.string(),
        }),
        incrementVersion: z.object({
            incrementFrom: z.string(),
            incrementBy: z.string(),
            store: z.string(),
        }),
        commit: z.object({
            message: z.string().optional(),
            add: z.string().optional()
        }),
        pull: z.object({
            branch: z.string().optional(),
        }),
        push: z.object({
            branch: z.string().optional(),
            awaitPipeline: z.boolean().optional()
        })
    }),
})

export { defaultConfig };
