# AJ COMMERCE - NỀN TẢNG THƯƠNG MẠI ĐIỆN TỬ CAO CẤP (PRODUCTION READY)

Hệ thống thương mại điện tử chuyên nghiệp, hoàn chỉnh toàn bộ tính năng từ **Khách hàng mua sắm (Storefront)** đến **Trung tâm điều hành doanh nghiệp (Admin Portal)**, đáp ứng các tiêu chuẩn khắt khe về bảo mật, hiệu năng và thẩm mỹ biên tập cao cấp theo tài liệu [DESIGN.md](DESIGN.md).

---

## 1. Công Nghệ Sử Dụng (Tech Stack)

### Frontend
- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS với bộ design tokens tùy biến cao cấp từ [DESIGN.md](DESIGN.md)
  - Jazeera Orange (`#fa9000`), Live Red (`#c31833`), Ink (`#000000`), Charcoal (`#333333`), Slate (`#595959`)
  - Corporate/Admin Palette: Night Canvas (`#181818`), Night Navy (`#100e2f`), Royal Indigo (`#272967`), Gold (`#dba200`)
- **Typography**: Phông chữ **Roboto** đa trọng số (300 Uppercase Section Eyebrow, 400 Body, 700 Headline, 900 Live Badge)
- **Icons**: Lucide Icons
- **Hiệu ứng & Hoạt ảnh**: Animation, Toast notification, Confetti ăn mừng đặt hàng thành công (`canvas-confetti`)
- **Validation**: Zod + React Hook Form

### Backend & API
- **Kiến trúc**: Next.js App Router API Route Handlers
- **Authentication**: JWT bảo mật qua Cookie HttpOnly, phân quyền đa cấp (`ROLE_USER`, `ROLE_ADMIN`)
- **Mã hóa mật khẩu**: bcryptjs
- **Xác thực giá & tồn kho**: **Hoàn toàn tại Backend**, tuyệt đối không tin cậy dữ liệu giá gửi lên từ Client
- **Concurrency & Transactions**: Prisma `$transaction` nguyên khối đảm bảo kiểm tra tồn kho, trừ kho và ghi nhận lịch sử đơn hàng an toàn khi nhiều khách đặt đồng thời

### Cơ Sở Dữ Liệu & ORM
- **ORM**: Prisma ORM v6
- **Database Môi Trường Dev**: SQLite (`file:./dev.db`) – Khởi chạy ngay lập tức không cần cài đặt dịch vụ ngoài
- **Database Môi Trường Production**: PostgreSQL 16 (`prisma/schema.postgresql.prisma`) với kiểu dữ liệu `Decimal(12, 2)`, Index tối ưu và Enums chuẩn

---

## 2. Tài Khoản Thử Nghiệm Có Sẵn (Demo Accounts)

Sau khi chạy seed script, hệ thống đã nạp sẵn 2 tài khoản mẫu:

| Loại Tài Khoản | Email | Mật Khẩu | Phân Quyền | Chức Năng |
|---|---|---|---|---|
| **Quản Trị Viên (Admin)** | `admin@ecommerce.vn` | `Admin@123456` | `ROLE_ADMIN` | Quản lý doanh thu, xuất file CSV, duyệt đơn hàng, quản lý sản phẩm, tạo voucher |
| **Khách Hàng (Customer)** | `khachhang@ecommerce.vn` | `User@123456` | `ROLE_USER` | Mua hàng, xem lịch sử đơn, hủy đơn chờ xử lý, gửi đánh giá sản phẩm |

*Lưu ý: Tại trang Đăng nhập (`/login`), có sẵn nút bấm 1-click để tự động điền thông tin tài khoản Admin hoặc Khách hàng rất tiện lợi.*

---

## 3. Hướng Dẫn Cài Đặt & Chạy Môi Trường Local

### Yêu cầu tiên quyết
- **Node.js**: v20+ hoặc v22+
- **npm** hoặc **pnpm**

### Bước 1: Cài đặt dependencies
```bash
npm install
```

### Bước 2: Thiết lập biến môi trường
File `.env` đã được cấu hình sẵn cho môi trường chạy local:
```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="aj_ecommerce_production_secure_jwt_secret_2026_xyz987"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Bước 3: Khởi tạo database và nạp dữ liệu mẫu (Seed Data)
```bash
# Đồng bộ Prisma Schema vào SQLite
npx prisma db push

