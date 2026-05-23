### 3.4 Màn Hình 4: Quản Lý Vùng Chấm Công 3D

| Thuộc tính | Mô tả |
| --- | --- |
| Đối tượng | HR, Admin |
| Mục đích | Tạo, sửa, vô hiệu hóa vùng chấm công theo tòa nhà, tầng và khu vực làm việc |
| Sidebar active | Vùng chấm công |

Thành phần chính:

- Bản đồ 3D để chọn tòa nhà, chọn tầng và vẽ khu vực chấm công.
- Stack tầng giúp người quản trị chọn đúng tầng cần cấu hình.
- Form tạo hoặc sửa vùng chấm công gồm tòa nhà, tầng, tên vùng, tọa độ trung tâm lat/lng, khu vực áp dụng, bán kính, độ cao và phạm vi độ cao áp dụng cho tầng.
- Nút `Lưu vùng chấm công` để lưu cấu hình.
- Nút `Vô hiệu hóa` để tạm tắt vùng không còn sử dụng.
- Bảng danh sách vùng chấm công gồm tên vùng, tòa nhà, tầng, bán kính, phạm vi và trạng thái.
- Khối tạo nhanh tòa nhà/tầng để hỗ trợ cấu hình dữ liệu nền ngay trong luồng tạo vùng.

Luồng thao tác:

- HR/Admin mở mục `Vùng chấm công`.
- Người dùng chọn tòa nhà và tầng trên bản đồ.
- Người dùng nhập thông tin vùng chấm công hoặc chọn điểm trung tâm trực tiếp trên bản đồ.
- Người dùng nhấn `Lưu vùng chấm công`.
- Nếu vùng mới bị trùng vùng đã có, hệ thống hiển thị cảnh báo để chỉnh lại.
- Nếu vùng hợp lệ, hệ thống lưu và hiển thị vùng trên bản đồ.

Trạng thái cần thể hiện:

- Vùng đang dùng hiển thị trạng thái `Đang dùng`.
- Vùng bị tắt hiển thị trạng thái `Tạm tắt`.
- Khi thiếu tòa nhà hoặc tầng, form cần hướng người dùng tạo dữ liệu nền trước.
