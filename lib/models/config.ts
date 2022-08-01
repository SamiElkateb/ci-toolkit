import { z } from 'zod';
import ERROR_MESSAGES from '../constants/ErrorMessages';
export const fetchLastTagOptionSchema = z
    .object({
        project: z.string({
            required_error: ERROR_MESSAGES.isRequired(
                'fetch_current_tag.project'
            ),
            invalid_type_error: ERROR_MESSAGES.shouldBeString(
                'fetch_current_tag.project'
            ),
        }),
        store: z
            .string({
                required_error: ERROR_MESSAGES.isRequired(
                    'fetch_current_tag.store'
                ),
                invalid_type_error: ERROR_MESSAGES.shouldBeString(
                    'fetch_current_tag.store'
                ),
            })
            .startsWith('$_', {
                message: ERROR_MESSAGES.shouldStartWith(
                    'fetch_current_tag.store'
                ),
            }),
    })
    .strict();

export const createTagOptionSchema = z
    .object({
        project: z.string({
            required_error: ERROR_MESSAGES.isRequired('create_tag.project'),
            invalid_type_error: ERROR_MESSAGES.shouldBeString(
                'create_tag.project'
            ),
        }),
        targetBranch: z.string({
            required_error: ERROR_MESSAGES.isRequired(
                'create_tag.target_branch'
            ),
            invalid_type_error: ERROR_MESSAGES.shouldBeString(
                'create_tag.target_branch'
            ),
        }),
        tagName: z.string({
            required_error: ERROR_MESSAGES.isRequired('create_tag.tag'),
            invalid_type_error: ERROR_MESSAGES.shouldBeString('create_tag.tag'),
        }),
        awaitPipeline: z
            .boolean({
                invalid_type_error: ERROR_MESSAGES.shouldBeBoolean(
                    'create_tag.await_pipeline'
                ),
            })
            .default(false),
    })
    .strict();

export const startPipelineOptionSchema = z
    .object({
        project: z.string({
            required_error: ERROR_MESSAGES.isRequired('start_pipeline.project'),
            invalid_type_error: ERROR_MESSAGES.shouldBeString(
                'start_pipeline.project'
            ),
        }),
        ref: z.string({
            required_error: ERROR_MESSAGES.isRequired('start_pipeline.ref'),
            invalid_type_error: ERROR_MESSAGES.shouldBeString(
                'start_pipeline.ref'
            ),
        }),
        retries: z
            .number({
                invalid_type_error: ERROR_MESSAGES.shouldBeNumber(
                    'start_pipeline.retries'
                ),
            })
            .default(0),
        awaitPipeline: z
            .boolean({
                invalid_type_error: ERROR_MESSAGES.shouldBeBoolean(
                    'start_pipeline.await_pipeline'
                ),
            })
            .default(false),
        variables: z.array(
            z.object({
                key: z.string(),
                value: z.string(),
                type: z.string(),
            })
        ),
        store: z
            .string({
                invalid_type_error: ERROR_MESSAGES.shouldBeString(
                    'start_pipeline.store'
                ),
            })
            .startsWith('$_', {
                message: ERROR_MESSAGES.shouldStartWith('start_pipeline.store'),
            })
            .optional(),
    })
    .strict();

export const startJobOptionSchema = z
    .object({
        project: z.string({
            required_error: ERROR_MESSAGES.isRequired('start_job.project'),
            invalid_type_error: ERROR_MESSAGES.shouldBeString(
                'start_job.project'
            ),
        }),
        pipeline: z.string({
            required_error: ERROR_MESSAGES.isRequired('start_job.pipeline'),
            invalid_type_error: ERROR_MESSAGES.shouldBeString(
                'start_job.pipeline'
            ),
        }),
        store: z
            .string({
                invalid_type_error: ERROR_MESSAGES.shouldBeString(
                    'start_job.store'
                ),
            })
            .startsWith('$_', {
                message: ERROR_MESSAGES.shouldStartWith('start_job.store'),
            })
            .optional(),
        name: z.string({
            required_error: ERROR_MESSAGES.isRequired('start_job.name'),
            invalid_type_error: ERROR_MESSAGES.shouldBeString('start_job.name'),
        }),
        retries: z
            .number({
                invalid_type_error: ERROR_MESSAGES.shouldBeNumber(
                    'start_job.retries'
                ),
            })
            .default(0),
        awaitJob: z
            .boolean({
                invalid_type_error: ERROR_MESSAGES.shouldBeBoolean(
                    'start_job.await_job'
                ),
            })
            .default(false),
    })
    .strict();

