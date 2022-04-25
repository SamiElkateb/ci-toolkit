import { checkIsString } from './utils';
import { checkIsVersion } from './validation';

type assertString = (val: unknown, message?: string) => asserts val is string;
const assertString: assertString = (
	val: unknown,
	message?: string
): asserts val is string => {
	if (!checkIsString(val)) throw message || 'value is not a string';
};

type assertExists = (val: unknown, message?: string) => asserts val;
const assertExists: assertExists = (
	val: unknown,
	message?: string
): asserts val => {
	if (typeof val === 'undefined') throw message || 'value does not exist';
};

type assertVersion = (val: unknown, message?: string) => asserts val is version;
const assertVersion: assertVersion = (
	val: unknown,
	message?: string
): asserts val is version => {
	if (!checkIsVersion(val)) throw message || 'value is not a version number';
};

function hasOwnProperty<X extends {}, Y extends PropertyKey>(
	obj: X,
	prop: Y
): obj is X & Record<Y, unknown> {
	return obj.hasOwnProperty(prop);
}

/* type assertProperty<X extends {}, Y extends PropertyKey> = (
	obj: X,
	prop: Y,
	message?: string
) => asserts obj is X & Record<Y, unknown>; */
function assertProperty<X extends {}, Y extends PropertyKey>(
	{obj: X,
	prop: Y,
	message?: string}
): asserts obj is X & Record<Y, unknown> {
	if (!hasOwnProperty(obj, prop)) throw message || 'does not have property';
}

export { assertExists, assertString, assertVersion, assertProperty };
