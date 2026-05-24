import type { DashboardSummaryData, RealtimeLocationItem } from '@/types/api';

export const mockDashboardSummary: DashboardSummaryData = {
  date: '2026-05-24',
  total_employees: 128,
  checked_in_today: 96,
  on_time_count: 84,
  late_count: 9,
  early_leave_count: 3,
  absent_count: 12,
  fraud_alerts_today: 4,
  on_time_rate: 87.5,
  active_locations: [
    {
      employee_id: 2,
      full_name: 'Minh Nguyễn',
      department_name: 'Kỹ thuật',
      latitude: 10.776889,
      longitude: 106.700981,
      altitude: 18.5,
      building_id: 1,
      building_name: 'Tòa nhà AMA',
      floor_id: 3,
      floor_name: 'Tầng 3',
      last_checkin_at: '2026-05-24T08:01:00Z',
    },
  ],
};

export const mockRealtimeLocations: RealtimeLocationItem[] = [
  {
    ...mockDashboardSummary.active_locations[0],
    gps_accuracy: 6.5,
    checked_in_at: '2026-05-24T08:01:00Z',
  },
];
