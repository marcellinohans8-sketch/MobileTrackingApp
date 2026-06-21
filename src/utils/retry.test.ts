import { retryQueue } from './retry';

test('retry success without delay when first attempt passes', async () => {
  const sleep = jest.fn().mockResolvedValue(undefined);
  const mock = jest.fn().mockResolvedValue('OK');

  const result = await retryQueue(mock, { sleep });

  expect(result).toBe('OK');
  expect(mock).toHaveBeenCalledTimes(1);
  expect(sleep).not.toHaveBeenCalled();
});

test('retry uses exponential backoff before succeeding', async () => {
  const sleep = jest.fn().mockResolvedValue(undefined);
  const mock = jest
    .fn()
    .mockRejectedValueOnce(new Error('offline'))
    .mockRejectedValueOnce(new Error('still offline'))
    .mockResolvedValue('OK');

  const result = await retryQueue(mock, {
    retries: 3,
    initialDelayMs: 100,
    sleep,
  });

  expect(result).toBe('OK');
  expect(mock).toHaveBeenCalledTimes(3);
  expect(sleep).toHaveBeenNthCalledWith(1, 100);
  expect(sleep).toHaveBeenNthCalledWith(2, 200);
});

test('retry throws last error after max retries', async () => {
  const sleep = jest.fn().mockResolvedValue(undefined);
  const error = new Error('server unavailable');
  const mock = jest.fn().mockRejectedValue(error);

  await expect(
    retryQueue(mock, { retries: 2, initialDelayMs: 100, sleep }),
  ).rejects.toThrow('server unavailable');

  expect(mock).toHaveBeenCalledTimes(3);
  expect(sleep).toHaveBeenCalledTimes(2);
});
