type pollParams = {
    fn: () => Promise<unknown>;
    validate?: (value: unknown) => boolean;
    interval?: number;
    timeout?: number;
    timeoutMessage?: string;
    pollingLogFn?: () => void;
};

const poll = async (params: pollParams) => {
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
        reject: (reason?: any) => void
    ) => {
        if (pollingLogFn) pollingLogFn();
        const result = await fn();
        attempts++;
        if (validate && validate(result)) return resolve(result);
        if (!validate && result) return resolve(result);
        if (timeout && interval * attempts > timeout && timeoutMessage) {
            return reject(new Error(timeoutMessage));
        }
        if (timeout && interval * attempts > timeout) {
            return reject(new Error('Timeout exceeded'));
        }
        setTimeout(executePolling, interval, resolve, reject);
    };
    return new Promise(executePolling);
};
export { poll };
