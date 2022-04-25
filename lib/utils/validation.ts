const checkIsString = (val: unknown): val is string => {
	return typeof val === 'string';
};

const checkIsVersion = (val: unknown): val is version => {
	if (typeof val !== 'string') return false;
	return Boolean(val.match(/\d*\.\d*\.\d*/));
};

export { checkIsString, checkIsVersion };
