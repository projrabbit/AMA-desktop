import { ApiError } from './apiErrors';

/** Lấy thông điệp lỗi tiếng Việt từ một lỗi bất kỳ (ApiError hoặc khác). */
export function getErrorMessage(error: unknown, fallback = 'Không thể thực hiện thao tác. Vui lòng thử lại.'): string {
  if (error instanceof ApiError) {
    return error.userMessage;
  }
  return fallback;
}
