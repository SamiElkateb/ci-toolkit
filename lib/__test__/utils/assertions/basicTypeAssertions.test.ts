import { describe, expect, it } from 'vitest';
import { Git } from '../../../core';
import {
	assertArray,
	assertBoolean,
	assertNumber,
	assertObject,
	assertString,
} from '../../../utils/assertions/baseTypeAssertions';

describe('assertString', () => {
	it('should not throw if provided with a string', () => {
		const input = 'test';

		expect(() => {
			assertString(input);
		}).not.toThrow();
	});
	it('should throw if not provided with a string', () => {
		const inputs = [true, false, 0, 1, {}, [], NaN, null, undefined];

		const resultsFn = inputs.map((input) => () => {
			assertString(input);
		});

		resultsFn.forEach((resultFn) =>
			expect(() => {
				resultFn();
			}).toThrow()
		);
	});

	it('should throw with the message provided as second argument if present', () => {
		const input = undefined;

		expect(() => {
			assertString(input, 'test message');
		}).toThrow('test message');
	});

	it('should throw with the default message if not message is provided as second argument', () => {
		const input = undefined;

		expect(() => {
			assertString(input);
		}).toThrow(`${input} is not a string`);
	});
});

describe('assertNumber', () => {
	it('should not throw if provided with a number', () => {
		const inputs = [-1, 0, 1];

		const resultsFn = inputs.map((input) => () => {
			assertNumber(input);
		});
		resultsFn.forEach((resultFn) =>
			expect(() => {
				resultFn();
			}).not.toThrow()
		);
	});
	it('should throw if not provided with a number', () => {
		const inputs = [
			'0',
			'1',
			true,
			false,
			{},
			[],
			[1],
			NaN,
			null,
			undefined,
		];

		const resultsFn = inputs.map((input) => () => {
			assertNumber(input);
		});

		resultsFn.forEach((resultFn) =>
			expect(() => {
				resultFn();
			}).toThrow()
		);
	});

	it('should throw with the message provided as second argument if present', () => {
		const input = undefined;

		expect(() => {
			assertNumber(input, 'test message');
		}).toThrow('test message');
	});

	it('should throw with the default message if not message is provided as second argument', () => {
		const input = undefined;

		expect(() => {
			assertNumber(input);
		}).toThrow(`${input} is not a number`);
	});
});

describe('assertBoolean', () => {
	it('should not throw if provided with a boolean', () => {
		const inputs = [true, false];

		const resultsFn = inputs.map((input) => () => {
			assertBoolean(input);
		});
		resultsFn.forEach((resultFn) =>
			expect(() => {
				resultFn();
			}).not.toThrow()
		);
	});
	it('should throw if not provided with a boolean', () => {
		const inputs = ['test', 0, 1, {}, [], NaN, null, undefined];

		const resultsFn = inputs.map((input) => () => {
			assertBoolean(input);
		});

		resultsFn.forEach((resultFn) =>
			expect(() => {
				resultFn();
			}).toThrow()
		);
	});

	it('should throw with the message provided as second argument if present', () => {
		const input = undefined;

		expect(() => {
			assertBoolean(input, 'test message');
		}).toThrow('test message');
	});

	it('should throw with the default message if not message is provided as second argument', () => {
		const input = undefined;

		expect(() => {
			assertBoolean(input);
		}).toThrow(`${input} is not a boolean`);
	});
});

describe('assertArray', () => {
	it('should not throw if provided with a string', () => {
		const input: unknown[] = [];

		expect(() => {
			assertArray(input);
		}).not.toThrow();
	});
	it('should throw if not provided with a string', () => {
		const inputs = [true, false, 'test', 0, 1, {}, NaN, null, undefined];

		const resultsFn = inputs.map((input) => () => {
			assertArray(input);
		});

		resultsFn.forEach((resultFn) =>
			expect(() => {
				resultFn();
			}).toThrow()
		);
	});

	it('should throw with the message provided as second argument if present', () => {
		const input = undefined;

		expect(() => {
			assertArray(input, 'test message');
		}).toThrow('test message');
	});

	it('should throw with the default message if not message is provided as second argument', () => {
		const input = undefined;

		expect(() => {
			assertArray(input);
		}).toThrow(`${input} is not an array`);
	});
});

describe('assertObject', () => {
	it('should not throw if provided with an object', () => {
		const inputs = [{}, new Git()];

		const resultsFn = inputs.map((input) => () => {
			assertObject(input);
		});
		resultsFn.forEach((resultFn) =>
			expect(() => {
				resultFn();
			}).not.toThrow()
		);
	});
	it.skip('should throw if not provided with an object', () => {
		const inputs = [true, false, 'test', 0, 1, [], NaN, null, undefined];

		const resultsFn = inputs.map((input) => () => {
			assertObject(input);
		});

		resultsFn.forEach((resultFn) =>
			expect(() => {
				resultFn();
			}).toThrow()
		);
	});

	it('should throw with the message provided as second argument if present', () => {
		const input = undefined;

		expect(() => {
			assertObject(input, 'test message');
		}).toThrow('test message');
	});

	it('should throw with the default message if not message is provided as second argument', () => {
		const input = undefined;

		expect(() => {
			assertObject(input);
		}).toThrow(`${input} is not an object`);
	});
});