# Nạp dữ liệu sản phẩm, danh mục, tài khoản, đơn hàng mẫu
npm run seed
```

### Bước 4: Chạy kiểm thử tự động (Automated Test Suite)
Hệ thống đi kèm kịch bản kiểm thử toàn diện kiểm tra 13 luồng cốt lõi:
```bash
npx tsx scripts/test-flows.ts
```

### Bước 5: Khởi động server phát triển
```bash
npm run dev
```
Truy cập website tại: [http://localhost:3000](http://localhost:3000)

---

## 4. Các Trang Chức Năng Đã Triển Khai

### 4.1. Dành cho Khách Hàng (Customer Storefront)
- **Trang chủ (`/`)**:
  - Masthead với logo block `#fa9000`, thanh tìm kiếm capsule, thanh xu hướng tìm kiếm
  - Banner Hero mở bán đặc quyền với CTA rõ ràng
  - **Flash Sale Giờ Vàng**: Đồng hồ đếm ngược thời gian thực, live red badge với chấm xung nhịp
  - Danh mục phổ biến, bộ sưu tập bán chạy / hàng mới về
  - Vé giảm giá độc quyền: `WELCOME10` (giảm 10%), `FLASHSALE100K` (giảm 100k), `VIP500K` (giảm 500k) với nút 1-click copy code
  - Cam kết 100% chính hãng VNA, giao 2H, đổi trả 30 ngày, bảo hành 12 tháng
  - Form đăng ký nhận bản tin khuyến mãi
- **Danh sách sản phẩm (`/products`)**:
  - Bộ lọc danh mục, thương hiệu (Apple, Sony, Marshall, Garmin), khoảng giá
  - Sắp xếp giá tăng/giảm, bán chạy, mới nhất, đánh giá cao
  - Chuyển đổi hiển thị Lưới (Grid) hoặc Danh sách (List)
  - Đồng bộ URL query parameters
  - Modal xem nhanh sản phẩm (Quick View)
- **Chi tiết sản phẩm (`/products/[slug]`)**:
  - Thư viện ảnh nhiều góc độ với thumbnail chuyển đổi
  - Chọn biến thể (màu sắc, dung lượng) với giá và tồn kho tương ứng
  - Cảnh báo tồn kho theo thời gian thực (còn hàng / sắp hết / hết hàng)
  - Đánh giá của khách hàng và form viết đánh giá có xác thực đăng nhập
  - Sản phẩm cùng danh mục
- **Giỏ hàng (`/cart` và Slide-out Drawer)**:
  - Cập nhật số lượng (+ / -), xóa sản phẩm, kiểm tra tồn kho
  - Áp dụng mã giảm giá với xác thực giá trị đơn tối thiểu qua API
  - Quy tắc phí vận chuyển: Miễn phí cho đơn từ 500.000₫, dưới 500.000₫ tính 30.000₫
- **Thanh toán (`/checkout`)**:
  - Form thông tin người nhận, địa chỉ hành chính tại Việt Nam
  - Phương thức thanh toán: COD, VNPay Sandbox, MoMo, Chuyển khoản VietQR
  - Kiểm tra và tính toán lại giá, tồn kho độc lập tại Backend
- **Xác nhận đặt hàng (`/order-success/[orderId]`)**:
  - Hiệu ứng pháo giấy Confetti chúc mừng
  - Biên nhận chi tiết mã đơn, sản phẩm và địa chỉ giao hàng
- **Tra cứu đơn hàng (`/order-tracking`)**:
  - Thanh tiến trình 5 bước: `ĐÃ ĐẶT HÀNG` → `ĐÃ XÁC NHẬN` → `ĐANG ĐÓNG GÓI` → `ĐANG VẬN CHUYỂN` → `GIAO THÀNH CÔNG`
  - Nhật ký thay đổi trạng thái có thời gian chi tiết
  - Hỗ trợ hủy đơn hàng trực tiếp khi đang ở trạng thái `PENDING`
