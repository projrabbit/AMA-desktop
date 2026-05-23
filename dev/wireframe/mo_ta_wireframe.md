# Mô Tả Wireframe Giao Diện - Hệ Thống Chấm Công Thông Minh

Tài liệu này mô tả chi tiết các màn hình wireframe đã được dựng trong 2 file HTML:

| Nhóm giao diện | File wireframe | Đối tượng sử dụng |
| --- | --- | --- |
| Web Dashboard | `wireframe_dashboard.html` | CEO, HR, Admin |
| Mobile App | `wireframe_mobile_app.html` | Nhân viên |

Các wireframe hiện tại là bản phác thảo giao diện mức thấp, tập trung vào bố cục, luồng thao tác và thông tin cần hiển thị. Đây chưa phải giao diện hoàn thiện về màu sắc, typography hoặc visual design.

## 1. Quy Ước Thiết Kế Wireframe

| Quy ước | Ý nghĩa |
| --- | --- |
| Khung viền lớn | Một màn hình hoặc một vùng chức năng chính |
| Sidebar / Bottom nav | Điều hướng chính của hệ thống |
| Card KPI | Chỉ số tổng quan cần nhìn nhanh |
| Bảng dữ liệu | Danh sách bản ghi để quản lý hoặc tra cứu |
| Form | Khu vực nhập, lọc, tạo mới hoặc cập nhật dữ liệu |
| Placeholder bản đồ | Khu vực sau này tích hợp bản đồ 3D hoặc mini-map |
| Wire note | Ghi chú nghiệp vụ để giải thích mục đích của vùng giao diện |

## 2. Tổng Quan Web Dashboard

Web Dashboard phục vụ nhóm người dùng quản lý gồm CEO, HR và Admin. Dashboard tập trung vào việc theo dõi tình hình chấm công, giám sát vị trí nhân viên trên bản đồ 3D, cấu hình vùng chấm công, xử lý ngoại lệ, quản trị dữ liệu hệ thống và tra cứu nhật ký.

### 2.1 Cấu Trúc Điều Hướng Dashboard

Sidebar điều hướng của Dashboard được chuẩn hóa thống nhất trên các màn hình sau khi đăng nhập.

| Mục điều hướng | Mục đích | Có wireframe |
| --- | --- | --- |
| Tổng quan | Xem KPI chấm công trong ngày và cảnh báo nhanh | Có |
| Bản đồ 3D | Theo dõi vị trí nhân viên theo tòa nhà và tầng | Có |
| Vùng chấm công | Quản lý vùng chấm công, tòa nhà và tầng | Có |
| Báo cáo | Xem và xuất báo cáo chấm công | Có |
| Ngoại lệ | Xử lý lượt chấm công bất thường | Có |
| Quản trị | Quản lý nhân viên, phòng ban, ca làm việc và thiết bị | Có |
| Nhật ký | Tra cứu nhật ký thao tác hệ thống | Có |

Mục `Quản trị` có các màn hình con riêng cho `Nhân viên`, `Phòng ban`, `Ca làm việc` và `Thiết bị`. Các chức năng này không tách thành menu sidebar riêng để giữ navbar gọn, nhưng đều có wireframe chi tiết.

Mục `Vùng chấm công` có màn hình riêng cho `Tòa nhà và tầng`, vì tòa nhà/tầng là dữ liệu nền để phân biệt vị trí theo tầng khi dùng bản đồ 3D và dữ liệu độ cao.

## 3. Chi Tiết Màn Hình Web Dashboard

### 3.1 Màn Hình 1: Đăng Nhập Dashboard

| Thuộc tính | Mô tả |
| --- | --- |
| Đối tượng | CEO, HR, Admin |
| Mục đích | Cho phép người dùng quản lý đăng nhập vào Web Dashboard bằng tài khoản công ty |
| Điều hướng sau đăng nhập | Chuyển đến Dashboard tổng quan hoặc màn hình phù hợp với quyền người dùng |

Thành phần chính:

- Khu vực nhận diện hệ thống gồm logo hoặc tên hệ thống.
- Form đăng nhập gồm email công ty và mật khẩu.
- Vùng mô tả nhóm quyền CEO, HR hoặc Admin sau xác thực; vai trò thực tế được hệ thống xác định từ tài khoản, không phải trường người dùng tự chọn.
- Nút `Đăng nhập` để gửi thông tin xác thực.
- Vùng thông báo lỗi cho các trường hợp sai mật khẩu, tài khoản bị khóa hoặc không có quyền truy cập Dashboard.

