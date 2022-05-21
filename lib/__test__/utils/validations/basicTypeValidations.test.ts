import {
	checkIsString,
	checkIsArray,
	checkIsBoolean,
	checkIsNumber,
	checkIsObject,
} from '../../../utils/validations/basicTypeValidations';
import { describe, expect, it } from 'vitest';
import { Git } from '../../../core';

describe('checkIsString', () => {
	it('should return true if provided with a string', () => {
		const input = 'test';
		const result = checkIsString(input);
		expect(result).toBe(true);
	});
	it('should return false if not provided with a string', () => {
		const inputs = [true, false, 0, 1, {}, [], NaN, null, undefined];
		const results = inputs.map((input) => checkIsString(input));
		results.forEach((result) => expect(result).toBe(false));
	});
});

describe('checkIsNumber', () => {
	it('should return true if provided with a number', () => {
		const inputs = [-1, 0, 1];
		const results = inputs.map((input) => checkIsNumber(input));
		results.forEach((result) => expect(result).toBe(true));
	});
	it('should return false if not provided with a number', () => {
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
		const results = inputs.map((input) => checkIsNumber(input));
		results.forEach((result) => expect(result).toBe(false));
	});
});

describe('checkIsBoolean', () => {
	it('should return true if provided with a boolean', () => {
		const input = true;
		const result = checkIsBoolean(input);
		expect(result).toBe(true);
	});
	it('should return false if not provided with a boolean', () => {
		const inputs = ['test', 0, 1, {}, [], NaN, null, undefined];
		const results = inputs.map((input) => checkIsBoolean(input));
		results.forEach((result) => expect(result).toBe(false));
	});
});

describe('checkIsArray', () => {
	it('should return true if provided with an array', () => {
		const input: unknown[] = [];
		const result = checkIsArray(input);
		expect(result).toBe(true);
	});
	it('should return false if not provided with an array', () => {
		const inputs = [true, false, 'test', 0, 1, {}, NaN, null, undefined];
		const results = inputs.map((input) => checkIsArray(input));
		results.forEach((result) => expect(result).toBe(false));
	});
});

describe('checkIsObject', () => {
	it('should return true if provided with an object', () => {
		const input = {};
		const input2 = new Git();

		const result = checkIsObject(input);
		const result2 = checkIsObject(input2);

		expect(result).toBe(true);
		expect(result2).toBe(true);
	});
	it.skip('should return false if not provided with a object', () => {
		const inputs = [true, false, 'test', 0, 1, [], NaN, null, undefined];
		const results = inputs.map((input) => checkIsObject(input));
		results.forEach((result) => expect(result).toBe(false));
	});
});
