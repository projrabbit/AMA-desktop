import type {
  BuildingItem,
  DepartmentItem,
  DeviceItem,
  EmployeeDetail,
  EmployeeListItem,
  FloorItem,
  GeofenceItem,
  ShiftItem,
} from '@/types/api';

export const mockFloors: FloorItem[] = [
  {
    floor_id: 3,
    building_id: 1,
    floor_number: 3,
    floor_name: 'Tầng 3',
    altitude_min: 15,
    altitude_max: 22,
  },
  {
    floor_id: 4,
    building_id: 1,
    floor_number: 4,
    floor_name: 'Tầng 4',
    altitude_min: 22,
    altitude_max: 29,
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
    geofence_rule_id: 1,
    floor_id: 3,
    name: 'Vùng chấm công tầng 3',
    building_id: 1,
    building_name: 'Tòa nhà AMA',
    floor_name: 'Tầng 3',
    center_lat: 10.776889,
    center_lng: 106.700981,
    radius_meters: 45,
    altitude_min: 15,
    altitude_max: 22,
    allow_checkin: true,
    allow_checkout: true,
    is_active: true,
  },
  {
    geofence_id: 2,
    geofence_rule_id: 2,
    floor_id: 4,
    name: 'Vùng chấm công tầng 4',
    building_id: 1,
    building_name: 'Tòa nhà AMA',
    floor_name: 'Tầng 4',
    center_lat: 10.77701,
    center_lng: 106.70112,
    radius_meters: 40,
    altitude_min: 22,
    altitude_max: 29,
    allow_checkin: true,
    allow_checkout: false,
    is_active: false,
  },
];

export const mockDepartments: DepartmentItem[] = [
  {
    department_id: 1,
    name: 'Ban điều hành',
    description: 'Khối quản lý',
    manager_id: 4,
    manager_name: 'Trang Lê',
    employee_count: 8,
  },
  {
    department_id: 2,
    name: 'Nhân sự',
    description: 'Phòng nhân sự',
    manager_id: 3,
    manager_name: 'Lan Phạm',
    employee_count: 12,
  },
  {
    department_id: 3,
    name: 'Kỹ thuật',
    description: 'Khối kỹ thuật',
    manager_id: null,
    manager_name: null,
    employee_count: 54,
  },
];

export const mockShifts: ShiftItem[] = [
  {
    shift_id: 1,
    employee_id: 2,
    employee_name: 'Minh Nguyễn',
    name: 'Ca hành chính',
    start_time: '08:00:00',
    end_time: '17:00:00',
    late_tolerance_min: 10,
    early_leave_min: 10,
    apply_to_weekends: false,
  },
  {
    shift_id: 2,
    employee_id: 7,
    employee_name: 'Lan Phạm',
    name: 'Ca chiều',
    start_time: '13:00:00',
    end_time: '21:00:00',
    late_tolerance_min: 15,
    early_leave_min: 5,
    apply_to_weekends: true,
  },
];

export const mockDevices: DeviceItem[] = [
  {
    device_id: 1,
    employee_id: 2,
    employee: { employee_id: 2, full_name: 'Minh Nguyễn', department_name: 'Kỹ thuật' },
    device_fingerprint: 'ama-device-fingerprint-001',
    platform: 'android',
    model: 'Pixel 8',
    os_version: 'Android 15',
    app_version: '1.0.0',
    is_trusted: true,
    registered_at: '2026-05-24T07:30:00Z',
  },
  {
    device_id: 31,
    employee_id: 7,
    employee: { employee_id: 7, full_name: 'Lan Phạm', department_name: 'Nhân sự' },
    device_fingerprint: 'ama-device-fingerprint-031',
    platform: 'ios',
    model: 'iPhone 15',
    os_version: 'iOS 18',
    app_version: '1.0.0',
    is_trusted: false,
    registered_at: '2026-05-25T02:10:00Z',
  },
];

export const mockEmployeeList: EmployeeListItem[] = [
  {
    employee_id: 2,
    department_id: 3,
    department_name: 'Kỹ thuật',
    full_name: 'Minh Nguyễn',
    email: 'minh.nguyen@ama.vn',
    phone: '0901234567',
    position: 'Kỹ sư phần mềm',
    hire_date: '2024-03-01',
    status: 'active',
    account: { account_id: 1002, username: 'minh.nguyen@ama.vn', role: 'employee', is_active: true },
  },
  {
    employee_id: 7,
    department_id: 2,
    department_name: 'Nhân sự',
    full_name: 'Lan Phạm',
    email: 'lan.pham@ama.vn',
    phone: '0907654321',
    position: 'Chuyên viên nhân sự',
    hire_date: '2023-08-15',
    status: 'active',
    account: { account_id: 1003, username: 'lan.pham@ama.vn', role: 'hr', is_active: true },
  },
  {
    employee_id: 11,
    department_id: 3,
    department_name: 'Kỹ thuật',
    full_name: 'Huy Trần',
    email: 'huy.tran@ama.vn',
    phone: '0912000111',
    position: 'Kỹ sư QA',
    hire_date: '2025-01-06',
    status: 'on_leave',
    account: { account_id: 1011, username: 'huy.tran@ama.vn', role: 'employee', is_active: true },
  },
];

export const mockEmployeeDetail: EmployeeDetail = {
  ...mockEmployeeList[0],
  face_registered: true,
  device: { device_id: 1, platform: 'android', model: 'Pixel 8', is_trusted: true },
  shift: { shift_id: 1, name: 'Ca hành chính' },
};
