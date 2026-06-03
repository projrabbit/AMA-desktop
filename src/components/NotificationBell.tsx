import { useEffect, useRef, useState } from 'react';

import { formatDateTime } from '@/lib/format';
import { getNotificationTypeLabel } from '@/lib/i18n/labels';
import { notificationService } from '@/services/notificationService';
import type { NotificationItem } from '@/types/api';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  async function load() {
    try {
      const { data } = await notificationService.list({ limit: 20 });
      setItems(data);
    } catch {
      setItems([]);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const unread = items.filter((item) => !item.is_read).length;

  async function markRead(item: NotificationItem) {
    if (item.is_read) {
      return;
    }
    setItems((prev) => prev.map((it) => (it.notification_id === item.notification_id ? { ...it, is_read: true } : it)));
    try {
      await notificationService.markRead(item.notification_id);
    } catch {
      // Bỏ qua: vẫn đánh dấu đã đọc ở phía giao diện.
    }
  }

  async function markAll() {
    setItems((prev) => prev.map((it) => ({ ...it, is_read: true })));
    try {
      await notificationService.markAllRead();
    } catch {
      // Bỏ qua lỗi mạng — UI đã cập nhật.
    }
  }

  return (
    <div className="notif-dropdown" ref={containerRef}>
      <button
        type="button"
        className="notif-bell"
        aria-label={`Thông báo${unread > 0 ? ` (${unread} chưa đọc)` : ''}`}
        onClick={() => setOpen((prev) => !prev)}
      >
        🔔
        {unread > 0 ? <span className="notif-count">{unread}</span> : null}
      </button>
      {open ? (
        <div className="notif-panel" role="menu">
          <div className="data-toolbar" style={{ padding: '4px 8px' }}>
            <strong>Thông báo</strong>
            {unread > 0 ? (
              <button type="button" className="notif-bell" style={{ fontSize: '0.82rem' }} onClick={markAll}>
                Đánh dấu đã đọc tất cả
              </button>
            ) : null}
          </div>
          {items.length > 0 ? (
            items.map((item) => (
              <div
                key={item.notification_id}
                className={`notif-item ${item.is_read ? '' : 'notif-item--unread'}`.trim()}
                role="menuitem"
                tabIndex={0}
                onClick={() => markRead(item)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    void markRead(item);
                  }
                }}
              >
                <strong>{item.title}</strong>
                <span>{item.body}</span>
                <small>
                  {getNotificationTypeLabel(item.type)} • {formatDateTime(item.created_at)}
                </small>
              </div>
            ))
          ) : (
            <p style={{ padding: 12, margin: 0 }}>Không có thông báo.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