export const applyDiffsOptionSchema = z
    .object({
        diffs: z
            .string({
                required_error: ERROR_MESSAGES.isRequired('apply_diffs.diffs'),
                invalid_type_error: ERROR_MESSAGES.shouldBeString(
                    'apply_diffs.diffs'
                ),
            })
            .startsWith('$_', {
                message: ERROR_MESSAGES.shouldStartWith('apply_diffs.diffs'),
            }),
        files: z.array(z.string()),
    })
    .strict();

export const getCurrentBranchNameOptionSchema = z
    .object({
        store: z
            .string({
                required_error: ERROR_MESSAGES.isRequired(
                    'get_current_branch_name.store'
                ),
                invalid_type_error: ERROR_MESSAGES.shouldBeString(
                    'get_current_branch_name.store'
                ),
            })
            .startsWith('$_', {
                message: ERROR_MESSAGES.shouldStartWith(
                    'get_current_branch_name.store'
                ),
            }),
    })
    .strict();

export const getCurrentProjectNameOptionSchema = z
    .object({
        store: z
            .string({
                required_error: ERROR_MESSAGES.isRequired(
                    'get_current_project_name.store'
                ),
                invalid_type_error: ERROR_MESSAGES.shouldBeString(
                    'get_current_project_name.store'
                ),
            })
            .startsWith('$_', {
                message: ERROR_MESSAGES.shouldStartWith(
                    'get_current_project_name.store'
                ),
            }),
    })
    .strict();

export const promptOptionSchema = z
    .object({
        question: z.string({
            required_error: ERROR_MESSAGES.isRequired('prompt.question'),
            invalid_type_error: ERROR_MESSAGES.shouldBeString(
                'prompt.question'
            ),
        }),
        store: z
            .string({
                required_error: ERROR_MESSAGES.isRequired('prompt.store'),
                invalid_type_error: ERROR_MESSAGES.shouldBeString(
                    'prompt.store'
                ),
            })
            .startsWith('$_', {
                message: ERROR_MESSAGES.shouldStartWith('prompt.store'),
            }),
    })
    .strict();

export const readCurrentVersionOptionSchema = z
    .object({
        file: z
            .string({
                required_error: ERROR_MESSAGES.isRequired(
                    'read_current_version.file'
                ),
                invalid_type_error: ERROR_MESSAGES.shouldBeString(
                    'read_current_version.file'
                ),
            })
            .regex(
                /^(\.{1,2}\/)?(\/|\w|_|-|\.)+$/,
                ERROR_MESSAGES.shouldBeValidPath('read_current_version.file')
            ),
        store: z
            .string({
                required_error: ERROR_MESSAGES.isRequired(
                    'read_current_version.store'
                ),
                invalid_type_error: ERROR_MESSAGES.shouldBeString(
                    'read_current_version.store'
                ),
            })
            .startsWith('$_', {
                message: ERROR_MESSAGES.shouldStartWith(
                    'read_current_version.store'
                ),
            }),
    })
    .strict();

export const getDiffsOptionSchema = z
    .object({
        file: z
            .string({
                required_error: ERROR_MESSAGES.isRequired('get_diffs.file'),
                invalid_type_error: ERROR_MESSAGES.shouldBeString(
                    'get_diffs.file'
                ),
            })
            .regex(
                /^(\.{1,2}\/)?(\/|\w|_|-|\.)+$/,
                ERROR_MESSAGES.shouldBeValidPath('get_diffs.file')
            ),
        sourceBranch: z.string({
            required_error: ERROR_MESSAGES.isRequired(
                'get_diffs.source_branch'
            ),
            invalid_type_error: ERROR_MESSAGES.shouldBeString(
                'get_diffs.source_branch'
            ),
        }),
        targetBranch: z.string(),
        store: z
            .string({
                required_error: ERROR_MESSAGES.isRequired('get_diffs.store'),
                invalid_type_error: ERROR_MESSAGES.shouldBeString(
                    'get_diffs.store'
                ),
            })
            .startsWith('$_', {
                message: ERROR_MESSAGES.shouldStartWith('get_diffs.store'),
            }),
    })
    .strict();

