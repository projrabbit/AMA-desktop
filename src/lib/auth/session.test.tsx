import { act, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { createMemoryTokenStorage } from '@/lib/api/tokenStorage';
import type { ApiSuccess, MeData } from '@/types/api';
import { SessionProvider, useSession } from './session';

function RoleProbe() {
  const { role } = useSession();
  return <div>Vai trò hiện tại: {role ?? 'none'}</div>;
}

function hrUser(): ApiSuccess<MeData> {
  return {
    success: true,
    data: {
      account: { account_id: 1, username: 'hr@example.com', role: 'hr', is_active: true },
      employee: {
        employee_id: 1,
        full_name: 'Nhân sự',
        email: 'hr@example.com',
        department_id: 1,
        status: 'active',
      },
    },
  };
}

describe('SessionProvider', () => {
  it('bootstraps the current management user when tokens exist', async () => {
    const tokenStorage = createMemoryTokenStorage({ accessToken: 'access', refreshToken: 'refresh' });
    const loadCurrentUser = vi.fn().mockResolvedValue(hrUser());

    render(
      <SessionProvider tokenStorage={tokenStorage} loadCurrentUser={loadCurrentUser}>
        <RoleProbe />
      </SessionProvider>,
    );

    expect(await screen.findByText('Vai trò hiện tại: hr')).toBeInTheDocument();
  });

  it('clears in-memory session when token storage is cleared', async () => {
    const tokenStorage = createMemoryTokenStorage({ accessToken: 'access', refreshToken: 'refresh' });

    render(
      <SessionProvider initialRole="admin" tokenStorage={tokenStorage}>
        <RoleProbe />
      </SessionProvider>,
    );

    expect(screen.getByText('Vai trò hiện tại: admin')).toBeInTheDocument();

    await act(async () => {
      tokenStorage.clearTokens();
    });

    expect(screen.getByText('Vai trò hiện tại: none')).toBeInTheDocument();
  });
});
