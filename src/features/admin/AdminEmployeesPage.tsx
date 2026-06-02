import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';

import { MockDataBadge } from '@/components/page-states/MockDataBadge';
import { LoadingState } from '@/components/page-states/PageState';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Drawer';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { getErrorMessage } from '@/lib/api/getErrorMessage';
import { canPerform } from '@/lib/auth/permissions';
import { useSession } from '@/lib/auth/session';
import { withFallback } from '@/lib/data/withFallback';
import { formatDate } from '@/lib/format';
import { getEmployeeStatusLabel, roleLabels } from '@/lib/i18n/labels';
import { mockDepartments, mockEmployeeDetail, mockEmployeeList, mockShifts } from '@/lib/mocks';
import { departmentService } from '@/services/departmentService';
import { employeeService } from '@/services/employeeService';
import { shiftService } from '@/services/shiftService';
import type { DepartmentItem, EmployeeDetail, EmployeeListItem, ShiftItem } from '@/types/api';
import { AdminNav } from './AdminNav';

const ALL = '';

const emptyCreate = {
  full_name: '',
  department_id: '',
  position: '',
  email: '',
  phone: '',
  hire_date: '',
  role: 'employee',
  temporary_password: '',
};

const statusOptions = [
  { value: 'active', label: 'Đang làm việc' },
  { value: 'inactive', label: 'Tạm ngưng' },
  { value: 'on_leave', label: 'Đang nghỉ phép' },
  { value: 'terminated', label: 'Đã nghỉ việc' },
];

