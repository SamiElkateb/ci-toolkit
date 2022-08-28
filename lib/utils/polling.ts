import standby from './standby';

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

  const executePolling = async (): Promise<unknown> => {
    if (pollingLogFn) pollingLogFn();
    const result = await fn();
    attempts += 1;
    if (validate && validate(result)) {
      return result;
    }
    if (!validate && result) {
      return result;
    }
    if (timeout && interval * attempts > timeout && timeoutMessage) {
      throw new Error(timeoutMessage);
    }
    if (timeout && interval * attempts > timeout) {
      throw new Error('Timeout exceeded');
    }
    await standby(interval);
    return executePolling();
  };
  return executePolling();
};
export default poll;
