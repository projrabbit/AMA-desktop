### 3.9 Màn Hình 8: Quản Trị - Nhân Viên

| Thuộc tính | Mô tả |
| --- | --- |
| Đối tượng | HR, Admin |
| Mục đích | Quản lý hồ sơ nhân viên và tài khoản đăng nhập liên quan |
| Sidebar active | Quản trị |
| Tab active | Nhân viên |

Thành phần chính:

- Bộ lọc nhân viên gồm tìm kiếm, phòng ban, trạng thái và ca làm.
- Nút `Tìm kiếm` để lọc danh sách.
- Nút `Thêm nhân viên` để mở form tạo mới.
- Bảng nhân viên gồm tên, phòng ban, chức vụ, email, ca làm, thiết bị và trạng thái.
- Form thông tin nhân viên gồm họ tên, email công ty, phòng ban, chức vụ, số điện thoại, ngày vào làm và ca làm mặc định.
- Nút `Lưu nhân viên` để tạo hoặc cập nhật.
- Nút `Vô hiệu hóa` để ngưng tài khoản nhân viên.
- Wire note giải thích việc tạo tài khoản đăng nhập bằng email công ty khi thêm nhân viên.

Luồng thao tác:

- HR/Admin mở tab `Nhân viên` trong nhóm Quản trị.
- Người dùng lọc hoặc tìm nhân viên cần chỉnh sửa.
- Người dùng chọn một nhân viên trong bảng.
- Form bên phải hiển thị thông tin nhân viên được chọn.
- Người dùng cập nhật thông tin và nhấn `Lưu nhân viên`.
- Nếu nhân viên nghỉ việc, người dùng nhấn `Vô hiệu hóa`.

Trạng thái cần thể hiện:

- Nhân viên đang làm.
- Nhân viên đã ngưng.
- Email bị trùng khi tạo mới.
- Thiết bị của nhân viên chưa duyệt.
