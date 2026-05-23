# AMA Desktop Dashboard Project Checklist

Build approach: implement by dashboard screen order from the wireframes, with a small foundation phase first so every screen can share routing, auth, API, layout, Vietnamese labels, and UI primitives.

Primary scope: React + TypeScript desktop dashboard for Manager/CEO, HR, and Admin. App UI copy must be Vietnamese. Mobile wireframes are reference only unless scope changes.

## Phase 0 - Foundation Before Screens

- [ ] Confirm dashboard-only scope for this repo.
- [ ] Confirm supported roles: `manager`, `hr`, `admin`; block or redirect `employee` from desktop dashboard.
- [ ] Use `dev/openAPI.json` as the API contract source of truth unless backend confirms otherwise.
- [ ] Reconcile API differences across `FULL_API_DOCS.md`, `openAPI.json`, and `SWAGGER_MANUAL_TEST_DATA.md`.
- [ ] Confirm exact endpoint names for device self endpoint: `/devices/me` vs `/devices/my`.
- [ ] Confirm exact endpoint names for shift assignment: `/employees/{employee_id}/shift` vs `/employees/{employee_id}/assign-shift`.
- [ ] Confirm exact endpoint names for face management: `/employees/{employee_id}/face` vs `/employees/{employee_id}/face/status` and `/face/register`.
- [ ] Confirm exact endpoint for disabling geofence: `DELETE /geofences/{geofence_id}` vs `PUT /geofences/{geofence_id}/disable`.
- [ ] Confirm trailing slash behavior for `/buildings/`, `/geofences/`, and `/audit-logs/` from OpenAPI.
- [ ] Confirm final role permission matrix for audit logs, face management, geofence writes, reports export, and dashboard access.
- [ ] Confirm map implementation path: ArcGIS integration now or 3D placeholder first.
- [ ] Scaffold React + TypeScript app, preferably Vite.
- [ ] Add scripts: `dev`, `build`, `preview`, `lint`, `typecheck`, `test`.
- [ ] Configure TypeScript strictness, path aliases, ESLint, Prettier.
- [ ] Create folder structure: `src/app`, `src/routes`, `src/features`, `src/components`, `src/lib`, `src/services`, `src/types`.
- [ ] Configure environment variables: `VITE_API_BASE_URL`, map config, build mode.
- [ ] Build API client with `/api/v1` base path.
- [ ] Support standard response shape: `success`, `data`, `meta`, `error`.
- [ ] Support token storage, refresh, logout, and `401` handling.
- [ ] Support query params, pagination, multipart uploads, and binary downloads.
- [ ] Map backend error codes to Vietnamese messages.
- [ ] Build shared Vietnamese UI primitives: button, input, select, date picker, table, badge, card, modal, drawer, tabs, toast.
- [ ] Build shared page states: loading, empty, error, forbidden, not found.
- [ ] Build enum label maps in Vietnamese for roles, attendance status, rejection reasons, device platform, notification type, export format.
- [ ] Build protected dashboard layout: sidebar, topbar, content area, responsive desktop/tablet behavior.

## Screen 1 - Đăng Nhập Dashboard

Reference files: HTML `dev/wireframe/wireframe_dashboard.html` (`#login`, line 475); MD `dev/wireframe/desktop/01_login_dashboard.md`; OpenAPI `dev/openAPI.json` (`/api/v1/auth/login`, `/api/v1/auth/refresh`, `/api/v1/auth/me`, `/api/v1/auth/logout`, `/api/v1/auth/change-password`).

- [ ] Implement login route and page.
- [ ] Build Vietnamese login form with email/company username and password.
- [ ] Connect `/auth/login`.
- [ ] Fetch current user via `/auth/me` after login.
- [ ] Redirect valid management roles to `Tổng quan`.
- [ ] Block or redirect `employee` role from desktop dashboard.
- [ ] Show clear Vietnamese errors for invalid credentials, locked account, no dashboard permission, network failure.
- [ ] Add logout support through `/auth/logout` for later topbar use.
- [ ] Add optional change-password support if account menu includes it.
- [ ] Verify with seeded accounts from `SWAGGER_MANUAL_TEST_DATA.md`.

## Screen 2 - Dashboard Tổng Quan

Reference files: HTML `dev/wireframe/wireframe_dashboard.html` (`#overview`, line 512); MD `dev/wireframe/desktop/02_dashboard_tong_quan.md`; OpenAPI `dev/openAPI.json` (`/api/v1/dashboard/summary`).

