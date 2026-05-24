import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { SessionProvider } from '@/lib/auth/session';
import { ProtectedRoute } from './ProtectedRoute';

function renderProtected(role: 'employee' | 'hr' | 'manager' | 'admin' | null) {
  render(
    <SessionProvider initialRole={role}>
      <MemoryRouter initialEntries={['/audit-logs']}>
        <Routes>
          <Route
            path="/audit-logs"
            element={
              <ProtectedRoute routeKey="auditLogs">
                <div>Nhật ký hệ thống</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Đăng nhập</div>} />
        </Routes>
      </MemoryRouter>
    </SessionProvider>,
  );
}

describe('ProtectedRoute', () => {
  it('redirects anonymous users to login', () => {
    renderProtected(null);
    expect(screen.getByText('Đăng nhập')).toBeInTheDocument();
  });

  it('shows forbidden state for a management role without route permission', () => {
    renderProtected('hr');
    expect(screen.getByText('Bạn không có quyền truy cập nội dung này.')).toBeInTheDocument();
  });

  it('allows an admin into audit logs', () => {
    renderProtected('admin');
    expect(screen.getByText('Nhật ký hệ thống')).toBeInTheDocument();
  });
});
