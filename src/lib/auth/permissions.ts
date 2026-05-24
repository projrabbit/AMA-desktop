import type { AccountRole } from '@/types/api';

export const dashboardRoles = ['manager', 'hr', 'admin'] as const satisfies AccountRole[];

export type DashboardRouteKey =
  | 'overview'
  | 'map'
  | 'geofences'
  | 'buildings'
  | 'reports'
  | 'exceptions'
  | 'admin'
  | 'adminEmployees'
  | 'adminDepartments'
  | 'adminShifts'
  | 'adminDevices'
  | 'auditLogs';

export type PermissionAction =
  | 'dashboard:view'
  | 'report:export'
  | 'face:write'
  | 'face:delete'
  | 'geofence:write'
  | 'building:write'
  | 'device:trust'
  | 'audit:view';

const routeRoles: Record<DashboardRouteKey, AccountRole[]> = {
  overview: ['manager', 'hr', 'admin'],
  map: ['hr', 'admin'],
  geofences: ['hr', 'admin'],
  buildings: ['hr', 'admin'],
  reports: ['manager', 'hr', 'admin'],
  exceptions: ['hr', 'admin'],
  admin: ['hr', 'admin'],
  adminEmployees: ['hr', 'admin'],
  adminDepartments: ['hr', 'admin'],
  adminShifts: ['hr', 'admin'],
  adminDevices: ['admin'],
  auditLogs: ['admin'],
};

const actionRoles: Record<PermissionAction, AccountRole[]> = {
  'dashboard:view': ['manager', 'hr', 'admin'],
  'report:export': ['hr', 'admin'],
  'face:write': ['hr', 'admin'],
  'face:delete': ['admin'],
  'geofence:write': ['hr', 'admin'],
  'building:write': ['admin'],
  'device:trust': ['admin'],
  'audit:view': ['admin'],
};

export function isDashboardRole(role: AccountRole | undefined | null): role is (typeof dashboardRoles)[number] {
  return role !== undefined && role !== null && dashboardRoles.includes(role as (typeof dashboardRoles)[number]);
}

export function canAccessRoute(route: DashboardRouteKey, role: AccountRole | undefined | null): boolean {
  return role !== undefined && role !== null && routeRoles[route].includes(role);
}

export function canPerform(action: PermissionAction, role: AccountRole | undefined | null): boolean {
  return role !== undefined && role !== null && actionRoles[action].includes(role);
}
