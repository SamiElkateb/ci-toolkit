function SnakeToCamelCaseArray<S extends string>(
  val: S[],
): SnakeToCamelCase<S>[] {
  return val.map((value) => {
    const lowerCaseKey = value.toLowerCase();
    return lowerCaseKey.replace(/(_\w)/g, (group) => group.toUpperCase().replace('_', '')) as unknown as SnakeToCamelCase<S>;
  });
}
function snakeToCamelCaseWord<T extends string>(val: T): SnakeToCamelCase<T> {
  return val.toLowerCase().replace(/(_\w)/g, (group) => group.toUpperCase().replace('_', '')) as unknown as SnakeToCamelCase<T>;
}
export { snakeToCamelCaseWord, SnakeToCamelCaseArray };
