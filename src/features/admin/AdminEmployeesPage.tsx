import { RemoteTablePage } from '@/components/data/RemoteTablePage';
import { employeeService } from '@/services/employeeService';
import type { EmployeeInfo } from '@/types/api';

export function AdminEmployeesPage() {
  return (
    <RemoteTablePage<EmployeeInfo>
      title="Quản trị nhân viên"
      description="Danh sách nhân viên lấy từ API employees."
      load={() => employeeService.list({ limit: 50 })}
      getRowKey={(item) => item.employee_id}
      columns={[
        { header: 'Nhân viên', render: (item) => item.full_name },
        { header: 'Email', render: (item) => item.email },
        { header: 'Phòng ban', render: (item) => item.department_name ?? item.department_id },
        { header: 'Vị trí', render: (item) => item.position ?? 'N/A' },
        { header: 'Trạng thái', render: (item) => item.status },
        { header: 'Vai trò', render: (item) => item.account?.role ?? 'N/A' },
      ]}
    />
  );
}
