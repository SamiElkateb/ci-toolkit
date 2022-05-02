import { checkIsObject } from './validation';

function SnakeToCamelCase<T>(obj: T): SnakeToCamelCaseObjectKeys<T> {
	const entries = Object.entries(obj);
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
