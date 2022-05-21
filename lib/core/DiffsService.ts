import {
	checkIsBoolean,
	checkIsNumber,
	checkIsString,
	hasOwnProperty,
} from '../utils/validations/basicTypeValidations';
import prompt = require('prompt');
import Conf from './Conf';
import Logger from './Logger';

class DiffsService {
	constructor() {}

	static promptDiff = async (
		diff: diffType[keyof diffType],
		_: Conf,
		logger: Logger
	) => {
		logger.debug('Prompt Diffs');
		assertCommandOptionsValid(options, 'promptDiffs');
		const diffs = this.populateDiffs(options.diffs);
		const { store } = options;
		assertExists(diffs);
		for (const key in diffs) {
			if (Object.prototype.hasOwnProperty.call(diffs, key)) {
				const element = diffs[key];
			}
		}
	};

	static parseThroughDiffs(diff: unknown, propName?: string): unknown {
		if (checkIsString(diff) && propName) {
			return { [propName]: diff };
		}
		if (checkIsNumber(diff) && propName) {
			return { [propName]: diff };
		}
		if (checkIsBoolean(diff) && propName) {
			return { [propName]: diff };
		}
		if (diff === null || typeof diff !== 'object') {
			return diff;
		}
		const diffsArray = [];
		for (const property in diff) {
			if (hasOwnProperty(diff, property)) {
				const newDiff = DiffsService.parseThroughDiffs(
					diff[property],
					property
				);
				diffsArray.push(newDiff);
			}
		}
		if (diffsArray.length > 1) {
			return diffsArray;
		}
		return diffsArray[0];
	}
}

export default DiffsService;