export const promptDiffsOptionSchema = z
    .object({
        diffs: z.string({
            required_error: ERROR_MESSAGES.isRequired('prompt_diffs.diffs'),
            invalid_type_error: ERROR_MESSAGES.shouldBeString(
                'prompt_diffs.diffs'
            ),
        }),
        store: z
            .string({
                required_error: ERROR_MESSAGES.isRequired('prompt_diffs.store'),
                invalid_type_error: ERROR_MESSAGES.shouldBeString(
                    'prompt_diffs.store'
                ),
            })
            .startsWith('$_', {
                message: ERROR_MESSAGES.shouldStartWith('prompt_diffs.store'),
            }),
    })
    .strict();

export const writeVersionOptionSchema = z.object({
    files: z.array(
        z
            .string({
                required_error: ERROR_MESSAGES.isRequired(
                    'write_version.files'
                ),
                invalid_type_error: ERROR_MESSAGES.shouldBeArrayOfStrings(
                    'write_version.files'
                ),
            })
            .regex(
                /^(\.{1,2}\/)?(\/|\w|_|-|\.)+$/,
                ERROR_MESSAGES.shouldBeValidPaths('write_version.files')
            )
    ),
    newVersion: z.string({
        required_error: ERROR_MESSAGES.isRequired('write_version.new_version'),
        invalid_type_error: ERROR_MESSAGES.shouldBeString(
            'write_version.new_version'
        ),
    }),
});
export const incrementVersionOptionSchema = z.object({
    incrementFrom: z.string({
        required_error: ERROR_MESSAGES.isRequired(
            'increment_version.increment_from'
        ),
        invalid_type_error: ERROR_MESSAGES.shouldBeString(
            'increment_version.increment_from'
        ),
    }),
    incrementBy: z.string({
        required_error: ERROR_MESSAGES.isRequired(
            'increment_version.increment_by'
        ),
        invalid_type_error: ERROR_MESSAGES.shouldBeString(
            'increment_version.increment_by'
        ),
    }),
    store: z
        .string({
            required_error: ERROR_MESSAGES.isRequired(
                'increment_version.store'
            ),
            invalid_type_error: ERROR_MESSAGES.shouldBeString(
                'increment_version.store'
            ),
        })
        .startsWith('$_', {
            message: ERROR_MESSAGES.shouldStartWith('increment_version.store'),
        }),
});
export const createMergeRequestOptionSchema = z
    .object({
        title: z.string({
            required_error: ERROR_MESSAGES.isRequired(
                'create_merge_request.title'
            ),
            invalid_type_error: ERROR_MESSAGES.shouldBeString(
                'create_merge_request.title'
            ),
        }),
        project: z.string({
            required_error: ERROR_MESSAGES.isRequired(
                'create_merge_request.project'
            ),
            invalid_type_error: ERROR_MESSAGES.shouldBeString(
                'create_merge_request.project'
            ),
        }),
        sourceBranch: z.string({
            required_error: ERROR_MESSAGES.isRequired(
                'create_merge_request.source_branch'
            ),
            invalid_type_error: ERROR_MESSAGES.shouldBeString(
                'create_merge_request.source_branch'
            ),
        }),
        targetBranch: z.string({
            required_error: ERROR_MESSAGES.isRequired(
                'create_merge_request.target_branch'
            ),
            invalid_type_error: ERROR_MESSAGES.shouldBeString(
                'create_merge_request.target_branch'
            ),
        }),
        awaitPipeline: z
            .boolean({
                invalid_type_error: ERROR_MESSAGES.shouldBeBoolean(
                    'create_merge_request.await_pipeline'
                ),
            })
            .default(false),
        minApprovals: z
            .number({
                invalid_type_error: ERROR_MESSAGES.shouldBeNumber(
                    'create_merge_request.min_approvals'
                ),
            })
            .default(0),
        assignToMe: z
            .boolean({
                invalid_type_error: ERROR_MESSAGES.shouldBeBoolean(
                    'create_merge_request.assign_to_me'
                ),
            })
            .default(false),
        deleteSourceBranch: z
            .boolean({
                invalid_type_error: ERROR_MESSAGES.shouldBeBoolean(
                    'create_merge_request.delete_source_branch'
                ),
            })
            .default(false),
        squashCommits: z
            .boolean({
                invalid_type_error: ERROR_MESSAGES.shouldBeBoolean(
                    'create_merge_request.squash_commits'
                ),
            })
            .default(false),
        reviewers: z
            .array(
                z.string({
                    invalid_type_error: ERROR_MESSAGES.shouldBeString(
                        'create_merge_request.reviewers'
                    ),
                })
            )
            .default([]),
        label: z
            .string({
                invalid_type_error: ERROR_MESSAGES.shouldBeString(
                    'create_merge_request.label'
                ),
            })
            .optional(),
    })
    .strict();

