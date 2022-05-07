import { commandName, command_name } from '../constants/commandNames';

const fs = require('fs');
const checkIsString = (val: unknown): val is string => {
	return typeof val === 'string';
};

const checkIsNumber = (val: unknown): val is number => {
	return typeof val === 'number';
};
const checkIsObject = (val: unknown): val is object => {
	return typeof val === 'object' && val !== null;
};

const checkIsStrictObject = (val: unknown): val is object => {
	return typeof val === 'object' && val !== null && !Array.isArray(val);
};

const checkIsArray = (val: unknown): val is Array<unknown> => {
	return Array.isArray(val);
};

const checkIsVersion = (val: unknown): val is version => {
	if (typeof val !== 'string') return false;
	return Boolean(val.match(/\d+\.\d+\.\d+/));
};

function hasOwnProperty<X extends {}, Y extends PropertyKey>(
	obj: X,
	prop: Y
): obj is X & Record<Y, unknown> {
	return obj.hasOwnProperty(prop);
}

const checkIsVarKey = (val: unknown): val is varKey => {
	if (!checkIsString(val)) return false;
	return Boolean(val.match(/\$_\w+/));
};

const checkIsPath = (val: unknown): val is path => {
	if (typeof val !== 'string') return false;
	return Boolean(val.match(/^(\.{1,2}\/)?(\/|\w|_|-|\.)+$/));
};

const checkIsConfigFilePath = (val: unknown): val is path => {
	if (!checkIsPath(val)) return false;
	return Boolean(val.match(/.json$|.yaml$|.yml$/));
};

const checkPathExists = (path: path) => {
	try {
		if (fs.existsSync(path)) return true;
	} catch (err) {
		console.error(err);
	}
	return false;
};
const checkIsCommandName = (val: unknown): val is commandName => {
	return true;
};

export {
	checkIsString,
	checkIsVersion,
	checkIsArray,
	checkIsObject,
	hasOwnProperty,
	checkIsNumber,
	checkIsPath,
	checkPathExists,
	checkIsStrictObject,
	checkIsConfigFilePath,
	checkIsVarKey,
	checkIsCommandName,
};