- **Tài khoản người dùng (`/account`, `/account/orders`, `/account/wishlist`)**:
  - Hồ sơ cá nhân, tổng chi tiêu tích lũy
  - Danh sách đơn hàng đã mua và danh sách sản phẩm yêu thích

### 4.2. Dành cho Quản Trị Viên (Admin Portal - `/admin`)
- **Dashboard Tổng Quan (`/admin`)**:
  - 4 thẻ KPI: Doanh thu thực tế, Tổng số đơn, Đơn cần xử lý, Tổng khách hàng & cảnh báo tồn kho
  - Danh sách đơn hàng mới nhất
  - Danh sách sản phẩm sắp hết hàng cần nhập thêm
- **Quản lý sản phẩm (`/admin/products`)**:
  - Bảng danh sách sản phẩm đầy đủ thông tin tồn kho, giá bán, SKU
  - Modal thêm sản phẩm mới (tự động tạo slug, nhập SKU, giá, ảnh, thuộc tính)
  - Xóa/ẩn sản phẩm bảo vệ toàn vẹn dữ liệu đơn hàng cũ
- **Quản lý đơn hàng (`/admin/orders`)**:
  - Lọc đơn theo trạng thái: Tất cả, Chờ xác nhận, Đang đóng gói, Đang giao, Đã giao, Đã hủy
  - Chuyển đổi trạng thái đơn hàng và trạng thái thanh toán chỉ với 1 click
  - Ghi nhận lịch sử người cập nhật vào bảng `OrderStatusHistory`
  - **Xuất file CSV chuẩn UTF-8 BOM**: Tương thích hoàn hảo với Microsoft Excel mà không bị lỗi font tiếng Việt
- **Quản lý khách hàng (`/admin/customers`)**:
  - Thống kê số lượng đơn và tổng chi tiêu của từng khách hàng
- **Quản lý mã giảm giá (`/admin/coupons`)**:
  - Tạo mã giảm giá mới (theo % hoặc số tiền cố định, đơn tối thiểu, số lượt tối đa, ngày hết hạn)
  - Xóa voucher khi kết thúc chiến dịch

---

## 5. Danh Sách REST API Backend

| Phương thức | Đường dẫn API | Mô tả chức năng | Quyền yêu cầu |
|---|---|---|---|
| `POST` | `/api/auth/register` | Đăng ký tài khoản người dùng mới | Công khai |
| `POST` | `/api/auth/login` | Đăng nhập tài khoản & cấp Cookie JWT | Công khai |
| `POST` | `/api/auth/logout` | Đăng xuất & xóa Cookie | Công khai |
| `GET` | `/api/auth/me` | Lấy thông tin user hiện tại từ phiên đăng nhập | Khách đã đăng nhập |
| `GET` | `/api/products` | Danh sách sản phẩm có tìm kiếm, lọc, phân trang | Công khai |
| `GET` | `/api/products/[slug]` | Chi tiết sản phẩm, biến thể, đánh giá, hàng liên quan | Công khai |
| `GET` | `/api/categories` | Danh sách danh mục sản phẩm | Công khai |
| `GET` | `/api/brands` | Danh sách thương hiệu đối tác | Công khai |
| `POST` | `/api/coupons/apply` | Xác minh và tính số tiền giảm giá voucher | Công khai |
| `POST` | `/api/orders` | Tạo đơn hàng (Transaction trừ kho, tính giá chuẩn) | Khách / Đã đăng nhập |
| `GET` | `/api/orders` | Lấy danh sách đơn hàng của người dùng hiện tại | Đã đăng nhập |
| `GET` | `/api/orders/[id]` | Chi tiết đơn hàng theo ID hoặc OrderNumber | Công khai / Người tạo |
| `POST` | `/api/orders/[id]/cancel` | Hủy đơn hàng và hoàn trả tồn kho tự động | Người tạo / Admin |
| `POST` | `/api/reviews` | Gửi đánh giá sao và bình luận sản phẩm | Đã đăng nhập |
| `GET` | `/api/wishlist` | Lấy danh sách yêu thích của người dùng | Đã đăng nhập |
| `POST` | `/api/wishlist` | Thêm / xóa sản phẩm khỏi danh sách yêu thích | Đã đăng nhập |
| `GET` | `/api/admin/dashboard` | Thống kê doanh thu, đơn hàng, khách hàng | `ROLE_ADMIN` |
| `GET` | `/api/admin/products` | Danh sách tất cả sản phẩm phục vụ quản trị | `ROLE_ADMIN` |
| `POST` | `/api/admin/products` | Tạo mới sản phẩm | `ROLE_ADMIN` |
| `PUT` | `/api/admin/products/[id]` | Cập nhật thông tin sản phẩm | `ROLE_ADMIN` |
| `DELETE` | `/api/admin/products/[id]`| Xóa / ẩn sản phẩm | `ROLE_ADMIN` |
| `GET` | `/api/admin/orders` | Danh sách đơn hàng toàn hệ thống có lọc | `ROLE_ADMIN` |
| `PUT` | `/api/admin/orders/[id]` | Chuyển đổi trạng thái đơn và thanh toán | `ROLE_ADMIN` |
| `GET` | `/api/admin/orders/export`| Xuất file CSV danh sách đơn hàng | `ROLE_ADMIN` |
| `GET` | `/api/admin/customers` | Danh sách khách hàng và lịch sử chi tiêu | `ROLE_ADMIN` |
| `GET` | `/api/admin/coupons` | Danh sách mã giảm giá | `ROLE_ADMIN` |
| `POST` | `/api/admin/coupons` | Tạo mới mã giảm giá | `ROLE_ADMIN` |
| `DELETE` | `/api/admin/coupons/[id]`| Xóa mã giảm giá | `ROLE_ADMIN` |

