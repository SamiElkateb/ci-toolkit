type PollParams = {
  fn: () => Promise<unknown>;
  validate?: (value: unknown) => boolean;
  interval?: number;
  timeout?: number;
  timeoutMessage?: string;
  pollingLogFn?: () => void;
};

const poll = async (params: PollParams) => {
  const {
    fn,
    validate,
    timeout,
    interval = 60000,
    timeoutMessage,
    pollingLogFn,
  } = params;
  let attempts = 0;

  const executePolling = async (
    resolve: (value: unknown) => void,
    reject: (reason?: Error) => void,
  ) => {
    if (pollingLogFn) pollingLogFn();
    const result = await fn();
    attempts += 1;
    if (validate && validate(result)) {
      resolve(result);
      return;
    }
    if (!validate && result) {
      resolve(result);
      return;
    }
    if (timeout && interval * attempts > timeout && timeoutMessage) {
      reject(new Error(timeoutMessage));
      return;
    }
    if (timeout && interval * attempts > timeout) {
      reject(new Error('Timeout exceeded'));
      return;
    }
    setTimeout(executePolling, interval, resolve, reject);
  };
  return new Promise(executePolling);
};
export default poll;
