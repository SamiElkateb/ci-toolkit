import {
	checkIsArray,
	checkIsBoolean,
	checkIsNumber,
	checkIsObject,
	checkIsString,
	hasOwnProperty,
} from '../validations/basicTypeValidations';

type assertString = (val: unknown, message?: string) => asserts val is string;
const assertString: assertString = (
	val: unknown,
	message?: string
): asserts val is string => {
	if (!checkIsString(val)) throw message || `${val} is not a string`;
};

type assertBoolean = (val: unknown, message?: string) => asserts val is boolean;
const assertBoolean: assertBoolean = (
	val: unknown,
	message?: string
): asserts val is boolean => {
	if (!checkIsBoolean(val)) throw message || `${val} is not a boolean`;
};

type assertNumber = (val: unknown, message?: string) => asserts val is number;
const assertNumber: assertNumber = (
	val: unknown,
	message?: string
): asserts val is number => {
	if (!checkIsNumber(val)) throw message || `${val} is not a number`;
};

type assertArray = (
	val: unknown,
	message?: string
) => asserts val is Array<unknown>;
const assertArray: assertArray = (
	val: unknown,
	message?: string
): asserts val is Array<unknown> => {
	if (!checkIsArray(val)) throw message || `${val} is not an array`;
};

type assertObject = (val: unknown, message?: string) => asserts val is object;
const assertObject: assertObject = (
	val: unknown,
	message?: string
): asserts val is object => {
	if (!checkIsObject(val)) throw message || `${val} is not an object`;
};

type assertExists = (val: unknown, message?: string) => asserts val;
const assertExists: assertExists = (
	val: unknown,
	message?: string
): asserts val => {
	if (typeof val === 'undefined') throw message || `${val} does not exist`;
};

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
	if (!hasOwnProperty(obj, prop))
		throw message || `${obj} does not have property ${prop}`;
}

export {
	assertExists,
	assertBoolean,
	assertString,
	assertProperty,
	assertObject,
	assertArray,
	assertNumber,
};