Luồng thao tác:

- Người dùng mở màn hình đăng nhập.
- Người dùng nhập email công ty và mật khẩu.
- Người dùng nhấn `Đăng nhập`.
- Nếu thông tin hợp lệ, hệ thống mở Web Dashboard.
- Nếu thông tin không hợp lệ, hệ thống hiển thị lỗi rõ ràng ngay trên form.

### 3.2 Màn Hình 2: Dashboard Tổng Quan

| Thuộc tính | Mô tả |
| --- | --- |
| Đối tượng | CEO, HR, Admin |
| Mục đích | Cung cấp cái nhìn nhanh về tình hình chấm công trong ngày |
| Sidebar active | Tổng quan |

Thành phần chính:

- Sidebar điều hướng chính gồm 7 mục: Tổng quan, Bản đồ 3D, Vùng chấm công, Báo cáo, Ngoại lệ, Quản trị, Nhật ký.
- Topbar hiển thị tiêu đề `Tổng quan chấm công hôm nay`, trạng thái tự cập nhật và thông tin người dùng.
- Card `Tổng nhân viên` cho biết số nhân viên đang hoạt động.
- Card `Đã chấm công vào` cho biết số nhân viên đã chấm công vào trong ngày.
- Card `Tỷ lệ đúng giờ` cho biết tỷ lệ nhân viên chấm công đúng giờ so với giờ bắt đầu ca.
- Card `Cần xem xét` cho biết số lượt có vị trí, thiết bị hoặc trạng thái bất thường.
- Placeholder bản đồ nhỏ hiển thị phân bố nhân viên đang làm việc theo tòa nhà và tầng.
- Placeholder biểu đồ tỷ lệ đúng giờ theo phòng ban.
- Bảng danh sách nhanh gồm nhân viên, phòng ban, trạng thái, vị trí gần nhất và thời gian.
- Panel cảnh báo nhanh hiển thị số lượt ngoài vùng và các trường hợp bất thường.

Luồng thao tác:

- Người dùng đăng nhập thành công và vào màn hình Tổng quan.
- Người dùng xem KPI để nắm tình hình chấm công trong ngày.
- Người dùng chọn `Xem ngoại lệ` nếu muốn xử lý các lượt cần kiểm tra.
- Dashboard tự cập nhật định kỳ để phản ánh dữ liệu mới.

Trạng thái cần thể hiện:

- Khi chưa có dữ liệu trong ngày, KPI hiển thị 0 và bảng danh sách trống.
- Khi có cảnh báo, card `Cần xem xét` và panel cảnh báo nhanh cần nổi bật hơn các thông tin thông thường.
- Khi nhân viên đang làm việc, mini-map hiển thị vị trí theo tòa nhà và tầng.

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

### 3.8 Màn Hình 7: Quản Trị Hệ Thống

| Thuộc tính | Mô tả |
| --- | --- |
| Đối tượng | HR, Admin |
| Mục đích | Màn hình tổng quan cho nhóm chức năng quản trị vận hành |
| Sidebar active | Quản trị |

Thành phần chính:

- Tab `Nhân viên` để quản lý hồ sơ nhân viên.
- Tab `Phòng ban` để quản lý cơ cấu tổ chức.
- Tab `Ca làm việc` để tạo và gán ca.
- Tab `Thiết bị` để duyệt thiết bị dùng cho chấm công.
- Bảng nhân viên tóm tắt gồm phòng ban, chức vụ, email, ca, thiết bị và trạng thái.
- Form tạo hoặc cập nhật nhân viên nhanh.
- Card tóm tắt ca làm việc.
- Card tóm tắt thiết bị tin cậy.
- Card tóm tắt phòng ban.

Vai trò của màn hình này:

- Đây là trang vào nhóm `Quản trị` để người dùng nhìn nhanh các dữ liệu vận hành.
- Các tab trong màn hình này có wireframe chi tiết riêng ở các màn hình 8, 9, 10 và 11.

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

## 4. Tổng Quan Mobile App

