/* eslint-disable @typescript-eslint/naming-convention */
import { z } from 'zod';
import ERROR_MESSAGES from '../constants/ErrorMessages';
// import { SnakeToCamelCase } from '../utils/snakeToCamelCase';

export const fetchLastTagOptionSchema = z
  .object({
    project: z.string({
      required_error: ERROR_MESSAGES.isRequired(
        'fetch_current_tag.project',
      ),
      invalid_type_error: ERROR_MESSAGES.shouldBeString(
        'fetch_current_tag.project',
      ),
    }),
    store: z
      .string({
        required_error: ERROR_MESSAGES.isRequired(
          'fetch_current_tag.store',
        ),
        invalid_type_error: ERROR_MESSAGES.shouldBeString(
          'fetch_current_tag.store',
        ),
      })
      .startsWith('$_', {
        message: ERROR_MESSAGES.shouldStartWith(
          'fetch_current_tag.store',
        ),
      }),
  })
  .strict();

export const create_tag_option_schema = z
  .object({
    project: z.string({
      required_error: ERROR_MESSAGES.isRequired('create_tag.project'),
      invalid_type_error: ERROR_MESSAGES.shouldBeString(
        'create_tag.project',
      ),
    }),
    target_branch: z.string({
      required_error: ERROR_MESSAGES.isRequired(
        'create_tag.target_branch',
      ),
      invalid_type_error: ERROR_MESSAGES.shouldBeString(
        'create_tag.target_branch',
      ),
    }),
    tag_name: z.string({
      required_error: ERROR_MESSAGES.isRequired('create_tag.tag'),
      invalid_type_error: ERROR_MESSAGES.shouldBeString('create_tag.tag'),
    }),
    await_pipeline: z
      .boolean({
        invalid_type_error: ERROR_MESSAGES.shouldBeBoolean(
          'create_tag.await_pipeline',
        ),
      })
      .default(false),
  })
  .strict();
export const createTagOptionSchema = create_tag_option_schema.transform(
  (value) => ({
    ...value,
    targetBranch: value.target_branch,
    tagName: value.tag_name,
    awaitPipeline: value.await_pipeline,
  }),
);

export const start_pipeline_option_schema = z
  .object({
    project: z.string({
      required_error: ERROR_MESSAGES.isRequired('start_pipeline.project'),
      invalid_type_error: ERROR_MESSAGES.shouldBeString(
        'start_pipeline.project',
      ),
    }),
    ref: z.string({
      required_error: ERROR_MESSAGES.isRequired('start_pipeline.ref'),
      invalid_type_error: ERROR_MESSAGES.shouldBeString(
        'start_pipeline.ref',
      ),
    }),
    retries: z
      .number({
        invalid_type_error: ERROR_MESSAGES.shouldBeNumber(
          'start_pipeline.retries',
        ),
      })
      .default(0),
    await_pipeline: z
      .boolean({
        invalid_type_error: ERROR_MESSAGES.shouldBeBoolean(
          'start_pipeline.await_pipeline',
        ),
      })
      .default(false),
    variables: z.array(
      z.object({
        key: z.string(),
        value: z.string(),
        type: z.string(),
      }),
    ),
    store: z
      .string({
        invalid_type_error: ERROR_MESSAGES.shouldBeString(
          'start_pipeline.store',
        ),
      })
      .startsWith('$_', {
        message: ERROR_MESSAGES.shouldStartWith('start_pipeline.store'),
      })
      .optional(),
  })
  .strict();
export const startPipelineOptionSchema = start_pipeline_option_schema.transform(
  (value) => ({
    ...value,
    awaitPipeline: value.await_pipeline,
  }),
);

export const start_job_option_schema = z
  .object({
    project: z.string({
      required_error: ERROR_MESSAGES.isRequired('start_job.project'),
      invalid_type_error: ERROR_MESSAGES.shouldBeString(
        'start_job.project',
      ),
    }),
    pipeline: z.string({
      required_error: ERROR_MESSAGES.isRequired('start_job.pipeline'),
      invalid_type_error: ERROR_MESSAGES.shouldBeString(
        'start_job.pipeline',
      ),
    }),
    store: z
      .string({
        invalid_type_error: ERROR_MESSAGES.shouldBeString(
          'start_job.store',
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
          'start_job.retries',
        ),
      })
      .default(0),
    await_job: z
      .boolean({
        invalid_type_error: ERROR_MESSAGES.shouldBeBoolean(
          'start_job.await_job',
        ),
      })
      .default(false),
  })
  .strict();
