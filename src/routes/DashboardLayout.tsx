import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/Button';
import { browserTokenStorage } from '@/lib/api/tokenStorage';
import { useSession } from '@/lib/auth/session';
import { authService } from '@/services/authService';

const navItems = [
  { to: '/overview', label: 'Tổng quan' },
  { to: '/map', label: 'Bản đồ 3D' },
  { to: '/geofences', label: 'Vùng chấm công' },
  { to: '/reports', label: 'Báo cáo' },
  { to: '/exceptions', label: 'Ngoại lệ' },
  { to: '/admin', label: 'Quản trị' },
  { to: '/audit-logs', label: 'Nhật ký' },
];

function pageTitle(pathname: string): string {
  const match = [...navItems].reverse().find((item) => pathname.startsWith(item.to));
  return match?.label ?? 'Dashboard';
}

export function DashboardLayout() {
  const { role, clearSession } = useSession();
  const navigate = useNavigate();
  const location = useLocation();

  async function handleLogout() {
    const tokens = browserTokenStorage.getTokens();
    try {
      await authService.logout(tokens ? { refresh_token: tokens.refreshToken } : undefined);
    } catch {
      // Local logout must still complete when the network is unavailable.
    } finally {
      browserTokenStorage.clearTokens();
      clearSession();
      navigate('/login', { replace: true });
    }
  }

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar" aria-label="Điều hướng Dashboard">
        <div className="dashboard-brand" aria-label="AMA Dashboard">
          <span className="dashboard-brand__mark">AMA</span>
          <span>Attendance Ops</span>
        </div>
        <nav>
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to}>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="dashboard-topbar__title">
            <span className="dashboard-status-pill">Hoạt động</span>
            <h1>{pageTitle(location.pathname)}</h1>
          </div>
          <div className="dashboard-topbar__actions">
            <span className="dashboard-sync-note">Cập nhật mỗi 60s</span>
            <span className="dashboard-role">Vai trò: {role ?? 'Chưa đăng nhập'}</span>
            <Button variant="ghost" onClick={handleLogout}>
              Đăng xuất
            </Button>
          </div>
        </header>
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
