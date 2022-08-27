import { z } from 'zod';

const gitlabJobSchema = z.object({
  id: z.number(),
  name: z.string(),
  status: z.string(),
});

export default gitlabJobSchema;
// export const gitlabRunJobApiResponseSchema = z.object({
//   coverage: z.any().optional(),
//   allow_failure: z.boolean(),
//   created_at: z.string(),
//   started_at: z.string().nullable(),
//   finished_at: z.string().nullable(),
//   duration: z.number().nullable(),
//   queued_duration: z.number().nullable(),
//   id: z.number(),
//   name: z.string(),
//   ref: z.string(),
//   artifacts: z.array(z.any()),
//   stage: z.string(),
//   status: z.string(),
//   tag: z.boolean(),
//   web_url: z.string(),
// });