export const startJobOptionSchema = start_job_option_schema.transform(
  (value) => ({
    ...value,
    awaitJob: value.await_job,
  }),
);

export const applyDiffsOptionSchema = z
  .object({
    diffs: z
      .string({
        required_error: ERROR_MESSAGES.isRequired('apply_diffs.diffs'),
        invalid_type_error: ERROR_MESSAGES.shouldBeString(
          'apply_diffs.diffs',
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
          'get_current_branch_name.store',
        ),
        invalid_type_error: ERROR_MESSAGES.shouldBeString(
          'get_current_branch_name.store',
        ),
      })
      .startsWith('$_', {
        message: ERROR_MESSAGES.shouldStartWith(
          'get_current_branch_name.store',
        ),
      }),
  })
  .strict();

export const getCurrentProjectNameOptionSchema = z
  .object({
    store: z
      .string({
        required_error: ERROR_MESSAGES.isRequired(
          'get_current_project_name.store',
        ),
        invalid_type_error: ERROR_MESSAGES.shouldBeString(
          'get_current_project_name.store',
        ),
      })
      .startsWith('$_', {
        message: ERROR_MESSAGES.shouldStartWith(
          'get_current_project_name.store',
        ),
      }),
  })
  .strict();

export const promptOptionSchema = z
  .object({
    question: z.string({
      required_error: ERROR_MESSAGES.isRequired('prompt.question'),
      invalid_type_error: ERROR_MESSAGES.shouldBeString(
        'prompt.question',
      ),
    }),
    store: z
      .string({
        required_error: ERROR_MESSAGES.isRequired('prompt.store'),
        invalid_type_error: ERROR_MESSAGES.shouldBeString(
          'prompt.store',
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
          'read_current_version.file',
        ),
        invalid_type_error: ERROR_MESSAGES.shouldBeString(
          'read_current_version.file',
        ),
      })
      .regex(
        /^(\.{1,2}\/)?(\/|\w|_|-|\.)+$/,
        ERROR_MESSAGES.shouldBeValidPath('read_current_version.file'),
      ),
    store: z
      .string({
        required_error: ERROR_MESSAGES.isRequired(
          'read_current_version.store',
        ),
        invalid_type_error: ERROR_MESSAGES.shouldBeString(
          'read_current_version.store',
        ),
      })
      .startsWith('$_', {
        message: ERROR_MESSAGES.shouldStartWith(
          'read_current_version.store',
        ),
      }),
  })
  .strict();

export const get_diffs_option_schema = z
  .object({
    file: z
      .string({
        required_error: ERROR_MESSAGES.isRequired('get_diffs.file'),
        invalid_type_error: ERROR_MESSAGES.shouldBeString(
          'get_diffs.file',
        ),
      })
      .regex(
        /^(\.{1,2}\/)?(\/|\w|_|-|\.)+$/,
        ERROR_MESSAGES.shouldBeValidPath('get_diffs.file'),
      ),
    source_branch: z.string({
      required_error: ERROR_MESSAGES.isRequired(
        'get_diffs.source_branch',
      ),
      invalid_type_error: ERROR_MESSAGES.shouldBeString(
        'get_diffs.source_branch',
      ),
    }),
    target_branch: z.string(),
    store: z
      .string({
        required_error: ERROR_MESSAGES.isRequired('get_diffs.store'),
        invalid_type_error: ERROR_MESSAGES.shouldBeString(
          'get_diffs.store',
        ),
      })
      .startsWith('$_', {
        message: ERROR_MESSAGES.shouldStartWith('get_diffs.store'),
      }),
  })
  .strict();
export const getDiffsOptionSchema = get_diffs_option_schema.transform(
  (value) => ({
    ...value,
    sourceBranch: value.source_branch,
    targetBranch: value.target_branch,
  }),
);

