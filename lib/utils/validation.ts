const checkIsString = (val: unknown): val is string => {
	return typeof val === 'string';
};

const checkIsObject = (val: unknown): val is object => {
	return typeof val === 'object' && val !== null;
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
export {
	checkIsString,
	checkIsVersion,
	checkIsArray,
	checkIsObject,
	hasOwnProperty,
};
