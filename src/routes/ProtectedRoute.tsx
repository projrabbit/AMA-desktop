import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

import { ForbiddenState } from '@/components/page-states/PageState';
import { useSession } from '@/lib/auth/session';
import { canAccessRoute, isDashboardRole, type DashboardRouteKey } from '@/lib/auth/permissions';

interface ProtectedRouteProps {
  routeKey: DashboardRouteKey;
  children: ReactNode;
}

export function ProtectedRoute({ routeKey, children }: ProtectedRouteProps) {
  const { role } = useSession();

  if (!role) {
    return <Navigate to="/login" replace />;
  }

  if (!isDashboardRole(role) || !canAccessRoute(routeKey, role)) {
    return <ForbiddenState />;
  }

  return children;
}
