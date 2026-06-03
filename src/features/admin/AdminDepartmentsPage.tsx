import { useEffect, useMemo, useState, type FormEvent } from 'react';

import { ErrorState, LoadingState } from '@/components/page-states/PageState';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { getErrorMessage } from '@/lib/api/getErrorMessage';
import { formatNumber } from '@/lib/format';
import { departmentService } from '@/services/departmentService';
import { employeeService } from '@/services/employeeService';
import type { DepartmentItem, EmployeeListItem } from '@/types/api';
import { AdminNav } from './AdminNav';

interface DepartmentFormState {
  name: string;
  description: string;
  manager_id: string;
}

const emptyForm: DepartmentFormState = { name: '', description: '', manager_id: '' };

export function AdminDepartmentsPage() {
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [employees, setEmployees] = useState<EmployeeListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<DepartmentFormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setLoading(true);
    try {
      setLoadError(false);
      const [deptRes, empRes] = await Promise.all([
        departmentService.list(),
        employeeService.list({ limit: 100 }),
      ]);
      setDepartments(deptRes.data);
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

  const filtered = useMemo(
    () => departments.filter((d) => search === '' || d.name.toLowerCase().includes(search.toLowerCase())),
    [departments, search],
  );

  const managerOptions = employees.map((e) => ({ value: String(e.employee_id), label: e.full_name }));

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError(null);
    setModalOpen(true);
  }

  function openEdit(dept: DepartmentItem) {
    setEditingId(dept.department_id);
    setForm({
      name: dept.name,
      description: dept.description ?? '',
      manager_id: dept.manager_id ? String(dept.manager_id) : '',
    });
    setFormError(null);
    setModalOpen(true);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFormError(null);
    setSubmitting(true);
    const body = {
      name: form.name,
      description: form.description || null,
      manager_id: form.manager_id ? Number(form.manager_id) : null,
    };
    try {
      if (editingId !== null) {
        await departmentService.update(editingId, body);
        setNotice('Đã cập nhật phòng ban.');
      } else {
        await departmentService.create(body);
        setNotice('Đã tạo phòng ban mới.');
      }
      setModalOpen(false);
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

  if (loadError) {
    return <ErrorState />;
  }

  return (
    <section className="screen-stack">
      <AdminNav />

      <header className="screen-header">
        <div>
          <h2>Quản trị phòng ban</h2>
          <p>Quản lý cơ cấu phòng ban và trưởng phòng. Phòng ban dùng để lọc báo cáo và phân nhóm nhân sự.</p>
        </div>
        <div className="screen-header__actions">
          <Button onClick={openCreate}>+ Thêm phòng ban</Button>
        </div>
      </header>

      {notice ? (
        <div className="ui-card" role="status">
          <p>{notice}</p>
        </div>
      ) : null}

      <div className="filter-bar">
        <Input label="Tìm kiếm" placeholder="Tên phòng ban" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="table-wrap">
        <table className="ui-table">
          <caption>Danh sách phòng ban</caption>
          <thead>
            <tr>
              <th scope="col">Tên phòng ban</th>
              <th scope="col">Trưởng phòng</th>
              <th scope="col">Số nhân viên</th>
              <th scope="col">Mô tả</th>
              <th scope="col">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length > 0 ? (
              filtered.map((dept) => (
                <tr key={dept.department_id}>
                  <td>{dept.name}</td>
                  <td>{dept.manager_name ?? 'Chưa có'}</td>
                  <td>{formatNumber(dept.employee_count ?? 0)}</td>
                  <td>{dept.description ?? '—'}</td>
                  <td>
                    <Button variant="secondary" onClick={() => openEdit(dept)}>
                      Sửa
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="table-empty">
                  Chưa có phòng ban nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal title={editingId !== null ? 'Sửa phòng ban' : 'Thêm phòng ban'} open={modalOpen} onClose={() => setModalOpen(false)}>
        <form className="form-grid" onSubmit={handleSubmit}>
          <Input
            label="Tên phòng ban"
            className="span-2"
            value={form.name}
            required
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          />
          <Select
            label="Trưởng phòng"
            className="span-2"
            value={form.manager_id}
            onChange={(e) => setForm((prev) => ({ ...prev, manager_id: e.target.value }))}
            options={[{ value: '', label: 'Chưa chỉ định' }, ...managerOptions]}
          />
          <Input
            label="Mô tả"
            className="span-2"
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          />
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
              {submitting ? 'Đang lưu...' : 'Lưu phòng ban'}
            </Button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
