### 3.3 Màn Hình 3: Bản Đồ 3D Theo Thời Gian Gần Thực

| Thuộc tính | Mô tả |
| --- | --- |
| Đối tượng | HR, Admin |
| Mục đích | Theo dõi vị trí nhân viên đang làm việc trên bản đồ 3D |
| Sidebar active | Bản đồ 3D |

Thành phần chính:

- Khu vực bản đồ 3D chiếm phần lớn màn hình.
- Marker nhân viên thể hiện vị trí hiện tại hoặc vị trí chấm công gần nhất.
- Stack tầng bên trong bản đồ giúp hình dung nhân viên đang ở tầng nào.
- Bộ lọc theo tòa nhà, tầng và phòng ban.
- Panel chi tiết nhân viên được chọn gồm tên nhân viên, vị trí ghi nhận, khu vực và trạng thái.
- Ghi chú cho biết danh sách tự cập nhật từ các lượt chấm công hợp lệ trong ngày.

Luồng thao tác:

- HR/Admin mở mục `Bản đồ 3D`.
- Hệ thống tải bản đồ tòa nhà và marker nhân viên đang làm việc.
- HR/Admin lọc theo tòa nhà, tầng hoặc phòng ban.
- HR/Admin chọn một marker để xem thông tin nhân viên.
- Bản đồ tự cập nhật theo chu kỳ để phản ánh thay đổi vị trí hoặc trạng thái chấm công.

Trạng thái cần thể hiện:

- Khi không có nhân viên đang làm việc, bản đồ hiển thị trạng thái trống.
- Khi chọn marker, panel chi tiết phải cập nhật tương ứng.
- Khi bộ lọc không có kết quả, bản đồ hiển thị thông báo không tìm thấy nhân viên phù hợp.
