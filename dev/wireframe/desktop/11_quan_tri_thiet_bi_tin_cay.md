### 3.12 Màn Hình 11: Quản Trị - Thiết Bị Tin Cậy

| Thuộc tính | Mô tả |
| --- | --- |
| Đối tượng | Admin |
| Mục đích | Duyệt thiết bị mới và thu hồi thiết bị không còn được tin cậy |
| Sidebar active | Quản trị |
| Tab active | Thiết bị |

Thành phần chính:

- Bộ lọc thiết bị gồm tìm kiếm, trạng thái, hệ điều hành và phòng ban.
- Bảng thiết bị gồm nhân viên, mã thiết bị đã ẩn, hệ điều hành, thời điểm đăng ký, trạng thái và ghi chú.
- Panel chi tiết thiết bị gồm nhân viên, dòng máy, lần đăng ký, trạng thái và rủi ro.
- Nút `Duyệt thiết bị` để cho phép thiết bị được dùng chính thức.
- Nút `Thu hồi` để hủy trạng thái tin cậy.
- Wire note giải thích thiết bị chưa duyệt vẫn có thể bị đánh dấu cần xem xét khi chấm công.

Luồng thao tác:

- Admin mở tab `Thiết bị`.
- Admin lọc danh sách thiết bị đang chờ duyệt.
- Admin chọn thiết bị để xem chi tiết.
- Nếu thiết bị hợp lệ, Admin nhấn `Duyệt thiết bị`.
- Nếu thiết bị cũ hoặc đáng ngờ, Admin nhấn `Thu hồi`.

Trạng thái cần thể hiện:

- Thiết bị đã duyệt.
- Thiết bị chờ duyệt.
- Thiết bị đã thu hồi.
- Thiết bị mới có rủi ro cần xem xét.
