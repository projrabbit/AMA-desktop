### 3.2 Màn Hình 2: Dashboard Tổng Quan

| Thuộc tính | Mô tả |
| --- | --- |
| Đối tượng | CEO, HR, Admin |
| Mục đích | Cung cấp cái nhìn nhanh về tình hình chấm công trong ngày |
| Sidebar active | Tổng quan |

Thành phần chính:

- Sidebar điều hướng chính gồm 7 mục: Tổng quan, Bản đồ 3D, Vùng chấm công, Báo cáo, Ngoại lệ, Quản trị, Nhật ký.
- Topbar hiển thị tiêu đề `Tổng quan chấm công hôm nay`, trạng thái tự cập nhật và thông tin người dùng.
- Card `Tổng nhân viên` cho biết số nhân viên đang hoạt động.
- Card `Đã chấm công vào` cho biết số nhân viên đã chấm công vào trong ngày.
- Card `Tỷ lệ đúng giờ` cho biết tỷ lệ nhân viên chấm công đúng giờ so với giờ bắt đầu ca.
- Card `Cần xem xét` cho biết số lượt có vị trí, thiết bị hoặc trạng thái bất thường.
- Placeholder bản đồ nhỏ hiển thị phân bố nhân viên đang làm việc theo tòa nhà và tầng.
- Placeholder biểu đồ tỷ lệ đúng giờ theo phòng ban.
- Bảng danh sách nhanh gồm nhân viên, phòng ban, trạng thái, vị trí gần nhất và thời gian.
- Panel cảnh báo nhanh hiển thị số lượt ngoài vùng và các trường hợp bất thường.

Luồng thao tác:

- Người dùng đăng nhập thành công và vào màn hình Tổng quan.
- Người dùng xem KPI để nắm tình hình chấm công trong ngày.
- Người dùng chọn `Xem ngoại lệ` nếu muốn xử lý các lượt cần kiểm tra.
- Dashboard tự cập nhật định kỳ để phản ánh dữ liệu mới.

Trạng thái cần thể hiện:

- Khi chưa có dữ liệu trong ngày, KPI hiển thị 0 và bảng danh sách trống.
- Khi có cảnh báo, card `Cần xem xét` và panel cảnh báo nhanh cần nổi bật hơn các thông tin thông thường.
- Khi nhân viên đang làm việc, mini-map hiển thị vị trí theo tòa nhà và tầng.
