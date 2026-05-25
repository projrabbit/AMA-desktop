import { RemoteTablePage } from '@/components/data/RemoteTablePage';
import { buildingService } from '@/services/buildingService';
import type { BuildingItem } from '@/types/api';

export function BuildingsPage() {
  return (
    <RemoteTablePage<BuildingItem>
      title="Tòa nhà và tầng"
      description="Dữ liệu tòa nhà và tầng lấy từ API buildings."
      load={() => buildingService.list({ include_floors: true })}
      getRowKey={(item) => item.building_id}
      columns={[
        { header: 'Tòa nhà', render: (item) => item.name },
        { header: 'Địa chỉ', render: (item) => item.address },
        { header: 'Số tầng', render: (item) => item.total_floors },
        { header: 'Tầng đã cấu hình', render: (item) => item.floors?.length ?? 0 },
        { header: 'ArcGIS layer', render: (item) => item.arcgis_layer_id || 'N/A' },
      ]}
    />
  );
}
