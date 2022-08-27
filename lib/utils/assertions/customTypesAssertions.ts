import { pathValidationSchema } from '../../models/others';
import {
  checkPathExists,
} from '../validations/customTypeValidation';

type AssertPathExists = (val: unknown, message?: string) => asserts val;
const assertPathExists: AssertPathExists = (
  val: unknown,
  message?: string,
): asserts val => {
  const parsedPath = pathValidationSchema.parse(val);
  if (!checkPathExists(parsedPath)) throw message || `path ${parsedPath} does not exist`;
};

export {
  assertPathExists,
};
