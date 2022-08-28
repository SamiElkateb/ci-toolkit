import { z } from 'zod';

const gitlabTagSchema = z.object({
  name: z.string(),
  target: z.string(),
});

export default gitlabTagSchema;
