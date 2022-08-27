import { z } from 'zod';

const gitlabMergeRequestSchema = z.object({
  id: z.number(),
  iid: z.number(),
  project_id: z.number(),
  title: z.string(),
  state: z.string(),
  target_branch: z.string(),
  source_branch: z.string(),
  upvotes: z.number(),
  downvotes: z.number(),
  merge_status: z.string(),
  should_remove_source_branch: z.string(),
  has_conflicts: z.boolean(),
  blocking_discussions_resolved: z.boolean(),
});

export default gitlabMergeRequestSchema;
