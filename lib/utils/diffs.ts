const diffsToKeyValuePairs = (diffs: string[]): diffsToKeyValue[] => diffs.map((diff) => {
  const [key, value] = diff.split(': ');
  let parsedKey = '';
  const keyMatch = key.match(/\w+/);
  if (keyMatch) {
    parsedKey = keyMatch[0];
  } else {
    throw 'couldn\'t find key while parsing diffs';
  }

  return { key: parsedKey, value };
});
interface diffsToKeyValue {
  key: string;
  value: string;
}
const findValuesInObject = async (diffs: diffsToKeyValue[], obj: unknown) => diffs.map((diff) => {});

export { diffsToKeyValuePairs };
