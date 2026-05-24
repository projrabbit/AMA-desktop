import { describe, expect, it } from 'vitest';

import { getVietnameseErrorMessage } from './errorMessages';

describe('Vietnamese backend error messages', () => {
  it('maps known backend codes', () => {
    expect(getVietnameseErrorMessage('INVALID_CREDENTIALS')).toBe(
      'Email hoặc mật khẩu không đúng.',
    );
    expect(getVietnameseErrorMessage('FORBIDDEN')).toBe(
      'Bạn không có quyền thực hiện thao tác này.',
    );
  });

  it('includes unknown code for debugging', () => {
    expect(getVietnameseErrorMessage('NEW_BACKEND_CODE')).toBe(
      'Đã xảy ra lỗi. Mã lỗi: NEW_BACKEND_CODE.',
    );
  });
});
