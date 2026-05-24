import { createBrowserRouter, Navigate } from 'react-router-dom';

import { NotFoundState } from '@/components/page-states/PageState';
import { AdminDepartmentsPage } from '@/features/admin/AdminDepartmentsPage';
import { AdminDevicesPage } from '@/features/admin/AdminDevicesPage';
import { AdminEmployeesPage } from '@/features/admin/AdminEmployeesPage';
import { AdminPage } from '@/features/admin/AdminPage';
import { AdminShiftsPage } from '@/features/admin/AdminShiftsPage';
import { AuditLogsPage } from '@/features/audit/AuditLogsPage';
import { LoginPage } from '@/features/auth/LoginPage';
import { ExceptionsPage } from '@/features/exceptions/ExceptionsPage';
import { BuildingsPage } from '@/features/geofences/BuildingsPage';
import { GeofencePage } from '@/features/geofences/GeofencePage';
import { MapPage } from '@/features/map/MapPage';
import { OverviewPage } from '@/features/overview/OverviewPage';
import { ReportsPage } from '@/features/reports/ReportsPage';
import { DashboardLayout } from './DashboardLayout';
import { ProtectedRoute } from './ProtectedRoute';

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/overview" replace /> },
  { path: '/login', element: <LoginPage /> },
  {
    element: <DashboardLayout />,
    children: [
      {
        path: '/overview',
        element: (
          <ProtectedRoute routeKey="overview">
            <OverviewPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/map',
        element: (
          <ProtectedRoute routeKey="map">
            <MapPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/geofences',
        element: (
          <ProtectedRoute routeKey="geofences">
            <GeofencePage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/geofences/buildings',
        element: (
          <ProtectedRoute routeKey="buildings">
            <BuildingsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/reports',
        element: (
          <ProtectedRoute routeKey="reports">
            <ReportsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/exceptions',
        element: (
          <ProtectedRoute routeKey="exceptions">
            <ExceptionsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin',
        element: (
          <ProtectedRoute routeKey="admin">
            <AdminPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/employees',
        element: (
          <ProtectedRoute routeKey="adminEmployees">
            <AdminEmployeesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/departments',
        element: (
          <ProtectedRoute routeKey="adminDepartments">
            <AdminDepartmentsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/shifts',
        element: (
          <ProtectedRoute routeKey="adminShifts">
            <AdminShiftsPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin/devices',
        element: (
          <ProtectedRoute routeKey="adminDevices">
            <AdminDevicesPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/audit-logs',
        element: (
          <ProtectedRoute routeKey="auditLogs">
            <AuditLogsPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  { path: '*', element: <NotFoundState /> },
]);