- [ ] Implement `Tổng quan` route and sidebar active state.
- [ ] Connect `/dashboard/summary`.
- [ ] Add date filter if needed by API and UX.
- [ ] Show KPI cards: tổng nhân viên, đã chấm công vào, tỷ lệ đúng giờ, cần xem xét.
- [ ] Also show available summary fields: đi trễ, về sớm, vắng mặt, cảnh báo gian lận.
- [ ] Build mini-map or placeholder for active employee locations.
- [ ] Build chart/placeholder for on-time rate by department if data is available.
- [ ] Build quick table: employee, department, status, latest location, time.
- [ ] Build quick alert panel linking to `Ngoại lệ`.
- [ ] Poll summary every 60 seconds.
- [ ] Handle no data, loading, API error, and forbidden states.

## Screen 3 - Bản Đồ 3D Theo Thời Gian Gần Thực

Reference files: HTML `dev/wireframe/wireframe_dashboard.html` (`#map`, line 570); MD `dev/wireframe/desktop/03_ban_do_3d.md`; OpenAPI `dev/openAPI.json` (`/api/v1/realtime/employees-location`, `/api/v1/buildings/`, `/api/v1/buildings/{building_id}/floors`, `/api/v1/departments`).

- [ ] Implement `Bản đồ 3D` route and sidebar active state.
- [ ] Connect `/realtime/employees-location`.
- [ ] Connect building/floor/department option data for filters.
- [ ] Add filters: tòa nhà, tầng, phòng ban.
- [ ] Show employee markers on ArcGIS map or high-quality placeholder.
- [ ] Show selected employee detail panel: name, department, building, floor, altitude, GPS accuracy, checked-in time.
- [ ] Show floor stack or floor selector.
- [ ] Poll locations every 30 seconds.
- [ ] Handle empty map, no filter result, loading, API error, and forbidden states.
- [ ] Keep map integration isolated so placeholder can be replaced by ArcGIS without changing page logic.

## Screen 4 - Quản Lý Vùng Chấm Công 3D

Reference files: HTML `dev/wireframe/wireframe_dashboard.html` (`#geofence`, line 633); MD `dev/wireframe/desktop/04_quan_ly_vung_cham_cong_3d.md`; OpenAPI `dev/openAPI.json` (`/api/v1/geofences/`, `/api/v1/geofences/{geofence_id}`, `/api/v1/buildings/`, `/api/v1/buildings/{building_id}/floors`).

- [ ] Implement `Vùng chấm công` route for geofence management.
- [ ] Connect geofence list endpoint.
- [ ] Connect geofence create endpoint.
- [ ] Connect geofence update endpoint.
- [ ] Connect geofence disable/delete endpoint after backend behavior is confirmed.
- [ ] Add filters: tòa nhà, tầng, trạng thái hoạt động.
- [ ] Build map/placeholder for choosing geofence center.
- [ ] Build form fields: tầng, tên vùng, center lat, center lng, bán kính, altitude min, altitude max, allow check-in, allow check-out, active state.
- [ ] Build geofence table with building, floor, radius, altitude range, allowed actions, status.
- [ ] Handle overlap errors, invalid altitude range, missing floor, geofence not found.
- [ ] Add confirmation modal before disabling a geofence.
- [ ] Link to Screen 4.2 when building/floor data is missing.

## Screen 4.2 - Quản Lý Tòa Nhà Và Tầng

Reference files: HTML `dev/wireframe/wireframe_dashboard.html` (`#buildings-floors`, line 713); MD `dev/wireframe/desktop/04_2_quan_ly_toa_nha_va_tang.md`; OpenAPI `dev/openAPI.json` (`/api/v1/buildings/`, `/api/v1/buildings/{building_id}`, `/api/v1/buildings/{building_id}/floors`, `/api/v1/floors/{floor_id}`).

- [ ] Implement building/floor management route under `Vùng chấm công`.
- [ ] Connect building list endpoint with `include_floors` support.
- [ ] Connect building create endpoint.
- [ ] Connect building update endpoint.
- [ ] Connect floor list endpoint.
- [ ] Connect floor create endpoint.
- [ ] Connect floor update endpoint.
- [ ] Build building table: name, address, total floors, ArcGIS layer state, status.
- [ ] Build floor table: floor number, floor name, altitude range, related geofence status.
- [ ] Build building form: name, address, center lat, center lng, total floors, `arcgis_layer_id`.
- [ ] Build floor form: floor number, floor name, `altitude_min`, `altitude_max`.
- [ ] Validate altitude min/max before submit.
- [ ] Handle duplicate building name, invalid ArcGIS layer, duplicate floor number, floor/building not found.
- [ ] Add `Kiểm tra bản đồ 3D` only if backend or map SDK supports it; otherwise keep it as disabled/future action.

