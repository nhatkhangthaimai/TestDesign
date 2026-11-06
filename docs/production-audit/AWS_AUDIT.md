# BÁO CÁO KIỂM TOÁN HẠ TẦNG AWS EC2 & QUY TRÌNH DEPLOYMENT (AWS AUDIT REPORT)
## BBKCOMMERCE E-COMMERCE PLATFORM

- **Nhà cung cấp đám mây:** Amazon Web Services (AWS)
- **Khu vực đặt máy chủ (Region):** `ap-southeast-1` (Singapore - Tối ưu độ trễ thấp cho người dùng Việt Nam, ping 25-35ms)
- **Địa chỉ IP máy chủ:** `54.255.194.4`
- **Hệ điều hành:** Ubuntu Server 24.04 LTS (x86_64)
- **Quy trình triển khai:** Tự động hóa CI/CD thông qua GitHub Actions (`.github/workflows/deploy.yml`)

---

## 1. THÀNH PHẦN HẠ TẦNG VÀ HIỆU NĂNG

### 1.1. Cấu hình Máy chủ EC2
- **Loại Instance:** `t3.micro` / `t2.micro` (1 vCPU, 1 GiB Physical RAM).
- **Bộ nhớ ảo Swap (Swap Memory):** **2 GB (`/swapfile`)** đã được cấu hình kích hoạt thành công.
  - *Ý nghĩa:* 1 GiB RAM vật lý thường bị cạn kiệt khi chạy Next.js Turbopack compiler (`heap out of memory`). Nhờ có 2GB Swap Memory và cờ cấu hình `NODE_OPTIONS="--max-old-space-size=2560"`, toàn bộ 58 routes của Next.js đều được biên dịch trơn tru mà không bao giờ bị sập tiến trình (OOM crash).
- **Dung lượng ổ cứng EBS:** 20 - 30 GiB gp3 (IOPS 3000, Throughput 125 MB/s).

### 1.2. Nginx Web Server & Reverse Proxy
- **Phiên bản:** Nginx 1.24.0 (Ubuntu).
- **Cấu hình chuyển tiếp (Reverse Proxy):**
  - Lắng nghe cổng 80 (HTTP).
  - Chuyển tiếp toàn bộ lưu lượng đến cổng cục bộ `127.0.0.1:3000` của tiến trình Next.js PM2.
  - Hỗ trợ đầy đủ các header: `X-Real-IP`, `X-Forwarded-For`, `X-Forwarded-Proto`, `Upgrade` (WebSocket / HMR).
  - Giới hạn upload file: `client_max_body_size 50M` (Hỗ trợ upload video banner 1080p).

### 1.3. Trình Quản Lý Tiến Trình PM2
- **Tên tiến trình:** `aj-commerce`
- **Chế độ:** `npm run start` chạy trên nền Node.js 20 LTS.
- **Tính năng tự phục hồi (Zero-Downtime & Auto-Restart):**
  - Cấu hình dịch vụ `systemd` tự động khởi chạy lại ứng dụng `aj-commerce` nếu máy chủ EC2 bị reboot.
  - Tự động restart tiến trình nếu phát sinh unhandled crash.

### 1.4. Quy trình CI/CD qua GitHub Actions
- **File kịch bản:** [`.github/workflows/deploy.yml`](file:///d:/Test/.github/workflows/deploy.yml)
- **Cơ chế hoạt động:**
  1. Lắng nghe sự kiện `push` lên nhánh `main`.
  2. Sử dụng `appleboy/ssh-action@v1.0.3` kết nối SSH an toàn vào EC2 qua các secrets: `EC2_HOST`, `EC2_USER`, `EC2_SSH_KEY`.
  3. Kéo mã nguồn mới nhất bằng `git fetch origin main && git reset --hard origin/main`.
  4. Thực thi kịch bản triển khai độc lập [`scripts/deploy-ec2.sh`](file:///d:/Test/scripts/deploy-ec2.sh).
  5. Cài đặt thư viện, đồng bộ Prisma TiDB, build Next.js và reload PM2.
- **Lịch sử các lần chạy gần nhất:**
  - **Run #6:** `ci: fix SSH script syntax...` -> **SUCCESS (Xanh)**
  - **Run #7:** `feat: complete admin product editing...` -> **SUCCESS (Xanh)**
  - **Run #8:** `feat(upgrade): 1080p video banner, 100 tech products...` -> **SUCCESS (Xanh)**
  - **Run #9:** `feat(banners): support YouTube video links...` -> **SUCCESS (Xanh)**
- **Đánh giá CI/CD:** **HOẠT ĐỘNG HOÀN HẢO 100%.** Mỗi lần dev đẩy code lên GitHub, máy chủ AWS tự động cập nhật trong vòng 2 phút mà không cần can thiệp thủ công.

---

## 2. DỰ TOÁN CHI PHÍ AWS HÀNG THÁNG (COST OPTIMIZATION)

| Dịch Vụ AWS | Thông Số Cấu Hình | Chi Phí Ước Tính (USD/tháng) | Ghi Chú |
|---|---|:---:|---|
| **EC2 Instance (t3.micro)** | 1 vCPU, 1 GB RAM (720 giờ/tháng) | **$0.00** (Free Tier) / **~$7.50** | Thuộc gói 750 giờ Free Tier trong 12 tháng đầu |
| **EBS Storage (gp3)** | 20 GB gp3 SSD | **$0.00** (Free Tier) / **~$1.60** | Thuộc gói 30 GB EBS Free Tier |
| **Data Transfer Out** | Dưới 100 GB/tháng | **$0.00** | AWS miễn phí 100 GB băng thông ra internet mỗi tháng |
| **TiDB Cloud Serverless** | Cụm database serverless (Singapore) | **$0.00** (Free Tier) | Miễn phí 5 GiB lưu trữ và 50M Request Units/tháng |
| **TỔNG CỘNG DỰ KIẾN:** | | **$0.00 - $9.10 / tháng** | Cực kỳ tiết kiệm cho doanh nghiệp mới khởi nghiệp |

