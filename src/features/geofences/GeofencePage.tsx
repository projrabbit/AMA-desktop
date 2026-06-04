import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';

import { ErrorState, LoadingState } from '@/components/page-states/PageState';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { getErrorMessage } from '@/lib/api/getErrorMessage';
import { canPerform } from '@/lib/auth/permissions';
import { useSession } from '@/lib/auth/session';
import { buildingService } from '@/services/buildingService';
import { geofenceService } from '@/services/geofenceService';
import type { BuildingItem, FloorItem, GeofenceItem } from '@/types/api';
import { GeofenceSubnav } from './GeofenceSubnav';

const ALL = '';

interface FloorOption extends FloorItem {
  building_name: string;
}

interface GeofenceFormState {
  floor_id: string;
  name: string;
  center_lat: string;
  center_lng: string;
  radius_meters: string;
  altitude_min: string;
  altitude_max: string;
  allow_checkin: boolean;
  allow_checkout: boolean;
  is_active: boolean;
}

const emptyForm: GeofenceFormState = {
  floor_id: '',
  name: '',
  center_lat: '',
  center_lng: '',
  radius_meters: '',
  altitude_min: '',
  altitude_max: '',
  allow_checkin: true,
  allow_checkout: true,
  is_active: true,
};

export function GeofencePage() {
  const { role } = useSession();
  const canWrite = canPerform('geofence:write', role);

  const [geofences, setGeofences] = useState<GeofenceItem[]>([]);
  const [buildings, setBuildings] = useState<BuildingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const [buildingFilter, setBuildingFilter] = useState(ALL);
  const [floorFilter, setFloorFilter] = useState(ALL);
  const [statusFilter, setStatusFilter] = useState(ALL);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<GeofenceItem | null>(null);
  const [form, setForm] = useState<GeofenceFormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [disableTarget, setDisableTarget] = useState<GeofenceItem | null>(null);

  async function load() {
    setLoading(true);
    try {
      setLoadError(false);
      const [geoRes, buildRes] = await Promise.all([
        geofenceService.list(),
        buildingService.list({ include_floors: true }),
      ]);
      setGeofences(geoRes.data);
      setBuildings(buildRes.data);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const floorOptions: FloorOption[] = useMemo(
    () =>
      buildings.flatMap((building) =>
        (building.floors ?? []).map((floor) => ({ ...floor, building_name: building.name })),
      ),
    [buildings],
  );

  const filtered = useMemo(
    () =>
      geofences.filter(
        (item) =>
          (buildingFilter === ALL || String(item.building_id ?? '') === buildingFilter) &&
          (floorFilter === ALL || String(item.floor_id) === floorFilter) &&
          (statusFilter === ALL || String(item.is_active) === statusFilter),
      ),
    [geofences, buildingFilter, floorFilter, statusFilter],
  );

  const hasBackground = buildings.length > 0 && floorOptions.length > 0;

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormError(null);
    setModalOpen(true);
  }

  function openEdit(item: GeofenceItem) {
    setEditing(item);
    setForm({
      floor_id: String(item.floor_id),
      name: item.name,
      center_lat: String(item.center_lat),
      center_lng: String(item.center_lng),
      radius_meters: String(item.radius_meters),
      altitude_min: String(item.altitude_min),
      altitude_max: String(item.altitude_max),
      allow_checkin: item.allow_checkin,
      allow_checkout: item.allow_checkout,
      is_active: item.is_active,
    });
    setFormError(null);
    setModalOpen(true);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);

    const altMin = Number(form.altitude_min);
    const altMax = Number(form.altitude_max);
    if (altMin >= altMax) {
      setFormError('Độ cao tối thiểu phải nhỏ hơn độ cao tối đa.');
      return;
    }
    if (Number(form.radius_meters) <= 0) {
      setFormError('Bán kính phải lớn hơn 0.');
      return;
    }
    if (!form.floor_id) {
      setFormError('Vui lòng chọn tầng cho vùng chấm công.');
      return;
    }

    const body = {
      floor_id: Number(form.floor_id),
      name: form.name,
      center_lat: Number(form.center_lat),
      center_lng: Number(form.center_lng),
      radius_meters: Number(form.radius_meters),
      altitude_min: altMin,
      altitude_max: altMax,
      allow_checkin: form.allow_checkin,
      allow_checkout: form.allow_checkout,
      is_active: form.is_active,
    };

    setSubmitting(true);
    try {
      if (editing) {
        await geofenceService.update(editing.geofence_id, body);
        setNotice('Đã cập nhật vùng chấm công.');
      } else {
        await geofenceService.create(body);
        setNotice('Đã tạo vùng chấm công mới.');
      }
      setModalOpen(false);
      await load();
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDisable() {
    if (!disableTarget) {
      return;
    }
    try {
      await geofenceService.disable(disableTarget.geofence_id);
      setNotice('Đã vô hiệu hóa vùng chấm công.');
      setDisableTarget(null);
      await load();
    } catch (error) {
      setNotice(getErrorMessage(error));
      setDisableTarget(null);
    }
  }

  if (loading) {
    return <LoadingState />;
  }

  if (loadError) {
    return <ErrorState />;
  }

  return (
    <section className="screen-stack">
      <GeofenceSubnav />

      <header className="screen-header">
        <div>
          <h2>Quản lý vùng chấm công 3D</h2>
          <p>Tạo, sửa và vô hiệu hóa vùng chấm công theo tòa nhà, tầng và phạm vi độ cao.</p>
        </div>
        <div className="screen-header__actions">
          {canWrite ? (
            <Button onClick={openCreate} disabled={!hasBackground}>
              + Thêm vùng chấm công
            </Button>
          ) : null}
        </div>
      </header>

      {!hasBackground ? (
        <div className="ui-card">
          <p>
            Chưa có dữ liệu tòa nhà/tầng. Hãy tạo tòa nhà và tầng trước tại{' '}
            <Link to="/geofences/buildings">Tòa nhà &amp; tầng</Link> rồi quay lại tạo vùng chấm công.
          </p>
        </div>
      ) : null}

      {notice ? (
        <div className="ui-card" role="status">
          <p>{notice}</p>
        </div>
      ) : null}

      <div className="filter-bar">
        <Select
          label="Tòa nhà"
          value={buildingFilter}
          onChange={(event) => setBuildingFilter(event.target.value)}
          options={[
            { value: ALL, label: 'Tất cả tòa nhà' },
            ...buildings.map((b) => ({ value: String(b.building_id), label: b.name })),
          ]}
        />
        <Select
          label="Tầng"
          value={floorFilter}
          onChange={(event) => setFloorFilter(event.target.value)}
          options={[
            { value: ALL, label: 'Tất cả tầng' },
            ...floorOptions.map((f) => ({ value: String(f.floor_id), label: `${f.building_name} • ${f.floor_name}` })),
          ]}
        />
        <Select
          label="Trạng thái"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          options={[
            { value: ALL, label: 'Tất cả trạng thái' },
            { value: 'true', label: 'Đang dùng' },
            { value: 'false', label: 'Tạm tắt' },
          ]}
        />
      </div>

      <div className="table-wrap">
        <table className="ui-table">
          <caption>Danh sách vùng chấm công</caption>
          <thead>
            <tr>
              <th scope="col">Tên vùng</th>
              <th scope="col">Tòa nhà</th>
              <th scope="col">Tầng</th>
              <th scope="col">Bán kính</th>
              <th scope="col">Độ cao</th>
              <th scope="col">Cho phép</th>
              <th scope="col">Trạng thái</th>
              {canWrite ? <th scope="col">Hành động</th> : null}
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((item) => (
                <tr key={item.geofence_id}>
                  <td>{item.name}</td>
                  <td>{item.building_name ?? '—'}</td>
                  <td>{item.floor_name ?? `#${item.floor_id}`}</td>
                  <td>{item.radius_meters} m</td>
                  <td>
                    {item.altitude_min}–{item.altitude_max} m
                  </td>
                  <td>
                    {item.allow_checkin ? 'Vào' : ''}
                    {item.allow_checkin && item.allow_checkout ? ' / ' : ''}
                    {item.allow_checkout ? 'Ra' : ''}
                    {!item.allow_checkin && !item.allow_checkout ? '—' : ''}
                  </td>
                  <td>
                    <span className={`status-pill ${item.is_active ? 'status-pill--ok' : 'status-pill--muted'}`}>
                      {item.is_active ? 'Đang dùng' : 'Tạm tắt'}
                    </span>
                  </td>
                  {canWrite ? (
                    <td>
                      <div className="table-actions">
                        <Button variant="secondary" onClick={() => openEdit(item)}>
                          Sửa
                        </Button>
                        {item.is_active ? (
                          <Button variant="danger" onClick={() => setDisableTarget(item)}>
                            Vô hiệu hóa
                          </Button>
                        ) : null}
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={canWrite ? 8 : 7} className="table-empty">
                  Không có vùng chấm công phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        title={editing ? 'Sửa vùng chấm công' : 'Thêm vùng chấm công'}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      >
        <form className="form-grid" onSubmit={handleSubmit}>
          <Select
            label="Tầng"
            className="span-2"
            value={form.floor_id}
            onChange={(event) => setForm((prev) => ({ ...prev, floor_id: event.target.value }))}
            options={[
              { value: '', label: '-- Chọn tầng --' },
              ...floorOptions.map((f) => ({ value: String(f.floor_id), label: `${f.building_name} • ${f.floor_name}` })),
            ]}
          />
          <Input
            label="Tên vùng"
            className="span-2"
            value={form.name}
            required
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          />
          <Input
            label="Vĩ độ (lat)"
            type="number"
            step="any"
            value={form.center_lat}
            required
            onChange={(event) => setForm((prev) => ({ ...prev, center_lat: event.target.value }))}
          />
          <Input
            label="Kinh độ (lng)"
            type="number"
            step="any"
            value={form.center_lng}
            required
            onChange={(event) => setForm((prev) => ({ ...prev, center_lng: event.target.value }))}
          />
          <Input
            label="Bán kính (m)"
            type="number"
            step="any"
            value={form.radius_meters}
            required
            onChange={(event) => setForm((prev) => ({ ...prev, radius_meters: event.target.value }))}
          />
          <div />
          <Input
            label="Độ cao tối thiểu (m)"
            type="number"
            step="any"
            value={form.altitude_min}
            required
            onChange={(event) => setForm((prev) => ({ ...prev, altitude_min: event.target.value }))}
          />
          <Input
            label="Độ cao tối đa (m)"
            type="number"
            step="any"
            value={form.altitude_max}
            required
            onChange={(event) => setForm((prev) => ({ ...prev, altitude_max: event.target.value }))}
          />
          <label className="ui-field">
            <span>Cho phép chấm công vào</span>
            <input
              type="checkbox"
              checked={form.allow_checkin}
              onChange={(event) => setForm((prev) => ({ ...prev, allow_checkin: event.target.checked }))}
            />
          </label>
          <label className="ui-field">
            <span>Cho phép chấm công ra</span>
            <input
              type="checkbox"
              checked={form.allow_checkout}
              onChange={(event) => setForm((prev) => ({ ...prev, allow_checkout: event.target.checked }))}
            />
          </label>
          {editing ? (
            <label className="ui-field span-2">
              <span>Đang sử dụng</span>
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(event) => setForm((prev) => ({ ...prev, is_active: event.target.checked }))}
              />
            </label>
          ) : null}
          {formError ? (
            <p className="span-2" role="alert" style={{ color: '#b91c1c', margin: 0 }}>
              {formError}
            </p>
          ) : null}
          <div className="form-actions">
            <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Đang lưu...' : 'Lưu vùng chấm công'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal title="Vô hiệu hóa vùng chấm công" open={disableTarget !== null} onClose={() => setDisableTarget(null)}>
        <p>
          Bạn có chắc muốn vô hiệu hóa vùng <strong>{disableTarget?.name}</strong>? Vùng sẽ chuyển sang trạng thái
          Tạm tắt và không dùng để đối chiếu chấm công.
        </p>
        <div className="form-actions">
          <Button variant="ghost" onClick={() => setDisableTarget(null)}>
            Hủy
          </Button>
          <Button variant="danger" onClick={handleDisable}>
            Vô hiệu hóa
          </Button>
        </div>
      </Modal>
    </section>
  );
}