## Screen 5 - Báo Cáo Chấm Công

Reference files: HTML `dev/wireframe/wireframe_dashboard.html` (`#reports`, line 788); MD `dev/wireframe/desktop/05_bao_cao_cham_cong.md`; OpenAPI `dev/openAPI.json` (`/api/v1/reports/attendance`, `/api/v1/reports/attendance/export`, `/api/v1/departments`, `/api/v1/employees`).

- [ ] Implement `Báo cáo` route and sidebar active state.
- [ ] Connect `/reports/attendance`.
- [ ] Add filters: từ ngày, đến ngày, phòng ban, nhân viên.
- [ ] Validate required date range before request.
- [ ] Show KPI cards: ngày công, tổng giờ làm, đi trễ/về sớm, chấm công lỗi.
- [ ] Build per-employee report table.
- [ ] Build day-level details table or expandable employee rows if useful.
- [ ] Connect `/reports/attendance/export` for Excel.
- [ ] Connect `/reports/attendance/export` for PDF.
- [ ] Disable export for roles that are not allowed.
- [ ] Handle no report data, invalid date range, export loading, export failure, and forbidden states.

## Screen 6 - Quản Lý Ngoại Lệ Và Cảnh Báo Gian Lận

Reference files: HTML `dev/wireframe/wireframe_dashboard.html` (`#exceptions`, line 846); MD `dev/wireframe/desktop/06_quan_ly_ngoai_le.md`; OpenAPI `dev/openAPI.json` (`/api/v1/attendance/exceptions`, `/api/v1/attendance/{record_id}`, `/api/v1/attendance/{record_id}/approve`, `/api/v1/fraud/records`, `/api/v1/fraud/records/{fraud_id}`).

- [ ] Implement `Ngoại lệ` route and sidebar active state.
- [ ] Connect `/attendance/exceptions`.
- [ ] Add filters: trạng thái, loại cảnh báo/lý do, từ ngày, đến ngày, phòng ban, nhân viên.
- [ ] Build exceptions table with time, employee, type, reason, confidence score, processing status.
- [ ] Connect `/attendance/{record_id}` for selected detail panel.
- [ ] Show detail data: record id, device, shift, location, GPS accuracy, geofence, fraud flags, confidence score.
- [ ] Connect `/attendance/{record_id}/approve`.
- [ ] Build manual approval modal with optional note.
- [ ] Treat `Giữ từ chối` as close/no-op unless backend adds a dedicated endpoint.
- [ ] Connect `/fraud/records` if a dedicated fraud list section is needed on this screen.
- [ ] Connect `/fraud/records/{fraud_id}` if a dedicated fraud detail section is needed.
- [ ] Handle already approved, record not found, fraud not found, loading, empty, error, and forbidden states.

## Screen 7 - Quản Trị Hệ Thống Overview

Reference files: HTML `dev/wireframe/wireframe_dashboard.html` (`#system-management`, line 912); MD `dev/wireframe/desktop/07_quan_tri_he_thong.md`; OpenAPI `dev/openAPI.json` (`/api/v1/employees`, `/api/v1/departments`, `/api/v1/shifts`, `/api/v1/devices`).

- [ ] Implement `Quản trị` route and sidebar active state.
- [ ] Build admin tabs: `Nhân viên`, `Phòng ban`, `Ca làm việc`, `Thiết bị`.
- [ ] Build management overview cards for employee count, department count, shift count, trusted/pending devices.
- [ ] Build compact employee summary table.
- [ ] Add quick links to Screens 8, 9, 10, and 11.
- [ ] Respect role permissions for HR vs Admin.
- [ ] Hide or disable unavailable actions with clear Vietnamese explanation.

## Screen 8 - Quản Trị Nhân Viên

Reference files: HTML `dev/wireframe/wireframe_dashboard.html` (`#admin-employees`, line 993); MD `dev/wireframe/desktop/08_quan_tri_nhan_vien.md`; OpenAPI `dev/openAPI.json` (`/api/v1/employees`, `/api/v1/employees/{employee_id}`, `/api/v1/employees/{employee_id}/deactivate`, `/api/v1/employees/{employee_id}/shift`, `/api/v1/employees/{employee_id}/face`).

