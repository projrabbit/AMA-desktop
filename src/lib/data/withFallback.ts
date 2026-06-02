import { isMockMode } from '@/lib/config/env';
import type { ApiSuccess } from '@/types/api';

export interface FallbackResult<T> {
  data: T;
  usedMock: boolean;
}

/** Sau khoảng thời gian này mà API chưa trả lời thì rơi về mock (tránh treo trang khi backend chậm/chết). */
const API_TIMEOUT_MS = 4000;

/**
 * Gọi API thật trước; nếu lỗi (backend offline, chưa seed, hết quyền…) hoặc quá chậm
 * thì trả về dữ liệu mock để màn hình vẫn demo được. Đúng tinh thần "cái nào gọi được
 * thì gọi, không có thì mock".
 *
 * Khi VITE_USE_MOCK=true: trả mock ngay, KHÔNG gọi mạng (vào trang tức thì).
 */
export async function withFallback<T>(
  call: () => Promise<ApiSuccess<T>>,
  mock: T,
): Promise<FallbackResult<T>> {
  if (isMockMode()) {
    return { data: mock, usedMock: true };
  }

  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const data = await Promise.race<T>([
      call().then((response) => response.data),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error('API_TIMEOUT')), API_TIMEOUT_MS);
      }),
    ]);
    return { data, usedMock: false };
  } catch {
    return { data: mock, usedMock: true };
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
}
