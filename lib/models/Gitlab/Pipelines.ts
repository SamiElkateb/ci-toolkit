import { z } from 'zod';

const gitlabPipelineSchema = z.object({
  id: z.number(),
  iid: z.number(),
  project_id: z.number(),
  ref: z.string(),
  status: z.string(),
  source: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export default gitlabPipelineSchema;
