### 3.7 Màn Hình 6: Quản Lý Ngoại Lệ Và Cảnh Báo Gian Lận

| Thuộc tính | Mô tả |
| --- | --- |
| Đối tượng | HR, Admin |
| Mục đích | Xem và xử lý các lượt chấm công bất thường |
| Sidebar active | Ngoại lệ |

Thành phần chính:

- Bộ lọc theo trạng thái, loại cảnh báo, từ ngày và đến ngày.
- Bảng danh sách ngoại lệ gồm thời gian, nhân viên, loại, lý do, mức tin cậy và trạng thái xử lý.
- Panel chi tiết ngoại lệ gồm mã lượt chấm, vị trí ghi nhận, khu vực cho phép, dấu hiệu gian lận, mức tin cậy và ghi chú.
- Các dấu hiệu cần thể hiện gồm ngoài vùng cho phép, GPS không đủ chính xác, mock location/GPS spoofing, thiết bị lạ, sai khuôn mặt, liveness fail hoặc nghi ngờ chấm công hộ.
- Nút `Phê duyệt thủ công` để chuyển lượt chấm công thành hợp lệ sau khi HR kiểm tra.
- Nút `Giữ từ chối` để giữ nguyên trạng thái bị từ chối.
- Ghi chú cho biết mọi thao tác xử lý đều được lưu vào nhật ký hệ thống.

Luồng thao tác:

- HR/Admin mở mục `Ngoại lệ`.
- Người dùng lọc danh sách theo loại bất thường.
- Người dùng chọn một lượt chấm công để xem chi tiết.
- Nếu lý do hợp lệ, người dùng phê duyệt thủ công.
- Nếu dữ liệu không đáng tin cậy, người dùng giữ trạng thái từ chối.
- Hệ thống lưu lại thao tác xử lý vào nhật ký.

Trạng thái cần thể hiện:

- Ngoại lệ đang chờ xử lý.
- Ngoại lệ đã được duyệt thủ công.
- Ngoại lệ giữ từ chối.
- Không có ngoại lệ trong khoảng thời gian được chọn.
