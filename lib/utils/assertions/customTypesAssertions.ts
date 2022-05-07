import { defaultConfig } from '../../core/defaultConfig';
import { commandName } from '../../types/commandNames';
import {
	checkIsVersion,
	checkIsPath,
	checkPathExists,
	checkIsVarKey,
} from '../validations/customTypeValidation';
import { assertObject, assertProperty } from './baseTypeAssertions';

type assertPathExists = (val: unknown, message?: string) => asserts val;
const assertPathExists: assertPathExists = (
	val: unknown,
	message?: string
): asserts val => {
	assertPath(val);
	if (!checkPathExists(val)) throw message || 'path does not exist';
};

type assertVersion = (val: unknown, message?: string) => asserts val is version;
const assertVersion: assertVersion = (
	val: unknown,
	message?: string
): asserts val is version => {
	if (!checkIsVersion(val)) throw message || 'value is not a version number';
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
	if (!checkIsPath(val)) throw message || 'value is not a path';
};

function hasOwnProperty<X extends {}, Y extends PropertyKey>(
	obj: X,
	prop: Y
): obj is X & Record<Y, unknown> {
	return obj.hasOwnProperty(prop);
}

type assertCommandOptions = (
	options: unknown,
	commandName: commandName
) => asserts options is commandOptions[commandName];

function assertCommandOptions<C extends commandName>(
	options: unknown,
	commandName: C
): asserts options is commandOptions[C] {
	const commandOptions = defaultConfig.commands[commandName];
	assertObject(options);
	for (const property in commandOptions) {
		assertProperty(commandOptions, property);
		assertProperty(options, property);
	}
	for (const property in options) {
		assertProperty(commandOptions, property);
		assertProperty(options, property);
	}
}

export {
	assertVersion,
	assertPath,
	assertPathExists,
	assertVarKey,
	assertCommandOptions,
};
