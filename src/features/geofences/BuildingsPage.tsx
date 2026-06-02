import { useEffect, useMemo, useState, type FormEvent } from 'react';

import { MockDataBadge } from '@/components/page-states/MockDataBadge';
import { LoadingState } from '@/components/page-states/PageState';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { getErrorMessage } from '@/lib/api/getErrorMessage';
import { canPerform } from '@/lib/auth/permissions';
import { useSession } from '@/lib/auth/session';
import { withFallback } from '@/lib/data/withFallback';
import { mockBuildings, mockGeofences } from '@/lib/mocks';
import { buildingService } from '@/services/buildingService';
import { geofenceService } from '@/services/geofenceService';
import type { BuildingItem, FloorItem, GeofenceItem } from '@/types/api';
import { GeofenceSubnav } from './GeofenceSubnav';

interface BuildingFormState {
  name: string;
  address: string;
  center_lat: string;
  center_lng: string;
  total_floors: string;
  arcgis_layer_id: string;
}

interface FloorFormState {
  floor_number: string;
  floor_name: string;
  altitude_min: string;
  altitude_max: string;
}

const emptyBuilding: BuildingFormState = {
  name: '',
  address: '',
  center_lat: '',
  center_lng: '',
  total_floors: '',
  arcgis_layer_id: '',
};

const emptyFloor: FloorFormState = { floor_number: '', floor_name: '', altitude_min: '', altitude_max: '' };

