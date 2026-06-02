import { NavLink } from 'react-router-dom';

import { useSession } from '@/lib/auth/session';
import { canAccessRoute } from '@/lib/auth/permissions';

const items = [
  { to: '/admin', label: 'Tổng quan', routeKey: 'admin' as const, end: true },
  { to: '/admin/employees', label: 'Nhân viên', routeKey: 'adminEmployees' as const, end: false },
  { to: '/admin/departments', label: 'Phòng ban', routeKey: 'adminDepartments' as const, end: false },
  { to: '/admin/shifts', label: 'Ca làm việc', routeKey: 'adminShifts' as const, end: false },
  { to: '/admin/devices', label: 'Thiết bị', routeKey: 'adminDevices' as const, end: false },
];

export function AdminNav() {
  const { role } = useSession();

  return (
    <nav className="admin-nav" aria-label="Điều hướng quản trị">
      {items
        .filter((item) => canAccessRoute(item.routeKey, role))
        .map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end}>
            {item.label}
          </NavLink>
        ))}
    </nav>
  );
}
