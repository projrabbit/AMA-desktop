import type { ApiClient } from '@/lib/api/apiClient';
import type { NotificationItem } from '@/types/api';
import { apiClient } from './apiClientInstance';

export const notificationEndpoints = {
  list: 'GET /notifications',
  markRead: 'PUT /notifications/{notification_id}/read',
  markAllRead: 'PUT /notifications/read-all',
  preferences: 'GET /notifications/preferences',
  updatePreferences: 'PUT /notifications/preferences',
} as const;

export interface NotificationListParams {
  is_read?: boolean;
  type?: string;
  page?: number;
  limit?: number;
}

export function createNotificationService(client: ApiClient = apiClient) {
  return {
    list: (query?: NotificationListParams) =>
      client.get<NotificationItem[]>('/notifications', { query }),
    markRead: (notificationId: number) =>
      client.put<Record<string, unknown>>(`/notifications/${notificationId}/read`),
    markAllRead: () => client.put<Record<string, unknown>>('/notifications/read-all'),
    preferences: () => client.get<Record<string, unknown>>('/notifications/preferences'),
    updatePreferences: (body: Record<string, unknown>) =>
      client.put<Record<string, unknown>>('/notifications/preferences', { body }),
  };
}

export const notificationService = createNotificationService();
