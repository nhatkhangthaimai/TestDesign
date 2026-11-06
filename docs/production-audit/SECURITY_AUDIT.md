# BÁO CÁO KIỂM TOÁN AN TOÀN THÔNG TIN & BẢO MẬT (SECURITY AUDIT REPORT)
## BBKCOMMERCE E-COMMERCE PLATFORM

- **Tiêu chuẩn tham chiếu:** OWASP Top 10 Web Application Security Risks (2021)
- **Mức độ rủi ro tổng thể:** **MEDIUM (TRUNG BÌNH - Chủ yếu do thiếu SSL/HTTPS)**
- **Khả năng chống tấn công của mã nguồn:** **XUẤT SẮC (HIGH RESILIENCE)**

---

## 1. MA TRẬN ĐÁNH GIÁ OWASP TOP 10 TRÊN BBKCOMMERCE

| Mã OWASP | Loại Lỗ Hổng Bảo Mật | Đánh Giá Trên BBKCommerce | Biện Pháp Kiểm Soát Kỹ Thuật | Trạng Thái |
|:---:|---|:---:|---|:---:|
| **A01:2021** | Broken Access Control (Kiểm soát truy cập yếu / IDOR) | **AN TOÀN** | Tất cả API Admin kiểm tra `user.role === 'ROLE_ADMIN'`. API User lọc cứng theo `userId` phiên đăng nhập | **PASS** |
| **A02:2021** | Cryptographic Failures (Lộ dữ liệu nhạy cảm / Mật khẩu yếu) | **CẦN CẢI THIỆN** | Mật khẩu băm Bcrypt 10 rounds; nhưng website chạy HTTP chưa bật SSL nên mật khẩu truyền trên mạng không mã hóa | **FAIL (Cần SSL)** |
| **A03:2021** | Injection (SQL Injection, Command Injection) | **AN TOÀN** | Sử dụng Prisma ORM với 100% Prepared Statements, loại trừ hoàn toàn nguy cơ SQLi | **PASS** |
| **A04:2021** | Insecure Design (Thiết kế thiếu an toàn) | **AN TOÀN** | Giá tiền tính toán 100% ở Backend, trừ tồn kho nguyên tử qua Prisma Transaction | **PASS** |
| **A05:2021** | Security Misconfiguration (Cấu hình bảo mật sai sót) | **CẦN CẢI THIỆN** | Nginx thiếu các HTTP Security Headers (`X-Frame-Options`, `HSTS`, `CSP`) | **PARTIAL** |
| **A06:2021** | Vulnerable and Outdated Components | **AN TOÀN** | Sử dụng Next.js 16.4.3, React 19.3.0, Prisma 6.19.3, kiểm tra `npm audit` không có CVE nghiêm trọng | **PASS** |
| **A07:2021** | Identification & Authentication Failures | **AN TOÀN** | JWT bí mật lưu trong biến môi trường `.env`, cookie `HttpOnly`, `SameSite=Lax` | **PASS** |
| **A08:2021** | Software & Data Integrity Failures | **AN TOÀN** | Webhook thanh toán có cơ chế kiểm tra chữ ký số HMAC-SHA256 bí mật | **PASS** |
| **A09:2021** | Security Logging & Monitoring Failures | **KHÁ** | Có ghi nhận log đăng nhập, đổi mật khẩu và thao tác đơn hàng | **PASS** |
| **A10:2021** | Server-Side Request Forgery (SSRF) | **AN TOÀN** | Không có endpoint nào nhận URL tùy ý từ client để fetch dữ liệu ra ngoài | **PASS** |

---

## 2. PHÂN TÍCH CHI TIẾT CÁC LỖ HỔNG CẦN KHẮC PHỤC TRƯỚC KHI GO-LIVE

### 2.1. Lỗ hổng P0 - Thiếu chứng chỉ mã hóa đường truyền SSL/HTTPS
- **Mức độ nghiêm trọng:** **P0 – BLOCKING**
- **Mô tả:** Website hiện đang được phục vụ thông qua giao thức HTTP không mã hóa tại cổng 80 (`http://54.255.194.4/`).
- **Hậu quả:** 
  1. Khi người dùng nhập email và mật khẩu tại `/login` hoặc số thẻ/địa chỉ tại `/checkout`, toàn bộ thông tin này bị gửi dưới dạng văn bản thô (Plaintext). Kẻ tấn công trong cùng mạng WiFi (Man-In-The-Middle - MITM) có thể nghe lén được toàn bộ.
  2. Các trình duyệt hiện đại (Chrome, Safari, Edge) hiển thị cảnh báo đỏ *"Not Secure / Không bảo mật"*, làm mất uy tín thương hiệu.
  3. Không thể tích hợp các cổng thanh toán thực tế (VNPay, MoMo, OnePay bắt buộc URL callback phải là HTTPS).
- **Giải pháp khắc phục:**
  - Trỏ tên miền chính thức (vd: `ajcommerce.vn`) về IP `54.255.194.4`.
  - Cài đặt công cụ Certbot và sinh chứng chỉ SSL Let's Encrypt hoàn toàn miễn phí:
    ```bash
    sudo apt install -y certbot python3-certbot-nginx
    sudo certbot --nginx -d ajcommerce.vn
    ```

### 2.2. Lỗ hổng P1 - Thiếu HTTP Security Headers trên Nginx
- **Mức độ nghiêm trọng:** **P1 – HIGH**
- **Mô tả:** Kiểm tra phản hồi HTTP từ Nginx (`54.255.194.4`) cho thấy chưa có các tiêu đề bảo vệ tiêu chuẩn:
  - `X-Frame-Options: DENY`: Chống tấn công Clickjacking (lồng website vào iframe ẩn).
  - `X-Content-Type-Options: nosniff`: Chống MIME-type sniffing.
  - `Strict-Transport-Security`: Bắt buộc trình duyệt luôn sử dụng HTTPS.
  - `Referrer-Policy: strict-origin-when-cross-origin`.
- **Giải pháp:** Bổ sung vào cấu hình Nginx `/etc/nginx/sites-available/default`:
  ```nginx
  add_header X-Frame-Options "DENY" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header Referrer-Policy "strict-origin-when-cross-origin" always;
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
  ```

### 2.3. Lỗ hổng P2 - Rate Limiting trên các endpoint nhạy cảm
- **Mức độ nghiêm trọng:** **P2 – MEDIUM**
- **Mô tả:** Các endpoint `/api/auth/login` và `/api/auth/forgot-password` hiện chưa giới hạn số lần thử trong 1 phút, có nguy cơ bị tấn công dò quét mật khẩu (Brute-force).
- **Giải pháp:** Cấu hình module `limit_req_zone` của Nginx hoặc sử dụng middleware in-memory rate limiter (5 lần sai/phút/IP).

