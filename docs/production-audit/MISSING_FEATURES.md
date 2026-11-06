# DANH MỤC CÁC TÍNH NĂNG CÒN THIẾU HOẶC CẦN NÂNG CẤP (MISSING FEATURES)
## BBKCOMMERCE E-COMMERCE PLATFORM

Báo cáo này liệt kê các tính năng kỹ thuật và nghiệp vụ chưa có hoặc mới triển khai ở mức cơ bản, cần được bổ sung trước hoặc sau khi website chính thức đi vào kinh doanh thực tế.

---

## 1. PHÂN LOẠI THEO MỨC ĐỘ ƯU TIÊN

### 1.1. Nhóm Bắt Buộc Trước Khi Bán Hàng Thật (P0 – Blocking)

1. **Chứng chỉ bảo mật SSL/HTTPS & Tên miền thương hiệu:**
   - *Hiện trạng:* Đang truy cập qua IP `54.255.194.4` (HTTP không mã hóa).
   - *Cần bổ sung:* Trỏ tên miền (ví dụ: `ajcommerce.vn`) và kích hoạt chứng chỉ SSL Let's Encrypt.
2. **Cổng thanh toán điện tử nội địa thực tế (VNPay / MoMo / ZaloPay):**
   - *Hiện trạng:* Đang hỗ trợ thanh toán khi nhận hàng (COD) và chuyển khoản ngân hàng qua mã QR tĩnh; API Webhook mới ở dạng khung chuẩn HMAC.
   - *Cần bổ sung:* Ký hợp đồng tích hợp cổng thanh toán trực tuyến (VNPay Gateway hoặc MoMo Business) để khách hàng có thể quét mã VietQR tự động hoặc thanh toán thẻ ATM nội địa/quốc tế (Visa/Mastercard) với phản hồi tức thì.
3. **Dịch vụ gửi Email thông báo tự động (Transactional Email Service):**
   - *Hiện trạng:* Chức năng quên mật khẩu `/api/auth/forgot-password` mới in token ra console server mà chưa gửi email thực tế cho khách hàng.
   - *Cần bổ sung:* Tích hợp dịch vụ email chuyên nghiệp như **Resend**, **SendGrid** hoặc **Amazon SES** để tự động gửi:
     - Email xác nhận đặt hàng thành công kèm hóa đơn chi tiết.
     - Email chứa link đặt lại mật khẩu an toàn (hết hạn sau 15 phút).
     - Email cập nhật trạng thái vận đơn khi đơn hàng được gửi đi.

---

### 1.2. Nhóm Quan Trọng Cần Bổ Sung Sớm (P1 – High)

4. **Tích hợp API Đơn Vị Vận Chuyển Tự Động (GHTK / GHN / Viettel Post):**
   - *Hiện trạng:* Khi Admin đổi trạng thái đơn sang `SHIPPED`, mã vận đơn phải nhập tay.
   - *Cần bổ sung:* Tích hợp API tạo vận đơn tự động với Giao Hàng Tiết Kiệm (GHTK) hoặc Giao Hàng Nhanh (GHN) để tự động in phiếu gửi hàng và đồng bộ lộ trình giao hàng trực tiếp vào trang `/order-tracking`.
5. **Thông báo qua Telegram / Zalo ZNS cho Chủ Cửa Hàng:**
   - *Hiện trạng:* Khi có đơn hàng mới phát sinh, Admin chỉ thấy khi mở Dashboard.
   - *Cần bổ sung:* Tích hợp Telegram Bot gửi tin nhắn tức thì: *"🔔 Bạn có đơn hàng mới #ORD-xxx trị giá 31.490.000₫ từ khách hàng Nguyễn Văn A!"*.

---

### 1.3. Nhóm Nâng Cấp Trải Nghiệm Khách Hàng (P2 – Medium)

6. **Đăng nhập nhanh qua Mạng xã hội (Social Login - Google / Facebook):**
   - *Hiện trạng:* Đăng nhập bằng Email và Mật khẩu truyền thống.
   - *Cần bổ sung:* Tích hợp NextAuth / Auth.js hoặc Google OAuth2 giúp khách hàng đăng nhập 1-click không cần nhớ mật khẩu.
7. **Hệ thống Live Chat hỗ trợ khách hàng:**
   - *Hiện trạng:* Có hotline VIP 1900 6868 trên thanh header.
   - *Cần bổ sung:* Tích hợp widget Tawk.to, Facebook Messenger hoặc Zalo Chat ở góc dưới màn hình để tư vấn khách hàng trong thời gian thực.
8. **Chương trình Điểm Thưởng & Khách Hàng Thân Thiết (Loyalty Points):**
   - *Hiện trạng:* Có phân loại khách hàng VIP tại Admin.
   - *Cần bổ sung:* Cơ chế tích lũy điểm khi mua hàng để đổi voucher giảm giá cho các đơn hàng tiếp theo.

---

### 1.4. Nhóm Tối Ưu Hóa Nâng Cao (P3 – Low)

9. **Tìm kiếm thông minh đa tiêu chí (ElasticSearch / MeiliSearch):**
   - *Hiện trạng:* Tìm kiếm bằng MySQL `LIKE` qua Prisma, rất nhanh với 233 sản phẩm hiện tại.
   - *Cần bổ sung:* Khi quy mô sản phẩm đạt trên 50.000 sản phẩm, nâng cấp lên MeiliSearch để hỗ trợ tìm kiếm không dấu, sửa lỗi chính tả (typo-tolerance).
10. **Quản lý kho đa chi nhánh (Multi-warehouse Inventory):**
    - *Hiện trạng:* Quản lý tồn kho tập trung.
    - *Cần bổ sung:* Phân tách kho hàng Hà Nội và TP. Hồ Chí Minh để tự động điều phối đơn hàng từ kho gần nhất.

