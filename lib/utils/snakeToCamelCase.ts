import {
	checkIsArray,
	checkIsNumber,
	checkIsObject,
	checkIsString,
} from './validation';

function SnakeToCamelCase<T>(val: T): SnakeToCamelCaseObjectKeys<T> {
	if (!checkIsObject(val)) return val as SnakeToCamelCaseObjectKeys<T>;
	if (checkIsArray(val)) {
		return val.map((i) => {
			return SnakeToCamelCase(i);
		}) as unknown as SnakeToCamelCaseObjectKeys<T>;
	}
	const entries = Object.entries(val);
	const mappedEntries = entries.map(([key, value]) => {
		const lowerCaseKey = key.toLowerCase();

		const camelCaseKey = lowerCaseKey.replace(/([-_][a-z])/, (group) =>
			group.toUpperCase().replace('_', '')
		);
		const newValue = checkIsObject(value) ? SnakeToCamelCase(value) : value;
		return [camelCaseKey, newValue];
	});
	return Object.fromEntries(mappedEntries);
}

export { SnakeToCamelCase };
