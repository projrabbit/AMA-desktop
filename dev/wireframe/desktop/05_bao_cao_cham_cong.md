### 3.6 Màn Hình 5: Báo Cáo Chấm Công

| Thuộc tính | Mô tả |
| --- | --- |
| Đối tượng | CEO, HR, Admin |
| Mục đích | Xem báo cáo chấm công theo khoảng thời gian và xuất file |
| Sidebar active | Báo cáo |

Thành phần chính:

- Bộ lọc báo cáo gồm từ ngày, đến ngày, phòng ban và nhân viên.
- Nút `Xem báo cáo` để tải dữ liệu theo bộ lọc.
- Nút `Xuất Excel` và `Xuất PDF` để tải file báo cáo.
- Card `Ngày công` thể hiện tổng ngày công trong kỳ.
- Card `Tổng giờ làm` thể hiện tổng giờ làm đã tính từ giờ vào và giờ ra.
- Card `Đi trễ / về sớm` thể hiện số lượt cần theo dõi.
- Card `Chấm công lỗi` thể hiện số lượt ngoài vùng hoặc dữ liệu không hợp lệ.
- Bảng báo cáo theo nhân viên gồm phòng ban, ngày công, giờ làm, số lượt trễ, số lượt về sớm, lỗi và ghi chú.

Luồng thao tác:

- Người dùng vào mục `Báo cáo`.
- Người dùng chọn khoảng thời gian, phòng ban hoặc nhân viên.
- Người dùng nhấn `Xem báo cáo`.
- Hệ thống hiển thị KPI tổng hợp và bảng chi tiết.
- Người dùng nhấn `Xuất Excel` hoặc `Xuất PDF` nếu cần tải báo cáo.

Trạng thái cần thể hiện:

- Nếu bộ lọc không có dữ liệu, hiển thị thông báo không có dữ liệu.
- Nếu đang tạo file xuất, hiển thị trạng thái đang xử lý.
- Nếu xuất file thất bại, hiển thị lỗi và cho phép thử lại.