Mobile App phục vụ nhân viên. Ứng dụng tập trung vào việc chấm công nhanh, xác minh vị trí và khuôn mặt, nhận phản hồi tức thời, xem lịch sử, đọc thông báo và quản lý thông tin tài khoản/thiết bị.

### 4.1 Cấu Trúc Điều Hướng Mobile

Bottom navigation của Mobile App gồm 4 tab chính.

| Tab | Mục đích | Có wireframe |
| --- | --- | --- |
| Trang chủ | Chấm công vào/ra và xem trạng thái hôm nay | Có |
| Lịch sử | Xem lịch sử chấm công cá nhân | Có |
| Thông báo | Xem thông báo hệ thống, nhắc chấm công và phản hồi từ HR | Có |
| Tài khoản | Xem thông tin cá nhân và thiết bị đang dùng | Có |

Màn hình `Thông báo trạng thái` là màn hình phản hồi tức thời sau khi nhân viên chấm công. Màn hình này không phải tab riêng, nhưng được hiển thị trong luồng thao tác sau khi nhấn chấm công vào hoặc chấm công ra.

## 5. Chi Tiết Màn Hình Mobile App

### 5.1 Màn Hình 1: Đăng Nhập

| Thuộc tính | Mô tả |
| --- | --- |
| Đối tượng | Nhân viên |
| Mục đích | Cho phép nhân viên đăng nhập vào ứng dụng bằng tài khoản công ty |
| Điều hướng sau đăng nhập | Chuyển đến tab Trang chủ |

Thành phần chính:

- Logo hoặc tên công ty.
- Trường nhập email công ty.
- Trường nhập mật khẩu.
- Nút `Đăng nhập`.
- Nút `Quên mật khẩu`.
- Vùng thông báo lỗi cho sai mật khẩu, tài khoản bị khóa hoặc lỗi kết nối.

Luồng thao tác:

- Nhân viên mở app.
- Nhân viên nhập email công ty và mật khẩu.
- Nhân viên nhấn `Đăng nhập`.
- Nếu hợp lệ, app chuyển đến Trang chủ.
- Nếu lỗi, app hiển thị thông báo lỗi ngay trên màn hình.

### 5.2 Màn Hình 2: Trang Chủ Chấm Công

| Thuộc tính | Mô tả |
| --- | --- |
| Đối tượng | Nhân viên |
| Mục đích | Là màn hình chính để chấm công vào/ra và xem trạng thái trong ngày |
| Bottom nav active | Trang chủ |

Thành phần chính:

- Lời chào nhân viên và thông tin ca làm hiện tại.
- Card `Chấm công vào gần nhất`.
- Card `Giờ làm hôm nay`.
- Khối trạng thái gồm vị trí, định vị, độ chính xác GPS và trạng thái thiết bị tin cậy.
- Bản đồ nhỏ hoặc vùng hiển thị vị trí hiện tại trong vùng cho phép.
- Nút `Chấm công vào`.
- Nút `Chấm công ra`.
- Wire note giải thích app tự kiểm tra vị trí, thiết bị và khuôn mặt khi chấm công.

Luồng thao tác:

- Nhân viên mở tab `Trang chủ`.
- App hiển thị ca làm và trạng thái vị trí hiện tại.
- Nhân viên nhấn `Chấm công vào` khi bắt đầu ca.
- Nhân viên nhấn `Chấm công ra` khi kết thúc ca.
- Sau khi nhấn, app chuyển sang màn hình xác minh.

Trạng thái cần thể hiện:

- Chưa chấm công vào.
- Đã chấm công vào.
- Đã chấm công ra.
- Vị trí chưa sẵn sàng.
- Thiết bị đang chờ duyệt tin cậy.

### 5.3 Màn Hình 3: Xác Minh Vị Trí Và Gương Mặt

| Thuộc tính | Mô tả |
| --- | --- |
| Đối tượng | Nhân viên |
| Mục đích | Xác nhận nhanh vị trí, thiết bị và khuôn mặt trước khi ghi nhận chấm công |
| Nguồn mở màn hình | Sau khi nhấn chấm công vào hoặc chấm công ra |

Thành phần chính:

- Khung camera selfie để kiểm tra đúng người đang chấm công.
- Danh sách bước xác minh gồm lấy vị trí GPS 3D, kiểm tra độ tin cậy của vị trí, xác nhận khuôn mặt, kiểm tra liveness và kiểm tra vùng cho phép.
- Dữ liệu gửi đi gồm latitude, longitude, altitude, gps_accuracy, device_fingerprint, ảnh selfie và tín hiệu liveness.
- Nút `Gửi yêu cầu chấm công`.
- Nút `Hủy`.

Luồng thao tác:

- Nhân viên nhấn chấm công ở Trang chủ.
- App mở màn hình xác minh.
- Nhân viên chụp selfie hoặc cho phép camera xác nhận.
- App kiểm tra vị trí GPS 3D, độ chính xác GPS, thiết bị và tín hiệu khuôn mặt/liveness.
- Nhân viên nhấn `Gửi yêu cầu chấm công`.
- App chuyển sang màn hình thông báo trạng thái.

Trạng thái cần thể hiện:

- Đang lấy vị trí.
- Camera chưa cấp quyền.
- Vị trí không đủ tin cậy hoặc GPS accuracy kém.
- Xác minh thành công và đang gửi yêu cầu.

### 5.4 Màn Hình 4: Thông Báo Trạng Thái

| Thuộc tính | Mô tả |
| --- | --- |
| Đối tượng | Nhân viên |
| Mục đích | Hiển thị kết quả xử lý ngay sau khi chấm công |
| Tính chất | Màn hình phản hồi trong luồng chấm công, không phải tab bottom nav |

Thành phần chính:

- Card trạng thái chính gồm kết quả, thông báo, vị trí và thời gian chờ.
- Khối trường hợp ngoài vùng cho phép.
- Khối trường hợp vị trí, thiết bị hoặc xác minh khuôn mặt/liveness không tin cậy.
- Khối trường hợp timeout hoặc lỗi kết nối.
- Nút `Về trang chủ`.

Luồng thao tác:

- App nhận kết quả xử lý chấm công.
- Nếu thành công, app hiển thị thông báo chấm công thành công và vị trí ghi nhận.
- Nếu ngoài vùng, app thông báo nhân viên đang ngoài khu vực chấm công.
- Nếu vị trí, thiết bị, khuôn mặt hoặc liveness không tin cậy, app thông báo bị từ chối và hướng dẫn liên hệ HR.
- Nếu lỗi mạng, app cho phép thử lại.
- Nhân viên nhấn `Về trang chủ` để quay lại màn hình chính.

Trạng thái cần thể hiện:

- Thành công.
- Ngoài vùng cho phép.
- Vị trí, thiết bị hoặc xác minh khuôn mặt/liveness không tin cậy.
- Lỗi kết nối hoặc timeout.

### 5.5 Màn Hình 5: Lịch Sử Chấm Công Cá Nhân

| Thuộc tính | Mô tả |
| --- | --- |
| Đối tượng | Nhân viên |
| Mục đích | Cho nhân viên tự xem lại lịch sử chấm công cá nhân |
| Bottom nav active | Lịch sử |

Thành phần chính:

- Tab lọc nhanh theo ngày, tuần và tháng.
- Trường chọn khoảng thời gian.
- Card tổng giờ làm.
- Card số lần đi trễ.
- Danh sách lịch sử theo ngày gồm giờ vào, giờ ra, vị trí và trạng thái.
- Wire note cho trường hợp không có dữ liệu.

Luồng thao tác:

- Nhân viên mở tab `Lịch sử`.
- Nhân viên chọn ngày, tuần hoặc tháng.
- Nhân viên chọn khoảng thời gian cần xem.
- App hiển thị tổng giờ, số lần đi trễ và danh sách chi tiết.
- Nếu không có dữ liệu, app hiển thị thông báo trống.

Trạng thái cần thể hiện:

- Có dữ liệu chấm công.
- Không có dữ liệu trong khoảng thời gian chọn.
- Có ngày thiếu lượt chấm công ra.
- Có lượt bị từ chối do ngoài vùng cho phép.

### 5.6 Màn Hình 6: Trung Tâm Thông Báo

| Thuộc tính | Mô tả |
| --- | --- |
| Đối tượng | Nhân viên |
| Mục đích | Cho nhân viên xem lại thông báo hệ thống, nhắc nhở và phản hồi từ HR |
| Bottom nav active | Thông báo |

Thành phần chính:

