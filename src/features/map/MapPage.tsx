import { useCallback, useEffect, useMemo, useState } from 'react';

import { ArcgisScene } from '@/components/map/ArcgisScene';
import { ErrorState, LoadingState, PageState } from '@/components/page-states/PageState';
import { Select } from '@/components/ui/Select';
import { buildingService } from '@/services/buildingService';
import { realtimeService } from '@/services/realtimeService';
import type { BuildingItem, RealtimeLocationItem } from '@/types/api';

export function MapPage() {
  const [buildings, setBuildings] = useState<BuildingItem[]>([]);
  const [locations, setLocations] = useState<RealtimeLocationItem[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState('');
  const [selectedFloorId, setSelectedFloorId] = useState('');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const selectedBuilding = buildings.find((building) => String(building.building_id) === selectedBuildingId);
  const floorOptions = selectedBuilding?.floors ?? buildings.flatMap((building) => building.floors ?? []);
  const departmentOptions = useMemo(() => {
    const departments = new Map<number, string>();
    for (const location of locations) {
      if (location.department_id) {
        departments.set(location.department_id, location.department_name);
      }
    }
    return [...departments.entries()].map(([value, label]) => ({ value: String(value), label }));
  }, [locations]);

  const loadLocations = useCallback(async () => {
    setError(false);
    const response = await realtimeService.locations({
      building_id: selectedBuildingId ? Number(selectedBuildingId) : undefined,
      floor_id: selectedFloorId ? Number(selectedFloorId) : undefined,
      department_id: selectedDepartmentId ? Number(selectedDepartmentId) : undefined,
    });
    setLocations(response.data);
  }, [selectedBuildingId, selectedDepartmentId, selectedFloorId]);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      setLoading(true);
      setError(false);
      try {
        const [buildingResponse, locationResponse] = await Promise.all([
          buildingService.list({ include_floors: true }),
          realtimeService.locations(),
        ]);
        if (!cancelled) {
          setBuildings(buildingResponse.data);
          setLocations(locationResponse.data);
        }
      } catch {
        if (!cancelled) {
          setError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!loading) {
      void loadLocations().catch(() => setError(true));
    }
  }, [loadLocations, loading]);

  const activeLocation = locations[0];
  const visibleCount = locations.length;

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState />;
  }

  return (
    <section className="map-page" aria-labelledby="map-title">
      <header className="map-command-bar">
        <div>
          <p className="overview-eyebrow">Bản đồ 3D gần thời gian thực</p>
          <h2 id="map-title">Theo dõi vị trí nhân viên theo tòa nhà và tầng</h2>
          <p>Ưu tiên nhân viên đang trong ca, độ chính xác GPS và tầng gần nhất.</p>
        </div>
        <section className="map-toolbar" aria-label="Bộ lọc bản đồ">
          <Select
            label="Tòa nhà"
            value={selectedBuildingId}
            onChange={(event) => {
              setSelectedBuildingId(event.target.value);
              setSelectedFloorId('');
            }}
            options={[
              { label: 'Tất cả tòa nhà', value: '' },
              ...buildings.map((building) => ({ label: building.name, value: String(building.building_id) })),
            ]}
          />
          <Select
            label="Tầng"
            value={selectedFloorId}
            onChange={(event) => setSelectedFloorId(event.target.value)}
            options={[
              { label: 'Tất cả tầng', value: '' },
              ...floorOptions.map((floor) => ({ label: floor.floor_name, value: String(floor.floor_id) })),
            ]}
          />
          <Select
            label="Phòng ban"
            value={selectedDepartmentId}
            onChange={(event) => setSelectedDepartmentId(event.target.value)}
            options={[
              { label: 'Tất cả phòng ban', value: '' },
              ...departmentOptions,
            ]}
          />
        </section>
      </header>

      <section className="map-shell">
        <div className="map-scene-panel">
          <ArcgisScene
            title="Bản đồ 3D"
            points={locations.map((location) => ({
              id: String(location.employee_id),
              longitude: location.longitude,
              latitude: location.latitude,
              altitude: location.altitude,
              title: location.full_name,
              description: location.department_name,
            }))}
          />
        </div>
        {activeLocation ? (
          <aside className="map-side-panel" aria-label="Chi tiết nhân viên được chọn">
            <div className="map-side-panel__header">
              <div>
                <p className="overview-panel__label">Nhân viên nổi bật</p>
                <h3>{activeLocation.full_name}</h3>
              </div>
              <div className="map-status-card">
                <span>Đang hiển thị</span>
                <strong>{visibleCount}</strong>
                <small>vị trí</small>
              </div>
            </div>
            <dl>
              <div>
                <dt>Phòng ban</dt>
                <dd>{activeLocation.department_name}</dd>
              </div>
              <div>
                <dt>Tòa nhà</dt>
                <dd>{activeLocation.building_name ?? 'Chưa xác định'}</dd>
              </div>
              <div>
                <dt>Tầng</dt>
                <dd>{activeLocation.floor_name ?? 'Chưa xác định'}</dd>
              </div>
              <div>
                <dt>Độ cao</dt>
                <dd>{activeLocation.altitude ?? 0} m</dd>
              </div>
              <div>
                <dt>Độ chính xác GPS</dt>
                <dd>{activeLocation.gps_accuracy ?? 'N/A'} m</dd>
              </div>
            </dl>
          </aside>
        ) : (
          <aside className="map-side-panel" aria-label="Trạng thái bản đồ">
            <PageState
              title="Không có vị trí đang hoạt động"
              description="Dữ liệu sẽ xuất hiện khi nhân viên chấm công vào ca."
            />
          </aside>
        )}
      </section>
    </section>
  );
}
