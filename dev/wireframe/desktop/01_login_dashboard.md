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