---

## 6. Hướng Dẫn Triển Khai Production (Docker & VPS)

### 6.1. Triển khai bằng Docker Compose (Khuyên dùng)
Dự án đã tích hợp sẵn `Dockerfile` đa tầng và `docker-compose.yml` gồm PostgreSQL 16 và container Next.js:

```bash
# 1. Chuyển schema sang PostgreSQL nếu muốn dùng native Postgres container
cp prisma/schema.postgresql.prisma prisma/schema.prisma

# 2. Khởi chạy toàn bộ hệ thống bằng Docker Compose
docker compose up -d --build

# 3. Đồng bộ schema và nạp dữ liệu vào PostgreSQL trong container
docker compose exec web npx prisma db push
docker compose exec web npm run seed
```

### 6.2. Cấu hình Nginx Reverse Proxy & SSL (Trên Ubuntu VPS)

Tạo file cấu hình `/etc/nginx/sites-available/ecommerce`:
```nginx
server {
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Kích hoạt và cấp chứng chỉ SSL miễn phí qua Certbot:
```bash
sudo ln -s /etc/nginx/sites-available/ecommerce /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### 6.3. Sao Lưu & Phục Hồi Cơ Sở Dữ Liệu (Backup & Restore)

**Sao lưu định kỳ (Backup):**
```bash
# Đối với PostgreSQL (Docker)
docker exec -t aj_ecommerce_db pg_dump -U ecommerce_user ecommerce_db > backup_$(date +%F).sql

# Đối với SQLite
cp dev.db backup_$(date +%F).db
```

**Phục hồi dữ liệu (Restore):**
```bash
# Đối với PostgreSQL
cat backup_2026-10-26.sql | docker exec -i aj_ecommerce_db psql -U ecommerce_user -d ecommerce_db
```

---

## 7. Kết Luận & Nghiệm Thu Dự Án

Hệ thống đã hoàn tất và được nghiệm thu:
1. **Tuân thủ thiết kế [DESIGN.md](DESIGN.md)**: Tone màu chuẩn (Jazeera Orange, Live Red, Ink, Slate, Hairline và Night Canvas cho Admin). Phông chữ Roboto với hệ thống Section Eyebrow Bar đặc trưng.
2. **Không có placeholder, không có API giả**: Toàn bộ dữ liệu hiển thị lấy từ Database thực, quy trình đặt hàng, tính mã giảm giá, trừ tồn kho và cập nhật đơn hàng diễn ra nguyên khối (Atomic Transaction).
3. **Đã kiểm thử thành công**: 13/13 test cases đều PASS, `npm run build` thành công 100% với 36 routes chuẩn Next.js 16.
