type AssertExists = (val: unknown, message?: string) => asserts val;
const assertExists: AssertExists = (
  val: unknown,
  message?: string,
): asserts val => {
  if (typeof val === 'undefined') throw new Error(message || 'A needed value does not exist');
};

export default assertExists;