export function BuildingsPage() {
  const { role } = useSession();
  const canWrite = canPerform('building:write', role);

  const [buildings, setBuildings] = useState<BuildingItem[]>([]);
  const [geofences, setGeofences] = useState<GeofenceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [usedMock, setUsedMock] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [selectedBuildingId, setSelectedBuildingId] = useState<number | null>(null);

  const [buildingModal, setBuildingModal] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<BuildingItem | null>(null);
  const [buildingForm, setBuildingForm] = useState<BuildingFormState>(emptyBuilding);

  const [floorModal, setFloorModal] = useState(false);
  const [editingFloor, setEditingFloor] = useState<FloorItem | null>(null);
  const [floorForm, setFloorForm] = useState<FloorFormState>(emptyFloor);

  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setLoading(true);
    const [buildRes, geoRes] = await Promise.all([
      withFallback(() => buildingService.list({ include_floors: true }), mockBuildings),
      withFallback(() => geofenceService.list(), mockGeofences),
    ]);
    setBuildings(buildRes.data);
    setGeofences(geoRes.data);
    setUsedMock(buildRes.usedMock || geoRes.usedMock);
    setSelectedBuildingId((prev) => prev ?? buildRes.data[0]?.building_id ?? null);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  const selectedBuilding = buildings.find((b) => b.building_id === selectedBuildingId) ?? null;
  const floors = selectedBuilding?.floors ?? [];

  const floorsWithGeofence = useMemo(() => new Set(geofences.map((g) => g.floor_id)), [geofences]);

  function openCreateBuilding() {
    setEditingBuilding(null);
    setBuildingForm(emptyBuilding);
    setFormError(null);
    setBuildingModal(true);
  }

  function openEditBuilding(building: BuildingItem) {
    setEditingBuilding(building);
    setBuildingForm({
      name: building.name,
      address: building.address,
      center_lat: String(building.center_lat),
      center_lng: String(building.center_lng),
      total_floors: String(building.total_floors),
      arcgis_layer_id: building.arcgis_layer_id ?? '',
    });
    setFormError(null);
    setBuildingModal(true);
  }

  async function submitBuilding(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    const body = {
      name: buildingForm.name,
      address: buildingForm.address,
      center_lat: Number(buildingForm.center_lat),
      center_lng: Number(buildingForm.center_lng),
      total_floors: Number(buildingForm.total_floors),
      arcgis_layer_id: buildingForm.arcgis_layer_id,
    };
    setSubmitting(true);
    try {
      if (editingBuilding) {
        await buildingService.update(editingBuilding.building_id, body);
        setNotice('Đã cập nhật tòa nhà.');
      } else {
        await buildingService.create(body);
        setNotice('Đã tạo tòa nhà mới.');
      }
      setBuildingModal(false);
      await load();
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  function openCreateFloor() {
    setEditingFloor(null);
    setFloorForm(emptyFloor);
    setFormError(null);
    setFloorModal(true);
  }

  function openEditFloor(floor: FloorItem) {
    setEditingFloor(floor);
    setFloorForm({
      floor_number: String(floor.floor_number),
      floor_name: floor.floor_name,
      altitude_min: String(floor.altitude_min),
      altitude_max: String(floor.altitude_max),
    });
    setFormError(null);
    setFloorModal(true);
  }

  async function submitFloor(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    const altMin = Number(floorForm.altitude_min);
    const altMax = Number(floorForm.altitude_max);
    if (altMin >= altMax) {
      setFormError('Độ cao tối thiểu phải nhỏ hơn độ cao tối đa.');
      return;
    }
    if (!selectedBuilding) {
      return;
    }
    const body = {
      floor_number: Number(floorForm.floor_number),
      floor_name: floorForm.floor_name,
      altitude_min: altMin,
      altitude_max: altMax,
    };
    setSubmitting(true);
    try {
      if (editingFloor) {
        await buildingService.updateFloor(editingFloor.floor_id, body);
        setNotice('Đã cập nhật tầng.');
      } else {
        await buildingService.createFloor(selectedBuilding.building_id, body);
        setNotice('Đã tạo tầng mới.');
      }
      setFloorModal(false);
      await load();
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <LoadingState />;
  }

  return (
    <section className="screen-stack">
      <GeofenceSubnav />

      <header className="screen-header">
        <div>
          <h2>Quản lý tòa nhà và tầng</h2>
          <p>
            Dữ liệu nền để hệ thống phân biệt vị trí theo độ cao và tạo vùng chấm công theo tầng cho bản đồ 3D.
          </p>
        </div>
        <div className="screen-header__actions">
          <MockDataBadge visible={usedMock} />
          {canWrite ? <Button onClick={openCreateBuilding}>+ Thêm tòa nhà</Button> : null}
        </div>
      </header>

      {notice ? (
        <div className="ui-card" role="status">
          <p>{notice}</p>
        </div>
      ) : null}

      <div className="table-wrap">
        <table className="ui-table">
          <caption>Danh sách tòa nhà</caption>
          <thead>
            <tr>
              <th scope="col">Tên</th>
              <th scope="col">Địa chỉ</th>
              <th scope="col">Số tầng</th>
              <th scope="col">Bản đồ 3D</th>
              <th scope="col">Trạng thái</th>
              <th scope="col">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {buildings.map((building) => (
              <tr
                key={building.building_id}
                className={`row-selectable ${building.building_id === selectedBuildingId ? 'row-selected' : ''}`.trim()}
                onClick={() => setSelectedBuildingId(building.building_id)}
              >
                <td>{building.name}</td>
                <td>{building.address}</td>
                <td>{building.total_floors}</td>
                <td>
                  <span className={`status-pill ${building.arcgis_layer_id ? 'status-pill--ok' : 'status-pill--muted'}`}>
                    {building.arcgis_layer_id ? 'Đã kết nối' : 'Chưa kết nối'}
                  </span>
                </td>
                <td>
                  <span
                    className={`status-pill ${building.is_active === false ? 'status-pill--muted' : 'status-pill--ok'}`}
                  >
                    {building.is_active === false ? 'Tạm ngưng' : 'Đang dùng'}
                  </span>
                </td>
                <td>
                  <div className="table-actions">
                    {canWrite ? (
                      <Button
                        variant="secondary"
                        onClick={(event) => {
                          event.stopPropagation();
                          openEditBuilding(building);
                        }}
                      >
                        Sửa
                      </Button>
                    ) : null}
                    <Button variant="ghost" disabled title="Tính năng kiểm tra mô hình bản đồ 3D (sắp có)">
                      Kiểm tra bản đồ 3D
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="data-toolbar">
        <h3 style={{ margin: 0 }}>Tầng của: {selectedBuilding ? selectedBuilding.name : 'Chưa chọn tòa nhà'}</h3>
        {canWrite && selectedBuilding ? <Button onClick={openCreateFloor}>+ Thêm tầng</Button> : null}
      </div>

      <div className="table-wrap">
        <table className="ui-table">
          <caption>Danh sách tầng</caption>
          <thead>
            <tr>
              <th scope="col">Số tầng</th>
              <th scope="col">Tên tầng</th>
              <th scope="col">Phạm vi độ cao</th>
              <th scope="col">Vùng chấm công</th>
              {canWrite ? <th scope="col">Hành động</th> : null}
            </tr>
          </thead>
          <tbody>
            {floors.length > 0 ? (
              floors.map((floor) => (
                <tr key={floor.floor_id}>
                  <td>{floor.floor_number}</td>
                  <td>{floor.floor_name}</td>
                  <td>
                    {floor.altitude_min}–{floor.altitude_max} m
                  </td>
                  <td>
                    <span
                      className={`status-pill ${floorsWithGeofence.has(floor.floor_id) ? 'status-pill--ok' : 'status-pill--muted'}`}
                    >
                      {floorsWithGeofence.has(floor.floor_id) ? 'Đã có vùng' : 'Chưa có vùng'}
                    </span>
                  </td>
                  {canWrite ? (
                    <td>
                      <Button variant="secondary" onClick={() => openEditFloor(floor)}>
                        Sửa
                      </Button>
                    </td>
                  ) : null}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={canWrite ? 5 : 4} className="table-empty">
                  Tòa nhà này chưa khai báo tầng nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        title={editingBuilding ? 'Sửa tòa nhà' : 'Thêm tòa nhà'}
        open={buildingModal}
        onClose={() => setBuildingModal(false)}
      >
        <form className="form-grid" onSubmit={submitBuilding}>
          <Input
            label="Tên tòa nhà"
            className="span-2"
            value={buildingForm.name}
            required
            onChange={(event) => setBuildingForm((prev) => ({ ...prev, name: event.target.value }))}
          />
          <Input
            label="Địa chỉ"
            className="span-2"
            value={buildingForm.address}
            required
            onChange={(event) => setBuildingForm((prev) => ({ ...prev, address: event.target.value }))}
          />
          <Input
            label="Vĩ độ trung tâm"
            type="number"
            step="any"
            value={buildingForm.center_lat}
            required
            onChange={(event) => setBuildingForm((prev) => ({ ...prev, center_lat: event.target.value }))}
          />
          <Input
            label="Kinh độ trung tâm"
            type="number"
            step="any"
            value={buildingForm.center_lng}
            required
            onChange={(event) => setBuildingForm((prev) => ({ ...prev, center_lng: event.target.value }))}
          />
          <Input
            label="Số tầng"
            type="number"
            value={buildingForm.total_floors}
            required
            onChange={(event) => setBuildingForm((prev) => ({ ...prev, total_floors: event.target.value }))}
          />
          <Input
            label="Mã lớp bản đồ 3D (arcgis_layer_id)"
            value={buildingForm.arcgis_layer_id}
            onChange={(event) => setBuildingForm((prev) => ({ ...prev, arcgis_layer_id: event.target.value }))}
          />
          {formError ? (
            <p className="span-2" role="alert" style={{ color: '#b91c1c', margin: 0 }}>
              {formError}
            </p>
          ) : null}
          <div className="form-actions">
            <Button type="button" variant="ghost" onClick={() => setBuildingModal(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Đang lưu...' : 'Lưu tòa nhà'}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal title={editingFloor ? 'Sửa tầng' : 'Thêm tầng'} open={floorModal} onClose={() => setFloorModal(false)}>
        <form className="form-grid" onSubmit={submitFloor}>
          <Input
            label="Số tầng"
            type="number"
            value={floorForm.floor_number}
            required
            onChange={(event) => setFloorForm((prev) => ({ ...prev, floor_number: event.target.value }))}
          />
          <Input
            label="Tên tầng"
            value={floorForm.floor_name}
            required
            onChange={(event) => setFloorForm((prev) => ({ ...prev, floor_name: event.target.value }))}
          />
          <Input
            label="Độ cao tối thiểu (m)"
            type="number"
            step="any"
            value={floorForm.altitude_min}
            required
            onChange={(event) => setFloorForm((prev) => ({ ...prev, altitude_min: event.target.value }))}
          />
          <Input
            label="Độ cao tối đa (m)"
            type="number"
            step="any"
            value={floorForm.altitude_max}
            required
            onChange={(event) => setFloorForm((prev) => ({ ...prev, altitude_max: event.target.value }))}
          />
          {formError ? (
            <p className="span-2" role="alert" style={{ color: '#b91c1c', margin: 0 }}>
              {formError}
            </p>
          ) : null}
          <div className="form-actions">
            <Button type="button" variant="ghost" onClick={() => setFloorModal(false)}>
              Hủy
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Đang lưu...' : 'Lưu tầng'}
            </Button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
