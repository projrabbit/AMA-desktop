import { useEffect, useState, type CSSProperties } from 'react';
import { Link } from 'react-router-dom';

import { LoadingState, PageState } from '@/components/page-states/PageState';
import { DatePicker } from '@/components/ui/DatePicker';
import { dashboardService } from '@/services/dashboardService';
import type { ActiveLocationItem, DashboardSummaryData } from '@/types/api';

const POLL_INTERVAL_MS = 60_000;

function formatNumber(value: number): string {
  return new Intl.NumberFormat('vi-VN').format(value);
}

function formatPercent(value: number): string {
  return `${new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 }).format(value)}%`;
}

function formatTime(value: string): string {
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(new Date(value));
}

function locationLabel(location: ActiveLocationItem): string {
  const building = location.building_name ?? 'Chưa xác định tòa nhà';
  const floor = location.floor_name ?? 'Chưa xác định tầng';
  return `${building} - ${floor}`;
}

function isEmptySummary(summary: DashboardSummaryData): boolean {
  return summary.total_employees === 0 && summary.active_locations.length === 0;
}

export function OverviewPage() {
  const [selectedDate, setSelectedDate] = useState('');
  const [summary, setSummary] = useState<DashboardSummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [refreshFailed, setRefreshFailed] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadSummary(showInitialLoading: boolean) {
      if (showInitialLoading) {
        setLoading(true);
        setRefreshFailed(false);
      } else {
        setRefreshing(true);
      }
      setError(false);

      try {
        const response = await dashboardService.summary(selectedDate || undefined);
        if (!cancelled) {
          setSummary(response.data);
          setRefreshFailed(false);
        }
      } catch {
        if (!cancelled) {
          if (showInitialLoading) {
            setSummary(null);
            setError(true);
          } else {
            setRefreshFailed(true);
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    }

    void loadSummary(true);
    const intervalId = window.setInterval(() => {
      void loadSummary(false);
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [selectedDate]);

  if (loading && !summary) {
    return <LoadingState />;
  }

  if (error || !summary) {
    return (
      <PageState
        title="Không thể tải tổng quan"
        description="Vui lòng thử lại sau hoặc kiểm tra kết nối máy chủ."
      />
    );
  }

  const reviewCount = summary.fraud_alerts_today;
  const activeLocations = summary.active_locations.slice(0, 5);

  return (
    <section className="overview-page" aria-labelledby="overview-title">
      <header className="overview-hero">
        <div>
          <p className="overview-eyebrow">Dashboard Tổng Quan</p>
          <h2 id="overview-title">Tổng quan chấm công hôm nay</h2>
          <p>Dữ liệu ngày {summary.date}. Theo dõi nhanh tình hình vào ca, đúng giờ và cảnh báo.</p>
        </div>
        <div className="overview-controls">
          <DatePicker
            label="Ngày tổng quan"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
          />
          <section className="overview-refresh-status" aria-label="Trạng thái tự cập nhật">
            <strong>{refreshing ? 'Đang cập nhật' : refreshFailed ? 'Cần kiểm tra' : 'Sẵn sàng'}</strong>
            <span>{refreshFailed ? 'Không thể cập nhật dữ liệu mới' : 'Tự cập nhật mỗi 60 giây'}</span>
          </section>
        </div>
      </header>

      {isEmptySummary(summary) ? (
        <section className="overview-empty" aria-live="polite">
          <h3>Chưa có dữ liệu chấm công trong ngày này.</h3>
          <p>KPI đang ở mức 0. Dữ liệu sẽ xuất hiện khi nhân viên bắt đầu chấm công.</p>
        </section>
      ) : null}

      <section className="overview-kpis" aria-label="Chỉ số chấm công chính">
        <article className="overview-kpi-card">
          <span>Tổng nhân viên</span>
          <strong>{formatNumber(summary.total_employees)}</strong>
          <small>Nhân sự đang hoạt động</small>
        </article>
        <article className="overview-kpi-card">
          <span>Đã chấm công vào</span>
          <strong>{formatNumber(summary.checked_in_today)}</strong>
          <small>{formatNumber(summary.on_time_count)} lượt đúng giờ</small>
        </article>
        <article className="overview-kpi-card">
          <span>Tỷ lệ đúng giờ</span>
          <strong>{formatPercent(summary.on_time_rate)}</strong>
          <small>So với giờ bắt đầu ca</small>
        </article>
        <article className="overview-kpi-card overview-kpi-card--warning">
          <span>Cần xem xét</span>
          <strong>{formatNumber(reviewCount)}</strong>
          <small>Cảnh báo gian lận hôm nay</small>
        </article>
      </section>

      <section className="overview-secondary-grid" aria-label="Chỉ số bổ sung">
        <article>
          <span>Đi trễ</span>
          <strong>{formatNumber(summary.late_count)}</strong>
        </article>
        <article>
          <span>Về sớm</span>
          <strong>{formatNumber(summary.early_leave_count)}</strong>
        </article>
        <article>
          <span>Vắng mặt</span>
          <strong>{formatNumber(summary.absent_count)}</strong>
        </article>
        <article>
          <span>Cảnh báo gian lận</span>
          <strong>{formatNumber(summary.fraud_alerts_today)}</strong>
        </article>
      </section>

      <section className="overview-insights-grid">
        <article className="overview-panel overview-map-panel">
          <div>
            <p className="overview-panel__label">Mini-map vị trí</p>
            <h3>Nhân viên đang hoạt động</h3>
          </div>
          {activeLocations.length > 0 ? (
            <div className="overview-location-map" aria-label="Phân bố nhân viên theo tòa nhà và tầng">
              {activeLocations.map((location, index) => (
                <span
                  key={location.employee_id}
                  className="overview-location-dot"
                  style={{ '--dot-index': index } as CSSProperties}
                  title={`${location.full_name} - ${locationLabel(location)}`}
                />
              ))}
            </div>
          ) : (
            <p>Không có nhân viên đang hoạt động theo dữ liệu hiện tại.</p>
          )}
        </article>

        <article className="overview-panel">
          <div>
            <p className="overview-panel__label">Tỷ lệ đúng giờ</p>
            <h3>Theo dữ liệu hiện có</h3>
          </div>
          <div className="overview-rate-chart" aria-label="Biểu đồ tỷ lệ đúng giờ toàn hệ thống">
            <span style={{ width: `${Math.min(Math.max(summary.on_time_rate, 0), 100)}%` }} />
          </div>
          <p>{formatPercent(summary.on_time_rate)} nhân viên chấm công đúng giờ trong dữ liệu tổng quan.</p>
        </article>

        <article className="overview-panel overview-alert-panel">
          <div>
            <p className="overview-panel__label">Cảnh báo nhanh</p>
            <h3>{reviewCount > 0 ? `${formatNumber(reviewCount)} lượt cần kiểm tra` : 'Không có cảnh báo mới'}</h3>
          </div>
          <p>
            {reviewCount > 0
              ? 'Ưu tiên rà soát các lượt có dấu hiệu bất thường về vị trí, thiết bị hoặc trạng thái.'
              : 'Hệ thống chưa ghi nhận bất thường trong ngày được chọn.'}
          </p>
          <Link className="overview-alert-link" to="/exceptions">
            Xem ngoại lệ
          </Link>
        </article>
      </section>

      <section className="overview-panel">
        <div>
          <p className="overview-panel__label">Danh sách nhanh</p>
          <h3>Vị trí chấm công gần nhất</h3>
        </div>
        <div className="overview-table-wrap">
          <table className="ui-table overview-table">
            <thead>
              <tr>
                <th>Nhân viên</th>
                <th>Phòng ban</th>
                <th>Trạng thái</th>
                <th>Vị trí gần nhất</th>
                <th>Thời gian</th>
              </tr>
            </thead>
            <tbody>
              {activeLocations.length > 0 ? (
                activeLocations.map((location) => (
                  <tr key={location.employee_id}>
                    <td>{location.full_name}</td>
                    <td>{location.department_name}</td>
                    <td>Đang làm việc</td>
                    <td>{locationLabel(location)}</td>
                    <td>{formatTime(location.last_checkin_at)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5}>Không có nhân viên đang hoạt động theo dữ liệu hiện tại.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}
