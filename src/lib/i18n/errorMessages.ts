const backendErrorMessages: Record<string, string> = {
  INVALID_CREDENTIALS: 'Email hoặc mật khẩu không đúng.',
  ACCOUNT_LOCKED: 'Tài khoản đã bị khóa hoặc chưa được kích hoạt.',
  ACCOUNT_INACTIVE: 'Tài khoản đã bị khóa hoặc chưa được kích hoạt.',
  NO_DASHBOARD_PERMISSION: 'Tài khoản này không có quyền truy cập Dashboard.',
  TOKEN_EXPIRED: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  UNAUTHORIZED: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  FORBIDDEN: 'Bạn không có quyền thực hiện thao tác này.',
  NOT_FOUND: 'Không tìm thấy dữ liệu yêu cầu.',
  VALIDATION_ERROR: 'Dữ liệu chưa hợp lệ. Vui lòng kiểm tra lại.',
  NETWORK_ERROR: 'Không thể kết nối máy chủ. Vui lòng kiểm tra mạng hoặc thử lại sau.',
  DUPLICATE_EMAIL: 'Email đã tồn tại trong hệ thống.',
  DUPLICATE_PHONE: 'Số điện thoại đã tồn tại trong hệ thống.',
  INVALID_ARCGIS_LAYER: 'Mã lớp bản đồ ArcGIS không hợp lệ.',
  GEOFENCE_OVERLAP: 'Vùng chấm công bị chồng lấn với vùng hiện có.',
};

export function getVietnameseErrorMessage(code: string, fallbackMessage?: string): string {
  if (backendErrorMessages[code]) {
    return backendErrorMessages[code];
  }

  if (fallbackMessage) {
    return fallbackMessage;
  }

  return `Đã xảy ra lỗi. Mã lỗi: ${code}.`;
}
