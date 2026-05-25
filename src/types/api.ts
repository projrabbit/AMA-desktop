export type AccountRole = 'employee' | 'hr' | 'manager' | 'admin';
export type EmployeeStatus = 'active' | 'inactive' | 'on_leave' | 'terminated';
export type DevicePlatform = 'android' | 'ios' | 'web' | 'other';
export type ExportFormat = 'excel' | 'xlsx' | 'pdf';
export type AuditActionType =
  | 'login'
  | 'logout'
  | 'create'
  | 'update'
  | 'delete'
  | 'checkin'
  | 'checkout'
  | 'approve'
  | 'reject';

export interface ApiMeta {
  page?: number;
  limit?: number;
  total?: number;
  total_pages?: number;
  [key: string]: unknown;
}

export interface ApiErrorPayload {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: ApiMeta | null;
}

export interface ApiFailure {
  success: false;
  error: ApiErrorPayload;
  meta?: ApiMeta | null;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export interface AccountInfo {
  account_id: number;
  username: string;
  role: AccountRole;
  is_active: boolean;
  last_login_at?: string | null;
}

export interface EmployeeInfo {
  employee_id: number;
  full_name: string;
  email: string;
  phone?: string | null;
  position?: string | null;
  department_id: number;
  department_name?: string;
  hire_date?: string | null;
  status: EmployeeStatus;
  account?: AccountInfo | null;
}

export interface LoginData {
  access_token: string;
  refresh_token: string;
  token_type?: string;
  expires_in: number;
  account: AccountInfo;
  employee: EmployeeInfo;
}

export interface RefreshData {
  access_token: string;
  token_type?: string;
  expires_in: number;
}

export interface MeData {
  account: AccountInfo;
  employee: EmployeeInfo;
}

export interface MessageData {
  message: string;
}

export interface ActiveLocationItem {
  employee_id: number;
  full_name: string;
  department_name: string;
  latitude: number;
  longitude: number;
  altitude: number | null;
  building_id: number | null;
  building_name: string | null;
  floor_id: number | null;
  floor_name: string | null;
  last_checkin_at: string;
}

export interface DashboardSummaryData {
  date: string;
  total_employees: number;
  checked_in_today: number;
  on_time_count: number;
  late_count: number;
  early_leave_count: number;
  absent_count: number;
  fraud_alerts_today: number;
  on_time_rate: number;
  active_locations: ActiveLocationItem[];
}

export interface RealtimeLocationItem extends ActiveLocationItem {
  department_id?: number;
  record_id?: number;
  gps_accuracy: number | null;
  arcgis_layer_id?: string | null;
  checked_in_at: string;
}

export interface BuildingItem {
  building_id: number;
  name: string;
  address: string;
  center_lat: number;
  center_lng: number;
  total_floors: number;
  arcgis_layer_id: string;
  is_active?: boolean;
  floors?: FloorItem[];
}

export interface FloorItem {
  floor_id: number;
  building_id: number;
  floor_number: number;
  floor_name: string;
  altitude_min: number;
  altitude_max: number;
}

export interface GeofenceItem {
  geofence_id: number;
  floor_id: number;
  name: string;
  center_lat: number;
  center_lng: number;
  radius_meters: number;
  altitude_min: number;
  altitude_max: number;
  allow_checkin: boolean;
  allow_checkout: boolean;
  is_active: boolean;
}

export interface DepartmentItem {
  department_id: number;
  name: string;
  description?: string | null;
  manager_id?: number | null;
  manager_name?: string | null;
  employee_count?: number;
  created_at?: string;
}

export interface ShiftItem {
  shift_id: number;
  employee_id: number;
  employee_name?: string;
  name: string;
  start_time: string;
  end_time: string;
  late_tolerance_min: number;
  early_leave_min: number;
  apply_to_weekends: boolean;
}

export interface DeviceItem {
  device_id: number;
  employee_id?: number;
  employee?: {
    employee_id: number;
    full_name: string;
    department_name: string;
  };
  device_fingerprint: string;
  platform: DevicePlatform;
  model?: string | null;
  os_version?: string | null;
  app_version?: string | null;
  is_trusted: boolean;
  registered_at: string;
}

export interface AuditLogItem {
  log_id: number;
  account_id: number;
  action_type: AuditActionType;
  target_entity: string;
  target_id: number | null;
  payload: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
}

export interface AuditLogListData {
  items: AuditLogItem[];
  total: number;
  limit: number;
  offset: number;
}

export interface ReportSummary {
  employee_count?: number;
  total_work_days?: number;
  total_work_minutes?: number;
  absent_count?: number;
  rejected_count?: number;
  work_days?: number;
  total_hours?: number;
  late_count: number;
  early_leave_count: number;
  error_count?: number;
}

export interface ReportEmployeeSummary {
  employee_id: number;
  full_name: string;
  department_name: string;
  work_days: number;
  total_hours?: number;
  total_work_minutes?: number;
  late_count: number;
  early_leave_count: number;
  absent_count?: number;
  rejected_count?: number;
}

export interface ReportDayDetail {
  employee_id: number;
  full_name?: string;
  department_name?: string;
  date: string;
  checkin_at: string | null;
  checkout_at: string | null;
  status: string;
  total_hours?: number;
  worked_minutes?: number | null;
  is_late?: boolean;
  is_early_leave?: boolean;
}

export interface AttendanceReportData {
  range: Record<string, string>;
  summary: ReportSummary;
  employees: ReportEmployeeSummary[];
  details: ReportDayDetail[];
}