- Tab `Tất cả` để xem toàn bộ thông báo.
- Tab `Chưa đọc` để lọc thông báo chưa xem.
- Tab `Chấm công` để lọc thông báo liên quan đến chấm công.
- Danh sách thông báo gồm chấm công thành công, nhắc chấm công ra, thiết bị đang chờ duyệt và yêu cầu đã được HR xử lý.
- Panel chi tiết thông báo được chọn gồm loại, thời gian và nội dung.

Luồng thao tác:

- Nhân viên mở tab `Thông báo`.
- App hiển thị danh sách thông báo mới nhất.
- Nhân viên chọn một thông báo.
- App hiển thị chi tiết thông báo ở panel bên dưới.
- Nhân viên có thể lọc theo chưa đọc hoặc chấm công.

Trạng thái cần thể hiện:

- Có thông báo chưa đọc.
- Không có thông báo.
- Thông báo nhắc chấm công ra.
- Thông báo phản hồi xử lý từ HR.
- Thông báo thiết bị đang chờ duyệt.

### 5.7 Màn Hình 7: Tài Khoản Và Thiết Bị

| Thuộc tính | Mô tả |
| --- | --- |
| Đối tượng | Nhân viên |
| Mục đích | Cho nhân viên xem thông tin cá nhân và thiết bị đang dùng để chấm công |
| Bottom nav active | Tài khoản |

Thành phần chính:

- Placeholder ảnh đại diện hoặc khuôn mặt đã đăng ký.
- Thông tin cá nhân gồm nhân viên, phòng ban, email và quyền.
- Thông tin thiết bị hiện tại gồm hệ điều hành, dòng máy, mã thiết bị đã ẩn và trạng thái tin cậy.
- Nút `Đăng xuất`.
- Wire note giải thích thiết bị chưa được duyệt tin cậy sẽ nhắc nhân viên liên hệ HR/Admin.

Luồng thao tác:

- Nhân viên mở tab `Tài khoản`.
- App hiển thị thông tin cá nhân.
- App hiển thị thiết bị hiện tại và trạng thái tin cậy.
- Nếu thiết bị chưa được duyệt tin cậy, nhân viên biết cần liên hệ HR/Admin.
- Nhân viên có thể nhấn `Đăng xuất` để thoát tài khoản.

Trạng thái cần thể hiện:

- Thiết bị đã được duyệt tin cậy.
- Thiết bị đang chờ duyệt tin cậy.
- Tài khoản đang hoạt động.
- Tài khoản bị khóa sẽ không vào được màn hình này do bị chặn từ đăng nhập.

## 6. Kiểm Tra Tính Đầy Đủ Theo Chức Năng Và Điều Hướng

### 6.1 Đối Chiếu Theo Use Case

