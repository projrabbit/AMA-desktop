import { useEffect, useState } from 'react';

import { ErrorState, LoadingState } from '@/components/page-states/PageState';
import { DatePicker } from '@/components/ui/DatePicker';
import { formatDateTime, formatMinutes } from '@/lib/format';
import { reportService } from '@/services/reportService';
import type { AttendanceReportData } from '@/types/api';

function isoDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function defaultRange() {
  const today = new Date();
  const from = new Date(today);
  from.setDate(today.getDate() - 30);
  return { from: isoDate(from), to: isoDate(today) };
}

export function ReportsPage() {
  const [range, setRange] = useState(defaultRange);
  const [report, setReport] = useState<AttendanceReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadReport() {
      setLoading(true);
      setError(false);
      try {
        const response = await reportService.attendance(range);
        if (!cancelled) {
          setReport(response.data);
        }
      } catch {
        if (!cancelled) {
          setReport(null);
          setError(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadReport();

    return () => {
      cancelled = true;
    };
  }, [range]);

  if (loading) {
    return <LoadingState />;
  }

  if (error || !report) {
    return <ErrorState />;
  }

  const summary = report.summary;

  return (
    <section className="resource-page">
      <header className="resource-header">
        <div>
          <p className="overview-eyebrow">Báo cáo thực</p>
          <h2>Báo cáo chấm công</h2>
          <p>Dữ liệu tổng hợp lấy từ API reports/attendance.</p>
        </div>
        <div className="overview-controls">
          <DatePicker
            label="Từ ngày"
            value={range.from}
            onChange={(event) => setRange((current) => ({ ...current, from: event.target.value }))}
          />
          <DatePicker
            label="Đến ngày"
            value={range.to}
            onChange={(event) => setRange((current) => ({ ...current, to: event.target.value }))}
          />
        </div>
      </header>

      <section className="overview-secondary-grid" aria-label="Tổng hợp báo cáo">
        <article>
          <span>Nhân viên</span>
          <strong>{summary.employee_count ?? report.employees.length}</strong>
        </article>
        <article>
          <span>Ngày công</span>
          <strong>{summary.total_work_days ?? summary.work_days ?? 0}</strong>
        </article>
        <article>
          <span>Tổng giờ</span>
          <strong>{formatMinutes(summary.total_work_minutes ?? Math.round((summary.total_hours ?? 0) * 60))}</strong>
        </article>
        <article>
          <span>Đi trễ</span>
          <strong>{summary.late_count}</strong>
        </article>
      </section>

      <div className="overview-table-wrap">
        <table className="ui-table">
          <thead>
            <tr>
              <th>Nhân viên</th>
              <th>Phòng ban</th>
              <th>Ngày công</th>
              <th>Tổng giờ</th>
              <th>Đi trễ</th>
              <th>Về sớm</th>
            </tr>
          </thead>
          <tbody>
            {report.employees.map((employee) => (
              <tr key={employee.employee_id}>
                <td>{employee.full_name}</td>
                <td>{employee.department_name}</td>
                <td>{employee.work_days}</td>
                <td>{formatMinutes(employee.total_work_minutes ?? Math.round((employee.total_hours ?? 0) * 60))}</td>
                <td>{employee.late_count}</td>
                <td>{employee.early_leave_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="overview-table-wrap">
        <table className="ui-table">
          <thead>
            <tr>
              <th>Ngày</th>
              <th>Nhân viên</th>
              <th>Vào</th>
              <th>Ra</th>
              <th>Thời lượng</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {report.details.slice(0, 20).map((detail, index) => (
              <tr key={`${detail.employee_id}-${detail.date}-${index}`}>
                <td>{detail.date}</td>
                <td>{detail.full_name ?? detail.employee_id}</td>
                <td>{formatDateTime(detail.checkin_at)}</td>
                <td>{formatDateTime(detail.checkout_at)}</td>
                <td>{formatMinutes(detail.worked_minutes ?? Math.round((detail.total_hours ?? 0) * 60))}</td>
                <td>{detail.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