export const promptDiffsOptionSchema = z
  .object({
    diffs: z.string({
      required_error: ERROR_MESSAGES.isRequired('prompt_diffs.diffs'),
      invalid_type_error: ERROR_MESSAGES.shouldBeString(
        'prompt_diffs.diffs',
      ),
    }),
    store: z
      .string({
        required_error: ERROR_MESSAGES.isRequired('prompt_diffs.store'),
        invalid_type_error: ERROR_MESSAGES.shouldBeString(
          'prompt_diffs.store',
        ),
      })
      .startsWith('$_', {
        message: ERROR_MESSAGES.shouldStartWith('prompt_diffs.store'),
      }),
  })
  .strict();

export const write_version_option_schema = z.object({
  files: z.array(
    z
      .string({
        required_error: ERROR_MESSAGES.isRequired(
          'write_version.files',
        ),
        invalid_type_error: ERROR_MESSAGES.shouldBeArrayOfStrings(
          'write_version.files',
        ),
      })
      .regex(
        /^(\.{1,2}\/)?(\/|\w|_|-|\.)+$/,
        ERROR_MESSAGES.shouldBeValidPaths('write_version.files'),
      ),
  ),
  new_version: z.string({
    required_error: ERROR_MESSAGES.isRequired('write_version.new_version'),
    invalid_type_error: ERROR_MESSAGES.shouldBeString(
      'write_version.new_version',
    ),
  }),
});
export const writeVersionOptionSchema = write_version_option_schema.transform(
  (value) => ({
    ...value,
    newVersion: value.new_version,
  }),
);

export const increment_version_option_schema = z.object({
  increment_from: z.string({
    required_error: ERROR_MESSAGES.isRequired(
      'increment_version.increment_from',
    ),
    invalid_type_error: ERROR_MESSAGES.shouldBeString(
      'increment_version.increment_from',
    ),
  }),
  increment_by: z.string({
    required_error: ERROR_MESSAGES.isRequired(
      'increment_version.increment_by',
    ),
    invalid_type_error: ERROR_MESSAGES.shouldBeString(
      'increment_version.increment_by',
    ),
  }),
  store: z
    .string({
      required_error: ERROR_MESSAGES.isRequired(
        'increment_version.store',
      ),
      invalid_type_error: ERROR_MESSAGES.shouldBeString(
        'increment_version.store',
      ),
    })
    .startsWith('$_', {
      message: ERROR_MESSAGES.shouldStartWith('increment_version.store'),
    }),
});
export const incrementVersionOptionSchema = increment_version_option_schema.transform(
  (value) => ({
    ...value,
    incrementFrom: value.increment_from,
    incrementBy: value.increment_by,
  }),
);

export const create_merge_request_option_schema = z
  .object({
    title: z.string({
      required_error: ERROR_MESSAGES.isRequired(
        'create_merge_request.title',
      ),
      invalid_type_error: ERROR_MESSAGES.shouldBeString(
        'create_merge_request.title',
      ),
    }),
    project: z.string({
      required_error: ERROR_MESSAGES.isRequired(
        'create_merge_request.project',
      ),
      invalid_type_error: ERROR_MESSAGES.shouldBeString(
        'create_merge_request.project',
      ),
    }),
    source_branch: z.string({
      required_error: ERROR_MESSAGES.isRequired(
        'create_merge_request.source_branch',
      ),
      invalid_type_error: ERROR_MESSAGES.shouldBeString(
        'create_merge_request.source_branch',
      ),
    }),
    target_branch: z.string({
      required_error: ERROR_MESSAGES.isRequired(
        'create_merge_request.target_branch',
      ),
      invalid_type_error: ERROR_MESSAGES.shouldBeString(
        'create_merge_request.target_branch',
      ),
    }),
    await_pipeline: z
      .boolean({
        invalid_type_error: ERROR_MESSAGES.shouldBeBoolean(
          'create_merge_request.await_pipeline',
        ),
      })
      .default(false),
    min_approvals: z
      .number({
        invalid_type_error: ERROR_MESSAGES.shouldBeNumber(
          'create_merge_request.min_approvals',
        ),
      })
      .default(0),
    assign_to_me: z
      .boolean({
        invalid_type_error: ERROR_MESSAGES.shouldBeBoolean(
          'create_merge_request.assign_to_me',
        ),
      })
      .default(false),
    delete_source_branch: z
      .boolean({
        invalid_type_error: ERROR_MESSAGES.shouldBeBoolean(
          'create_merge_request.delete_source_branch',
        ),
      })
      .default(false),
    squash_commits: z
      .boolean({
        invalid_type_error: ERROR_MESSAGES.shouldBeBoolean(
          'create_merge_request.squash_commits',
        ),
      })
      .default(false),
    reviewers: z
      .array(
        z.string({
          invalid_type_error: ERROR_MESSAGES.shouldBeString(
            'create_merge_request.reviewers',
          ),
        }),
      )
      .default([]),
    label: z
      .string({
        invalid_type_error: ERROR_MESSAGES.shouldBeString(
          'create_merge_request.label',
        ),
      })
      .optional(),
  })
  .strict();

