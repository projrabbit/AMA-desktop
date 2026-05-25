import { Link } from 'react-router-dom';

export function AdminPage() {
  return (
    <section className="resource-page">
      <header className="resource-header">
        <div>
          <p className="overview-eyebrow">Quản trị hệ thống</p>
          <h2>Trung tâm dữ liệu quản trị</h2>
          <p>Đi vào từng khu vực để tải dữ liệu trực tiếp từ API.</p>
        </div>
      </header>
      <div className="admin-link-grid">
        <Link to="/admin/employees">Nhân viên</Link>
        <Link to="/admin/departments">Phòng ban</Link>
        <Link to="/admin/shifts">Ca làm việc</Link>
        <Link to="/admin/devices">Thiết bị</Link>
      </div>
    </section>
  );
}
