import { z } from 'zod';

const gitlabUserSchema = z.object({
  id: z.number(),
  username: z.string(),
  name: z.string(),
  state: z.string(),
});

export default gitlabUserSchema;
