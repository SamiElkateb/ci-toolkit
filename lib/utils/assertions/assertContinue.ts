import prompt = require('prompt');
import { assertString } from './baseTypeAssertions';

const assertContinue = async (question: string) => {
	prompt.start();
	const { answer } = await prompt.get([
		{
			description: `${question} (Y/n)`,
			name: 'answer',
			required: true,
		},
	]);
	assertString(answer);
	if (['yes', 'Y'].includes(answer)) return true;
	if (['no', 'n'].includes(answer)) throw 'Aborted by user';
	assertContinue(question);
};

export { assertContinue };
