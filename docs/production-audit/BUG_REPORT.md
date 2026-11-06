# BẢNG THEO DÕI VÀ BÁO CÁO SỰ CỐ KỸ THUẬT (BUG REPORT)
## BBKCOMMERCE E-COMMERCE PLATFORM

- **Quy chuẩn đánh giá lỗi:**
  - **P0 (Blocking):** Làm sập hệ thống hoặc chặn đứng luồng thanh toán / bảo mật cốt lõi.
  - **P1 (High):** Lỗi ảnh hưởng nghiêm trọng đến tính ổn định hoặc trải nghiệm người dùng.
  - **P2 (Medium):** Lỗi giao diện nhỏ hoặc thiếu sót không gây mất dữ liệu.
  - **P3 (Low):** Cải tiến nhỏ về thẩm mỹ hoặc tối ưu hóa hiệu năng.

---

## 1. DANH SÁCH CÁC SỰ CỐ ĐÃ KHẮC PHỤC THÀNH CÔNG (RESOLVED ISSUES)

### [BUG-001] [P0 - RESOLVED] Crash toàn bộ trang Product Detail với thông báo "This page couldn't load"
- **Mức độ:** P0 (Blocking)
- **Tình trạng:** **ĐÃ SỬA VÀ KIỂM CHỨNG THÀNH CÔNG 100% TRÊN PRODUCTION**
- **Mô tả:** Truy cập bất kỳ URL sản phẩm nào trên web EC2 đều xuất hiện màn hình đen lỗi Next.js.
- **Nguyên nhân:** Kiểu `Decimal` từ database TiDB khi serialize qua JSON trong Next.js App Router không tự động chuyển thành `number`, dẫn đến lỗi `ratingsAvg.toFixed is not a function`. Đồng thời thiếu `error.tsx` boundary cấp segment.
- **Biện pháp xử lý:**
  - Ép kiểu an toàn bằng `Number(raw.ratingsAvg || 0)` và `Number(raw.regularPrice || 0)`.
  - Bổ sung `error.tsx` và `loading.tsx` tại [`src/app/products/[slug]/`](file:///d:/Test/src/app/products/[slug]/).
- **Bằng chứng kiểm chứng:** Kiểm thử live trên EC2: `http://54.255.194.4/products/lg-gram-pro-16-inch-2024` trả về HTTP `200 OK`, render đầy đủ thông tin sản phẩm và thông số kỹ thuật.

---

### [BUG-002] [P0 - RESOLVED] Pipeline GitHub Actions deploy lên EC2 bị dừng ở `Process exited with status 1`
- **Mức độ:** P0 (Blocking)
- **Tình trạng:** **ĐÃ SỬA VÀ KIỂM CHỨNG THÀNH CÔNG 100%**
- **Mô tả:** Các lần deploy qua GitHub Actions (Run #4 & #5) đều báo dấu X đỏ sau 9-14 giây do lỗi cú pháp shell SSH `script_stop: true`.
- **Nguyên nhân:** Các lệnh shell nhiều dòng chạy trong ngữ cảnh non-interactive SSH của `appleboy/ssh-action` gây lỗi ngắt tiến trình.
- **Biện pháp xử lý:** Ủy quyền toàn bộ lệnh deploy vào file độc lập [`scripts/deploy-ec2.sh`](file:///d:/Test/scripts/deploy-ec2.sh) và kích hoạt 2GB Swap Memory.
- **Bằng chứng kiểm chứng:** GitHub Actions Run #6, #7, #8, #9 đều chuyển sang trạng thái **Success (Tích xanh)**.

---

### [BUG-003] [P1 - RESOLVED] Banner không hiển thị video YouTube mà chỉ hiện ảnh tĩnh iPhone
- **Mức độ:** P1 (High)
- **Tình trạng:** **ĐÃ SỬA VÀ KIỂM CHỨNG THÀNH CÔNG 100%**
- **Mô tả:** Quản trị viên nhập đường link xem video YouTube (`https://www.youtube.com/watch?v=...`), nhưng trang chủ chỉ hiển thị ảnh tĩnh mockup iPhone 15 mà không phát video.
- **Nguyên nhân:** Thẻ `<video>` của HTML5 không thể phát trực tiếp trang web YouTube, phát sinh `onError` và component tự động fallback về ảnh poster Unsplash.
- **Biện pháp xử lý:** 
  - Thêm bộ tách mã Video ID thông minh `getYouTubeVideoId(url)` trong [`HeroBanner.tsx`](file:///d:/Test/src/components/home/HeroBanner.tsx) và trang Admin [`/admin/banners`](file:///d:/Test/src/app/admin/banners/page.tsx).
  - Tự động nhúng `<iframe>` full-bleed chạy ngầm (Cinematic Loop Autoplay Muted) không viền, không hiện thanh điều khiển YouTube.
- **Bằng chứng kiểm chứng:** Đã kiểm tra bundle trên EC2 (`/static/chunks/43hhm048jpyz3.js`), component đã tự động tải video YouTube background thành công.

---

## 2. DANH SÁCH CÁC VẤN ĐỀ CẦN XỬ LÝ ĐỂ GO-LIVE (OPEN ISSUES FOR GO-LIVE)

### [BUG-004] [P0 - OPEN] Website chưa chạy qua giao thức bảo mật HTTPS/SSL
- **Mức độ:** P0 (Blocking)
- **Tình trạng:** Cần hoàn tất trước khi mở bán thật.
- **Mô tả:** Website hiện đang truy cập qua `http://54.255.194.4/` (Port 80 không mã hóa).
- **Hậu quả:** Trình duyệt hiện cảnh báo *"Không bảo mật"*. Mật khẩu đăng nhập và thông tin khách hàng không được mã hóa trên đường truyền. Không thể tích hợp các cổng thanh toán ngân hàng trực tuyến.
- **Hướng xử lý:** Cấu hình tên miền và kích hoạt Let's Encrypt SSL qua Nginx. Độ phức tạp: Thấp (15 phút).

---

### [BUG-005] [P1 - OPEN] Chức năng Quên Mật Khẩu chưa gửi Email thực tế
- **Mức độ:** P1 (High)
- **Tình trạng:** Cần hoàn tất trước khi mở bán thật.
- **Mô tả:** Khách hàng bấm Quên mật khẩu tại `/login`, API `/api/auth/forgot-password` tạo token đặt lại mật khẩu nhưng chỉ in ra console máy chủ mà chưa gửi email đến hòm thư người dùng.
- **Hướng xử lý:** Tích hợp SDK gửi email (Resend hoặc Amazon SES) để chuyển token thành đường link click trực tiếp trong email. Độ phức tạp: Trung bình (1-2 giờ).

---

### [BUG-006] [P2 - OPEN] Nginx thiếu các Security Headers tiêu chuẩn
- **Mức độ:** P2 (Medium)
- **Tình trạng:** Khuyến nghị bổ sung để nâng điểm bảo mật.
- **Mô tả:** Phản hồi HTTP thiếu `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`.
- **Hướng xử lý:** Thêm 4 dòng `add_header` vào file cấu hình Nginx trên EC2. Độ phức tạp: Rất thấp (5 phút).

