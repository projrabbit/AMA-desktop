import { useEffect, useState, type FormEvent } from 'react';

import { ErrorState, LoadingState } from '@/components/page-states/PageState';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { getErrorMessage } from '@/lib/api/getErrorMessage';
import { formatClock } from '@/lib/format';
import { employeeService } from '@/services/employeeService';
import { shiftService } from '@/services/shiftService';
import type { EmployeeListItem, ShiftItem } from '@/types/api';
import { AdminNav } from './AdminNav';

interface ShiftFormState {
  employee_id: string;
  name: string;
  start_time: string;
  end_time: string;
  late_tolerance_min: string;
  early_leave_min: string;
  apply_to_weekends: boolean;
}

const emptyForm: ShiftFormState = {
  employee_id: '',
  name: '',
  start_time: '08:00',
  end_time: '17:00',
  late_tolerance_min: '10',
  early_leave_min: '10',
  apply_to_weekends: false,
};

export function AdminShiftsPage() {
  const [shifts, setShifts] = useState<ShiftItem[]>([]);
  const [employees, setEmployees] = useState<EmployeeListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ShiftItem | null>(null);
  const [form, setForm] = useState<ShiftFormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [assignEmployee, setAssignEmployee] = useState('');
  const [assignShift, setAssignShift] = useState('');

  async function load() {
    setLoading(true);
    try {
      setLoadError(false);
      const [shiftRes, empRes] = await Promise.all([
        shiftService.list(),
        employeeService.list({ limit: 200 }),
      ]);
      setShifts(shiftRes.data);
      setEmployees(empRes.data);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const employeeOptions = employees.map((e) => ({ value: String(e.employee_id), label: e.full_name }));
  const shiftOptions = shifts.map((s) => ({ value: String(s.shift_id), label: s.name }));

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFormError(null);
    setModalOpen(true);
  }

  function openEdit(shift: ShiftItem) {
    setEditing(shift);
    setForm({
      employee_id: String(shift.employee_id),
      name: shift.name,
      start_time: formatClock(shift.start_time),
      end_time: formatClock(shift.end_time),
      late_tolerance_min: String(shift.late_tolerance_min),
      early_leave_min: String(shift.early_leave_min),
      apply_to_weekends: shift.apply_to_weekends,
    });
    setFormError(null);
    setModalOpen(true);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    if (form.start_time >= form.end_time) {
      setFormError('Giờ vào phải sớm hơn giờ ra.');
      return;
    }
    setSubmitting(true);
    const body = {
      name: form.name,
      start_time: `${form.start_time}:00`,
      end_time: `${form.end_time}:00`,
      late_tolerance_min: Number(form.late_tolerance_min),
      early_leave_min: Number(form.early_leave_min),
      apply_to_weekends: form.apply_to_weekends,
    };
    try {
      if (editing) {
        await shiftService.update(editing.shift_id, body);
        setNotice('Đã cập nhật ca làm việc.');
      } else {
        await shiftService.create({ ...body, employee_id: Number(form.employee_id) });
        setNotice('Đã tạo ca làm việc mới.');
      }
      setModalOpen(false);
      await load();
    } catch (error) {
      setFormError(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleQuickAssign() {
    if (!assignEmployee || !assignShift) return;
    try {
      await employeeService.assignShift(Number(assignEmployee), Number(assignShift));
      setNotice('Đã gán ca cho nhân viên.');
      setAssignEmployee('');
      setAssignShift('');
      await load();
    } catch (error) {
      setNotice(getErrorMessage(error));
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
      <AdminNav />

      <header className="screen-header">
        <div>
          <h2>Quản trị ca làm việc</h2>
          <p>Tạo, sửa ca làm và gán ca cho nhân viên. Mỗi ca được khai báo theo nhân viên áp dụng.</p>
        </div>
        <div className="screen-header__actions">
          <Button onClick={openCreate}>+ Thêm ca</Button>
        </div>
      </header>

      {notice ? (
        <div className="ui-card" role="status">
          <p>{notice}</p>
        </div>
      ) : null}

      <div className="ui-card">
        <h3 style={{ marginTop: 0 }}>Gán ca nhanh cho nhân viên</h3>
        <div className="filter-bar" style={{ border: 'none', padding: 0 }}>
          <Select
            label="Nhân viên"
            value={assignEmployee}
            onChange={(e) => setAssignEmployee(e.target.value)}
            options={[{ value: '', label: '-- Chọn nhân viên --' }, ...employeeOptions]}
          />
          <Select
            label="Ca làm việc"
            value={assignShift}
            onChange={(e) => setAssignShift(e.target.value)}
            options={[{ value: '', label: '-- Chọn ca --' }, ...shiftOptions]}
          />
          <div className="filter-bar__actions">
            <Button onClick={handleQuickAssign} disabled={!assignEmployee || !assignShift}>
              Gán ca
            </Button>
          </div>
        </div>
      </div>

      <div className="table-wrap">
        <table className="ui-table">
          <caption>Danh sách ca làm việc</caption>
          <thead>
            <tr>
              <th scope="col">Tên ca</th>
              <th scope="col">Giờ vào</th>
              <th scope="col">Giờ ra</th>
              <th scope="col">Cho phép trễ</th>
              <th scope="col">Cho phép về sớm</th>
              <th scope="col">Cuối tuần</th>
              <th scope="col">Nhân viên</th>
              <th scope="col">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {shifts.length > 0 ? (
              shifts.map((shift) => (
                <tr key={shift.shift_id}>
                  <td>{shift.name}</td>
                  <td>{formatClock(shift.start_time)}</td>
                  <td>{formatClock(shift.end_time)}</td>
                  <td>{shift.late_tolerance_min} phút</td>
                  <td>{shift.early_leave_min} phút</td>
                  <td>{shift.apply_to_weekends ? 'Có' : 'Không'}</td>
                  <td>{shift.employee_name ?? `#${shift.employee_id}`}</td>
                  <td>
                    <Button variant="secondary" onClick={() => openEdit(shift)}>
                      Sửa
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="table-empty">
                  Chưa có ca làm việc nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal title={editing ? 'Sửa ca làm việc' : 'Thêm ca làm việc'} open={modalOpen} onClose={() => setModalOpen(false)}>
        <form className="form-grid" onSubmit={handleSubmit}>
          {!editing ? (
            <Select
              label="Nhân viên áp dụng"
              className="span-2"
              value={form.employee_id}
              onChange={(e) => setForm((prev) => ({ ...prev, employee_id: e.target.value }))}
              options={[{ value: '', label: '-- Chọn nhân viên --' }, ...employeeOptions]}
            />
          ) : null}
          <Input
            label="Tên ca"
            className="span-2"
            value={form.name}
            required
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          />
          <Input
            label="Giờ vào"
            type="time"
            value={form.start_time}
            required
            onChange={(e) => setForm((prev) => ({ ...prev, start_time: e.target.value }))}
          />
          <Input
            label="Giờ ra"
            type="time"
            value={form.end_time}
            required
            onChange={(e) => setForm((prev) => ({ ...prev, end_time: e.target.value }))}
          />
          <Input
            label="Cho phép đi trễ (phút)"
            type="number"
            value={form.late_tolerance_min}
            onChange={(e) => setForm((prev) => ({ ...prev, late_tolerance_min: e.target.value }))}
          />
          <Input
            label="Cho phép về sớm (phút)"
            type="number"
            value={form.early_leave_min}
            onChange={(e) => setForm((prev) => ({ ...prev, early_leave_min: e.target.value }))}
          />
          <label className="ui-field span-2">
            <span>Áp dụng cuối tuần</span>
            <input
              type="checkbox"
              checked={form.apply_to_weekends}
              onChange={(e) => setForm((prev) => ({ ...prev, apply_to_weekends: e.target.checked }))}
            />
          </label>
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
              {submitting ? 'Đang lưu...' : 'Lưu ca'}
            </Button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
