import fs from 'fs';

const checkPathExists = (path: string) => {
  try {
    if (fs.existsSync(path)) return true;
  } catch (err) {
    console.error(err);
  }
  return false;
};
export {
  checkPathExists,
};
