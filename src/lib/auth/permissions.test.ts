import { describe, expect, it } from 'vitest';

import { canAccessRoute, canPerform, dashboardRoles } from './permissions';

describe('permissions', () => {
  it('allows only management roles into the dashboard', () => {
    expect(dashboardRoles).toEqual(['manager', 'hr', 'admin']);
    expect(canAccessRoute('overview', 'manager')).toBe(true);
    expect(canAccessRoute('overview', 'employee')).toBe(false);
  });

  it('restricts admin-only areas', () => {
    expect(canAccessRoute('auditLogs', 'admin')).toBe(true);
    expect(canAccessRoute('auditLogs', 'hr')).toBe(false);
    expect(canPerform('device:trust', 'admin')).toBe(true);
    expect(canPerform('device:trust', 'hr')).toBe(false);
  });

  it('allows HR and admin operational actions', () => {
    expect(canAccessRoute('map', 'hr')).toBe(true);
    expect(canPerform('report:export', 'hr')).toBe(true);
    expect(canPerform('face:delete', 'hr')).toBe(false);
  });
});
