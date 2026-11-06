# BÁO CÁO KIỂM TOÁN HỆ THỐNG API (API AUDIT REPORT)
## BBKCOMMERCE E-COMMERCE PLATFORM

- **Tổng số Endpoint phát hiện:** 53 endpoints
- **Trạng thái hoạt động trên Production:** 100% Khả dụng (HTTP 200, 201 hoặc 401/403 bảo vệ quyền)
- **Tiêu chuẩn kiểm toán:** RESTful, JWT Bearer/Cookie, Zod Schema Validation, HTTP Status Codes

---

## 1. BẢNG TỔNG HỢP KIỂM TOÁN TOÀN BỘ 53 API ENDPOINTS

### 1.1. Nhóm Xác Thực & Tài Khoản (Authentication & Identity - 10 Endpoints)

| STT | Phương Thức | Đường Dẫn Endpoint | Chức Năng | Yêu Cầu Auth | Phân Quyền | Request Validation | Status Codes | Trạng Thái |
|:---:|:---:|---|---|:---:|:---:|:---:|:---:|:---:|
| 1 | `POST` | `/api/auth/register` | Đăng ký tài khoản khách hàng mới | Không | Public | Zod (email, password 6+ ký tự, name) | 201, 400, 409 | **PASS** |
| 2 | `POST` | `/api/auth/login` | Đăng nhập tài khoản & cấp JWT Cookie | Không | Public | Zod (email, password) | 200, 400, 401 | **PASS** |
| 3 | `POST` | `/api/auth/logout` | Đăng xuất, xóa HttpOnly cookie | Có | User | Không | 200 | **PASS** |
| 4 | `GET` | `/api/auth/me` | Lấy thông tin phiên đăng nhập hiện tại | Không | Public/User | Không | 200 (kèm user hoặc null) | **PASS** |
| 5 | `PUT` | `/api/auth/profile` | Cập nhật thông tin cá nhân (tên, sđt) | Có | User | Zod (name, phone, avatar) | 200, 400, 401 | **PASS** |
| 6 | `POST` | `/api/auth/change-password` | Đổi mật khẩu tài khoản đang đăng nhập | Có | User | Zod (oldPassword, newPassword) | 200, 400, 401 | **PASS** |
| 7 | `POST` | `/api/auth/forgot-password` | Yêu cầu mã/link đặt lại mật khẩu | Không | Public | Zod (email) | 200, 400, 404 | **PASS** |
| 8 | `POST` | `/api/auth/reset-password` | Đặt lại mật khẩu mới với token | Không | Public | Zod (token, newPassword) | 200, 400 | **PASS** |
| 9 | `DELETE` | `/api/auth/delete-account` | Yêu cầu xóa vĩnh viễn tài khoản | Có | User | Zod (password xác nhận) | 200, 400, 401 | **PASS** |
| 10 | `GET` | `/api/health` | Kiểm tra tình trạng máy chủ & database | Không | Public | Không | 200, 500 | **PASS** |

### 1.2. Nhóm Sổ Địa Chỉ Khách Hàng (Address Management - 3 Endpoints)

| STT | Phương Thức | Đường Dẫn Endpoint | Chức Năng | Yêu Cầu Auth | Phân Quyền | Request Validation | Status Codes | Trạng Thái |
|:---:|:---:|---|---|:---:|:---:|:---:|:---:|:---:|
| 11 | `GET` | `/api/addresses` | Lấy danh sách địa chỉ nhận hàng | Có | User | Không (lọc theo `userId`) | 200, 401 | **PASS** |
| 12 | `POST` | `/api/addresses` | Thêm mới địa chỉ nhận hàng | Có | User | Zod (street, ward, city, phone) | 201, 400, 401 | **PASS** |
| 13 | `PUT` | `/api/addresses/[id]` | Chỉnh sửa địa chỉ nhận hàng | Có | User (Owner) | Zod (kiểm tra quyền sở hữu IDOR) | 200, 403, 404 | **PASS** |
| 14 | `DELETE` | `/api/addresses/[id]` | Xóa địa chỉ nhận hàng | Có | User (Owner) | Kiểm tra quyền sở hữu IDOR | 200, 403, 404 | **PASS** |
| 15 | `PATCH` | `/api/addresses/[id]/default` | Đặt địa chỉ làm mặc định | Có | User (Owner) | Transaction đặt default duy nhất | 200, 403 | **PASS** |

### 1.3. Nhóm Sản Phẩm, Danh Mục & Thương Hiệu (Catalog & Taxonomy - 7 Endpoints)

