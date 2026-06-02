import { useEffect, useMemo, useState } from 'react';

import { MockDataBadge } from '@/components/page-states/MockDataBadge';
import { LoadingState } from '@/components/page-states/PageState';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { getErrorMessage } from '@/lib/api/getErrorMessage';
import { canPerform } from '@/lib/auth/permissions';
import { useSession } from '@/lib/auth/session';
import { withFallback } from '@/lib/data/withFallback';
import { formatDateTime } from '@/lib/format';
import { devicePlatformLabels, getDevicePlatformLabel } from '@/lib/i18n/labels';
import { mockDevices } from '@/lib/mocks';
import { deviceService } from '@/services/deviceService';
import type { DeviceItem } from '@/types/api';
import { AdminNav } from './AdminNav';

const ALL = '';

function maskFingerprint(value: string): string {
  if (value.length <= 6) return '••••';
  return `${value.slice(0, 4)}••••${value.slice(-4)}`;
}

export function AdminDevicesPage() {
  const { role } = useSession();
  const canTrust = canPerform('device:trust', role);

  const [devices, setDevices] = useState<DeviceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [usedMock, setUsedMock] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [trustedFilter, setTrustedFilter] = useState(ALL);
  const [platformFilter, setPlatformFilter] = useState(ALL);

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<{ device: DeviceItem; trust: boolean } | null>(null);

  async function load() {
    setLoading(true);
    const { data, usedMock: mock } = await withFallback(() => deviceService.list({ limit: 200 }), mockDevices);
    setDevices(data);
    setUsedMock(mock);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(
    () =>
      devices.filter((device) => {
        const empName = device.employee?.full_name ?? '';
        return (
          (trustedFilter === ALL || String(device.is_trusted) === trustedFilter) &&
          (platformFilter === ALL || device.platform === platformFilter) &&
          (search === '' || empName.toLowerCase().includes(search.toLowerCase()))
        );
      }),
    [devices, trustedFilter, platformFilter, search],
  );

  const selected = devices.find((d) => d.device_id === selectedId) ?? null;

  async function handleConfirm() {
    if (!confirmTarget) return;
    try {
      await deviceService.trust(confirmTarget.device.device_id, confirmTarget.trust);
      setNotice(confirmTarget.trust ? 'Đã duyệt thiết bị tin cậy.' : 'Đã thu hồi tin cậy thiết bị.');
      setConfirmTarget(null);
      await load();
    } catch (error) {
      setNotice(getErrorMessage(error));
      setConfirmTarget(null);
    }
  }

  if (loading) {
    return <LoadingState />;
  }

  return (
    <section className="screen-stack">
      <AdminNav />

      <header className="screen-header">
        <div>
          <h2>Quản trị thiết bị tin cậy</h2>
          <p>Duyệt thiết bị mới và thu hồi thiết bị không còn được tin cậy dùng cho chấm công.</p>
        </div>
        <MockDataBadge visible={usedMock} />
      </header>

      {notice ? (
        <div className="ui-card" role="status">
          <p>{notice}</p>
        </div>
      ) : null}

      <div className="filter-bar">
        <Input label="Tìm kiếm" placeholder="Tên nhân viên" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Select
          label="Trạng thái"
          value={trustedFilter}
          onChange={(e) => setTrustedFilter(e.target.value)}
          options={[
            { value: ALL, label: 'Tất cả' },
            { value: 'true', label: 'Đã duyệt' },
            { value: 'false', label: 'Chờ duyệt' },
          ]}
        />
        <Select
          label="Nền tảng"
          value={platformFilter}
          onChange={(e) => setPlatformFilter(e.target.value)}
          options={[
            { value: ALL, label: 'Tất cả nền tảng' },
            ...Object.entries(devicePlatformLabels).map(([value, label]) => ({ value, label })),
          ]}
        />
      </div>

      <div className="two-pane">
        <div className="table-wrap">
          <table className="ui-table">
            <caption>Danh sách thiết bị</caption>
            <thead>
              <tr>
                <th scope="col">Nhân viên</th>
                <th scope="col">Mã thiết bị</th>
                <th scope="col">Nền tảng</th>
                <th scope="col">Đăng ký</th>
                <th scope="col">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((device) => (
                  <tr
                    key={device.device_id}
                    className={`row-selectable ${device.device_id === selectedId ? 'row-selected' : ''}`.trim()}
                    onClick={() => setSelectedId(device.device_id)}
                  >
                    <td>{device.employee?.full_name ?? '—'}</td>
                    <td>{maskFingerprint(device.device_fingerprint)}</td>
                    <td>{getDevicePlatformLabel(device.platform)}</td>
                    <td>{formatDateTime(device.registered_at)}</td>
                    <td>
                      <span
                        className={`status-pill ${device.is_trusted ? 'status-pill--ok' : 'status-pill--warn'}`}
                      >
                        {device.is_trusted ? 'Đã duyệt' : 'Chờ duyệt'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="table-empty">
                    Không có thiết bị phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <aside className="detail-panel" aria-label="Chi tiết thiết bị">
          {selected ? (
            <>
              <h3>{selected.employee?.full_name ?? `Thiết bị #${selected.device_id}`}</h3>
              <dl className="detail-list">
                <div>
                  <dt>Phòng ban</dt>
                  <dd>{selected.employee?.department_name ?? '—'}</dd>
                </div>
                <div>
                  <dt>Mã thiết bị</dt>
                  <dd>{maskFingerprint(selected.device_fingerprint)}</dd>
                </div>
                <div>
                  <dt>Nền tảng</dt>
                  <dd>{getDevicePlatformLabel(selected.platform)}</dd>
                </div>
                <div>
                  <dt>Dòng máy</dt>
                  <dd>{selected.model ?? '—'}</dd>
                </div>
                <div>
                  <dt>Phiên bản OS</dt>
                  <dd>{selected.os_version ?? '—'}</dd>
                </div>
                <div>
                  <dt>Phiên bản app</dt>
                  <dd>{selected.app_version ?? '—'}</dd>
                </div>
                <div>
                  <dt>Đăng ký lúc</dt>
                  <dd>{formatDateTime(selected.registered_at)}</dd>
                </div>
                <div>
                  <dt>Trạng thái</dt>
                  <dd>{selected.is_trusted ? 'Đã duyệt tin cậy' : 'Chờ duyệt — có rủi ro'}</dd>
                </div>
              </dl>
              {canTrust ? (
                <div className="form-actions">
                  {selected.is_trusted ? (
                    <Button variant="danger" onClick={() => setConfirmTarget({ device: selected, trust: false })}>
                      Thu hồi
                    </Button>
                  ) : (
                    <Button onClick={() => setConfirmTarget({ device: selected, trust: true })}>Duyệt thiết bị</Button>
                  )}
                </div>
              ) : (
                <p>Chỉ Admin mới có quyền duyệt/thu hồi thiết bị.</p>
              )}
            </>
          ) : (
            <p>Chọn một thiết bị để xem chi tiết và xử lý.</p>
          )}
        </aside>
      </div>

      <Modal
        title={confirmTarget?.trust ? 'Duyệt thiết bị' : 'Thu hồi thiết bị'}
        open={confirmTarget !== null}
        onClose={() => setConfirmTarget(null)}
      >
        <p>
          {confirmTarget?.trust
            ? 'Duyệt thiết bị này để cho phép dùng chính thức cho chấm công?'
            : 'Thu hồi tin cậy thiết bị này? Các lượt chấm công sau đó có thể bị đánh dấu cần xem xét.'}
        </p>
        <div className="form-actions">
          <Button variant="ghost" onClick={() => setConfirmTarget(null)}>
            Hủy
          </Button>
          <Button variant={confirmTarget?.trust ? 'primary' : 'danger'} onClick={handleConfirm}>
            Xác nhận
          </Button>
        </div>
      </Modal>
    </section>
  );
}
