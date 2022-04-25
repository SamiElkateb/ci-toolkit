const checkIsString = (val: unknown): val is string => {
	return typeof val === 'string';
};

const checkIsVersion = (val: unknown): val is version => {
	if (typeof val !== 'string') return false;
	return Boolean(val.match(/\d*\.\d*\.\d*/));
};

function hasOwnProperty<X extends {}, Y extends PropertyKey>(
	obj: X,
	prop: Y
): obj is X & Record<Y, unknown> {
	return obj.hasOwnProperty(prop);
}
export { checkIsString, checkIsVersion, hasOwnProperty };
