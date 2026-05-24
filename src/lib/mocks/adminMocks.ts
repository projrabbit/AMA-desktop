import type { BuildingItem, DepartmentItem, DeviceItem, FloorItem, GeofenceItem, ShiftItem } from '@/types/api';

export const mockFloors: FloorItem[] = [
  {
    floor_id: 3,
    building_id: 1,
    floor_number: 3,
    floor_name: 'Tầng 3',
    altitude_min: 15,
    altitude_max: 22,
  },
];

export const mockBuildings: BuildingItem[] = [
  {
    building_id: 1,
    name: 'Tòa nhà AMA',
    address: 'Quận 1, TP. Hồ Chí Minh',
    center_lat: 10.776889,
    center_lng: 106.700981,
    total_floors: 12,
    arcgis_layer_id: 'ama-building-layer',
    is_active: true,
    floors: mockFloors,
  },
];

export const mockGeofences: GeofenceItem[] = [
  {
    geofence_id: 1,
    floor_id: 3,
    name: 'Vùng chấm công tầng 3',
    center_lat: 10.776889,
    center_lng: 106.700981,
    radius_meters: 45,
    altitude_min: 15,
    altitude_max: 22,
    allow_checkin: true,
    allow_checkout: true,
    is_active: true,
  },
];

export const mockDepartments: DepartmentItem[] = [
  {
    department_id: 1,
    name: 'Ban điều hành',
    description: 'Khối quản lý',
    manager_id: 4,
    employee_count: 8,
  },
  {
    department_id: 2,
    name: 'Nhân sự',
    description: 'Phòng nhân sự',
    manager_id: 3,
    employee_count: 12,
  },
  {
    department_id: 3,
    name: 'Kỹ thuật',
    description: 'Khối kỹ thuật',
    manager_id: null,
    employee_count: 54,
  },
];

export const mockShifts: ShiftItem[] = [
  {
    shift_id: 1,
    employee_id: 2,
    name: 'Ca hành chính',
    start_time: '08:00:00',
    end_time: '17:00:00',
    late_tolerance_min: 10,
    early_leave_min: 10,
    apply_to_weekends: false,
  },
];

export const mockDevices: DeviceItem[] = [
  {
    device_id: 1,
    employee_id: 2,
    device_fingerprint: 'ama-device-fingerprint-001',
    platform: 'android',
    model: 'Pixel 8',
    os_version: 'Android 15',
    app_version: '1.0.0',
    is_trusted: true,
    registered_at: '2026-05-24T07:30:00Z',
  },
];
