function snakeToCamelCase<T extends string>(val: T): SnakeToCamelCase<T> {
  return val.toLowerCase().replace(/(_\w)/g, (group) => group.toUpperCase().replace('_', '')) as unknown as SnakeToCamelCase<T>;
}
export default snakeToCamelCase;
