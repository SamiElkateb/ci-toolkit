import { commandNames } from '../../constants/commandNames';
import { commandName } from '../../types/commandNames';

const fs = require('fs');
const checkIsString = (val: unknown): val is string => {
	return typeof val === 'string';
};

const checkIsVersion = (val: unknown): val is version => {
	if (typeof val !== 'string') return false;
	return Boolean(val.match(/\d+\.\d+\.\d+/));
};

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
	if (!checkIsString(val)) return false;
	return commandNames.includes(val as any);
};

export {
	checkIsString,
	checkIsVersion,
	checkIsPath,
	checkPathExists,
	checkIsConfigFilePath,
	checkIsVarKey,
	checkIsCommandName,
};