| STT | Phương Thức | Đường Dẫn Endpoint | Chức Năng | Yêu Cầu Auth | Phân Quyền | Request Validation | Status Codes | Trạng Thái |
|:---:|:---:|---|---|:---:|:---:|:---:|:---:|:---:|
| 16 | `GET` | `/api/products` | Lấy danh sách sản phẩm (Phân trang, Lọc) | Không | Public | Query (page, limit, category, search, sort) | 200 | **PASS** |
| 17 | `GET` | `/api/products/[slug]` | Lấy chi tiết 1 sản phẩm theo slug | Không | Public | Slug param (xử lý Decimal -> Number) | 200, 404 | **PASS** |
| 18 | `GET` | `/api/categories` | Lấy cây danh mục sản phẩm | Không | Public | Không | 200 | **PASS** |
| 19 | `GET` | `/api/categories/[slug]` | Lấy chi tiết danh mục theo slug | Không | Public | Slug param | 200, 404 | **PASS** |
| 20 | `GET` | `/api/brands` | Lấy danh sách thương hiệu chính hãng | Không | Public | Không | 200 | **PASS** |
| 21 | `GET` | `/api/brands/[slug]` | Lấy chi tiết thương hiệu & sản phẩm | Không | Public | Slug param | 200, 404 | **PASS** |
| 22 | `GET` | `/api/banners` | Lấy banner hiển thị theo vị trí & thiết bị | Không | Public | Query (position, device) | 200 | **PASS** |

### 1.4. Nhóm Giỏ Hàng, Khuyến Mãi & Yêu Thích (Shopping Experience - 5 Endpoints)

| STT | Phương Thức | Đường Dẫn Endpoint | Chức Năng | Yêu Cầu Auth | Phân Quyền | Request Validation | Status Codes | Trạng Thái |
|:---:|:---:|---|---|:---:|:---:|:---:|:---:|:---:|
| 23 | `GET` | `/api/cart` | Lấy giỏ hàng của user | Có/Không | Hybrid (DB hoặc Guest Session) | Cookie / Token | 200 | **PASS** |
| 24 | `POST` | `/api/cart` | Thêm sản phẩm vào giỏ hàng | Có/Không | Hybrid | Zod (productId, variantId, qty) | 200, 400 | **PASS** |
| 25 | `POST` | `/api/cart/sync` | Đồng bộ giỏ hàng khách lên tài khoản | Có | User | Array cart items | 200, 401 | **PASS** |
| 26 | `POST` | `/api/coupons/apply` | Kiểm tra và áp dụng mã giảm giá | Không | Public | Zod (code, orderAmount) | 200, 400, 404 | **PASS** |
| 27 | `GET` | `/api/wishlist` | Lấy danh sách sản phẩm yêu thích | Có | User | Không | 200, 401 | **PASS** |
| 28 | `POST` | `/api/wishlist` | Thêm / xóa sản phẩm yêu thích (Toggle) | Có | User | Zod (productId) | 200, 400, 401 | **PASS** |
| 29 | `POST` | `/api/reviews` | Gửi đánh giá sản phẩm đã mua | Có | User | Zod (productId, rating 1-5, comment) | 201, 400, 401 | **PASS** |

### 1.5. Nhóm Đơn Hàng & Thanh Toán (Orders & Payments - 7 Endpoints)

| STT | Phương Thức | Đường Dẫn Endpoint | Chức Năng | Yêu Cầu Auth | Phân Quyền | Request Validation | Status Codes | Trạng Thái |
|:---:|:---:|---|---|:---:|:---:|:---:|:---:|:---:|
| 30 | `GET` | `/api/orders` | Danh sách đơn hàng của người dùng | Có | User | Lọc an toàn theo `userId` | 200, 401 | **PASS** |
| 31 | `POST` | `/api/orders` | Tạo đơn hàng mới từ giỏ hàng | Có/Không | Guest / User | Zod (items, shippingAddress, paymentMethod) | 201, 400 | **PASS** |
| 32 | `GET` | `/api/orders/[id]` | Tra cứu thông tin chi tiết 1 đơn hàng | Có/Không | Owner / Public Code | ID hoặc Tracking Code | 200, 403, 404 | **PASS** |
| 33 | `POST` | `/api/orders/[id]/cancel` | Hủy đơn hàng khi chưa bàn giao ship | Có | User (Owner) | Chỉ cho phép hủy khi PENDING/CONFIRMED | 200, 400, 403 | **PASS** |
| 34 | `POST` | `/api/payments` | Khởi tạo giao dịch thanh toán | Có | User | Zod (orderId, gateway) | 200, 400 | **PASS** |
| 35 | `GET` | `/api/payments/[id]/status` | Kiểm tra trạng thái thanh toán | Có | User | Payment ID | 200, 404 | **PASS** |
| 36 | `POST` | `/api/payments/webhook` | Nhận IPN Webhook từ cổng thanh toán | Không | Secret Key | Signature Verification (HMAC-SHA256) | 200, 400, 401 | **PASS** |

### 1.6. Nhóm Quản Trị Hệ Thống (Admin APIs - 17 Endpoints)

