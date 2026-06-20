import { retryQueue } from './retry';

test('retry success', async () => {
  const mock = jest.fn().mockResolvedValue('OK');

  const result = await retryQueue(mock);

  expect(result).toBe('OK');
});
