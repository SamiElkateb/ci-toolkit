import { commandNames } from '../../constants/commandNames';
import { commandName } from '../../types/commandNames';
import { checkIsString } from './basicTypeValidations';

const fs = require('fs');

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

function checkIsSameType<T, K>(val1: T, val2: K): val1 is K & T {
    return typeof val1 === typeof val2;
}

const checkIsConfigFilePath = (val: unknown): val is path => {
    if (!checkIsPath(val)) return false;
    return Boolean(val.match(/.json$|.yaml$|.yml$|.txt$/));
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

const checkIsCommitMessageValidLength = (message: unknown) => {
    if (!checkIsString(message)) return false;
    return message.length < 80;
};

const checkAreCommitMessageCharactersValid = (message: unknown) => {
    if (!checkIsString(message)) return false;
    return Boolean(message.match(/^[\w|\d|\_|\-|\,|\:| ]+$/));
};

export {
    checkIsVersion,
    checkIsPath,
    checkPathExists,
    checkIsConfigFilePath,
    checkIsVarKey,
    checkIsCommandName,
    checkIsSameType,
    checkIsCommitMessageValidLength,
    checkAreCommitMessageCharactersValid,
};
