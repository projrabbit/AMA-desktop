import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { mockDashboardSummary } from '@/lib/mocks/dashboardMocks';
import { dashboardService } from '@/services/dashboardService';
import type { ApiSuccess, DashboardSummaryData } from '@/types/api';
import { OverviewPage } from './OverviewPage';

vi.mock('@/services/dashboardService', () => ({
  dashboardService: {
    summary: vi.fn(),
  },
}));

const summaryMock = vi.mocked(dashboardService.summary);

function success(data: DashboardSummaryData): ApiSuccess<DashboardSummaryData> {
  return { success: true, data };
}

function renderOverview() {
  return render(
    <MemoryRouter>
      <OverviewPage />
    </MemoryRouter>,
  );
}

describe('OverviewPage', () => {
  beforeEach(() => {
    vi.useRealTimers();
    summaryMock.mockReset();
    summaryMock.mockResolvedValue(success(mockDashboardSummary));
  });

  it('loads the dashboard summary and renders the key overview sections', async () => {
    renderOverview();

    expect(screen.getByText('Đang tải dữ liệu...')).toBeInTheDocument();
    expect(await screen.findByText('Tổng quan chấm công hôm nay')).toBeInTheDocument();

    expect(summaryMock).toHaveBeenCalledWith(undefined);
    expect(screen.getByText('128')).toBeInTheDocument();
    expect(screen.getByText('96')).toBeInTheDocument();
    expect(screen.getAllByText('87,5%').length).toBeGreaterThan(0);
    expect(screen.getAllByText('4').length).toBeGreaterThan(0);
    expect(screen.getByText('Đi trễ')).toBeInTheDocument();
    expect(screen.getByText('Vắng mặt')).toBeInTheDocument();
    expect(screen.getByText('Minh Nguyễn')).toBeInTheDocument();
    expect(screen.getByText('Tòa nhà AMA - Tầng 3')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Xem ngoại lệ' })).toHaveAttribute('href', '/exceptions');
  });

  it('reloads summary data with the selected date', async () => {
    renderOverview();

    await screen.findByText('Tổng quan chấm công hôm nay');
    await userEvent.type(screen.getByLabelText('Ngày tổng quan'), '2026-05-23');

    expect(summaryMock).toHaveBeenLastCalledWith('2026-05-23');
  });

  it('shows an empty state when there are no employees or locations for the day', async () => {
    summaryMock.mockResolvedValue(
      success({
        ...mockDashboardSummary,
        total_employees: 0,
        checked_in_today: 0,
        on_time_count: 0,
        late_count: 0,
        early_leave_count: 0,
        absent_count: 0,
        fraud_alerts_today: 0,
        on_time_rate: 0,
        active_locations: [],
      }),
    );

    renderOverview();

    expect(await screen.findByText('Chưa có dữ liệu chấm công trong ngày này.')).toBeInTheDocument();
    expect(screen.getAllByText('Không có nhân viên đang hoạt động theo dữ liệu hiện tại.').length).toBe(
      2,
    );
  });

  it('shows an API error state when the summary cannot be loaded', async () => {
    summaryMock.mockRejectedValue(new Error('Server unavailable'));

    renderOverview();

    expect(await screen.findByText('Không thể tải tổng quan')).toBeInTheDocument();
    expect(screen.getByText('Vui lòng thử lại sau hoặc kiểm tra kết nối máy chủ.')).toBeInTheDocument();
  });

  it('polls the dashboard summary every 60 seconds', async () => {
    const intervalSpy = vi.spyOn(window, 'setInterval');
    const clearIntervalSpy = vi.spyOn(window, 'clearInterval');
    summaryMock.mockResolvedValue(success(mockDashboardSummary));

    const { unmount } = renderOverview();
    await screen.findByText('Tổng quan chấm công hôm nay');

    expect(intervalSpy).toHaveBeenCalledWith(expect.any(Function), 60_000);
    const pollHandler = intervalSpy.mock.calls.find((call) => call[1] === 60_000)?.[0];
    expect(pollHandler).toEqual(expect.any(Function));

    await act(async () => {
      if (typeof pollHandler === 'function') {
        pollHandler();
      }
      await Promise.resolve();
    });

    expect(summaryMock).toHaveBeenCalledTimes(2);

    const status = screen.getByText('Tự cập nhật mỗi 60 giây');
    expect(within(status.closest('section') ?? document.body).getByText('Sẵn sàng')).toBeInTheDocument();

    unmount();
    expect(clearIntervalSpy).toHaveBeenCalled();

    intervalSpy.mockRestore();
    clearIntervalSpy.mockRestore();
  });

  it('keeps the last summary visible when a poll refresh fails', async () => {
    const intervalSpy = vi.spyOn(window, 'setInterval');
    summaryMock.mockResolvedValueOnce(success(mockDashboardSummary));

    renderOverview();
    await screen.findByText('Tổng quan chấm công hôm nay');
    summaryMock.mockRejectedValueOnce(new Error('Temporary outage'));

    const pollHandler = intervalSpy.mock.calls.find((call) => call[1] === 60_000)?.[0];
    await act(async () => {
      if (typeof pollHandler === 'function') {
        pollHandler();
      }
      await Promise.resolve();
    });

    expect(screen.getByText('Tổng quan chấm công hôm nay')).toBeInTheDocument();
    expect(screen.getByText('128')).toBeInTheDocument();
    expect(screen.getByText('Không thể cập nhật dữ liệu mới')).toBeInTheDocument();

    intervalSpy.mockRestore();
  });
});
