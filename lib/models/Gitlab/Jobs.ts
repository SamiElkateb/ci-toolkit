import { z } from 'zod';

export const gitlabCommitSchema = z.object({
  id: z.string(),
  short_id: z.string(),
  title: z.string(),
  author_name: z.string(),
  author_email: z.string(),
  authored_date: z.string().optional(),
  committer_name: z.string().optional(),
  committer_email: z.string().optional(),
  committed_date: z.string().optional(),
  created_at: z.string(),
  message: z.string(),
  parent_ids: z.array(z.string()).optional(),
  web_url: z.string().optional(),
});

export const gitlabUserSchema = z.object({
  id: z.number(),
  username: z.string(),
  name: z.string(),
  state: z.string(),
  avatar_url: z.string(),
  web_url: z.string(),
});

export const gitlabRunnerSchema = z.object({
  active: z.boolean(),
  paused: z.boolean(),
  description: z.string(),
  id: z.number(),
  ip_address: z.string(),
  is_shared: z.boolean(),
  runner_type: z.string(),
  name: z.string().nullable(),
  online: z.boolean(),
  status: z.string(),
});

export const gitlabRunJobApiResponseSchema = z.object({
  commit: gitlabCommitSchema,
  coverage: z.any().optional(),
  allow_failure: z.boolean(),
  created_at: z.string(),
  started_at: z.string().nullable(),
  finished_at: z.string().nullable(),
  duration: z.number().nullable(),
  queued_duration: z.number().nullable(),
  id: z.number(),
  name: z.string(),
  ref: z.string(),
  artifacts: z.array(z.any()),
  runner: gitlabRunnerSchema.nullable(),
  stage: z.string(),
  status: z.string(),
  tag: z.boolean(),
  web_url: z.string(),
  user: gitlabUserSchema.nullable(),
});