export function AdminEmployeesPage() {
  const { role } = useSession();
  const canWriteFace = canPerform('face:write', role);
  const canDeleteFace = canPerform('face:delete', role);

  const [employees, setEmployees] = useState<EmployeeListItem[]>([]);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [shifts, setShifts] = useState<ShiftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [usedMock, setUsedMock] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState(ALL);
  const [statusFilter, setStatusFilter] = useState(ALL);

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(emptyCreate);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState(emptyCreate);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [detail, setDetail] = useState<EmployeeDetail | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [assignShiftId, setAssignShiftId] = useState('');
  const [faceFile, setFaceFile] = useState<File | null>(null);

  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [deactivateReason, setDeactivateReason] = useState('');

  async function load() {
    setLoading(true);
    const [empRes, deptRes, shiftRes] = await Promise.all([
      withFallback(() => employeeService.list({ limit: 200 }), mockEmployeeList),
      withFallback(() => departmentService.list(), mockDepartments),
      withFallback(() => shiftService.list(), mockShifts),
    ]);
    setEmployees(empRes.data);
    setDepartments(deptRes.data);
    setShifts(shiftRes.data);
    setUsedMock(empRes.usedMock || deptRes.usedMock || shiftRes.usedMock);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(
    () =>
      employees.filter(
        (emp) =>
          (departmentFilter === ALL || String(emp.department_id) === departmentFilter) &&
          (statusFilter === ALL || emp.status === statusFilter) &&
          (search === '' ||
            emp.full_name.toLowerCase().includes(search.toLowerCase()) ||
            emp.email.toLowerCase().includes(search.toLowerCase())),
      ),
    [employees, departmentFilter, statusFilter, search],
  );

  const departmentOptions = departments.map((d) => ({ value: String(d.department_id), label: d.name }));
  const shiftOptions = shifts.map((s) => ({ value: String(s.shift_id), label: s.name }));

  async function openDetail(employeeId: number) {
    setDrawerOpen(true);
    setDetail(null);
    setFaceFile(null);
    const { data } = await withFallback(() => employeeService.detail(employeeId), mockEmployeeDetail);
    setDetail(data);
    setAssignShiftId(data.shift ? String(data.shift.shift_id) : '');
  }

  async function submitCreate(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      await employeeService.create({
        full_name: createForm.full_name,
        department_id: Number(createForm.department_id),
        position: createForm.position,
        email: createForm.email,
        phone: createForm.phone,
        hire_date: createForm.hire_date,
        role: createForm.role,
        temporary_password: createForm.temporary_password,
      });
      setNotice('Đã tạo nhân viên mới và tài khoản đăng nhập.');
      setCreateOpen(false);
      setCreateForm(emptyCreate);
      await load();
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  function openEdit(emp: EmployeeListItem) {
    setEditingId(emp.employee_id);
    setEditForm({
      full_name: emp.full_name,
      department_id: String(emp.department_id),
      position: emp.position ?? '',
      email: emp.email,
      phone: emp.phone ?? '',
      hire_date: emp.hire_date ?? '',
      role: emp.account?.role ?? 'employee',
      temporary_password: '',
    });
    setFormError(null);
    setEditOpen(true);
  }

  async function submitEdit(event: FormEvent) {
    event.preventDefault();
    if (editingId === null) return;
    setFormError(null);
    setSubmitting(true);
    try {
      await employeeService.update(editingId, {
        full_name: editForm.full_name,
        department_id: Number(editForm.department_id),
        position: editForm.position,
        email: editForm.email,
        phone: editForm.phone,
        hire_date: editForm.hire_date,
      });
      setNotice('Đã cập nhật thông tin nhân viên.');
      setEditOpen(false);
      await load();
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAssignShift() {
    if (!detail || !assignShiftId) return;
    try {
      await employeeService.assignShift(detail.employee_id, Number(assignShiftId));
      setNotice('Đã gán ca làm việc cho nhân viên.');
      await openDetail(detail.employee_id);
    } catch (error) {
      setNotice(getErrorMessage(error));
    }
  }

  async function handleRegisterFace() {
    if (!detail || !faceFile) return;
    const formData = new FormData();
    formData.append('face_image', faceFile);
    try {
      await employeeService.registerFace(detail.employee_id, formData);
      setNotice('Đã đăng ký khuôn mặt cho nhân viên.');
      setFaceFile(null);
      await openDetail(detail.employee_id);
    } catch (error) {
      setNotice(getErrorMessage(error));
    }
  }

  async function handleDeleteFace() {
    if (!detail) return;
    try {
      await employeeService.deleteFace(detail.employee_id);
      setNotice('Đã xóa dữ liệu khuôn mặt.');
      await openDetail(detail.employee_id);
    } catch (error) {
      setNotice(getErrorMessage(error));
    }
  }

  async function handleDeactivate() {
    if (!detail) return;
    try {
      await employeeService.deactivate(detail.employee_id, deactivateReason || undefined);
      setNotice('Đã vô hiệu hóa nhân viên.');
      setDeactivateOpen(false);
      setDeactivateReason('');
      setDrawerOpen(false);
      await load();
    } catch (error) {
      setNotice(getErrorMessage(error));
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
          <h2>Quản trị nhân viên</h2>
          <p>Quản lý hồ sơ nhân viên, tài khoản đăng nhập, ca làm việc và đăng ký khuôn mặt.</p>
        </div>
        <div className="screen-header__actions">
          <MockDataBadge visible={usedMock} />
          <Button onClick={() => setCreateOpen(true)}>+ Thêm nhân viên</Button>
        </div>
      </header>

      {notice ? (
        <div className="ui-card" role="status">
          <p>{notice}</p>
        </div>
      ) : null}

      <div className="filter-bar">
        <Input label="Tìm kiếm" placeholder="Tên hoặc email" value={search} onChange={(e) => setSearch(e.target.value)} />
        <Select
          label="Phòng ban"
          value={departmentFilter}
          onChange={(e) => setDepartmentFilter(e.target.value)}
          options={[{ value: ALL, label: 'Tất cả phòng ban' }, ...departmentOptions]}
        />
        <Select
          label="Trạng thái"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[{ value: ALL, label: 'Tất cả trạng thái' }, ...statusOptions]}
        />
      </div>

      <div className="table-wrap">
        <table className="ui-table">
          <caption>Danh sách nhân viên</caption>
          <thead>
            <tr>
              <th scope="col">Họ tên</th>
              <th scope="col">Phòng ban</th>
              <th scope="col">Chức vụ</th>
              <th scope="col">Email</th>
              <th scope="col">Vai trò</th>
              <th scope="col">Trạng thái</th>
              <th scope="col">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((emp) => (
                <tr key={emp.employee_id}>
                  <td>{emp.full_name}</td>
                  <td>{emp.department_name}</td>
                  <td>{emp.position ?? '—'}</td>
                  <td>{emp.email}</td>
                  <td>{emp.account ? roleLabels[emp.account.role] : '—'}</td>
                  <td>
                    <span
                      className={`status-pill ${emp.status === 'active' ? 'status-pill--ok' : 'status-pill--muted'}`}
                    >
                      {getEmployeeStatusLabel(emp.status)}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <Button variant="secondary" onClick={() => openDetail(emp.employee_id)}>
                        Chi tiết
                      </Button>
                      <Button variant="ghost" onClick={() => openEdit(emp)}>
                        Sửa
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="table-empty">
                  Không tìm thấy nhân viên phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Drawer chi tiết */}
      <Drawer title="Chi tiết nhân viên" open={drawerOpen}>
        <div className="data-toolbar">
          <h3 style={{ margin: 0 }}>{detail?.full_name ?? 'Đang tải...'}</h3>
          <Button variant="ghost" onClick={() => setDrawerOpen(false)}>
            Đóng
          </Button>
        </div>
        {detail ? (
          <div className="screen-stack">
            <dl className="detail-list">
              <div>
                <dt>Phòng ban</dt>
                <dd>{detail.department_name}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>{detail.email}</dd>
              </div>
              <div>
                <dt>Tài khoản</dt>
                <dd>{detail.account?.username ?? '—'}</dd>
              </div>
              <div>
                <dt>Vai trò</dt>
                <dd>{detail.account ? roleLabels[detail.account.role] : '—'}</dd>
              </div>
              <div>
                <dt>Ngày vào làm</dt>
                <dd>{formatDate(detail.hire_date)}</dd>
              </div>
              <div>
                <dt>Thiết bị</dt>
                <dd>
                  {detail.device
                    ? `${detail.device.platform}${detail.device.is_trusted ? ' (tin cậy)' : ' (chờ duyệt)'}`
                    : 'Chưa có'}
                </dd>
              </div>
              <div>
                <dt>Khuôn mặt</dt>
                <dd>{detail.face_registered ? 'Đã đăng ký' : 'Chưa đăng ký'}</dd>
              </div>
            </dl>

            <div className="ui-field">
              <span>Gán ca làm việc</span>
              <div className="table-actions">
                <Select
                  label=""
                  value={assignShiftId}
                  onChange={(e) => setAssignShiftId(e.target.value)}
                  options={[{ value: '', label: '-- Chọn ca --' }, ...shiftOptions]}
                />
                <Button onClick={handleAssignShift} disabled={!assignShiftId}>
                  Gán ca
                </Button>
              </div>
            </div>

            {canWriteFace ? (
              <div className="ui-field">
                <span>Đăng ký khuôn mặt</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFaceFile(e.target.files?.[0] ?? null)}
                />
                <div className="table-actions">
                  <Button onClick={handleRegisterFace} disabled={!faceFile}>
                    Tải lên khuôn mặt
                  </Button>
                  {canDeleteFace && detail.face_registered ? (
                    <Button variant="danger" onClick={handleDeleteFace}>
                      Xóa khuôn mặt
                    </Button>
                  ) : null}
                </div>
              </div>
            ) : null}

            <div className="form-actions">
              <Button variant="ghost" onClick={() => detail && openEdit(detail)}>
                Sửa thông tin
              </Button>
              {detail.status === 'active' ? (
                <Button variant="danger" onClick={() => setDeactivateOpen(true)}>
                  Vô hiệu hóa
                </Button>
              ) : null}
            </div>
          </div>
        ) : (
          <p>Đang tải chi tiết nhân viên...</p>
        )}
      </Drawer>

      {/* Modal tạo */}
      <Modal title="Thêm nhân viên" open={createOpen} onClose={() => setCreateOpen(false)}>
        <EmployeeForm
          form={createForm}
          setForm={setCreateForm}
          departmentOptions={departmentOptions}
          showRoleAndPassword
          formError={formError}
          submitting={submitting}
          onSubmit={submitCreate}
          onCancel={() => setCreateOpen(false)}
        />
      </Modal>

      {/* Modal sửa */}
      <Modal title="Sửa nhân viên" open={editOpen} onClose={() => setEditOpen(false)}>
        <EmployeeForm
          form={editForm}
          setForm={setEditForm}
          departmentOptions={departmentOptions}
          showRoleAndPassword={false}
          formError={formError}
          submitting={submitting}
          onSubmit={submitEdit}
          onCancel={() => setEditOpen(false)}
        />
      </Modal>

      {/* Modal vô hiệu hóa */}
      <Modal title="Vô hiệu hóa nhân viên" open={deactivateOpen} onClose={() => setDeactivateOpen(false)}>
        <div className="form-grid form-grid--single">
          <p style={{ margin: 0 }}>
            Vô hiệu hóa <strong>{detail?.full_name}</strong>? Tài khoản đăng nhập sẽ bị khóa.
          </p>
          <Input
            label="Lý do (không bắt buộc)"
            value={deactivateReason}
            onChange={(e) => setDeactivateReason(e.target.value)}
          />
          <div className="form-actions">
            <Button variant="ghost" onClick={() => setDeactivateOpen(false)}>
              Hủy
            </Button>
            <Button variant="danger" onClick={handleDeactivate}>
              Xác nhận
            </Button>
          </div>
        </div>
      </Modal>
    </section>
  );
}

interface EmployeeFormProps {
  form: typeof emptyCreate;
  setForm: (updater: (prev: typeof emptyCreate) => typeof emptyCreate) => void;
  departmentOptions: { value: string; label: string }[];
  showRoleAndPassword: boolean;
  formError: string | null;
  submitting: boolean;
  onSubmit: (event: FormEvent) => void;
  onCancel: () => void;
}

function EmployeeForm({
  form,
  setForm,
  departmentOptions,
  showRoleAndPassword,
  formError,
  submitting,
  onSubmit,
  onCancel,
}: EmployeeFormProps) {
  return (
    <form className="form-grid" onSubmit={onSubmit}>
      <Input
        label="Họ tên"
        className="span-2"
        value={form.full_name}
        required
        onChange={(e) => setForm((prev) => ({ ...prev, full_name: e.target.value }))}
      />
      <Select
        label="Phòng ban"
        value={form.department_id}
        onChange={(e) => setForm((prev) => ({ ...prev, department_id: e.target.value }))}
        options={[{ value: '', label: '-- Chọn phòng ban --' }, ...departmentOptions]}
      />
      <Input
        label="Chức vụ"
        value={form.position}
        onChange={(e) => setForm((prev) => ({ ...prev, position: e.target.value }))}
      />
      <Input
        label="Email công ty"
        type="email"
        value={form.email}
        required
        onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
      />
      <Input
        label="Số điện thoại"
        value={form.phone}
        onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
      />
      <Input
        label="Ngày vào làm"
        type="date"
        value={form.hire_date}
        onChange={(e) => setForm((prev) => ({ ...prev, hire_date: e.target.value }))}
      />
      {showRoleAndPassword ? (
        <>
          <Select
            label="Vai trò"
            value={form.role}
            onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
            options={Object.entries(roleLabels).map(([value, label]) => ({ value, label }))}
          />
          <Input
            label="Mật khẩu tạm thời"
            type="text"
            value={form.temporary_password}
            required
            helperText="Tối thiểu 8 ký tự"
            onChange={(e) => setForm((prev) => ({ ...prev, temporary_password: e.target.value }))}
          />
        </>
      ) : null}
      {formError ? (
        <p className="span-2" role="alert" style={{ color: '#b91c1c', margin: 0 }}>
          {formError}
        </p>
      ) : null}
      <div className="form-actions">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Đang lưu...' : 'Lưu nhân viên'}
        </Button>
      </div>
    </form>
  );
}
