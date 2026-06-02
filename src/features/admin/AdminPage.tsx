import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { MockDataBadge } from '@/components/page-states/MockDataBadge';
import { LoadingState } from '@/components/page-states/PageState';
import { withFallback } from '@/lib/data/withFallback';
import { formatNumber } from '@/lib/format';
import { getEmployeeStatusLabel } from '@/lib/i18n/labels';
import { mockDepartments, mockDevices, mockEmployeeList, mockShifts } from '@/lib/mocks';
import { departmentService } from '@/services/departmentService';
import { deviceService } from '@/services/deviceService';
import { employeeService } from '@/services/employeeService';
import { shiftService } from '@/services/shiftService';
import type { DepartmentItem, DeviceItem, EmployeeListItem, ShiftItem } from '@/types/api';
import { AdminNav } from './AdminNav';

export function AdminPage() {
  const [employees, setEmployees] = useState<EmployeeListItem[]>([]);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [shifts, setShifts] = useState<ShiftItem[]>([]);
  const [devices, setDevices] = useState<DeviceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [usedMock, setUsedMock] = useState(false);

  useEffect(() => {
    async function load() {
      const [empRes, deptRes, shiftRes, deviceRes] = await Promise.all([
        withFallback(() => employeeService.list({ limit: 200 }), mockEmployeeList),
        withFallback(() => departmentService.list(), mockDepartments),
        withFallback(() => shiftService.list(), mockShifts),
        withFallback(() => deviceService.list({ limit: 200 }), mockDevices),
      ]);
      setEmployees(empRes.data);
      setDepartments(deptRes.data);
      setShifts(shiftRes.data);
      setDevices(deviceRes.data);
      setUsedMock(empRes.usedMock || deptRes.usedMock || shiftRes.usedMock || deviceRes.usedMock);
      setLoading(false);
    }
    void load();
  }, []);

  if (loading) {
    return <LoadingState />;
  }

  const trustedDevices = devices.filter((d) => d.is_trusted).length;
  const pendingDevices = devices.length - trustedDevices;

  return (
    <section className="screen-stack">
      <AdminNav />

      <header className="screen-header">
        <div>
          <h2>Quản trị hệ thống</h2>
          <p>Nhìn nhanh dữ liệu vận hành và truy cập các nhóm chức năng nhân viên, phòng ban, ca và thiết bị.</p>
        </div>
        <MockDataBadge visible={usedMock} />
      </header>

      <div className="kpi-grid">
        <article className="kpi-card">
          <span>Nhân viên</span>
          <strong>{formatNumber(employees.length)}</strong>
          <Link to="/admin/employees">Quản lý nhân viên →</Link>
        </article>
        <article className="kpi-card">
          <span>Phòng ban</span>
          <strong>{formatNumber(departments.length)}</strong>
          <Link to="/admin/departments">Quản lý phòng ban →</Link>
        </article>
        <article className="kpi-card">
          <span>Ca làm việc</span>
          <strong>{formatNumber(shifts.length)}</strong>
          <Link to="/admin/shifts">Quản lý ca →</Link>
        </article>
        <article className="kpi-card">
          <span>Thiết bị</span>
          <strong>
            {formatNumber(trustedDevices)} tin cậy / {formatNumber(pendingDevices)} chờ
          </strong>
          <Link to="/admin/devices">Quản lý thiết bị →</Link>
        </article>
      </div>

      <div className="table-wrap">
        <table className="ui-table">
          <caption>Nhân viên (tóm tắt)</caption>
          <thead>
            <tr>
              <th scope="col">Họ tên</th>
              <th scope="col">Phòng ban</th>
              <th scope="col">Chức vụ</th>
              <th scope="col">Email</th>
              <th scope="col">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {employees.slice(0, 8).map((emp) => (
              <tr key={emp.employee_id}>
                <td>{emp.full_name}</td>
                <td>{emp.department_name}</td>
                <td>{emp.position ?? '—'}</td>
                <td>{emp.email}</td>
                <td>{getEmployeeStatusLabel(emp.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
