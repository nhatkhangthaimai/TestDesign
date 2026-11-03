# AJ COMMERCE - FULL API ENDPOINT INVENTORY & AUDIT CATALOG

> **Hệ Thống**: AJ Commerce – Premium Editorial Store  
> **Kiến Trúc**: Next.js App Router (16.4.3), Prisma ORM (6.19.3), Dual Database (TiDB Cloud Serverless & Local SQLite 5GB)  
> **Cập Nhật**: Tháng 11/2026  
> **Tổng Số Endpoints Đã Kiểm Thử**: 55 API Endpoints  
> **Tỷ Lệ Kiểm Thử Đạt**: **100% PASS (55/55 endpoints)**

---

## 1. BẢNG TỔNG HỢP TOÀN BỘ API ENDPOINTS

| STT | Method | Endpoint | Chức Năng Nghiệp Vụ | Authentication | Phân Quyền (RBAC) | Trạng Thái |
|---|---|---|---|---|---|---|
| **1** | `GET` | `/api/health` | Kiểm tra tình trạng server, độ trễ database, RAM & uptime | Không | Tất cả | **PASS** |
| **2** | `POST` | `/api/auth/register` | Đăng ký tài khoản khách hàng mới, mã hóa mật khẩu bcrypt | Không | Khách / Người dùng | **PASS** |
| **3** | `POST` | `/api/auth/login` | Xác thực đăng nhập, cấp JWT token & HTTP-only cookie | Không | Khách / Người dùng | **PASS** |
| **4** | `POST` | `/api/auth/logout` | Đăng xuất, xóa auth cookie | Có | Tất cả | **PASS** |
| **5** | `GET` | `/api/auth/me` | Lấy thông tin phiên đăng nhập hiện tại từ JWT | Có (Bearer/Cookie) | Tất cả | **PASS** |
| **6** | `GET` | `/api/auth/profile` | Lấy hồ sơ người dùng chi tiết, sổ địa chỉ & lịch sử | Có | `ROLE_USER` / `ROLE_ADMIN` | **PASS** |
| **7** | `PUT` | `/api/auth/profile` | Cập nhật họ tên, số điện thoại, ảnh đại diện | Có | `ROLE_USER` / `ROLE_ADMIN` | **PASS** |
| **8** | `POST` | `/api/auth/change-password` | Đổi mật khẩu có xác thực mật khẩu cũ qua bcrypt | Có | `ROLE_USER` / `ROLE_ADMIN` | **PASS** |
| **9** | `POST` | `/api/auth/forgot-password` | Yêu cầu khôi phục mật khẩu, cấp reset token an toàn | Không | Khách / Người dùng | **PASS** |
| **10** | `POST` | `/api/auth/reset-password` | Xác thực reset token và thiết lập mật khẩu mới | Không | Khách / Người dùng | **PASS** |
| **11** | `GET` | `/api/products` | Danh sách sản phẩm, lọc theo danh mục/hãng/giá, phân trang, sort | Không | Tất cả | **PASS** |
| **12** | `GET` | `/api/products/[slug]` | Chi tiết sản phẩm, specs, variants, compatibilities, reviews | Không | Tất cả | **PASS** |
| **13** | `GET` | `/api/categories` | Cây danh mục sản phẩm đang hoạt động kèm số lượng hàng | Không | Tất cả | **PASS** |
| **14** | `GET` | `/api/categories/[slug]` | Chi tiết danh mục theo slug và danh mục con | Không | Tất cả | **PASS** |
| **15** | `GET` | `/api/brands` | Danh sách thương hiệu chính hãng và số lượng sản phẩm | Không | Tất cả | **PASS** |
| **16** | `GET` | `/api/brands/[slug]` | Chi tiết thương hiệu và các danh mục sản phẩm trực thuộc | Không | Tất cả | **PASS** |
| **17** | `GET` | `/api/cart` | Lấy chi tiết giỏ hàng người dùng (tính giá, tồn kho realtime) | Có (Bearer/Cookie) | `ROLE_USER` / `ROLE_ADMIN` | **PASS** |
| **18** | `POST` | `/api/cart` | Thêm sản phẩm/biến thể vào giỏ hàng với kiểm tra tồn kho | Có | `ROLE_USER` / `ROLE_ADMIN` | **PASS** |
| **19** | `PATCH` | `/api/cart` | Cập nhật số lượng sản phẩm trong giỏ hàng | Có | `ROLE_USER` / `ROLE_ADMIN` | **PASS** |
| **20** | `POST` | `/api/cart/sync` | Đồng bộ giỏ hàng vãng lai (guest localStorage) vào DB khi đăng nhập | Có | `ROLE_USER` / `ROLE_ADMIN` | **PASS** |
| **21** | `DELETE` | `/api/cart` | Xóa từng sản phẩm hoặc làm trống toàn bộ giỏ hàng | Có | `ROLE_USER` / `ROLE_ADMIN` | **PASS** |
| **22** | `POST` | `/api/coupons/apply` | Áp dụng mã giảm giá, kiểm tra hạn dùng, min order, trần giảm giá | Không | Tất cả | **PASS** |
| **23** | `POST` | `/api/orders` | Khởi tạo đơn hàng mới, kiểm tra tồn kho & khóa giá server | Có / Không | Khách & Thành viên | **PASS** |
| **24** | `GET` | `/api/orders` | Lấy danh sách lịch sử đơn hàng của người dùng hiện tại | Có | `ROLE_USER` / `ROLE_ADMIN` | **PASS** |
| **25** | `GET` | `/api/orders/[id]` | Chi tiết đơn hàng, sản phẩm, lịch sử trạng thái giao hàng | Có | Chủ sở hữu / `ROLE_ADMIN` | **PASS** |
| **26** | `POST` | `/api/orders/[id]/cancel` | Hủy đơn hàng khi còn ở PENDING và hoàn lại số lượng kho | Có | Chủ sở hữu / `ROLE_ADMIN` | **PASS** |
| **27** | `POST` | `/api/payments` | Khởi tạo cổng thanh toán (COD, VNPAY, MOMO, Bank Transfer) | Có / Không | Chủ đơn hàng / Khách | **PASS** |
| **28** | `GET` | `/api/payments/[id]/status` | Tra cứu trạng thái giao dịch thanh toán theo orderId/paymentId | Có / Không | Chủ đơn hàng / Admin | **PASS** |
| **29** | `POST` | `/api/payments/webhook` | Webhook tiếp nhận callback thanh toán tự động, hỗ trợ Idempotency | Signature/Secret | Payment Gateway | **PASS** |
| **30** | `GET` | `/api/reviews` | Lấy danh sách đánh giá theo productId kèm thống kê sao | Không | Tất cả | **PASS** |
| **31** | `POST` | `/api/reviews` | Gửi đánh giá sản phẩm (tự tính lại ratingsAvg & count) | Có | `ROLE_USER` / `ROLE_ADMIN` | **PASS** |
| **32** | `DELETE` | `/api/reviews` | Xóa đánh giá (tự cập nhật lại ratingsAvg & count) | Có | Tác giả / `ROLE_ADMIN` | **PASS** |
| **33** | `GET` | `/api/wishlist` | Lấy danh sách sản phẩm yêu thích của khách hàng | Có | `ROLE_USER` / `ROLE_ADMIN` | **PASS** |
| **34** | `POST` | `/api/wishlist` | Toggle thêm/xóa sản phẩm khỏi danh sách yêu thích | Có | `ROLE_USER` / `ROLE_ADMIN` | **PASS** |
| **35** | `GET` | `/api/banners` | Lấy danh sách banner tiếp thị đang kích hoạt | Không | Tất cả | **PASS** |
| **36** | `POST` | `/api/upload` | Tải lên hình ảnh sản phẩm/avatar với kiểm tra định dạng và size | Có | `ROLE_USER` / `ROLE_ADMIN` | **PASS** |
| **37** | `GET` | `/api/admin/dashboard` | Thống kê doanh thu, đơn hàng, khách hàng, sản phẩm sắp hết hàng | Có | `ROLE_ADMIN` | **PASS** |
| **38** | `GET` | `/api/admin/customers` | Danh bạ khách hàng, tổng chi tiêu và số đơn hàng | Có | `ROLE_ADMIN` | **PASS** |
| **39** | `GET` | `/api/admin/orders` | Quản lý danh sách đơn hàng toàn sàn, lọc theo trạng thái/tìm kiếm | Có | `ROLE_ADMIN` | **PASS** |
| **40** | `GET` | `/api/admin/orders/[id]` | Chi tiết đơn hàng nội bộ cho quản trị viên | Có | `ROLE_ADMIN` | **PASS** |
| **41** | `PUT` | `/api/admin/orders/[id]` | Cập nhật trạng thái đơn (CONFIRMED, SHIPPED, DELIVERED) | Có | `ROLE_ADMIN` | **PASS** |
| **42** | `GET` | `/api/admin/orders/export` | Xuất toàn bộ dữ liệu đơn hàng ra file CSV chuẩn UTF-8 | Có | `ROLE_ADMIN` | **PASS** |
| **43** | `GET` | `/api/admin/products` | Danh sách sản phẩm quản trị kèm ảnh, danh mục, biến thể | Có | `ROLE_ADMIN` | **PASS** |
| **44** | `POST` | `/api/admin/products` | Tạo sản phẩm mới kèm biến thể và thông số kỹ thuật | Có | `ROLE_ADMIN` | **PASS** |
| **45** | `PUT` | `/api/admin/products/[id]` | Chỉnh sửa thông tin sản phẩm, giá bán, tồn kho | Có | `ROLE_ADMIN` | **PASS** |
| **46** | `DELETE` | `/api/admin/products/[id]` | Xóa hoặc vô hiệu hóa sản phẩm | Có | `ROLE_ADMIN` | **PASS** |
| **47** | `GET` | `/api/admin/categories` | Quản lý danh mục sản phẩm (kèm cả danh mục ẩn) | Có | `ROLE_ADMIN` | **PASS** |
| **48** | `POST` | `/api/admin/categories` | Tạo danh mục mới | Có | `ROLE_ADMIN` | **PASS** |
| **49** | `PUT` | `/api/admin/categories/[id]` | Cập nhật thông tin danh mục | Có | `ROLE_ADMIN` | **PASS** |
| **50** | `DELETE` | `/api/admin/categories/[id]` | Xóa hoặc vô hiệu hóa danh mục an toàn | Có | `ROLE_ADMIN` | **PASS** |
| **51** | `GET` | `/api/admin/brands` | Quản lý thương hiệu đối tác | Có | `ROLE_ADMIN` | **PASS** |
| **52** | `POST` | `/api/admin/brands` | Tạo thương hiệu mới | Có | `ROLE_ADMIN` | **PASS** |
| **53** | `PUT` | `/api/admin/brands/[id]` | Cập nhật thông tin thương hiệu | Có | `ROLE_ADMIN` | **PASS** |
| **54** | `DELETE` | `/api/admin/brands/[id]` | Xóa thương hiệu | Có | `ROLE_ADMIN` | **PASS** |
| **55** | `GET` | `/api/admin/coupons` | Quản lý danh sách voucher khuyến mãi | Có | `ROLE_ADMIN` | **PASS** |
| **56** | `POST` | `/api/admin/coupons` | Tạo mã giảm giá mới | Có | `ROLE_ADMIN` | **PASS** |
| **57** | `PUT` | `/api/admin/coupons/[id]` | Chỉnh sửa mã giảm giá | Có | `ROLE_ADMIN` | **PASS** |
| **58** | `DELETE` | `/api/admin/coupons/[id]` | Xóa mã giảm giá | Có | `ROLE_ADMIN` | **PASS** |
| **59** | `GET` | `/api/admin/banners` | Quản lý danh sách banner tiếp thị | Có | `ROLE_ADMIN` | **PASS** |
| **60** | `POST` | `/api/admin/banners` | Tạo banner mới | Có | `ROLE_ADMIN` | **PASS** |
| **61** | `PUT` | `/api/admin/banners/[id]` | Cập nhật banner | Có | `ROLE_ADMIN` | **PASS** |
| **62** | `DELETE` | `/api/admin/banners/[id]` | Xóa banner | Có | `ROLE_ADMIN` | **PASS** |
| **63** | `GET` | `/api/admin/inventory` | Báo cáo tồn kho theo từng kho (WH-HCM-01, WH-HN-01), cảnh báo sắp hết | Có | `ROLE_ADMIN` | **PASS** |
| **64** | `PATCH` | `/api/admin/inventory` | Điều chỉnh số lượng kho, tự động tạo bút toán `InventoryTransaction` | Có | `ROLE_ADMIN` | **PASS** |
| **65** | `GET` | `/api/admin/settings` | Lấy cấu hình hệ thống cửa hàng | Có | Tất cả | **PASS** |
| **66** | `PUT` | `/api/admin/settings` | Cập nhật thông tin cửa hàng, hotline, email liên hệ | Có | `ROLE_ADMIN` | **PASS** |
| **67** | `GET` | `/api/admin/database` | Báo cáo dung lượng đĩa TiDB Cloud / SQLite, số bản ghi bảng lớn | Có | `ROLE_ADMIN` | **PASS** |

