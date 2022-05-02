type logLevel = 'error' | 'warn' | 'info' | 'debug';

type version = `${number}.${number}.${number}`;

type path = `${string}/${string}`;

type nonArrayObject = object & { length?: never };

type SnakeToCamelCase<S extends string> = S extends `${infer T}_${infer U}`
	? `${T}${Capitalize<SnakeToCamelCase<U>>}`
	: S;

type SnakeToCamelCaseObjectKeys<T> = T extends nonArrayObject
	? {
			[K in keyof T as SnakeToCamelCase<
				K & string
			>]: SnakeToCamelCaseObjectKeys<T[K]>;
	  }
	: T;
