import { RemoteTablePage } from '@/components/data/RemoteTablePage';
import { formatDateTime, formatYesNo } from '@/lib/format';
import { deviceService } from '@/services/deviceService';
import type { DeviceItem } from '@/types/api';

export function AdminDevicesPage() {
  return (
    <RemoteTablePage<DeviceItem>
      title="Quản trị thiết bị tin cậy"
      description="Danh sách thiết bị lấy từ API devices."
      load={() => deviceService.list({ limit: 50 })}
      getRowKey={(item) => item.device_id}
      columns={[
        { header: 'Thiết bị', render: (item) => item.model ?? item.device_fingerprint },
        { header: 'Nhân viên', render: (item) => item.employee?.full_name ?? item.employee_id },
        { header: 'Nền tảng', render: (item) => item.platform },
        { header: 'Phiên bản', render: (item) => item.app_version ?? 'N/A' },
        { header: 'Tin cậy', render: (item) => formatYesNo(item.is_trusted) },
        { header: 'Đăng ký', render: (item) => formatDateTime(item.registered_at) },
      ]}
    />
  );
}