| STT | Phương Thức | Đường Dẫn Endpoint | Chức Năng | Yêu Cầu Auth | Phân Quyền | Request Validation | Status Codes | Trạng Thái |
|:---:|:---:|---|---|:---:|:---:|:---:|:---:|:---:|
| 37 | `GET` | `/api/admin/dashboard` | Thống kê doanh thu, đơn hàng, biểu đồ | Có | **ROLE_ADMIN** | Lọc bỏ `isSimulated=true` | 200, 403 | **PASS** |
| 38 | `GET` | `/api/admin/products` | Lấy toàn bộ sản phẩm quản trị | Có | **ROLE_ADMIN** | Pagination, Search, Filter | 200, 403 | **PASS** |
| 39 | `POST` | `/api/admin/products` | Tạo sản phẩm mới | Có | **ROLE_ADMIN** | Zod Product Schema | 201, 400, 403 | **PASS** |
| 40 | `GET` | `/api/admin/products/[id]` | Lấy chi tiết sản phẩm để sửa | Có | **ROLE_ADMIN** | Product ID | 200, 403, 404 | **PASS** |
| 41 | `PUT` | `/api/admin/products/[id]` | Chỉnh sửa cập nhật sản phẩm | Có | **ROLE_ADMIN** | Zod Update Schema | 200, 400, 403 | **PASS** |
| 42 | `DELETE` | `/api/admin/products/[id]` | Xóa hoặc ẩn sản phẩm | Có | **ROLE_ADMIN** | Cascade / Soft-delete | 200, 403 | **PASS** |
| 43 | `GET` | `/api/admin/banners` | Lấy danh sách banner quản lý | Có | **ROLE_ADMIN** | Sắp xếp theo sortOrder | 200, 403 | **PASS** |
| 44 | `POST` | `/api/admin/banners` | Tạo video/image banner mới | Có | **ROLE_ADMIN** | Zod Banner (Hỗ trợ 1080p/YouTube) | 201, 400, 403 | **PASS** |
| 45 | `PUT` | `/api/admin/banners/[id]` | Cập nhật thông tin banner | Có | **ROLE_ADMIN** | Zod Banner Schema | 200, 400, 403 | **PASS** |
| 46 | `DELETE` | `/api/admin/banners/[id]` | Xóa banner quảng bá | Có | **ROLE_ADMIN** | Banner ID | 200, 403 | **PASS** |
| 47 | `PATCH` | `/api/admin/banners/[id]/toggle` | Bật / tắt kích hoạt nhanh banner | Có | **ROLE_ADMIN** | Boolean isActive | 200, 403 | **PASS** |
| 48 | `PATCH` | `/api/admin/banners/reorder` | Sắp xếp lại thứ tự banner | Có | **ROLE_ADMIN** | Array `{ id, sortOrder }` | 200, 403 | **PASS** |
| 49 | `POST` | `/api/admin/upload` | Upload video MP4 (tới 80MB) & ảnh (15MB) | Có | **ROLE_ADMIN** | Multipart/form-data validation | 200, 400, 403 | **PASS** |
| 50 | `GET` | `/api/admin/orders` | Danh sách đơn hàng toàn sàn | Có | **ROLE_ADMIN** | Lọc theo status, simulated | 200, 403 | **PASS** |
| 51 | `GET` | `/api/admin/orders/[id]` | Chi tiết đơn & lịch sử vận đơn | Có | **ROLE_ADMIN** | Order ID | 200, 403, 404 | **PASS** |
| 52 | `PUT` | `/api/admin/orders/[id]` | Cập nhật trạng thái đơn (CONFIRMED->SHIPPED) | Có | **ROLE_ADMIN** | Ghi nhận OrderStatusHistory | 200, 400, 403 | **PASS** |
| 53 | `GET` | `/api/admin/customers` | Danh sách và lịch sử khách hàng | Có | **ROLE_ADMIN** | Pagination, Search | 200, 403 | **PASS** |

---

## 2. KẾT LUẬN & ĐÁNH GIÁ API

1. **Tính Nhất Quán & Toàn Vẹn:** Tất cả 53 endpoint đều được kết nối với cơ sở dữ liệu TiDB Cloud thông qua Prisma Client, không sử dụng mock data tĩnh.
2. **Bảo Vệ Quyền Hạn (RBAC):** Tất cả các route `/api/admin/*` đều thực hiện kiểm tra `user.role === 'ROLE_ADMIN'`, người dùng thông thường hoặc khách chưa đăng nhập khi gọi API đều nhận phản hồi `403 Forbidden`.
3. **Xử Lý Dữ Liệu Decimal:** Các endpoint trả về sản phẩm và đơn hàng đều đã ép kiểu an toàn số thực JavaScript, giải quyết triệt để lỗi serialize JSON trong Next.js App Router.

