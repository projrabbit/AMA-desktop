import { RemoteTablePage } from '@/components/data/RemoteTablePage';
import { formatYesNo } from '@/lib/format';
import { shiftService } from '@/services/shiftService';
import type { ShiftItem } from '@/types/api';

export function AdminShiftsPage() {
  return (
    <RemoteTablePage<ShiftItem>
      title="Quản trị ca làm việc"
      description="Danh sách ca làm việc lấy từ API shifts."
      load={() => shiftService.list()}
      getRowKey={(item) => item.shift_id}
      columns={[
        { header: 'Ca', render: (item) => item.name },
        { header: 'Nhân viên', render: (item) => item.employee_name ?? item.employee_id },
        { header: 'Giờ bắt đầu', render: (item) => item.start_time },
        { header: 'Giờ kết thúc', render: (item) => item.end_time },
        { header: 'Cho phép trễ', render: (item) => `${item.late_tolerance_min} phút` },
        { header: 'Cuối tuần', render: (item) => formatYesNo(item.apply_to_weekends) },
      ]}
    />
  );
}
