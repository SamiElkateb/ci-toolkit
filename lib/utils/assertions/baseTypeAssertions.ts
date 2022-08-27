import {
  hasOwnProperty,
} from '../validations/basicTypeValidations';

type AssertExists = (val: unknown, message?: string) => asserts val;
const assertExists: AssertExists = (
  val: unknown,
  message?: string,
): asserts val => {
  if (typeof val === 'undefined') throw new Error(message || 'A needed value does not exist');
};

type assertProperty<X extends {}, Y extends PropertyKey> = (
  obj: X,
  prop: Y,
  message?: string
) => asserts obj is X & Record<Y, unknown>;

function assertProperty<X extends {}, Y extends PropertyKey>(
  obj: X,
  prop: Y,
  message?: string,
): asserts obj is X & Record<Y, unknown> {
  if (!hasOwnProperty(obj, prop)) { throw message || `${obj} does not have property ${String(prop)}`; }
}

export {
  assertExists,
  assertProperty,
};