| Mã UC | Chức năng | Màn hình mockup liên quan | Ghi chú thể hiện trên wireframe |
| --- | --- | --- | --- |
| UC-01 | Đăng nhập hệ thống | Dashboard Màn hình 1, Mobile Màn hình 1 | Có form email/mật khẩu, thông báo lỗi và điều hướng sau đăng nhập theo vai trò. |
| UC-02 | Thực hiện Check-in | Mobile Màn hình 2, 3, 4 | Có nút chấm công vào, bước xác minh GPS 3D/khuôn mặt/liveness và màn hình kết quả. |
| UC-03 | Thực hiện Check-out | Mobile Màn hình 2, 3, 4 | Dùng chung luồng xác minh với check-in, có nút chấm công ra và phản hồi trạng thái. |
| UC-04 | Xem lịch sử chấm công cá nhân | Mobile Màn hình 5 | Có bộ lọc ngày/tuần/tháng, tổng giờ, đi trễ, thiếu checkout và lượt bị từ chối. |
| UC-05 | Nhận thông báo trạng thái chấm công | Mobile Màn hình 4, 6 | Có phản hồi tức thời sau chấm công và trung tâm thông báo để xem lại. |
| UC-06 | Quản lý Geofence 3D | Dashboard Màn hình 4 | Có bản đồ 3D, form vùng chấm công theo tòa nhà/tầng/bán kính/độ cao và danh sách vùng. |
| UC-07 | Xem bản đồ GIS 3D real-time | Dashboard Màn hình 3 | Có bản đồ 3D, marker nhân viên, lọc tòa nhà/tầng/phòng ban và tự cập nhật. |
| UC-08 | Quản lý ca làm việc | Dashboard Màn hình 10 | Có danh sách ca, form tạo/sửa ca, gán ca nhanh và cảnh báo xung đột. |
| UC-09 | Xem và xuất báo cáo chấm công | Dashboard Màn hình 5 | Có bộ lọc báo cáo, KPI tổng hợp, bảng chi tiết và nút xuất Excel/PDF. |
| UC-10 | Quản lý ngoại lệ chấm công | Dashboard Màn hình 6 | Có danh sách ngoại lệ, panel chi tiết, phê duyệt thủ công và giữ từ chối. |
| UC-11 | Phát hiện Mock Location / GPS Spoofing | Mobile Màn hình 3, 4; Dashboard Màn hình 6 | Đây là xử lý tự động, được thể hiện qua bước xác minh, thông báo bị từ chối và chi tiết ngoại lệ. |
| UC-12 | Phát hiện chấm công hộ | Mobile Màn hình 3, 4; Dashboard Màn hình 6, 11 | Đây là xử lý tự động, được thể hiện qua kiểm tra thiết bị, cảnh báo ngoại lệ và quản lý thiết bị tin cậy. |
| UC-13 | Quản lý thiết bị tin cậy | Dashboard Màn hình 11, Mobile Màn hình 7 | Có danh sách thiết bị, duyệt/thu hồi thiết bị và trạng thái thiết bị trên tài khoản nhân viên. |
| UC-14 | Tra cứu Audit Log | Dashboard Màn hình 12 | Có bộ lọc, bảng log, panel chi tiết và ghi chú chỉ đọc. |
| UC-15 | Quản lý nhân viên và phòng ban | Dashboard Màn hình 8, 9 | Có quản lý hồ sơ nhân viên, tài khoản liên quan, phòng ban và trạng thái hoạt động. |
| UC-16 | Xem Dashboard tổng quan | Dashboard Màn hình 2 | Có KPI, mini-map, biểu đồ, danh sách nhanh và panel cảnh báo. |
| UC-17 | Quản lý tòa nhà và tầng | Dashboard Màn hình 4.2 | Có danh sách tòa nhà/tầng, form tạo/sửa, độ cao tầng và kiểm tra bản đồ 3D. |

UC-11 và UC-12 không có màn hình thao tác riêng vì đây là các chức năng tự động trong luồng check-in/check-out. Wireframe thể hiện kết quả của hai chức năng này qua màn hình xác minh, thông báo trạng thái, ngoại lệ và thiết bị tin cậy.

### 6.2 Đối Chiếu Theo Điều Hướng

| Giao diện | Mục điều hướng hoặc tab | Wireframe tương ứng |
| --- | --- | --- |
| Dashboard | Tổng quan | Màn hình 2 |
| Dashboard | Bản đồ 3D | Màn hình 3 |
| Dashboard | Vùng chấm công | Màn hình 4 và 4.2 |
| Dashboard | Báo cáo | Màn hình 5 |
| Dashboard | Ngoại lệ | Màn hình 6 |
| Dashboard | Quản trị | Màn hình 7, 8, 9, 10 và 11 |
| Dashboard | Nhật ký | Màn hình 12 |
| Mobile | Trang chủ | Màn hình 2 |
| Mobile | Lịch sử | Màn hình 5 |
| Mobile | Thông báo | Màn hình 6 |
| Mobile | Tài khoản | Màn hình 7 |

## 7. Ghi Chú Triển Khai Tiếp Theo

- Nếu chuyển wireframe sang prototype tương tác, cần liên kết click từ sidebar Dashboard đến đúng màn hình tương ứng.
- Nếu chuyển wireframe sang prototype tương tác, cần liên kết bottom nav Mobile đến các tab Trang chủ, Lịch sử, Thông báo và Tài khoản.
- Màn hình `Thông báo trạng thái` của Mobile cần được mở sau thao tác chấm công chứ không đặt thành tab chính.
- Màn hình `Quản lý tòa nhà và tầng` nên được truy cập từ nhóm `Vùng chấm công` vì đây là dữ liệu nền cho vùng chấm công theo tầng.
- Các màn hình quản trị chi tiết nên dùng chung tab Nhân viên, Phòng ban, Ca làm việc và Thiết bị để người dùng hiểu chúng thuộc cùng một nhóm chức năng.
