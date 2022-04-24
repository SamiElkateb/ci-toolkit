const checkIsString = (toCheck: unknown): toCheck is string => {
	return typeof toCheck === 'string';
};
