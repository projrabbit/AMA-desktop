### 3.5 Màn Hình 4.2: Quản Lý Tòa Nhà Và Tầng

| Thuộc tính | Mô tả |
| --- | --- |
| Đối tượng | Admin |
| Mục đích | Quản lý dữ liệu nền tòa nhà và tầng để hệ thống phân biệt vị trí theo độ cao |
| Sidebar active | Vùng chấm công |

Lý do cần màn hình này:

- Cùng một vị trí mặt đất có thể thuộc nhiều tầng khác nhau trong cùng một tòa nhà.
- Hệ thống cần biết tầng nào tương ứng với phạm vi độ cao nào để đối chiếu vùng chấm công chính xác.
- Dữ liệu tòa nhà và tầng là nền tảng để tạo vùng chấm công theo tầng và hiển thị bản đồ 3D.

Thành phần chính:

- Ghi chú giải thích vai trò của tòa nhà và tầng trong hệ thống.
- Bảng danh sách tòa nhà gồm tên, địa chỉ, số tầng, trạng thái bản đồ 3D và trạng thái sử dụng.
- Bảng danh sách tầng gồm số tầng, tên tầng, phạm vi tầng, vùng chấm công liên quan và ghi chú.
- Form tạo hoặc sửa tòa nhà gồm tên, địa chỉ, vị trí trung tâm, số tầng và mã lớp bản đồ 3D hoặc `arcgis_layer_id`.
- Form tạo hoặc sửa tầng gồm số tầng, tên tầng, `altitude_min` và `altitude_max`.
- Nút `Lưu tòa nhà / tầng` để lưu dữ liệu.
- Nút `Kiểm tra bản đồ 3D` để xác nhận dữ liệu bản đồ đã kết nối được hay chưa.

Luồng thao tác:

- Admin mở màn hình quản lý tòa nhà và tầng trong nhóm `Vùng chấm công`.
- Admin tạo tòa nhà với địa chỉ, vị trí trung tâm và số tầng.
- Admin tạo từng tầng và khai báo phạm vi tầng tương ứng.
- Admin kiểm tra kết nối bản đồ 3D nếu có mô hình tòa nhà.
- Sau khi hoàn tất, HR/Admin có thể dùng tầng đó để tạo vùng chấm công.

Trạng thái cần thể hiện:

- Tòa nhà đã kết nối bản đồ 3D.
- Tòa nhà chưa kết nối bản đồ 3D.
- Tầng đã có vùng chấm công.
- Tầng chưa có vùng chấm công.
