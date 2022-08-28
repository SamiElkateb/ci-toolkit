import { z } from 'zod';

const gitlabJobSchema = z.object({
  id: z.number(),
  name: z.string(),
  status: z.string(),
});

export default gitlabJobSchema;
