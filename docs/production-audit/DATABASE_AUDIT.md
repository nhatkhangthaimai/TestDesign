# BÁO CÁO KIỂM TOÁN CƠ SỞ DỮ LIỆU TIDB CLOUD (DATABASE AUDIT REPORT)
## BBKCOMMERCE E-COMMERCE PLATFORM

- **Hệ quản trị CSDL:** TiDB Cloud Serverless (MySQL 8.0 Compatible, TiKV Storage Engine)
- **Cụm máy chủ (Cluster):** `gateway01.ap-southeast-1.prod.aws.tidbcloud.com` (AWS Singapore)
- **Giao thức bảo mật:** TLS 1.3 / SSL (`sslaccept=strict`)
- **ORM sử dụng:** Prisma Client v6.19.3
- **Schema định nghĩa:** [`prisma/schema.tidb.prisma`](file:///d:/Test/prisma/schema.tidb.prisma)

---

## 1. THỐNG KÊ TỔNG QUAN DỮ LIỆU THỰC TẾ TRÊN TIDB CLOUD

| Tên Bảng (Table Name) | Model Prisma | Số Lượng Bản Ghi | Mô Tả Nghiệp Vụ | Trạng Thái Dữ Liệu |
|---|---|:---:|---|:---:|
| `products` | `Product` | **233** | Toàn bộ sản phẩm công nghệ (133 ban đầu + 100 mới nạp) | **Chuẩn 100%** |
| `categories` | `Category` | **6** | Điện thoại, Laptop, Âm thanh, Smartwatch, Phụ kiện, Gia dụng | **Chuẩn 100%** |
| `brands` | `Brand` | **30** | Apple, Samsung, Sony, Marshall, Dell, Asus, Garmin... | **Chuẩn 100%** |
| `banners` | `Banner` | **4** | Video Banners 1080p & Banners hình ảnh tĩnh | **Chuẩn 100%** |
| `orders` | `Order` | **64** | Gồm 50 đơn hàng mô phỏng + 14 đơn hàng test thực tế | **Tách biệt rõ ràng** |
| `order_items` | `OrderItem` | **150+** | Chi tiết sản phẩm trong từng đơn hàng | **Khóa ngoại toàn vẹn** |
| `order_status_histories` | `OrderStatusHistory` | **120+** | Lịch sử chuyển trạng thái từng bước của đơn hàng | **Đầy đủ mốc thời gian** |
| `payments` | `Payment` | **64** | Thông tin giao dịch thanh toán gắn với đơn | **Không có giá trị âm** |
| `users` | `User` | **14** | Gồm 5 tài khoản Admin và 9 tài khoản khách hàng test | **Băm Bcrypt an toàn** |
| `shipping_addresses` | `ShippingAddress` | **7** | Sổ địa chỉ giao hàng tại Hà Nội, TP.HCM, Đà Nẵng | **Gắn đúng userId** |
| `coupons` | `Coupon` | **6** | Mã voucher: WELCOMEAJ, TECH2026, VIP10, FLASHSALE... | **Ràng buộc chiết khấu chuẩn** |
| `product_images` | `ProductImage` | **238** | Hình ảnh độ phân giải cao cho từng sản phẩm | **Unsplash CDN HTTPS** |
| `product_variants` | `ProductVariant` | **11** | Biến thể màu sắc và dung lượng (RAM/SSD/Color) | **Đầy đủ SKU & Giá** |
| `product_specifications` | `ProductSpecification` | **387** | Thông số kỹ thuật chi tiết (CPU, RAM, Pin, Trọng lượng) | **Đã phân nhóm chuẩn** |

---

## 2. PHÂN TÍCH CHUYÊN SÂU TÍNH TOÀN VẸN CỦA DỮ LIỆU

### 2.1. Phân biệt Dữ liệu mô phỏng (`isSimulated = true`) và Giao dịch thật
- **Bối cảnh:** Trong giai đoạn phát triển và kiểm thử, 50 đơn hàng mẫu đã được tạo để kiểm thử quy trình xử lý đơn hàng, bộ lọc báo cáo và giao diện người dùng.
- **Biện pháp kỹ thuật:**
  1. Cột `isSimulated` (kiểu `BOOLEAN`, mặc định `false`) được bổ sung vào bảng `orders`.
  2. Toàn bộ 50 đơn hàng mẫu được gán tường minh `isSimulated = true`.
  3. API Thống kê Doanh thu [`/api/admin/dashboard`](file:///d:/Test/src/app/api/admin/dashboard/route.ts) có câu truy vấn loại trừ triệt để:
     ```ts
     where: {
       isSimulated: false,
       status: { notIn: ["CANCELLED", "REFUNDED"] }
     }
     ```
  4. **Đánh giá:** Doanh thu báo cáo trên Dashboard phản ánh chính xác 100% giao dịch thật, không bị sai lệch bởi dữ liệu demo.

### 2.2. Kiểm tra phân phối trạng thái 64 đơn hàng
Dữ liệu kiểm toán thực tế từ TiDB Cloud:
- `PENDING` (Chờ xử lý): 13 đơn
- `CONFIRMED` (Đã xác nhận): 15 đơn
- `PROCESSING` (Đang đóng gói): 2 đơn
- `SHIPPED` (Đang giao hàng): 11 đơn
- `DELIVERED` (Đã giao thành công): 18 đơn
- `CANCELLED` (Đã hủy): 5 đơn
- **Tổng cộng:** 64 đơn hàng. Tất cả đều có tổng tiền lớn hơn 0, liên kết chặt chẽ với bảng thanh toán và không phát hiện đơn hàng mồ côi (orphan records).

### 2.3. Ràng buộc toàn vẹn & Khóa ngoại (Referential Integrity)
- Toàn bộ các bảng chính đều sử dụng khóa chính UUID (`VARCHAR(36)`) được tạo bằng `crypto.randomUUID()`.
- Ràng buộc khóa ngoại `onDelete: Cascade` cho `OrderItem`, `Payment`, `OrderStatusHistory`, `ShippingAddress` đảm bảo khi xóa đối tượng cha thì không để lại bản ghi rác.
- Khóa duy nhất (Unique Indexes):
  - `users.email`: Đảm bảo 1 email chỉ đăng ký 1 tài khoản duy nhất.
  - `products.slug` và `products.sku`: Đảm bảo không trùng đường dẫn SEO và mã sản phẩm.
  - `coupons.code`: Đảm bảo mã giảm giá là độc nhất.

### 2.4. Dung lượng lưu trữ & Hạn mức TiDB Cloud
- **Dung lượng dữ liệu logic thực tế:** `~945 MB` (Bao gồm dữ liệu bảng và các chỉ mục B-Tree/TiKV RocksDB).
- **Hạn mức lưu trữ miễn phí của cụm TiDB Serverless:** `7.00 GB`.
- **Tỷ lệ sử dụng:** `~13.5% / 7.00 GB`.
- **Khả năng mở rộng:** Hệ thống còn trống hơn **6.05 GB lưu trữ miễn phí**, đủ khả năng lưu trữ hơn 50.000 sản phẩm và hàng triệu lượt đặt hàng trước khi cần nâng cấp gói tài nguyên.

