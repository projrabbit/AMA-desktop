import { describe, expect, it } from 'vitest';

import { withFallback } from './withFallback';

describe('withFallback', () => {
  it('trả về dữ liệu API khi gọi thành công', async () => {
    const result = await withFallback(async () => ({ success: true as const, data: [1, 2, 3] }), []);
    expect(result).toEqual({ data: [1, 2, 3], usedMock: false });
  });

  it('fallback sang mock khi gọi API thất bại', async () => {
    const mock = [{ id: 9 }];
    const result = await withFallback(async () => {
      throw new Error('offline');
    }, mock);
    expect(result).toEqual({ data: mock, usedMock: true });
  });
});
