import { defaultConfig } from '../../core/defaultConfig';
import { commandName } from '../../types/commandNames';
import { hasOwnProperty } from '../validations/basicTypeValidations';
import {
	checkIsVersion,
	checkIsPath,
	checkPathExists,
	checkIsVarKey,
	checkIsSameType,
	checkIsCommitMessageValidLength,
	checkAreCommitMessageCharactersValid,
} from '../validations/customTypeValidation';
import {
	assertObject,
	assertProperty,
	assertString,
} from './baseTypeAssertions';

type assertPathExists = (val: unknown, message?: string) => asserts val;
const assertPathExists: assertPathExists = (
	val: unknown,
	message?: string
): asserts val => {
	assertPath(val);
	if (!checkPathExists(val)) throw message || `path ${val} does not exist`;
};

type assertVersion = (val: unknown, message?: string) => asserts val is version;
const assertVersion: assertVersion = (
	val: unknown,
	message?: string
): asserts val is version => {
	if (!checkIsVersion(val)) throw message || `${val} is not a version number`;
};

type assertVersionIncrement = (
	val: unknown,
	message?: string
) => asserts val is versionIncrement;
const assertVersionIncrement: assertVersionIncrement = (
	val: unknown,
	message?: string
): asserts val is versionIncrement => {
	assertString(val);
	if (!['major', 'minor', 'patch'].includes(val))
		throw message || `${val} should be major|minor|patch`;
};

type assertVarKey = (val: unknown, message?: string) => asserts val is varKey;
const assertVarKey: assertVarKey = (
	val: unknown,
	message?: string
): asserts val is varKey => {
	if (!checkIsVarKey(val))
		throw message || `${val} is not a valid variable name`;
};

type assertPath = (val: unknown, message?: string) => asserts val is path;
const assertPath: assertPath = (
	val: unknown,
	message?: string
): asserts val is path => {
	if (!checkIsPath(val)) throw message || `${val} is not a path`;
};

function assertSameType<T, K>(
	val1: T,
	val2: K,
	message?: string
): asserts val1 is T & K {
	if (!checkIsSameType(val1, val2))
		throw message || `${val1} and ${val2} are not the same type`;
}

type assertCommandOptionsValid = (
	options: unknown,
	commandName: commandName
) => asserts options is commandOptions[commandName];

function assertCommandOptionsValid<C extends commandName>(
	options: unknown,
	commandName: C
): asserts options is commandOptions[C] {
	const commandOptions = defaultConfig.commands[commandName];
	assertObject(options);
	for (const property in commandOptions) {
		assertProperty(commandOptions, property);
		const requirementLevel = commandOptions[property];
		assertString(requirementLevel);
		const isRequired = requirementLevel === 'required';
		if (isRequired) {
			assertProperty(options, property);
		}
		// else if (hasOwnProperty(options, property)) {
		// 	assertSameType(options[property], commandOptions[property]);
		// }
	}
	for (const property in options) {
		assertProperty(commandOptions, property);
		assertProperty(options, property);
		// assertSameType(options[property], commandOptions[property]);
	}
}

function assertCommitMessageValidLength(
	commitMessage: unknown,
	message?: string
) {
	if (!checkIsCommitMessageValidLength(commitMessage))
		throw message || `Commit message is to long`;
}
function assertCommitMessageValidCharacters(
	commitMessage: unknown,
	message?: string
) {
	if (!checkAreCommitMessageCharactersValid(commitMessage)) {
		console.log(commitMessage);
		throw message || `Unauthorized characters in commit message`;
	}
}
export {
	assertVersion,
	assertVersionIncrement,
	assertPath,
	assertPathExists,
	assertVarKey,
	assertCommandOptionsValid,
	assertCommitMessageValidLength,
	assertCommitMessageValidCharacters,
};
