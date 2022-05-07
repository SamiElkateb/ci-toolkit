import {
	checkIsArray,
	checkIsNumber,
	checkIsObject,
	checkIsString,
} from './validations/basicTypeValidations';

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

		const camelCaseKey = lowerCaseKey.replace(/(_\w)/g, (group) => {
			return group.toUpperCase().replace('_', '');
		});
		const newValue = checkIsObject(value) ? SnakeToCamelCase(value) : value;
		return [camelCaseKey, newValue];
	});
	return Object.fromEntries(mappedEntries);
}

function SnakeToCamelCaseArray<S extends string>(
	val: S[]
): SnakeToCamelCase<S>[] {
	return val.map((value) => {
		const lowerCaseKey = value.toLowerCase();
		return lowerCaseKey.replace(/(_\w)/g, (group) => {
			return group.toUpperCase().replace('_', '');
		}) as unknown as SnakeToCamelCase<S>;
	});
}

export { SnakeToCamelCase, SnakeToCamelCaseArray };
