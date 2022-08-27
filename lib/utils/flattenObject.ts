import { checkIsObject, hasOwnProperty } from './validations/basicTypeValidations';

type Map = { [key:string]: unknown };
const getObjectPaths = (obj:unknown, prefix = ''): object => {
  if (!checkIsObject(obj)) return {};
  return Object.keys(obj).reduce((acc: Map, curr) => {
    const pre = prefix.length ? `${prefix}.` : '';
    if (hasOwnProperty(obj, curr) && checkIsObject(obj[curr])) {
      Object.assign(acc, getObjectPaths(obj[curr], pre + curr));
    } else if (hasOwnProperty(obj, curr)) {
      acc[pre + curr] = obj[curr];
    }
    return acc;
  }, {});
};

export default getObjectPaths;
