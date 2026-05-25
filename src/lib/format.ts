export function formatDateTime(value: string | null | undefined): string {
  if (!value) {
    return 'N/A';
  }

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(new Date(value));
}

export function formatMinutes(value: number | null | undefined): string {
  if (!value) {
    return '0 giờ';
  }

  const hours = Math.floor(value / 60);
  const minutes = value % 60;
  return minutes > 0 ? `${hours} giờ ${minutes} phút` : `${hours} giờ`;
}

export function formatYesNo(value: boolean | null | undefined): string {
  return value ? 'Có' : 'Không';
}
