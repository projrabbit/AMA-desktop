import { useEffect, useMemo, useState } from 'react';

import { ArcgisScene } from '@/components/map/ArcgisScene';
import { MockDataBadge } from '@/components/page-states/MockDataBadge';
import { LoadingState } from '@/components/page-states/PageState';
import { Select } from '@/components/ui/Select';
import { Tabs } from '@/components/ui/Tabs';
import { withFallback } from '@/lib/data/withFallback';
import { formatTime } from '@/lib/format';
import { mockRealtimeLocations } from '@/lib/mocks';
import { realtimeService } from '@/services/realtimeService';
import type { RealtimeLocationItem } from '@/types/api';

const POLL_INTERVAL_MS = 30_000;
const ALL = '';
const HOUSE_MODEL_SRC = '/testing/house_view_3_4_rooms_corridor_fixed.html';
const MAP_VIEW_TABS = [
  { id: 'house', label: 'Mô hình nhà' },
  { id: 'live', label: 'Vị trí nhân viên' },
];
type MapViewMode = (typeof MAP_VIEW_TABS)[number]['id'];

function distinctOptions(
  items: RealtimeLocationItem[],
  idKey: 'building_id' | 'floor_id',
  labelKey: 'building_name' | 'floor_name',
): { label: string; value: string }[] {
  const map = new Map<string, string>();
  for (const item of items) {
    const id = item[idKey];
    if (id !== null && id !== undefined) {
      map.set(String(id), item[labelKey] ?? `#${id}`);
    }
  }
  return [...map.entries()].map(([value, label]) => ({ value, label }));
}

export function MapPage() {
  const [locations, setLocations] = useState<RealtimeLocationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [usedMock, setUsedMock] = useState(false);
  const [building, setBuilding] = useState(ALL);
  const [floor, setFloor] = useState(ALL);
  const [department, setDepartment] = useState(ALL);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<MapViewMode>('house');

  useEffect(() => {
    let cancelled = false;

    async function load(initial: boolean) {
      if (initial) {
        setLoading(true);
      }
      const { data, usedMock: mock } = await withFallback(
        () => realtimeService.locations(),
        mockRealtimeLocations,
      );
      if (!cancelled) {
        setLocations(data);
        setUsedMock(mock);
        setLoading(false);
      }
    }

    void load(true);
    const intervalId = window.setInterval(() => void load(false), POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, []);

  const buildingOptions = useMemo(
    () => distinctOptions(locations, 'building_id', 'building_name'),
    [locations],
  );
  const floorOptions = useMemo(
    () => distinctOptions(locations, 'floor_id', 'floor_name'),
    [locations],
  );
  const departmentOptions = useMemo(() => {
    const set = new Set(locations.map((item) => item.department_name).filter(Boolean));
    return [...set].map((name) => ({ value: name, label: name }));
  }, [locations]);

  const filtered = useMemo(
    () =>
      locations.filter(
        (item) =>
          (building === ALL || String(item.building_id) === building) &&
          (floor === ALL || String(item.floor_id) === floor) &&
          (department === ALL || item.department_name === department),
      ),
    [locations, building, floor, department],
  );

  const selected = filtered.find((item) => item.employee_id === selectedId) ?? null;

  if (loading) {
    return <LoadingState />;
  }

  return (
    <section className="screen-stack">
      <header className="screen-header">
        <div>
          <h2>Bản đồ 3D theo thời gian gần thực</h2>
          <p>
            Vị trí nhân viên đang làm việc, tự cập nhật mỗi 30 giây từ các lượt chấm công hợp lệ.
          </p>
        </div>
        <div className="screen-header__actions">
          <Tabs
            tabs={MAP_VIEW_TABS}
            activeId={viewMode}
            onChange={(id) => setViewMode(id as MapViewMode)}
          />
          <MockDataBadge visible={usedMock} />
        </div>
      </header>

      {viewMode === 'house' ? (
        <section className="house-model-frame" aria-label="Mô hình nhà 3D">
          <iframe
            title="Mô hình nhà 3D"
            src={HOUSE_MODEL_SRC}
            sandbox="allow-scripts allow-same-origin"
          />
        </section>
      ) : (
        <>
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
          </div>

          <div className="two-pane">
            <div className="screen-stack">
              <ArcgisScene
                title="Bản đồ 3D vị trí nhân viên"
                points={filtered.map((location) => ({
                  id: String(location.employee_id),
                  longitude: location.longitude,
                  latitude: location.latitude,
                  altitude: location.altitude ?? 0,
                  title: location.full_name,
                  description: `${location.department_name} • ${location.floor_name ?? 'Chưa rõ tầng'}`,
                }))}
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
        </>
      )}
    </section>
  );
}
