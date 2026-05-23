### 3.10 Màn Hình 9: Quản Trị - Phòng Ban

| Thuộc tính | Mô tả |
| --- | --- |
| Đối tượng | HR, Admin |
| Mục đích | Quản lý phòng ban, trưởng phòng và ca mặc định |
| Sidebar active | Quản trị |
| Tab active | Phòng ban |

Thành phần chính:

- Bảng phòng ban gồm tên phòng ban, trưởng phòng, số nhân viên, ca mặc định và trạng thái.
- Form tạo hoặc sửa phòng ban gồm tên phòng ban, trưởng phòng, ca làm mặc định và mô tả.
- Nút `Lưu phòng ban` để lưu thay đổi.
- Nút `Tạm ngưng` để ngưng sử dụng phòng ban.
- Wire note giải thích phòng ban dùng cho lọc báo cáo, gán ca theo nhóm và phân quyền quản lý nhân sự.

Luồng thao tác:

- HR/Admin mở tab `Phòng ban`.
- Người dùng xem danh sách phòng ban hiện có.
- Người dùng chọn một phòng ban để chỉnh sửa hoặc tạo mới.
- Người dùng chọn trưởng phòng và ca làm mặc định.
- Người dùng nhấn `Lưu phòng ban`.

Trạng thái cần thể hiện:

- Phòng ban đang dùng.
- Phòng ban tạm ngưng.
- Phòng ban chưa có trưởng phòng.
- Phòng ban chưa gán ca mặc định.
