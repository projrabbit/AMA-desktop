import type { AttendanceReportData, AuditLogItem } from '@/types/api';

export const mockAttendanceReport: AttendanceReportData = {
  range: { from: '2026-05-01', to: '2026-05-24' },
  summary: {
    work_days: 18,
    total_hours: 144,
    late_count: 9,
    early_leave_count: 3,
    error_count: 4,
  },
  employees: [
    {
      employee_id: 2,
      full_name: 'Minh Nguyễn',
      department_name: 'Kỹ thuật',
      work_days: 18,
      total_hours: 144,
      late_count: 1,
      early_leave_count: 0,
    },
  ],
  details: [
    {
      employee_id: 2,
      date: '2026-05-24',
      checkin_at: '2026-05-24T08:01:00Z',
      checkout_at: null,
      status: 'approved',
      total_hours: 0,
    },
  ],
};

export const mockAuditLogs: AuditLogItem[] = [
  {
    log_id: 1,
    account_id: 1001,
    action_type: 'login',
    target_entity: 'account',
    target_id: 1001,
    payload: { username: 'linh.tran@example.com' },
    ip_address: '127.0.0.1',
    created_at: '2026-05-24T08:00:00Z',
  },
];
