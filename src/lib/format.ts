const TIME_ZONE = 'Asia/Ho_Chi_Minh';

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('vi-VN').format(value);
}

export function formatPercent(value: number): string {
  return `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 }).format(value)}%`;
}

export function formatDate(value: string | null | undefined): string {
  if (!value) {
    return '—';
  }
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeZone: TIME_ZONE }).format(new Date(value));
}

export function formatTime(value: string | null | undefined): string {
  if (!value) {
    return '—';
  }
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: TIME_ZONE,
  }).format(new Date(value));
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) {
    return '—';
  }
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: TIME_ZONE,
  }).format(new Date(value));
}

/** Cắt giờ HH:MM từ chuỗi time backend trả về (vd "08:00:00"). */
export function formatClock(value: string | null | undefined): string {
  if (!value) {
    return '—';
  }
  return value.slice(0, 5);
}

/** Hiển thị giờ làm từ số phút. */
export function formatHoursFromMinutes(minutes: number | null | undefined): string {
  if (minutes === null || minutes === undefined) {
    return '—';
  }
  const hours = minutes / 60;
  return `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 }).format(hours)} giờ`;
}