export const createMergeRequestOptionSchema = create_merge_request_option_schema.transform(
  (value) => ({
    ...value,
    sourceBranch: value.source_branch,
    targetBranch: value.target_branch,
    awaitPipeline: value.await_pipeline,
    minApprovals: value.min_approvals,
    assignToMe: value.assign_to_me,
    deleteSourceBranch: value.delete_source_branch,
    squashCommits: value.squash_commits,
  }),
);

export const merge_merge_request_option_chema = z.object({
  project: z.string({
    required_error: ERROR_MESSAGES.isRequired(
      'merge_merge_request.project',
    ),
    invalid_type_error: ERROR_MESSAGES.shouldBeString(
      'merge_merge_request.project',
    ),
  }),
  source_branch: z.string({
    required_error: ERROR_MESSAGES.isRequired(
      'merge_merge_request.source_branch',
    ),
    invalid_type_error: ERROR_MESSAGES.shouldBeString(
      'merge_merge_request.source_branch',
    ),
  }),
  target_branch: z.string({
    required_error: ERROR_MESSAGES.isRequired(
      'merge_merge_request.target_branch',
    ),
    invalid_type_error: ERROR_MESSAGES.shouldBeString(
      'merge_merge_request.target_branch',
    ),
  }),
  await_pipeline: z
    .boolean({
      invalid_type_error: ERROR_MESSAGES.shouldBeBoolean(
        'merge_merge_request.await_pipeline',
      ),
    })
    .default(false),
  min_upvotes: z
    .number({
      invalid_type_error: ERROR_MESSAGES.shouldBeNumber(
        'merge_merge_request.min_upvotes',
      ),
    })
    .default(0),
  max_downvotes: z
    .number({
      invalid_type_error: ERROR_MESSAGES.shouldBeNumber(
        'merge_merge_request.max_downvotes',
      ),
    })
    .default(0),
  delete_source_branch: z
    .boolean({
      invalid_type_error: ERROR_MESSAGES.shouldBeBoolean(
        'merge_merge_request.delete_source_branch',
      ),
    })
    .default(false),
  squash_commits: z
    .boolean({
      invalid_type_error: ERROR_MESSAGES.shouldBeBoolean(
        'merge_merge_request.squash_commits',
      ),
    })
    .default(false),
});
export const mergeMergeRequestOptionSchema = merge_merge_request_option_chema.transform(
  (value) => ({
    ...value,
    sourceBranch: value.source_branch,
    targetBranch: value.target_branch,
    awaitPipeline: value.await_pipeline,
    minUpvotes: value.min_upvotes,
    maxDownvotes: value.max_downvotes,
    deleteSourceBranch: value.delete_source_branch,
    squashCommits: value.squash_commits,
  }),
);

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

export const push_option_schema = z.object({
  branch: z
    .string({
      invalid_type_error: ERROR_MESSAGES.shouldBeString('push.branch'),
    })
    .optional(),
  await_pipeline: z
    .boolean({
      invalid_type_error: ERROR_MESSAGES.shouldBeBoolean(
        'push.await_pipeline',
      ),
    })
    .default(false),
});

