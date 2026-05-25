import { RemoteTablePage } from '@/components/data/RemoteTablePage';
import { formatDateTime, formatYesNo } from '@/lib/format';
import { attendanceService } from '@/services/attendanceService';

export function ExceptionsPage() {
  return (
    <RemoteTablePage<Record<string, unknown>>
      title="Ngoại lệ và cảnh báo"
      description="Danh sách ngoại lệ lấy từ API attendance/exceptions."
      load={() => attendanceService.exceptions()}
      getRowKey={(item, index) => String(item.record_id ?? index)}
      columns={[
        {
          header: 'Nhân viên',
          render: (item) => {
            const employee = item.employee as { full_name?: string; department_name?: string } | undefined;
            return employee?.department_name ? `${employee.full_name} - ${employee.department_name}` : employee?.full_name ?? 'N/A';
          },
        },
        { header: 'Loại', render: (item) => String(item.type ?? 'N/A') },
        { header: 'Thời gian', render: (item) => formatDateTime(item.timestamp as string | undefined) },
        { header: 'Trạng thái', render: (item) => String(item.status ?? 'N/A') },
        { header: 'Đi trễ', render: (item) => formatYesNo(Boolean(item.is_late)) },
        { header: 'Về sớm', render: (item) => formatYesNo(Boolean(item.is_early_leave)) },
        { header: 'Lý do', render: (item) => String(item.rejection_reason ?? 'N/A') },
      ]}
    />
  );
}
