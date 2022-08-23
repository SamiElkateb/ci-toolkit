import { checkIsObject, hasOwnProperty } from './validations/basicTypeValidations';

const getObjectPaths = (obj:unknown, prefix = '') => {
  if (!checkIsObject(obj)) return obj;
  return Object.keys(obj).reduce((acc: any, curr) => {
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
