import { z } from "zod";

export const fetchLastTagOptionSchema = z.object({
    project: z.string({
        required_error: "fetch_current_tag.project is required",
        invalid_type_error: "fetch_current_tag.project must be a string containing the project name or associated with a stored variable (ex: $_currentProject)",
    }),
    store: z.string({
        required_error: "fetch_current_tag.store is required",
        invalid_type_error: "fetch_current_tag.store must be a string associated with a stored variable (ex: $_currentTag)",
    }).startsWith("$_", {message: 'fetch_current_tag.store must start with $_'}),
}).strict();

export const createTagOptionSchema = z.object({
    project: z.string({
        required_error: "create_tag.project is required",
        invalid_type_error: "create_tag.project must be a string containing the project name or associated with a stored variable (ex: $_currentProject)",
    }), 
    targetBranch: z.string({
        required_error: "create_tag.target_branch is required",
        invalid_type_error: "create_tag.target_branch must be a string containing the branch name or associated with a stored variable (ex: $_targetBranch)",
    }),
    tagName: z.string({
        required_error: "create_tag.tag is required",
        invalid_type_error: "create_tag.tag must be a string containing the tag name or associated with a stored variable (ex: $_newTag)",
    }),
    awaitPipeline: z.boolean({
        invalid_type_error: "create_tag.await_pipeline must be a boolean",
    }).default(false)
}).strict();

export const applyDiffsOptionSchema = z.object({
    diffs: z.string({
        required_error: "apply_diffs.diffs is required",
        invalid_type_error: "apply_diffs.diffs must be a string associated with a stored variable (ex: $_diffs)",
    }).startsWith("$_", {message: 'apply_diffs.diffs must start with $_'}),
    files: z.array(z.string())
}).strict();


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
