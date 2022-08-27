import { z } from 'zod';

type Map = { [key:string]: unknown };
const getObjectPaths = (obj:unknown, prefix = ''): object => {
  const checkedObj = z.object({}).passthrough().safeParse(obj);
  if (!checkedObj.success) return {};
  return Object.keys(checkedObj.data).reduce((acc: Map, curr) => {
    const pre = prefix.length ? `${prefix}.` : '';
    const parsedObjWithChildren = z.object({ [curr]: z.object({}) }).passthrough().safeParse(obj);
    const parsedObj = z.object({ [curr]: z.unknown() }).passthrough().safeParse(obj);
    if (parsedObjWithChildren.success) {
      Object.assign(acc, getObjectPaths(parsedObjWithChildren.data[curr], pre + curr));
    } else if (parsedObj.success) {
      acc[pre + curr] = parsedObj.data[curr];
    }
    return acc;
  }, {});
};

export default getObjectPaths;
