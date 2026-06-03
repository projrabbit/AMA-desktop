import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { DatePicker } from '@/components/ui/DatePicker';
import { Select } from '@/components/ui/Select';
import { downloadBlob } from '@/lib/api/downloadBlob';
import { getErrorMessage } from '@/lib/api/getErrorMessage';
import { canPerform } from '@/lib/auth/permissions';
import { useSession } from '@/lib/auth/session';
import { formatDate, formatHoursFromMinutes, formatNumber, formatTime } from '@/lib/format';
import { getAttendanceStatusLabel } from '@/lib/i18n/labels';
import { departmentService } from '@/services/departmentService';
import { employeeService } from '@/services/employeeService';
import { reportService } from '@/services/reportService';
import type { AttendanceReportData, DepartmentItem, EmployeeListItem, ExportFormat } from '@/types/api';

const ALL = '';

function isoDaysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

export function ReportsPage() {
  const { role } = useSession();
  const canExport = canPerform('report:export', role);

  const [from, setFrom] = useState(isoDaysAgo(30));
  const [to, setTo] = useState(isoDaysAgo(0));
  const [departmentId, setDepartmentId] = useState(ALL);
  const [employeeId, setEmployeeId] = useState(ALL);

  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [employees, setEmployees] = useState<EmployeeListItem[]>([]);
  const [report, setReport] = useState<AttendanceReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState<ExportFormat | null>(null);

  useEffect(() => {
    async function loadFilters() {
      try {
        const [deptRes, empRes] = await Promise.all([
          departmentService.list(),
          employeeService.list({ limit: 200 }),
        ]);
        setDepartments(deptRes.data);
        setEmployees(empRes.data);
      } catch (err) {
        setError(getErrorMessage(err, 'Không thể tải bộ lọc báo cáo.'));
      }
    }
    void loadFilters();
    void runReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function buildParams() {
    return {
      from,
      to,
      department_id: departmentId ? Number(departmentId) : undefined,
      employee_id: employeeId ? Number(employeeId) : undefined,
    };
  }

  async function runReport() {
    if (!from || !to) {
      setError('Vui lòng chọn đầy đủ khoảng thời gian.');
      return;
    }
    if (from > to) {
      setError('Từ ngày phải nhỏ hơn hoặc bằng đến ngày.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const { data } = await reportService.attendance(buildParams());
      setReport(data);
    } catch (err) {
      setReport(null);
      setError(getErrorMessage(err, 'Không thể tải báo cáo. Vui lòng thử lại.'));
    } finally {
      setLoading(false);
    }
  }

  async function handleExport(format: ExportFormat) {
    setError(null);
    setExporting(format);
    try {
      const blob = await reportService.exportAttendance({ ...buildParams(), format });
      const ext = format === 'pdf' ? 'pdf' : 'xlsx';
      downloadBlob(blob, `bao-cao-cham-cong_${from}_${to}.${ext}`);
    } catch (err) {
      setError(getErrorMessage(err, 'Không thể xuất báo cáo. Vui lòng thử lại.'));
    } finally {
      setExporting(null);
    }
  }

  const summary = report?.summary;

  return (
    <section className="screen-stack">
      <header className="screen-header">
        <div>
          <h2>Báo cáo chấm công</h2>
          <p>Xem báo cáo theo khoảng thời gian, phòng ban, nhân viên và xuất file Excel/PDF.</p>
        </div>
      </header>

      <div className="filter-bar">
        <DatePicker label="Từ ngày" value={from} onChange={(event) => setFrom(event.target.value)} />
        <DatePicker label="Đến ngày" value={to} onChange={(event) => setTo(event.target.value)} />
        <Select
          label="Phòng ban"
          value={departmentId}
          onChange={(event) => setDepartmentId(event.target.value)}
          options={[
            { value: ALL, label: 'Tất cả phòng ban' },
            ...departments.map((d) => ({ value: String(d.department_id), label: d.name })),
          ]}
        />
        <Select
          label="Nhân viên"
          value={employeeId}
          onChange={(event) => setEmployeeId(event.target.value)}
          options={[
            { value: ALL, label: 'Tất cả nhân viên' },
            ...employees.map((e) => ({ value: String(e.employee_id), label: e.full_name })),
          ]}
        />
        <div className="filter-bar__actions">
          <Button onClick={runReport} disabled={loading}>
            {loading ? 'Đang tải...' : 'Xem báo cáo'}
          </Button>
          {canExport ? (
            <>
              <Button variant="secondary" onClick={() => handleExport('excel')} disabled={exporting !== null || !report}>
                {exporting === 'excel' ? 'Đang xuất...' : 'Xuất Excel'}
              </Button>
              <Button variant="secondary" onClick={() => handleExport('pdf')} disabled={exporting !== null || !report}>
                {exporting === 'pdf' ? 'Đang xuất...' : 'Xuất PDF'}
              </Button>
            </>
          ) : null}
        </div>
      </div>

      {error ? (
        <div className="ui-card" role="alert">
          <p style={{ color: '#b91c1c', margin: 0 }}>{error}</p>
        </div>
      ) : null}

      {summary ? (
        <div className="kpi-grid">
          <article className="kpi-card">
            <span>Ngày công</span>
            <strong>{formatNumber(summary.total_work_days)}</strong>
            <small>{formatNumber(summary.employee_count)} nhân viên</small>
          </article>
          <article className="kpi-card">
            <span>Tổng giờ làm</span>
            <strong>{formatHoursFromMinutes(summary.total_work_minutes)}</strong>
            <small>Tính từ giờ vào và giờ ra</small>
          </article>
          <article className="kpi-card">
            <span>Đi trễ / về sớm</span>
            <strong>
              {formatNumber(summary.late_count)} / {formatNumber(summary.early_leave_count)}
            </strong>
            <small>Số lượt cần theo dõi</small>
          </article>
          <article className="kpi-card">
            <span>Chấm công lỗi</span>
            <strong>{formatNumber(summary.rejected_count + summary.absent_count)}</strong>
            <small>Bị từ chối / vắng mặt</small>
          </article>
        </div>
      ) : null}

      <div className="table-wrap">
        <table className="ui-table">
          <caption>Báo cáo theo nhân viên</caption>
          <thead>
            <tr>
              <th scope="col">Nhân viên</th>
              <th scope="col">Phòng ban</th>
              <th scope="col">Ngày công</th>
              <th scope="col">Giờ làm</th>
              <th scope="col">Đi trễ</th>
              <th scope="col">Về sớm</th>
              <th scope="col">Lỗi</th>
            </tr>
          </thead>
          <tbody>
            {report && report.employees.length > 0 ? (
              report.employees.map((emp) => (
                <tr key={emp.employee_id}>
                  <td>{emp.full_name}</td>
                  <td>{emp.department_name}</td>
                  <td>{formatNumber(emp.work_days)}</td>
                  <td>{formatHoursFromMinutes(emp.total_work_minutes)}</td>
                  <td>{formatNumber(emp.late_count)}</td>
                  <td>{formatNumber(emp.early_leave_count)}</td>
                  <td>{formatNumber(emp.rejected_count + emp.absent_count)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="table-empty">
                  {loading ? 'Đang tải báo cáo...' : 'Không có dữ liệu báo cáo cho bộ lọc đã chọn.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {report && report.details.length > 0 ? (
        <div className="table-wrap">
          <table className="ui-table">
            <caption>Chi tiết theo ngày</caption>
            <thead>
              <tr>
                <th scope="col">Ngày</th>
                <th scope="col">Nhân viên</th>
                <th scope="col">Giờ vào</th>
                <th scope="col">Giờ ra</th>
                <th scope="col">Giờ làm</th>
                <th scope="col">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {report.details.map((day) => (
                <tr key={`${day.employee_id}-${day.date}`}>
                  <td>{formatDate(day.date)}</td>
                  <td>{day.full_name}</td>
                  <td>{formatTime(day.checkin_at)}</td>
                  <td>{formatTime(day.checkout_at)}</td>
                  <td>{formatHoursFromMinutes(day.worked_minutes)}</td>
                  <td>{getAttendanceStatusLabel(day.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
