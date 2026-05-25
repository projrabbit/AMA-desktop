import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/lib/api/apiErrors';
import { SessionProvider } from '@/lib/auth/session';
import { LoginPage } from './LoginPage';

describe('LoginPage', () => {
  it('shows a Vietnamese no-permission error for employee accounts', async () => {
    render(
      <SessionProvider>
        <MemoryRouter>
          <LoginPage
            login={vi.fn().mockResolvedValue({
              success: true,
              data: {
                access_token: 'a',
                refresh_token: 'r',
                expires_in: 3600,
                account: {
                  account_id: 1,
                  username: 'employee@example.com',
                  role: 'employee',
                  is_active: true,
                },
                employee: {
                  employee_id: 1,
                  full_name: 'Nhân viên',
                  email: 'employee@example.com',
                  department_id: 1,
                  status: 'active',
                },
              },
            })}
          />
        </MemoryRouter>
      </SessionProvider>,
    );

    await userEvent.type(screen.getByLabelText('Email công ty'), 'employee@example.com');
    await userEvent.type(screen.getByLabelText('Mật khẩu'), 'Employee@2026');
    await userEvent.click(screen.getByRole('button', { name: 'Đăng nhập' }));

    expect(
      await screen.findByText('Tài khoản này không có quyền truy cập Dashboard.'),
    ).toBeInTheDocument();
  });

  it('shows a server error instead of invalid credentials for API 500 responses', async () => {
    render(
      <SessionProvider>
        <MemoryRouter>
          <LoginPage
            login={vi.fn().mockRejectedValue(
              new ApiError({
                status: 500,
                code: 'HTTP_ERROR',
                message: 'Internal Server Error',
              }),
            )}
          />
        </MemoryRouter>
      </SessionProvider>,
    );

    await userEvent.type(screen.getByLabelText('Email công ty'), 'linh.tran@example.com');
    await userEvent.type(screen.getByLabelText('Mật khẩu'), 'Admin@2026');
    await userEvent.click(screen.getByRole('button', { name: 'Đăng nhập' }));

    expect(await screen.findByText('Máy chủ đang gặp lỗi. Vui lòng thử lại sau.')).toBeInTheDocument();
  });
});
