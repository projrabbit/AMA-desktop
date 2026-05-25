import { RemoteTablePage } from '@/components/data/RemoteTablePage';
import { formatDateTime } from '@/lib/format';
import { auditLogService } from '@/services/auditLogService';
import type { ApiSuccess, AuditLogItem } from '@/types/api';

export function AuditLogsPage() {
  return (
    <RemoteTablePage<AuditLogItem>
      title="Tra cứu nhật ký hệ thống"
      description="Nhật ký hệ thống chỉ đọc, lấy từ API audit-logs."
      load={async (): Promise<ApiSuccess<AuditLogItem[]>> => {
        const response = await auditLogService.list({ limit: 50, offset: 0 });
        return {
          ...response,
          data: response.data.items,
          meta: { ...(response.meta ?? {}), total: response.data.total },
        };
      }}
      getRowKey={(item) => item.log_id}
      columns={[
        { header: 'Thời gian', render: (item) => formatDateTime(item.created_at) },
        { header: 'Tài khoản', render: (item) => item.account_id },
        { header: 'Hành động', render: (item) => item.action_type },
        { header: 'Đối tượng', render: (item) => item.target_entity },
        { header: 'ID', render: (item) => item.target_id ?? 'N/A' },
        { header: 'IP', render: (item) => item.ip_address ?? 'N/A' },
      ]}
    />
  );
}