export const mergeMergeRequestOptionSchema = z.object({
    project: z.string({
        required_error: ERROR_MESSAGES.isRequired(
            'merge_merge_request.project'
        ),
        invalid_type_error: ERROR_MESSAGES.shouldBeString(
            'merge_merge_request.project'
        ),
    }),
    sourceBranch: z.string({
        required_error: ERROR_MESSAGES.isRequired(
            'merge_merge_request.source_branch'
        ),
        invalid_type_error: ERROR_MESSAGES.shouldBeString(
            'merge_merge_request.source_branch'
        ),
    }),
    targetBranch: z.string({
        required_error: ERROR_MESSAGES.isRequired(
            'merge_merge_request.target_branch'
        ),
        invalid_type_error: ERROR_MESSAGES.shouldBeString(
            'merge_merge_request.target_branch'
        ),
    }),
    awaitPipeline: z
        .boolean({
            invalid_type_error: ERROR_MESSAGES.shouldBeBoolean(
                'merge_merge_request.await_pipeline'
            ),
        })
        .default(false),
    minUpvotes: z
        .number({
            invalid_type_error: ERROR_MESSAGES.shouldBeNumber(
                'merge_merge_request.min_upvotes'
            ),
        })
        .default(0),
    maxDownvotes: z
        .number({
            invalid_type_error: ERROR_MESSAGES.shouldBeNumber(
                'merge_merge_request.max_downvotes'
            ),
        })
        .default(0),
    deleteSourceBranch: z
        .boolean({
            invalid_type_error: ERROR_MESSAGES.shouldBeBoolean(
                'merge_merge_request.delete_source_branch'
            ),
        })
        .default(false),
    squashCommits: z
        .boolean({
            invalid_type_error: ERROR_MESSAGES.shouldBeBoolean(
                'merge_merge_request.squash_commits'
            ),
        })
        .default(false),
});

export const commitOptionSchema = z
    .object({
        message: z.string({
            required_error: ERROR_MESSAGES.isRequired('commit.message'),
            invalid_type_error: ERROR_MESSAGES.shouldBeString('commit.message'),
        }),
        add: z
            .string({
                invalid_type_error: ERROR_MESSAGES.shouldBeString('commit.add'),
            })
            .regex(/all|tracked/, 'commit.add must be "all" or "tracked"')
            .optional(),
    })
    .strict();

export const pullOptionSchema = z.object({
    branch: z
        .string({
            invalid_type_error: ERROR_MESSAGES.shouldBeString('pull.branch'),
        })
        .optional(),
});

export const pushOptionSchema = z.object({
    branch: z
        .string({
            invalid_type_error: ERROR_MESSAGES.shouldBeString('push.branch'),
        })
        .optional(),
    awaitPipeline: z
        .boolean({
            invalid_type_error: ERROR_MESSAGES.shouldBeBoolean(
                'push.await_pipeline'
            ),
        })
        .default(false),
});

export const commandsUnion = z.union([
    z.object({
        prompt: promptOptionSchema,
    }),
    z.object({
        get_current_branch_name: getCurrentBranchNameOptionSchema,
    }),
    z.object({
        get_current_project_name: getCurrentProjectNameOptionSchema,
    }),
    z.object({
        get_diffs: getDiffsOptionSchema,
    }),
    z.object({
        prompt_diffs: promptDiffsOptionSchema,
    }),
    z.object({
        apply_diffs: applyDiffsOptionSchema,
    }),
    z.object({
        create_merge_request: createMergeRequestOptionSchema,
    }),
    z.object({
        merge_merge_request: mergeMergeRequestOptionSchema,
    }),
    z.object({
        fetch_last_tag: fetchLastTagOptionSchema,
    }),
    z.object({
        read_current_version: readCurrentVersionOptionSchema,
    }),
    z.object({
        create_tag: createTagOptionSchema,
    }),
    z.object({
        write_version: writeVersionOptionSchema,
    }),
    z.object({
        increment_version: incrementVersionOptionSchema,
    }),
    z.object({
        commit: commitOptionSchema,
    }),
    z.object({
        pull: pullOptionSchema,
    }),
    z.object({
        push: pushOptionSchema,
    }),
]);

export const arrayCommands = z.array(commandsUnion);
