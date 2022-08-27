const fs = require('fs');

const checkIsString = (val: unknown): val is string => typeof val === 'string';

const checkIsObject = (val: unknown): val is object => typeof val === 'object' && val !== null;

const checkIsStrictObject = (val: unknown): val is object => typeof val === 'object' && val !== null && !Array.isArray(val);

const checkIsArray = (val: unknown): val is Array<unknown> => Array.isArray(val);

function hasOwnProperty<X extends {}, Y extends PropertyKey>(
  obj: X,
  prop: Y,
): obj is X & Record<Y, unknown> {
  return obj.hasOwnProperty(prop);
}

export {
  checkIsString,
  checkIsArray,
  checkIsObject,
  hasOwnProperty,
  checkIsStrictObject,
};
