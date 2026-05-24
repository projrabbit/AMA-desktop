import type { AccountRole, AuditActionType, DevicePlatform, EmployeeStatus } from '@/types/api';

const UNKNOWN_LABEL = 'Không xác định';

export const roleLabels: Record<AccountRole, string> = {
  employee: 'Nhân viên',
  hr: 'Nhân sự',
  manager: 'Quản lý',
  admin: 'Quản trị viên',
};

export const employeeStatusLabels: Record<EmployeeStatus, string> = {
  active: 'Đang làm việc',
  inactive: 'Tạm ngưng',
  on_leave: 'Đang nghỉ phép',
  terminated: 'Đã nghỉ việc',
};

export const devicePlatformLabels: Record<DevicePlatform, string> = {
  android: 'Android',
  ios: 'iOS',
  web: 'Web',
  other: 'Khác',
};

export const auditActionLabels: Record<AuditActionType, string> = {
  login: 'Đăng nhập',
  logout: 'Đăng xuất',
  create: 'Tạo mới',
  update: 'Cập nhật',
  delete: 'Xóa',
  checkin: 'Chấm công vào',
  checkout: 'Chấm công ra',
  approve: 'Phê duyệt',
  reject: 'Từ chối',
};

export const attendanceStatusLabels: Record<string, string> = {
  approved: 'Hợp lệ',
  rejected: 'Bị từ chối',
  pending: 'Chờ xử lý',
  late: 'Đi trễ',
  early_leave: 'Về sớm',
  absent: 'Vắng mặt',
};

export const rejectionReasonLabels: Record<string, string> = {
  outside_geofence: 'Ngoài vùng chấm công',
  untrusted_device: 'Thiết bị chưa tin cậy',
  face_mismatch: 'Khuôn mặt không khớp',
  liveness_failed: 'Không đạt kiểm tra sống',
  mock_location: 'Phát hiện vị trí giả lập',
};

export const notificationTypeLabels: Record<string, string> = {
  attendance_exception: 'Ngoại lệ chấm công',
  fraud_alert: 'Cảnh báo gian lận',
  system: 'Hệ thống',
};

export const exportFormatLabels: Record<string, string> = {
  excel: 'Excel',
  xlsx: 'Excel',
  pdf: 'PDF',
};

function getLabel(labels: Record<string, string>, value: string): string {
  return labels[value] ?? UNKNOWN_LABEL;
}

export function getRoleLabel(value: string): string {
  return getLabel(roleLabels, value);
}

export function getEmployeeStatusLabel(value: string): string {
  return getLabel(employeeStatusLabels, value);
}

export function getDevicePlatformLabel(value: string): string {
  return getLabel(devicePlatformLabels, value);
}

export function getAuditActionLabel(value: string): string {
  return getLabel(auditActionLabels, value);
}

export function getAttendanceStatusLabel(value: string): string {
  return getLabel(attendanceStatusLabels, value);
}

export function getRejectionReasonLabel(value: string): string {
  return getLabel(rejectionReasonLabels, value);
}

export function getNotificationTypeLabel(value: string): string {
  return getLabel(notificationTypeLabels, value);
}

export function getExportFormatLabel(value: string): string {
  return getLabel(exportFormatLabels, value);
}
