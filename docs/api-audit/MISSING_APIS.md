# AJ COMMERCE - BÁO CÁO CÁC API THIẾU ĐÃ ĐƯỢC BỔ SUNG TOÀN DIỆN

Trong quá trình audit kiến trúc toàn sàn và quét tương tác người dùng trên giao diện frontend (`/cart`, `/checkout`, `/account`, `/admin`), chúng tôi đã phát hiện và phát triển bổ sung đầy đủ **18 API endpoints bị thiếu** để đảm bảo hệ thống vận hành chuẩn chỉnh, không phụ thuộc vào mock data tạm thời.

---

## 1. DANH SÁCH 18 API ĐÃ ĐƯỢC TẠO MỚI HOÀN TOÀN

### 1.1. Miền Giỏ Hàng (Cart Management)
1. **`GET /api/cart`**: Lấy danh sách sản phẩm trong giỏ của người dùng từ cơ sở dữ liệu. Tự động kiểm tra giá bán và tình trạng tồn kho mới nhất, loại bỏ tình trạng người dùng xem giá cũ lưu trên client.
2. **`POST /api/cart`**: Thêm sản phẩm vào giỏ hàng với kiểm tra tồn kho nghiêm ngặt tại server.
3. **`PATCH /api/cart`**: Thay đổi số lượng sản phẩm trong giỏ, hỗ trợ tra cứu linh hoạt qua cả `itemId` và `productId`.
4. **`DELETE /api/cart`**: Xóa 1 mặt hàng hoặc làm trống toàn bộ giỏ sau khi đặt hàng thành công.
5. **`POST /api/cart/sync`**: Đồng bộ giỏ hàng vãng lai (guest items trên localStorage) vào tài khoản thành viên ngay khi đăng nhập.

### 1.2. Miền Quản Lý Người Dùng & Bảo Mật (Profile & Security)
6. **`GET /api/auth/profile`**: Trả về hồ sơ người dùng đầy đủ (họ tên, email, điện thoại, avatar, sổ địa chỉ nhận hàng và số lượng đơn).
7. **`PUT /api/auth/profile`**: Cho phép người dùng chỉnh sửa thông tin cá nhân.
8. **`POST /api/auth/change-password`**: Đổi mật khẩu với việc đối chiếu bcrypt hash của mật khẩu cũ.
9. **`POST /api/auth/forgot-password`**: Yêu cầu đặt lại mật khẩu bằng cách tạo reset token JWT thời hạn 1 giờ.
10. **`POST /api/auth/reset-password`**: Xác minh reset token và cập nhật mật khẩu mã hóa mới.

### 1.3. Miền Danh Mục & Thương Hiệu (Categories & Brands Detail)
11. **`GET /api/categories/[slug]`**: Lấy chi tiết danh mục theo đường dẫn thân thiện (slug), bao gồm cả cây danh mục con và số sản phẩm.
12. **`GET /api/brands/[slug]`**: Lấy chi tiết thương hiệu đối tác.

### 1.4. Miền Thanh Toán & Webhook (Payments)
13. **`POST /api/payments`**: Khởi tạo phiên thanh toán (COD, VNPAY, MOMO, Bank Transfer) gắn liền với đơn hàng.
14. **`GET /api/payments/[id]/status`**: Tra cứu trạng thái thanh toán đơn hàng.
15. **`POST /api/payments/webhook`**: Nhận callback từ các cổng thanh toán với cơ chế chống xử lý trùng lặp (Idempotency).

### 1.5. Miền Media & Upload (Uploads)
16. **`POST /api/upload`**: Upload tệp tin hình ảnh với kiểm tra dung lượng tối đa (5MB) và kiểm duyệt định dạng an toàn (JPEG, PNG, WebP, GIF, SVG).

### 1.6. Miền Quản Trị Danh Mục & Kho Bãi (Admin Management)
17. **`GET & POST /api/admin/categories`** và **`PUT & DELETE /api/admin/categories/[id]`**: Quản lý danh mục từ trang quản trị.
18. **`GET & POST /api/admin/brands`** và **`PUT & DELETE /api/admin/brands/[id]`**: Quản lý thương hiệu đối tác.
19. **`GET & PATCH /api/admin/inventory`**: Quản lý tồn kho theo từng kho hàng (`WH-HCM-01`, `WH-HN-01`), cảnh báo hàng sắp hết và ghi nhận lịch sử biến động kho `InventoryTransaction`.
20. **`GET & POST & PUT & DELETE /api/admin/banners`**: Quản lý banner quảng cáo trang chủ.