- [ ] Implement `Quản trị / Nhân viên` tab or route.
- [ ] Connect employee list endpoint.
- [ ] Connect employee detail endpoint.
- [ ] Connect employee create endpoint.
- [ ] Connect employee update endpoint.
- [ ] Connect employee deactivate endpoint.
- [ ] Connect employee shift assignment endpoint.
- [ ] Add filters: search, department, status, pagination.
- [ ] Build employee table: name, department, position, email, shift, device, status.
- [ ] Build create employee form: full name, department, position, email, phone, hire date, role, temporary password.
- [ ] Build update employee form.
- [ ] Build deactivate flow with reason.
- [ ] Display linked account, current device, assigned shift, and face registration status in detail.
- [ ] Connect face status endpoint.
- [ ] Connect face registration upload endpoint.
- [ ] Connect face delete/reset endpoint if role allows.
- [ ] Handle duplicate email, duplicate phone, department not found, employee not found, validation errors.

## Screen 9 - Quản Trị Phòng Ban

Reference files: HTML `dev/wireframe/wireframe_dashboard.html` (`#admin-departments`, line 1070); MD `dev/wireframe/desktop/09_quan_tri_phong_ban.md`; OpenAPI `dev/openAPI.json` (`/api/v1/departments`, `/api/v1/departments/{department_id}`, `/api/v1/employees`).

- [ ] Implement `Quản trị / Phòng ban` tab or route.
- [ ] Connect department list endpoint.
- [ ] Connect department create endpoint.
- [ ] Connect department update endpoint.
- [ ] Add search and pagination.
- [ ] Build department table: name, manager, employee count, default shift if available, status if available.
- [ ] Build department form: name, manager, description.
- [ ] Show manager select sourced from employees.
- [ ] Handle duplicate department name, manager not found, department not found.
- [ ] Confirm whether default shift and suspend department are backend-supported; hide these UI controls if not supported.

## Screen 10 - Quản Trị Ca Làm Việc

Reference files: HTML `dev/wireframe/wireframe_dashboard.html` (`#admin-shifts`, line 1129); MD `dev/wireframe/desktop/10_quan_tri_ca_lam_viec.md`; OpenAPI `dev/openAPI.json` (`/api/v1/shifts`, `/api/v1/shifts/{shift_id}`, `/api/v1/employees/{employee_id}/shift`, `/api/v1/employees`).

- [ ] Implement `Quản trị / Ca làm việc` tab or route.
- [ ] Connect shift list endpoint.
- [ ] Connect shift create endpoint.
- [ ] Connect shift update endpoint.
- [ ] Connect employee shift assignment endpoint.
- [ ] Add employee filter if useful.
- [ ] Build shift table: name, start time, end time, late tolerance, early leave, weekend flag, assigned employee.
- [ ] Build shift form: employee, name, start time, end time, late tolerance, early leave, weekend flag.
- [ ] Build quick assign shift to employee flow.
- [ ] Handle shift time conflict, employee not found, shift not found.
- [ ] Confirm whether assigning shifts to departments is supported; hide department assignment if not supported.

## Screen 11 - Quản Trị Thiết Bị Tin Cậy

Reference files: HTML `dev/wireframe/wireframe_dashboard.html` (`#admin-devices`, line 1204); MD `dev/wireframe/desktop/11_quan_tri_thiet_bi_tin_cay.md`; OpenAPI `dev/openAPI.json` (`/api/v1/devices`, `/api/v1/devices/{device_id}/trust`, `/api/v1/devices/register`, `/api/v1/devices/me`).

- [ ] Implement `Quản trị / Thiết bị` tab or route.
- [ ] Connect device list endpoint.
- [ ] Connect device trust/untrust endpoint.
- [ ] Add filters: employee, trusted state, platform, pagination.
- [ ] Build device table: employee, masked fingerprint, platform, model, OS/app version, registered time, trusted state.
- [ ] Build selected device detail panel.
- [ ] Build trust device action with confirmation.
- [ ] Build untrust/revoke device action with confirmation.
- [ ] Mask device fingerprint everywhere except where explicit admin visibility is required.
- [ ] Handle device not found, loading, empty, API error, and forbidden states.
- [ ] Confirm whether dashboard should expose device registration; likely hide because it belongs to employee/mobile flow.

## Screen 12 - Tra Cứu Nhật Ký Hệ Thống

Reference files: HTML `dev/wireframe/wireframe_dashboard.html` (`#audit-log`, line 1274); MD `dev/wireframe/desktop/12_tra_cuu_nhat_ky.md`; OpenAPI `dev/openAPI.json` (`/api/v1/audit-logs/`, `/api/v1/audit-logs/{log_id}`).

