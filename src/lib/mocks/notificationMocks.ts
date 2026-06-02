import type { NotificationItem } from '@/types/api';

export const mockNotifications: NotificationItem[] = [
  {
    notification_id: 1,
    type: 'exception_flagged',
    title: 'Ngoại lệ chấm công mới',
    body: 'Minh Nguyễn có lượt chấm công bị đánh dấu nghi ngờ vị trí giả lập.',
    is_read: false,
    created_at: '2026-05-24T08:33:00Z',
    meta: { record_id: 5012 },
  },
  {
    notification_id: 2,
    type: 'device_trusted',
    title: 'Thiết bị đã được duyệt',
    body: 'Thiết bị của Lan Phạm đã được Admin duyệt tin cậy.',
    is_read: false,
    created_at: '2026-05-24T07:50:00Z',
    meta: { device_id: 31 },
  },
  {
    notification_id: 3,
    type: 'checkin_approved',
    title: 'Đã phê duyệt chấm công',
    body: 'Lượt chấm công của Huy Trần đã được phê duyệt thủ công.',
    is_read: true,
    created_at: '2026-05-23T16:20:00Z',
    meta: { record_id: 4980 },
  },
];
