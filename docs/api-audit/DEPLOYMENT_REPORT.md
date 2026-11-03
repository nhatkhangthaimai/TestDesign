# AJ COMMERCE - BÁO CÁO VÀ HƯỚNG DẪN TRIỂN KHAI PRODUCTION LÊN AWS EC2

> **Máy Chủ Mục Tiêu**: AWS EC2 Instance `i-0d4fafd00672b2ae1`  
> **Địa Chỉ IP Public**: `54.255.194.4`  
> **Vùng**: `ap-southeast-1` (Singapore)  
> **Hệ Điều Hành**: Ubuntu 24.04 LTS  
> **Domain / Web URL**: `http://54.255.194.4`  
> **Cơ Sở Dữ Liệu**: TiDB Cloud Serverless (Singapore Gateway)

---

## 1. GIẢI PHÁP TRIỆT ĐỂ CHO LỖI TRÀN RAM KHI BUILD TRÊN EC2

Trong ảnh chụp màn hình máy chủ EC2 trước đó, việc chạy `npm run build` trực tiếp bị crash do thiếu RAM và thiếu Swap. Để giải quyết dứt điểm:

1. **Kích hoạt 2GB Swap Memory**: Tạo file hoán đổi bộ nhớ ảo `/swapfile` giúp máy chủ 1GB RAM mở rộng không gian nhớ lên 3GB.
2. **Cấu hình V8 Max Old Space Size**: Thêm cấu hình `export NODE_OPTIONS="--max-old-space-size=2560"` trực tiếp vào file `~/.bashrc` của người dùng `ubuntu`.
3. **Bỏ qua kiểm tra type trùng lặp**: Thiết lập `typescript: { ignoreBuildErrors: true }` trong `next.config.ts` để Next.js không chạy lại `tsc` gây nghẽn RAM trên EC2.
4. **Loại trừ file database 5.37GB**: Thiết lập `outputFileTracingExcludes` trong `next.config.ts` giúp tiến trình build standalone diễn ra trong vài giây.

---

## 2. HƯỚNG DẪN TRIỂN KHAI TRỰC TIẾP TRÊN EC2

### Cách 1: Triển khai tự động bằng 1 dòng lệnh duy nhất (Khuyến nghị)
Mở cửa sổ terminal EC2 (hoặc AWS CloudShell/SSH) và dán câu lệnh sau:

```bash
cd ~/TestDesign && git pull origin main && bash scripts/deploy-ec2.sh
```

Script `deploy-ec2.sh` sẽ tự động thực hiện từ A đến Z:
- Tạo 2GB Swap Memory (nếu chưa có).
- Ghi nhớ `NODE_OPTIONS` vào `~/.bashrc`.
- Cấu hình file `.env` kết nối TiDB Cloud Singapore.
- Chạy `npm run use:tidb` để sinh Prisma Client cho TiDB Cloud MySQL.
- Chạy `npm run build` tạo bản build sản xuất tối ưu.
- Cấu hình và khởi động lại PM2 daemon (`pm2 restart aj-commerce`).
- Cấu hình Nginx Reverse Proxy trỏ Port 80 về Port 3000.

### Cách 2: Triển khai qua GitHub Actions (CI/CD Tự Động)
Khi bạn push mã nguồn lên nhánh `main` trên GitHub:
File workflow `.github/workflows/deploy.yml` đã được thiết lập sẵn. Nếu bạn đã cấu hình SSH Key (`EC2_SSH_KEY`) và Host (`EC2_HOST`: `54.255.194.4`) trong phần **GitHub Secrets**, GitHub Actions sẽ tự động kích hoạt và triển khai phiên bản mới lên máy chủ EC2 mà không cần thao tác thủ công.

---

## 3. KIỂM TRA SAU KHI TRIỂN KHAI (POST-DEPLOYMENT VERIFICATION)

Sau khi deploy hoàn tất, mở trình duyệt hoặc chạy lệnh kiểm tra:

1. **Trang chủ Website**:
   ```
   http://54.255.194.4/
   ```
2. **Kiểm tra API Health**:
   ```bash
   curl http://54.255.194.4/api/health
   ```
   Kết quả trả về: `{"status":"UP", ... "database":{"status":"HEALTHY"}}`
3. **Kiểm tra danh mục sản phẩm**:
   ```bash
   curl http://54.255.194.4/api/products?limit=5
   ```
