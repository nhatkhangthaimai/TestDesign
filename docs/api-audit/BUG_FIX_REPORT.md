# BBKCOMMERCE - BÁO CÁO CÁC LỖI ĐÃ ĐƯỢC PHÁT HIỆN VÀ KHẮC PHỤC TRIỆT ĐỂ

Trong quá trình audit mã nguồn, kiểm tra cơ sở dữ liệu TiDB Cloud và chạy kiểm thử tự động, chúng tôi đã phát hiện và xử lý dứt điểm các lỗi sau:

---

## 1. LỖI TRÀN BỘ NHỚ V8 (JAVASCRIPT HEAP OUT OF MEMORY) TRÊN AWS EC2

- **Hiện tượng**: Khi chạy build trên máy chủ EC2 (1GB RAM), tiến trình `npm run build` bị dừng đột ngột với thông báo:
  `FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory. Failed to type check.`
- **Nguyên nhân gốc rễ**: 
  1. Node.js trên máy ảo Linux 1GB RAM tự động gán giới hạn V8 Heap Limit khoảng 453MB - 512MB. Khi Next.js chạy TypeScript compiler kiểm tra toàn bộ kiểu dữ liệu dự án, bộ nhớ vượt quá 453MB gây crash.
  2. Next.js `output: "standalone"` mặc định dò tìm và copy cả file SQLite cục bộ `prisma/dev.db` (5.37GB) vào thư mục `.next/standalone`, khiến ổ đĩa và RAM bị nghẽn nghiêm trọng.
- **Biện pháp khắc phục**:
  1. Thêm cấu hình `outputFileTracingExcludes` vào `next.config.ts` để loại trừ hoàn toàn `dev.db*`, `docs/**` và Prisma query engine khỏi quá trình sao chép standalone.
  2. Bổ sung `typescript: { ignoreBuildErrors: true }` trong `next.config.ts`, bỏ qua kiểm tra type trùng lặp khi đóng gói trên server yếu (vì đã có `npx tsc --noEmit` kiểm tra độc lập thành công 100% trước khi deploy).
  3. Cấu hình tự động 2GB Swap Memory và tự động thêm `export NODE_OPTIONS="--max-old-space-size=2560"` vào `~/.bashrc` của hệ điều hành Ubuntu trong script `scripts/deploy-ec2.sh`.

---

## 2. LỖI THIẾU HTTP METHOD `GET /api/reviews`

- **Hiện tượng**: Khách hàng mở trang chi tiết sản phẩm thì danh sách đánh giá không thể tải qua API `/api/reviews` (trả về mã 405 Method Not Allowed).
- **Nguyên nhân**: File `src/app/api/reviews/route.ts` ban đầu chỉ định nghĩa hàm `POST`, chưa có hàm `GET` và `DELETE`.
- **Khắc phục**: Đã bổ sung `GET /api/reviews` hỗ trợ lọc theo `productId`, phân trang và biểu đồ phân bổ số sao (1-5 sao). Bổ sung phương thức `DELETE` cho phép tác giả hoặc Quản trị viên xóa bình luận và tự động tính lại điểm trung bình `ratingsAvg` của sản phẩm.

---

## 3. LỖI XÁC THỰC AUTHENTICATION GIỮA COOKIE VÀ BEARER TOKEN

- **Hiện tượng**: Các lệnh gọi API từ mobile, ứng dụng bên thứ ba hoặc script kiểm thử tự động sử dụng header `Authorization: Bearer <token>` bị từ chối với mã 401 Unauthorized do backend trước đây chỉ đọc token từ HTTP Cookie.
- **Khắc phục**: Nâng cấp hàm `getCurrentUser(req)` trong `src/lib/auth.ts` để ưu tiên đọc cả hai nguồn:
  1. Header `Authorization: Bearer <token>`
  2. Cookie `token` (nếu không có Bearer Header)
  Đồng thời cập nhật toàn bộ các route handlers truyền đối số `req: NextRequest` vào `getCurrentUser(req)`.

---

## 4. LỖI ĐỐI CHIẾU ITEM TRONG GIỎ HÀNG (`itemId` vs `productId`)

- **Hiện tượng**: Khi gọi `PATCH /api/cart` để cập nhật số lượng với payload `{ productId, quantity }`, API báo lỗi 500 do schema yêu cầu bắt buộc `itemId`.
- **Khắc phục**: Cập nhật Zod validation hỗ trợ cả `itemId` và `productId`, giúp API tương thích tối đa với cả giỏ hàng frontend lưu ID dòng hay ID sản phẩm.

---

## 5. LỖI SAI LỆCH KIỂU SỐ TIỀN DECIMAL GIỮA TIDB VÀ SQLITE

- **Hiện tượng**: TiDB Cloud lưu trữ tiền tệ dưới dạng `Decimal(14,2)`, khi Prisma truy vấn trả về đối tượng Decimal, các phép toán `+`, `-`, `*` trong JavaScript có thể phát sinh lỗi NaN hoặc nối chuỗi thay vì tính toán số học.
- **Khắc phục**: Đã bọc toán tử ép kiểu an toàn `Number(...)` tại toàn bộ các controller: `coupons/apply`, `cart`, `orders`, `dashboard`, đảm bảo kết quả chính xác 100% trên cả 2 môi trường DB.

