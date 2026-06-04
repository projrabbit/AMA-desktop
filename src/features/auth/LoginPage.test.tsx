import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

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

    await userEvent.type(screen.getByLabelText('User được cấp'), 'employee@example.com');
    await userEvent.type(screen.getByLabelText('Mật khẩu'), 'Employee@2026');
    await userEvent.click(screen.getByRole('button', { name: 'Đăng nhập' }));

    expect(
      await screen.findByText('Tài khoản này không có quyền truy cập Dashboard.'),
    ).toBeInTheDocument();
  });
});
