import prompt = require('prompt');
import { z } from 'zod';

const assertContinue = async (question: string): Promise<true> => {
  prompt.start();
  const { answer } = await prompt.get([
    {
      description: `${question} (Y/n)`,
      name: 'answer',
      required: true,
    },
  ]);
  const parsedAnswer = z.string().safeParse(answer);
  if (parsedAnswer.success) {
    if (['yes', 'Y'].includes(parsedAnswer.data)) return true;
    if (['no', 'n'].includes(parsedAnswer.data)) throw new Error('Aborted by user');
  }
  return assertContinue(question);
};

export default assertContinue;
