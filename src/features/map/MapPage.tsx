import { useEffect, useMemo, useState } from 'react';

import { ArcgisScene } from '@/components/map/ArcgisScene';
import { ErrorState, LoadingState } from '@/components/page-states/PageState';
import { Select } from '@/components/ui/Select';
import { formatTime } from '@/lib/format';
import { mapBuildingToScene, mapGeofenceToScene, mapLocationToScenePoint } from '@/lib/map/gisMappers';
import { buildingService } from '@/services/buildingService';
import { geofenceService } from '@/services/geofenceService';
import { realtimeService } from '@/services/realtimeService';
import type { BuildingItem, GeofenceItem, RealtimeLocationItem } from '@/types/api';

const POLL_INTERVAL_MS = 30_000;
const ALL = '';

function numberFilter(value: string): number | undefined {
  return value === ALL ? undefined : Number(value);
}

export function MapPage() {
  const [locations, setLocations] = useState<RealtimeLocationItem[]>([]);
  const [buildings, setBuildings] = useState<BuildingItem[]>([]);
  const [geofences, setGeofences] = useState<GeofenceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [building, setBuilding] = useState(ALL);
  const [floor, setFloor] = useState(ALL);
  const [department, setDepartment] = useState(ALL);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showGeofences, setShowGeofences] = useState(true);
  const [showBuildings3d, setShowBuildings3d] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load(initial: boolean) {
      if (initial) {
        setLoading(true);
      }
      try {
        setLoadError(false);
        const buildingId = numberFilter(building);
        const floorId = numberFilter(floor);
        const departmentId = numberFilter(department);
        const [locationRes, buildingRes, geofenceRes] = await Promise.all([
          realtimeService.locations({ building_id: buildingId, floor_id: floorId, department_id: departmentId }),
          buildingService.list({ include_floors: true }),
          geofenceService.list({
            ...(buildingId !== undefined ? { building_id: buildingId } : {}),
            ...(floorId !== undefined ? { floor_id: floorId } : {}),
            is_active: true,
          }),
        ]);
        if (!cancelled) {
          setLocations(locationRes.data);
          setBuildings(buildingRes.data);
          setGeofences(geofenceRes.data);
        }
      } catch {
        if (!cancelled) {
          setLoadError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load(true);
    const intervalId = window.setInterval(() => void load(false), POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [building, floor, department]);

  const buildingOptions = useMemo(
    () => buildings.map((item) => ({ value: String(item.building_id), label: item.name })),
    [buildings],
  );
  const floorOptions = useMemo(
    () =>
      buildings
        .filter((item) => building === ALL || String(item.building_id) === building)
        .flatMap((item) =>
          (item.floors ?? []).map((floorItem) => ({
            value: String(floorItem.floor_id),
            label: `${item.name} • ${floorItem.floor_name}`,
          })),
        ),
    [buildings, building],
  );
  const departmentOptions = useMemo(() => {
    const map = new Map<number, string>();
    for (const item of locations) {
      map.set(item.department_id, item.department_name);
    }
    return [...map.entries()].map(([value, label]) => ({ value: String(value), label }));
  }, [locations]);

  const filtered = useMemo(
    () =>
      locations.filter(
          (item) =>
            (building === ALL || String(item.building_id) === building) &&
            (floor === ALL || String(item.floor_id) === floor) &&
            (department === ALL || String(item.department_id) === department),
      ),
    [locations, building, floor, department],
  );
  const sceneGeofences = useMemo(
    () =>
      geofences.filter(
        (item) =>
          item.is_active &&
          (building === ALL || String(item.building_id ?? '') === building) &&
          (floor === ALL || String(item.floor_id) === floor),
      ),
    [geofences, building, floor],
  );

  const scenePoints = useMemo(() => filtered.map(mapLocationToScenePoint), [filtered]);
  const sceneBuildings = useMemo(() => buildings.map(mapBuildingToScene), [buildings]);
  const sceneGeofenceGraphics = useMemo(() => sceneGeofences.map(mapGeofenceToScene), [sceneGeofences]);

  const selected = filtered.find((item) => item.employee_id === selectedId) ?? null;

  if (loading) {
    return <LoadingState />;
  }

  if (loadError) {
    return <ErrorState />;
  }

  return (
    <section className="screen-stack">
      <header className="screen-header">
        <div>
          <h2>Bản đồ 3D theo thời gian gần thực</h2>
          <p>Vị trí nhân viên đang làm việc, tự cập nhật mỗi 30 giây từ các lượt chấm công hợp lệ.</p>
        </div>
      </header>

      <div className="filter-bar">
        <Select
          label="Tòa nhà"
          value={building}
          onChange={(event) => setBuilding(event.target.value)}
          options={[{ value: ALL, label: 'Tất cả tòa nhà' }, ...buildingOptions]}
        />
        <Select
          label="Tầng"
          value={floor}
          onChange={(event) => setFloor(event.target.value)}
          options={[{ value: ALL, label: 'Tất cả tầng' }, ...floorOptions]}
        />
        <Select
          label="Phòng ban"
          value={department}
          onChange={(event) => setDepartment(event.target.value)}
          options={[{ value: ALL, label: 'Tất cả phòng ban' }, ...departmentOptions]}
        />
        <label className="map-toggle">
          <input
            type="checkbox"
            checked={showGeofences}
            onChange={(event) => setShowGeofences(event.target.checked)}
          />
          Vùng geofence
        </label>
        <label className="map-toggle">
          <input
            type="checkbox"
            checked={showBuildings3d}
            onChange={(event) => setShowBuildings3d(event.target.checked)}
          />
          Khối 3D tòa nhà
        </label>
      </div>

      <div className="two-pane">
        <div className="screen-stack">
          <ArcgisScene
            title="Bản đồ 3D vị trí nhân viên"
            points={scenePoints}
            buildings={sceneBuildings}
            geofences={sceneGeofenceGraphics}
            showGeofences={showGeofences}
            showBuildings3d={showBuildings3d}
          />
          <div className="table-wrap">
            <table className="ui-table">
              <caption>Nhân viên đang làm việc</caption>
              <thead>
                <tr>
                  <th scope="col">Nhân viên</th>
                  <th scope="col">Phòng ban</th>
                  <th scope="col">Vị trí</th>
                  <th scope="col">Giờ chấm</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length > 0 ? (
                  filtered.map((item) => (
                    <tr
                      key={item.employee_id}
                      className={`row-selectable ${item.employee_id === selectedId ? 'row-selected' : ''}`.trim()}
                      onClick={() => setSelectedId(item.employee_id)}
                    >
                      <td>{item.full_name}</td>
                      <td>{item.department_name}</td>
                      <td>
                        {item.building_name ?? '—'} • {item.floor_name ?? '—'}
                      </td>
                      <td>{formatTime(item.checked_in_at)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="table-empty">
                      Không tìm thấy nhân viên phù hợp với bộ lọc.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="detail-panel" aria-label="Chi tiết nhân viên được chọn">
          {selected ? (
            <>
              <h3>{selected.full_name}</h3>
              <dl className="detail-list">
                <div>
                  <dt>Phòng ban</dt>
                  <dd>{selected.department_name}</dd>
                </div>
                <div>
                  <dt>Tòa nhà</dt>
                  <dd>{selected.building_name ?? '—'}</dd>
                </div>
                <div>
                  <dt>Tầng</dt>
                  <dd>{selected.floor_name ?? '—'}</dd>
                </div>
                <div>
                  <dt>Độ cao</dt>
                  <dd>{selected.altitude !== null ? `${selected.altitude} m` : '—'}</dd>
                </div>
                <div>
                  <dt>Độ chính xác GPS</dt>
                  <dd>{selected.gps_accuracy !== null ? `${selected.gps_accuracy} m` : '—'}</dd>
                </div>
                <div>
                  <dt>Giờ chấm công</dt>
                  <dd>{formatTime(selected.checked_in_at)}</dd>
                </div>
              </dl>
            </>
          ) : (
            <p>Chọn một nhân viên trong danh sách để xem chi tiết vị trí.</p>
          )}
        </aside>
      </div>
    </section>
  );
}
