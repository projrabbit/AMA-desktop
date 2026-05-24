import type { AccountInfo, EmployeeInfo, LoginData, MeData, RefreshData } from '@/types/api';

export const mockAccounts: Record<string, AccountInfo> = {
  admin: {
    account_id: 1001,
    username: 'linh.tran@example.com',
    role: 'admin',
    is_active: true,
    last_login_at: '2026-05-24T08:00:00Z',
  },
  hr: {
    account_id: 1003,
    username: 'hoa.pham@example.com',
    role: 'hr',
    is_active: true,
    last_login_at: '2026-05-24T08:05:00Z',
  },
  manager: {
    account_id: 1004,
    username: 'quang.le@example.com',
    role: 'manager',
    is_active: true,
    last_login_at: '2026-05-24T08:10:00Z',
  },
  employee: {
    account_id: 1002,
    username: 'minh.nguyen@example.com',
    role: 'employee',
    is_active: true,
    last_login_at: '2026-05-24T08:15:00Z',
  },
};

export const mockEmployees: Record<string, EmployeeInfo> = {
  admin: {
    employee_id: 1,
    full_name: 'Linh Trần',
    email: 'linh.tran@example.com',
    phone: '0901001001',
    position: 'Quản trị hệ thống',
    department_id: 1,
    status: 'active',
  },
  hr: {
    employee_id: 3,
    full_name: 'Hoa Phạm',
    email: 'hoa.pham@example.com',
    phone: '0901001003',
    position: 'Chuyên viên nhân sự',
    department_id: 2,
    status: 'active',
  },
  manager: {
    employee_id: 4,
    full_name: 'Quang Lê',
    email: 'quang.le@example.com',
    phone: '0901001004',
    position: 'Giám đốc điều hành',
    department_id: 1,
    status: 'active',
  },
  employee: {
    employee_id: 2,
    full_name: 'Minh Nguyễn',
    email: 'minh.nguyen@example.com',
    phone: '0901001002',
    position: 'Nhân viên',
    department_id: 3,
    status: 'active',
  },
};

export const mockLoginData: Record<string, LoginData> = Object.fromEntries(
  Object.entries(mockAccounts).map(([key, account]) => [
    key,
    {
      access_token: `mock-access-token-${key}`,
      refresh_token: `mock-refresh-token-${key}`,
      token_type: 'bearer',
      expires_in: 3600,
      account,
      employee: mockEmployees[key],
    },
  ]),
) as Record<string, LoginData>;

export const mockMeData: Record<string, MeData> = Object.fromEntries(
  Object.entries(mockAccounts).map(([key, account]) => [
    key,
    {
      account,
      employee: mockEmployees[key],
    },
  ]),
) as Record<string, MeData>;

export const mockRefreshData: RefreshData = {
  access_token: 'mock-refreshed-access-token',
  token_type: 'bearer',
  expires_in: 3600,
};
