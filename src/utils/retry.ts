type RetryOptions = {
  retries?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  factor?: number;
  sleep?: (delayMs: number) => Promise<void>;
};

const defaultSleep = (delayMs: number) =>
  new Promise<void>(resolve => setTimeout(resolve, delayMs));

export async function retryQueue<T>(
  fn: () => Promise<T>,
  {
    retries = 5,
    initialDelayMs = 1000,
    maxDelayMs = 30000,
    factor = 2,
    sleep = defaultSleep,
  }: RetryOptions = {},
) {
  let delay = initialDelayMs;
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === retries) {
        break;
      }

      await sleep(delay);
      delay = Math.min(delay * factor, maxDelayMs);
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('Failed after retry');
}
