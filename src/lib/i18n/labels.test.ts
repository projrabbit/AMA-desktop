import { describe, expect, it } from 'vitest';

import { getAuditActionLabel, getDevicePlatformLabel, getRoleLabel } from './labels';

describe('Vietnamese labels', () => {
  it('maps supported roles', () => {
    expect(getRoleLabel('admin')).toBe('Quản trị viên');
    expect(getRoleLabel('hr')).toBe('Nhân sự');
    expect(getRoleLabel('manager')).toBe('Quản lý');
    expect(getRoleLabel('employee')).toBe('Nhân viên');
  });

  it('maps device platforms and audit actions', () => {
    expect(getDevicePlatformLabel('android')).toBe('Android');
    expect(getAuditActionLabel('approve')).toBe('Phê duyệt');
  });

  it('uses a safe fallback for unknown values', () => {
    expect(getRoleLabel('owner')).toBe('Không xác định');
  });
});
