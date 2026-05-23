### 3.13 Màn Hình 12: Tra Cứu Nhật Ký Hệ Thống

| Thuộc tính | Mô tả |
| --- | --- |
| Đối tượng | Admin |
| Mục đích | Tra cứu lịch sử thao tác để kiểm tra và truy vết |
| Sidebar active | Nhật ký |

Thành phần chính:

- Bộ lọc nhật ký gồm người thao tác, loại thao tác, khu vực dữ liệu và khoảng thời gian.
- Nút `Tìm kiếm` để tải danh sách nhật ký.
- Bảng nhật ký gồm thời gian, người thao tác, hành động, dữ liệu liên quan và địa chỉ.
- Panel chi tiết thao tác mô tả nội dung thay đổi của log được chọn.
- Wire note cho biết nhật ký chỉ xem, không có nút sửa hoặc xóa.

Luồng thao tác:

- Admin mở mục `Nhật ký`.
- Admin nhập điều kiện lọc.
- Admin nhấn `Tìm kiếm`.
- Admin chọn một dòng log để xem chi tiết.
- Hệ thống hiển thị chi tiết ở chế độ chỉ đọc.

Trạng thái cần thể hiện:

- Không có log phù hợp.
- Có log và hiển thị chi tiết.
- Log chỉ đọc, không có hành động chỉnh sửa hoặc xóa.
