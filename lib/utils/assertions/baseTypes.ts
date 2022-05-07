import {
	checkIsArray,
	checkIsNumber,
	checkIsObject,
	checkIsString,
} from '../validation';

type assertString = (val: unknown, message?: string) => asserts val is string;
const assertString: assertString = (
	val: unknown,
	message?: string
): asserts val is string => {
	if (!checkIsString(val)) throw message || 'value is not a string';
};

type assertNumber = (val: unknown, message?: string) => asserts val is number;
const assertNumber: assertNumber = (
	val: unknown,
	message?: string
): asserts val is number => {
	if (!checkIsNumber(val)) throw message || 'value is not a number';
};

type assertArray = (
	val: unknown,
	message?: string
) => asserts val is Array<unknown>;
const assertArray: assertArray = (
	val: unknown,
	message?: string
): asserts val is Array<unknown> => {
	if (!checkIsArray(val)) throw message || 'value is not an array';
};

type assertObject = (val: unknown, message?: string) => asserts val is object;
const assertObject: assertObject = (
	val: unknown,
	message?: string
): asserts val is object => {
	if (!checkIsObject(val)) throw message || 'value is not an object';
};

type assertExists = (val: unknown, message?: string) => asserts val;
const assertExists: assertExists = (
	val: unknown,
	message?: string
): asserts val => {
	if (typeof val === 'undefined') throw message || 'value does not exist';
};

function hasOwnProperty<X extends {}, Y extends PropertyKey>(
	obj: X,
	prop: Y
): obj is X & Record<Y, unknown> {
	return obj.hasOwnProperty(prop);
}

type assertProperty<X extends {}, Y extends PropertyKey> = (
	obj: X,
	prop: Y,
	message?: string
) => asserts obj is X & Record<Y, unknown>;
function assertProperty<X extends {}, Y extends PropertyKey>(
	obj: X,
	prop: Y,
	message?: string
): asserts obj is X & Record<Y, unknown> {
	if (!hasOwnProperty(obj, prop)) throw message || 'does not have property';
}

export {
	assertExists,
	assertString,
	assertProperty,
	assertObject,
	assertArray,
	assertNumber,
};
