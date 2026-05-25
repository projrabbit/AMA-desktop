import { RemoteTablePage } from '@/components/data/RemoteTablePage';
import { formatYesNo } from '@/lib/format';
import { geofenceService } from '@/services/geofenceService';
import type { GeofenceItem } from '@/types/api';

export function GeofencePage() {
  return (
    <RemoteTablePage<GeofenceItem>
      title="Vùng chấm công"
      description="Danh sách vùng chấm công lấy trực tiếp từ API geofence."
      load={() => geofenceService.list({ is_active: true })}
      getRowKey={(item) => item.geofence_id}
      columns={[
        { header: 'Tên vùng', render: (item) => item.name },
        { header: 'Tầng', render: (item) => item.floor_id },
        { header: 'Bán kính', render: (item) => `${item.radius_meters} m` },
        { header: 'Độ cao', render: (item) => `${item.altitude_min} - ${item.altitude_max} m` },
        { header: 'Check-in', render: (item) => formatYesNo(item.allow_checkin) },
        { header: 'Check-out', render: (item) => formatYesNo(item.allow_checkout) },
      ]}
    />
  );
}