export const pushOptionSchema = push_option_schema.transform(
  (value) => ({ ...value, awaitPipeline: value.await_pipeline }),
);

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
    get_diffs: get_diffs_option_schema,
  }),
  z.object({
    prompt_diffs: promptDiffsOptionSchema,
  }),
  z.object({
    apply_diffs: applyDiffsOptionSchema,
  }),
  z.object({
    create_merge_request: create_merge_request_option_schema,
  }),
  z.object({
    merge_merge_request: merge_merge_request_option_chema,
  }),
  z.object({
    fetch_last_tag: fetchLastTagOptionSchema,
  }),
  z.object({
    read_current_version: readCurrentVersionOptionSchema,
  }),
  z.object({
    create_tag: create_tag_option_schema,
  }),
  z.object({
    write_version: write_version_option_schema,
  }),
  z.object({
    increment_version: increment_version_option_schema,
  }),
  z.object({
    commit: commitOptionSchema,
  }),
  z.object({
    pull: pullOptionSchema,
  }),
  z.object({
    push: push_option_schema,
  }),
  z.object({
    start_pipeline: start_pipeline_option_schema,
  }),
  z.object({
    start_job: start_job_option_schema,
  }),
]);

export const arrayCommands = z.array(commandsUnion);
export const customCommands = z.record(z.string(), arrayCommands, {
  required_error: ERROR_MESSAGES.isRequired(
    'commands',
  ),
  // invalid_type_error: ERROR_MESSAGES.shouldBeBoolean(
  //   'commands',
  // ),
});

export const nonPopulatedConfigSchema = z.object({
  token: z.string({
    required_error: ERROR_MESSAGES.isRequired(
      'token',
    ),
    invalid_type_error: ERROR_MESSAGES.shouldBeString(
      'token',
    ),
  }).regex(
    /^(\.{1,2}\/)?(\/|\w|_|-|\.)+$/,
    ERROR_MESSAGES.shouldBeValidPath('token'),
  ),
  commands: z.record(z.string(), z.union([z.string(), arrayCommands])),
});

export const configSchema = z
  .object({
    token: z.string({
      required_error: ERROR_MESSAGES.isRequired(
        'token',
      ),
      invalid_type_error: ERROR_MESSAGES.shouldBeString(
        'token',
      ),
    }),
    project: z
      .string({
        invalid_type_error: ERROR_MESSAGES.shouldBeString(
          'project',
        ),
      }).optional(),
    aggregated_commands: z.record(z.string(), customCommands).optional(),
    commands: customCommands,
    log_level: z
      .string({
        invalid_type_error: ERROR_MESSAGES.shouldBeString(
          'log_level',
        ),
      }).regex(
        /^(debug|info|warn|error)$/,
        ERROR_MESSAGES.shouldBeOneOf('log_level', 'debug|info|warn|error'),
      )
      .default('info'),
    domain: z
      .string({
        invalid_type_error: ERROR_MESSAGES.shouldBeString(
          'domain',
        ),
      })
      .default('gitlab.com'),
    lang: z
      .string({
        invalid_type_error: ERROR_MESSAGES.shouldBeString(
          'lang',
        ),
      })
      .default('en'),
    allow_insecure_certificates: z
      .boolean({
        invalid_type_error: ERROR_MESSAGES.shouldBeBoolean(
          'allow_insecure_certificates',
        ),
      })
      .default(false),
    warning_action: z
      .string({
        invalid_type_error: ERROR_MESSAGES.shouldBeString(
          'warning_action',
        ),
      }).regex(
        /^(prompt|standby|skip)$/,
        ERROR_MESSAGES.shouldBeOneOf('warning_action', 'prompt|standby|skip'),
      )
      .default('prompt'),
    protocole: z
      .string({
        invalid_type_error: ERROR_MESSAGES.shouldBeString(
          'protocole',
        ),
      }).regex(
        /^(http|https)$/,
        ERROR_MESSAGES.shouldBeOneOf('protocoles', 'http|https'),
      )
      .default('https'),
  }).strict()
  .transform((userConfig) => ({
    ...userConfig,
    warningAction: userConfig.warning_action,
    allowInsecureCertificates: userConfig.allow_insecure_certificates,
    logLevel: userConfig.log_level,
    // aggregatedCommands: userConfig.aggregated_commands,
  }));
export type ConfigFile = z.infer<typeof configSchema>;
