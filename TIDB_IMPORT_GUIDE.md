# HƯỚNG DẪN KẾT NỐI & DI CHUYỂN DỮ LIỆU TIDB CLOUD (TIDB IMPORT GUIDE)
## AJ COMMERCE – BIG DATA E-COMMERCE & DISTRIBUTED SQL ARCHITECTURE

---

### 1. PHÂN TÍCH TIỀM NĂNG & HẠN MỨC TIDB CLOUD (SERVERLESS VS DEDICATED)

Hệ thống **AJ Commerce** được xây dựng với khả năng tương thích 100% giao thức **MySQL Wire Protocol** của **TiDB Cloud**:

#### 1.1. Gói TiDB Cloud Serverless (Starter - Miễn phí)
- **Hạn mức lưu trữ:** Tối đa **5 GiB Storage** miễn phí.
- **Hạn mức tính toán:** 50 triệu Request Units (RU) miễn phí mỗi tháng.
- **LƯU Ý CỰC KỲ QUAN TRỌNG:**
  > [!WARNING] CẢNH BÁO HẠN MỨC 5GiB TRÊN TIDB CLOUD STARTER
  > Nếu bạn nạp vượt mức 5.000.000.000 bytes trên cụm TiDB Cloud Serverless Starter, tài khoản có thể bị khóa cụm (Cluster Throttle) hoặc phát sinh chi phí tự động nếu đã gắn thẻ thanh toán.
  > Vì vậy, kiến trúc của dự án đã được thiết kế phân tầng:
  > - **Môi trường Local:** Chạy trên SQLite / MySQL Local để sinh dữ liệu vượt mức **5.37 GiB (5.368.709.120 bytes)** an toàn 100%, không bị giới hạn mạng, không phát sinh chi phí.
  > - **Môi trường Cloud:** Dùng TiDB Cloud để chạy ứng dụng trực tuyến với danh mục sản phẩm chuẩn và một tập dữ liệu benchmark kiểm thử vừa vặn trong ngưỡng 5GiB.

#### 1.2. Gói TiDB Cloud Dedicated (Essential / Enterprise)
- Không giới hạn dung lượng lưu trữ (Scale tự động theo nhu cầu hàng chục Terabytes).
- Phù hợp triển khai hệ thống thương mại điện tử thực tế quy mô hàng triệu sản phẩm.

---

### 2. CẤU HÌNH KẾT NỐI TIDB CLOUD

Dự án đã chuẩn bị sẵn file schema chuyên biệt cho TiDB tại:
`prisma/schema.tidb.prisma` (sử dụng `provider = "mysql"` và các kiểu dữ liệu `Decimal(14,2)`, `VarChar`, `MediumText` chuẩn TiDB).

#### Bước 1: Tạo tệp cấu hình `.env.tidb`
Tạo file `.env.tidb` tại thư mục gốc của dự án với nội dung:
```env
# TiDB Cloud Serverless Connection String (Port 4000)
DATABASE_URL="mysql://<USERNAME>.<CLUSTER_NAME>:<PASSWORD>@gateway01.<REGION>.prod.aws.tidbcloud.com:4000/aj_ecommerce?sslaccept=strict"

# JWT Authentication
JWT_SECRET="aj_ecommerce_production_secure_jwt_secret_2026_xyz987"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

#### Bước 2: Đồng bộ cấu trúc bảng lên TiDB Cloud
Chạy lệnh Prisma đẩy schema TiDB:
```bash
npx prisma db push --schema prisma/schema.tidb.prisma
```
Lệnh này sẽ tự động tạo đầy đủ 31 bảng quan hệ, khóa chính, khóa ngoại và các chỉ mục B-Tree trên TiDB Cloud.

#### Bước 3: Nạp danh mục sản phẩm vào TiDB
Chạy script seed dữ liệu sản phẩm:
```bash
npx tsx scripts/data/seed-catalog.ts
```

---

### 3. CÂU LỆNH ĐO LƯỜNG DUNG LƯỢNG TRONG TIDB CLOUD CONSOLE

Trong **TiDB Cloud Console (SQL Editor)**, chạy câu lệnh sau để kiểm tra dung lượng chính xác của từng bảng:

```sql
SELECT 
    table_name AS 'Tên Bảng',
    table_rows AS 'Số Bản Ghi Ước Tính',
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Tổng Dung Lượng (MB)',
    ROUND((data_length / 1024 / 1024), 2) AS 'Dữ Liệu Thuần (MB)',
    ROUND((index_length / 1024 / 1024), 2) AS 'Chỉ Mục Index (MB)'
FROM information_schema.tables
WHERE table_schema = DATABASE()
ORDER BY (data_length + index_length) DESC;
```

Kiểm tra tổng dung lượng toàn bộ database trên TiDB:
```sql
SELECT 
    table_schema AS 'Tên Database',
    ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Tổng Dung Lượng (MB)',
    ROUND(SUM(data_length + index_length) / 1024 / 1024 / 1024, 3) AS 'Tổng Dung Lượng (GB)',
    SUM(table_rows) AS 'Tổng Số Bản Ghi'
FROM information_schema.tables
WHERE table_schema = DATABASE()
GROUP BY table_schema;
```

---

### 4. GIẢI THÍCH SỰ KHÁC BIỆT GIỮA DUNG LƯỢNG SQL VÀ STORAGE CONSOLE

Khi trình bày với Giảng viên, cần lưu ý hai khái niệm đo lường trong cơ sở dữ liệu phân tán TiDB:

1. **Dung lượng SQL Logical (`information_schema.tables`):**
   - Là kích thước dữ liệu bản ghi và chỉ mục logic do máy chủ tính toán.
2. **Dung lượng Physical Storage trên TiDB Cloud Console:**
   - Trong TiDB, dữ liệu được phân chia thành các **Region (mặc định 96MB)** và lưu trữ trên **TiKV**.
   - TiKV sử dụng cơ chế đồng thuận **Raft Consensus** với **3 bản sao (3 Replicas)** tại 3 Availability Zones để chống chịu sự cố.
   - Do đó, 1 GB dữ liệu logic sau khi nén bằng thuật toán RocksDB (ZSTD/Snappy) và nhân với hệ số bản sao 3x sẽ hiển thị khác so với số liệu đếm byte đơn thuần trên SQL.
   - **Báo cáo chuẩn học phần:** Lấy số đo `information_schema.tables` (Data + Index) và số liệu kiểm định thực tế trên tệp vật lý cục bộ làm căn cứ minh chứng dung lượng chính xác nhất.

