const standby = async (duration: number) => new Promise((resolve) => {
  setTimeout(() => {
    resolve(true);
  }, duration);
});
export default standby;
