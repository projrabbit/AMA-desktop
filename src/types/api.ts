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
  status: EmployeeStatus;
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
  department_id: number;
  record_id: number;
  arcgis_layer_id: string | null;
  gps_accuracy: number | null;
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
  geofence_rule_id?: number;
  floor_id: number;
  name: string;
  building_id?: number | null;
  building_name?: string | null;
  floor_name?: string | null;
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

export interface DeviceEmployeeInfo {
  employee_id: number;
  full_name: string;
  department_name: string;
}

export interface DeviceItem {
  device_id: number;
  employee_id?: number;
  employee?: DeviceEmployeeInfo | null;
  device_fingerprint: string;
  platform: DevicePlatform;
  model?: string | null;
  os_version?: string | null;
  app_version?: string | null;
  is_trusted: boolean;
  registered_at: string;
}

export interface EmployeeListItem {
  employee_id: number;
  department_id: number;
  department_name: string;
  full_name: string;
  email: string;
  phone?: string | null;
  position?: string | null;
  hire_date?: string | null;
  status: EmployeeStatus;
  account?: { account_id: number; username: string; role: AccountRole; is_active: boolean } | null;
}

export interface EmployeeDetail extends EmployeeListItem {
  face_registered?: boolean;
  device?: { device_id: number; platform: DevicePlatform; model?: string | null; is_trusted: boolean } | null;
  shift?: { shift_id: number; name: string } | null;
}

export interface CreateEmployeeData {
  employee_id: number;
  account_id: number;
  username: string;
  status: EmployeeStatus;
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
  employee_count: number;
  total_work_days: number;
  total_work_minutes: number;
  late_count: number;
  early_leave_count: number;
  absent_count: number;
  rejected_count: number;
}

export interface ReportEmployeeSummary {
  employee_id: number;
  full_name: string;
  department_name: string;
  work_days: number;
  total_work_minutes: number;
  late_count: number;
  early_leave_count: number;
  absent_count: number;
  rejected_count: number;
}

export interface ReportDayDetail {
  date: string;
  employee_id: number;
  full_name: string;
  department_name: string;
  checkin_at: string | null;
  checkout_at: string | null;
  worked_minutes: number | null;
  is_late: boolean;
  is_early_leave: boolean;
  status: string;
}

export interface AttendanceReportData {
  range: Record<string, string>;
  summary: ReportSummary;
  employees: ReportEmployeeSummary[];
  details: ReportDayDetail[];
}

// ── Ngoại lệ chấm công & chi tiết bản ghi ──────────────────────────────────────

export interface ExceptionEmployeeInfo {
  employee_id: number;
  full_name: string;
  department_name: string | null;
}

export interface FraudFlags {
  mock_location_detected: boolean;
  gps_spoofing_detected: boolean;
  buddy_punch_suspected: boolean;
  unknown_device: boolean;
  face_mismatch_detected: boolean;
  liveness_failed: boolean;
}

export interface AttendanceExceptionItem {
  record_id: number;
  employee: ExceptionEmployeeInfo;
  type: string;
  timestamp: string;
  status: string;
  rejection_reason: string | null;
  is_late: boolean;
  is_early_leave: boolean;
  fraud_flags: FraudFlags | null;
}

export interface RecordDeviceInfo {
  device_id: number;
  device_fingerprint: string;
  platform: string;
  model: string | null;
  is_trusted: boolean;
}

export interface RecordShiftInfo {
  shift_id: number;
  name: string;
  start_time: string;
  end_time: string;
}

export interface RecordFraudDetection extends FraudFlags {
  fraud_id: number;
  reason: string | null;
  confidence_score: number | null;
  checked_at: string;
}

export interface AttendanceRecordDetail {
  record_id: number;
  employee: {
    employee_id: number;
    full_name: string;
    department_id: number | null;
    department_name: string | null;
  };
  device: RecordDeviceInfo;
  shift: RecordShiftInfo | null;
  geofence_rule_id: number | null;
  type: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  altitude: number | null;
  gps_accuracy: number | null;
  status: string;
  rejection_reason: string | null;
  is_late: boolean;
  is_early_leave: boolean;
  fraud_detection: RecordFraudDetection | null;
}

export interface ApproveData {
  record_id: number;
  status: string;
  rejection_reason: string | null;
  approved_by_account_id: number;
  approved_at: string;
}

// ── Cảnh báo gian lận ──────────────────────────────────────────────────────────

export interface FraudRecordItem extends FraudFlags {
  fraud_id: number;
  record_id: number;
  employee: ExceptionEmployeeInfo;
  attendance_type: string;
  attendance_timestamp: string;
  confidence_score: number | null;
  reason: string | null;
  checked_at: string;
}

// ── Thông báo ──────────────────────────────────────────────────────────────────

export interface NotificationItem {
  notification_id: number;
  type: string;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
  meta: Record<string, unknown> | null;
}
