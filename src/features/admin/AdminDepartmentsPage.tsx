import { RemoteTablePage } from '@/components/data/RemoteTablePage';
import { departmentService } from '@/services/departmentService';
import type { DepartmentItem } from '@/types/api';

export function AdminDepartmentsPage() {
  return (
    <RemoteTablePage<DepartmentItem>
      title="Quản trị phòng ban"
      description="Danh sách phòng ban lấy từ API departments."
      load={() => departmentService.list({ limit: 50 })}
      getRowKey={(item) => item.department_id}
      columns={[
        { header: 'Phòng ban', render: (item) => item.name },
        { header: 'Mô tả', render: (item) => item.description ?? 'N/A' },
        { header: 'Quản lý', render: (item) => item.manager_name ?? item.manager_id ?? 'Chưa gán' },
        { header: 'Nhân viên', render: (item) => item.employee_count ?? 0 },
      ]}
    />
  );
}
