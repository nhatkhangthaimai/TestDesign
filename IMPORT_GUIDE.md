# HƯỚNG DẪN IMPORT DỮ LIỆU TỪNG GIAI ĐOẠN (IMPORT GUIDE)
## AJ COMMERCE – 5GB+ STAGED DATA IMPORT & BENCHMARKING

---

### 1. QUY TRÌNH NẠP DỮ LIỆU TỔNG QUAN

Hệ thống import dữ liệu của **AJ Commerce** được thiết kế chia thành 5 giai đoạn có kiểm soát và checkpoint:

| Giai Đoạn | Mục Tiêu Dung Lượng | Số Lượng Bản Ghi Dự Kiến | Mục Đích Kiểm Thử |
| :---: | :---: | :---: | :--- |
| **Giai đoạn 1** | **100 MB** (~105.000.000 bytes) | ~200.000 bản ghi | Kiểm thử cấu trúc schema, batch size và tính toàn vẹn khóa ngoại |
| **Giai đoạn 2** | **500 MB** (~525.000.000 bytes) | ~950.000 bản ghi | Kiểm thử tốc độ ghi đĩa, bộ nhớ đệm WAL và query latency |
| **Giai đoạn 3** | **1 GB** (~1.075.000.000 bytes) | ~1.900.000 bản ghi | Kiểm thử hiệu năng phân trang Server-side pagination và GroupBy |
| **Giai đoạn 4** | **3 GB** (~3.225.000.000 bytes) | ~5.200.000 bản ghi | Kiểm tra độ sâu B-Tree Index và khả năng mở rộng bộ nhớ |
| **Giai đoạn 5** | **5 GiB** (≥ 5.368.709.120 bytes) | ~8.000.000 bản ghi | Hoàn thiện mục tiêu đồ án, vượt cả chuẩn 5GB và 5GiB |

---

### 2. CÁC LỆNH THỰC THI DÒNG LỆNH (CLI COMMANDS)

#### Bước 1: Khởi tạo danh mục và sản phẩm thương mại thật
Trước khi sinh dữ liệu lớn, cần đảm bảo danh mục 6 nhóm sản phẩm và 30 thương hiệu chính hãng đã có sẵn:
```bash
npx tsx scripts/data/seed-catalog.ts
```

#### Bước 2: Nạp dữ liệu theo từng giai đoạn

**Chạy Giai đoạn 1 (100 MB):**
```bash
npx tsx scripts/data/generate-5gb.ts --stage 1
```

**Chạy Giai đoạn 2 (500 MB):**
```bash
npx tsx scripts/data/generate-5gb.ts --stage 2
```

**Chạy Giai đoạn 3 (1 GB):**
```bash
npx tsx scripts/data/generate-5gb.ts --stage 3
```

**Chạy Giai đoạn 4 (3 GB):**
```bash
npx tsx scripts/data/generate-5gb.ts --stage 4
```

**Chạy Giai đoạn 5 (5 GiB Chuẩn - Vượt 5.37 GB):**
```bash
npx tsx scripts/data/generate-5gb.ts --stage 5
```

Hoặc chỉ định dung lượng tùy biến:
```bash
# Nạp tới đích 2000 MB:
npx tsx scripts/data/generate-5gb.ts --target-mb 2000

# Nạp trực tiếp tới đích 5.370.000.000 bytes:
npx tsx scripts/data/generate-5gb.ts --target-bytes 5370000000
```

#### Bước 3: Kiểm định và đo lường dung lượng
Sau mỗi giai đoạn, chạy script kiểm định để xuất bảng báo cáo:
```bash
npx tsx scripts/data/verify-size.ts
```

---

### 3. CƠ CHẾ AN TOÀN, CHECKPOINT VÀ KHÔI PHỤC

1. **Tự động lưu Checkpoint (`scripts/data/checkpoint.json`):**
   - Sau mỗi 3 lô (hoặc 2 giây), hệ thống ghi lại trạng thái: `{ currentStage, targetBytes, currentBytes, totalRecordsInserted, isCompleted }`.
   - Nếu tiến trình bị gián đoạn (mất điện, tắt terminal), khi chạy lại hệ thống sẽ tự động đo dung lượng thực tế hiện tại và tiếp tục sinh từ điểm dừng, **không bao giờ sinh trùng lặp khóa chính** nhờ sử dụng UUID v4 chuẩn.

2. **Cơ chế giới hạn an toàn ổ đĩa:**
   - Script liên tục kiểm tra dung lượng còn trống trên ổ đĩa. Nếu dung lượng trống của ổ đĩa < 10 GB, tiến trình sẽ lập tức dừng an toàn để tránh làm đầy ổ cứng của người dùng.

3. **Giao dịch nguyên tử (Atomic Batch Transactions):**
   - Dữ liệu được gom thành từng lô (`BATCH_SIZE = 4000` bản ghi) và bọc trong Prisma Transaction. Nếu một câu lệnh trong lô gặp sự cố, transaction sẽ tự động Rollback, không để lại dữ liệu rác dở dang.

4. **Quản lý qua giao diện Admin:**
   - Quản trị viên và giảng viên có thể theo dõi trực tiếp thanh tiến trình, biểu đồ phân loại dữ liệu và kiểm tra kết quả tại địa chỉ:
     **`http://localhost:3000/admin/database`**