- [ ] Implement `Nhật ký` route and sidebar active state.
- [ ] Connect audit log list endpoint.
- [ ] Connect audit log detail endpoint.
- [ ] Add filters: actor/account, action type, entity, from, to, pagination.
- [ ] Build readonly log table: time, actor, action, target entity, target id, IP address.
- [ ] Build selected log detail panel with before/after payload snapshot.
- [ ] Restrict to final confirmed roles.
- [ ] Handle no matching logs, log not found, loading, API error, and forbidden states.
- [ ] Ensure no edit/delete actions exist for logs.

## Cross-Screen Notifications

- [ ] Decide whether notifications are a topbar dropdown, a route, or deferred.
- [ ] Connect `/notifications` if included.
- [ ] Show unread count if included.
- [ ] Mark single notification as read if included.
- [ ] Mark all notifications as read if included.
- [ ] Build notification preferences form only if included in dashboard scope.
- [ ] Map notification type labels to Vietnamese.

## Cross-Screen UX Polish

- [ ] Replace all placeholder English UI strings with Vietnamese.
- [ ] Review Vietnamese labels for HR/Admin/Manager workflows.
- [ ] Ensure all forms have helper text and validation errors.
- [ ] Ensure all tables support pagination and useful filtering.
- [ ] Add skeleton loading for KPI-heavy screens.
- [ ] Add specific empty states for every screen.
- [ ] Add forbidden states for role-restricted screens.
- [ ] Add responsive behavior for smaller desktop/tablet widths.
- [ ] Add accessible labels, keyboard navigation, focus states, and color contrast.
- [ ] Ensure destructive actions use confirmation dialogs.
- [ ] Ensure exported file names are user-friendly.

## Testing And Verification

- [ ] Unit test API client behavior, response parsing, and error mapping.
- [ ] Unit test auth token refresh/logout behavior.
- [ ] Unit test date/time/duration formatting helpers.
- [ ] Unit test enum-to-Vietnamese label maps.
- [ ] Component test login form.
- [ ] Component test role guard behavior.
- [ ] Component test data table loading/empty/error states.
- [ ] Component test each screen's primary form and action.
- [ ] E2E test Screen 1 login to Screen 2 overview.
- [ ] E2E test Screen 5 report filtering and export request.
- [ ] E2E test Screen 6 exception detail and manual approval.
- [ ] E2E test Screens 8-11 admin workflows.
- [ ] Manually test with seeded accounts from `SWAGGER_MANUAL_TEST_DATA.md`.
- [ ] Run lint before release.
- [ ] Run typecheck before release.
- [ ] Run production build before release.

## Documentation And Delivery

- [ ] Add frontend README with setup, scripts, and environment variables.
- [ ] Document route map and role access rules.
- [ ] Document confirmed API discrepancies and final endpoint decisions.
- [ ] Document manual QA scenarios using backend seed accounts.
- [ ] Document known limitations, especially map placeholder or unsupported backend actions.
- [ ] Prepare deployment configuration.
- [ ] Prepare release checklist for handoff.

## Recommended Screen Build Order

1. Foundation before screens.
2. Screen 1: Đăng nhập Dashboard.
3. Screen 2: Dashboard Tổng Quan.
4. Screen 3: Bản Đồ 3D Theo Thời Gian Gần Thực.
5. Screen 4: Quản Lý Vùng Chấm Công 3D.
6. Screen 4.2: Quản Lý Tòa Nhà Và Tầng.
7. Screen 5: Báo Cáo Chấm Công.
8. Screen 6: Quản Lý Ngoại Lệ Và Cảnh Báo Gian Lận.
9. Screen 7: Quản Trị Hệ Thống Overview.
10. Screen 8: Quản Trị Nhân Viên.
11. Screen 9: Quản Trị Phòng Ban.
12. Screen 10: Quản Trị Ca Làm Việc.
13. Screen 11: Quản Trị Thiết Bị Tin Cậy.
14. Screen 12: Tra Cứu Nhật Ký Hệ Thống.
15. Cross-screen notifications, polish, testing, docs, delivery.

## Definition Of Done

- [ ] All dashboard screens from the wireframes are implemented in screen order.
- [ ] All dashboard routes are implemented and role-protected.
- [ ] All visible UI copy is Vietnamese.
- [ ] API client handles auth, refresh, errors, pagination, multipart, and downloads.
- [ ] Core workflows work against seeded backend accounts.
- [ ] Loading, empty, error, forbidden, and success states are covered.
- [ ] `lint`, `typecheck`, tests, and production build pass.
- [ ] README and QA notes are complete.
