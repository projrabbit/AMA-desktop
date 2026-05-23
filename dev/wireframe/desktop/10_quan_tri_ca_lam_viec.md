### 3.11 Màn Hình 10: Quản Trị - Ca Làm Việc

| Thuộc tính | Mô tả |
| --- | --- |
| Đối tượng | HR, Admin |
| Mục đích | Tạo ca làm, sửa ca và gán ca cho phòng ban hoặc nhân viên |
| Sidebar active | Quản trị |
| Tab active | Ca làm việc |

Thành phần chính:

- Bảng ca làm việc gồm tên ca, giờ vào, giờ ra, cho phép trễ, cho phép về sớm và đối tượng áp dụng.
- Khối `Gán ca nhanh` gồm gán cho phòng ban hoặc nhân viên, đối tượng và ca làm.
- Form tạo hoặc sửa ca gồm tên ca, giờ vào, giờ ra, mức cho phép đi trễ, mức cho phép về sớm và áp dụng cuối tuần.
- Wire note cảnh báo nếu giờ ca bị trùng với ca khác hoặc thay đổi ca đang được áp dụng.
- Nút `Lưu ca` để lưu cấu hình.
- Nút `Hủy` để bỏ thay đổi.

Luồng thao tác:

- HR/Admin mở tab `Ca làm việc`.
- Người dùng xem danh sách ca hiện có.
- Người dùng tạo ca mới hoặc chọn ca để sửa.
- Người dùng gán ca cho phòng ban hoặc nhân viên.
- Nếu ca bị trùng giờ hoặc ảnh hưởng dữ liệu đang dùng, hệ thống hiển thị cảnh báo.
- Người dùng xác nhận và lưu ca.

Trạng thái cần thể hiện:

- Ca đang áp dụng.
- Ca có xung đột thời gian.
- Ca đang được gán cho phòng ban.
- Ca đang được gán cho nhân viên riêng lẻ.
