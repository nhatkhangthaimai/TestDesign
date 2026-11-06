import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const DB_PATH = path.resolve(process.cwd(), "prisma/dev.db");

interface TableStat {
  table: string;
  count: number;
}

export async function verifyDatabase() {
  console.log("================================================================================");
  console.log("      BBKCOMMERCE - BÁO CÁO ĐO LƯỜNG & KIỂM ĐỊNH DUNG LƯỢNG DATABASE");
  console.log("================================================================================");

  if (!fs.existsSync(DB_PATH)) {
    console.error("Không tìm thấy file database tại:", DB_PATH);
    return;
  }

  const stat = fs.statSync(DB_PATH);
  const sizeBytes = stat.size;
  const sizeKB = (sizeBytes / 1024).toFixed(2);
  const sizeMB = (sizeBytes / (1024 * 1024)).toFixed(2);
  const sizeGB_dec = (sizeBytes / 1_000_000_000).toFixed(4);
  const sizeGiB_bin = (sizeBytes / (1024 * 1024 * 1024)).toFixed(4);

  // Đo theo SQLite Pragma
  const pageCountResult: any = await prisma.$queryRawUnsafe("PRAGMA page_count;");
  const pageSizeResult: any = await prisma.$queryRawUnsafe("PRAGMA page_size;");
  const freelistResult: any = await prisma.$queryRawUnsafe("PRAGMA freelist_count;");

  const pageCount = Number(pageCountResult[0]?.page_count || 0);
  const pageSize = Number(pageSizeResult[0]?.page_size || 4096);
  const freelistCount = Number(freelistResult[0]?.freelist_count || 0);
  const pragmaCalculatedBytes = pageCount * pageSize;

  console.log("\n1. THÔNG SỐ VẬT LÝ DATABASE:");
  console.log(`- Tệp lưu trữ vật lý: ${DB_PATH}`);
  console.log(`- Dung lượng chính xác: ${sizeBytes.toLocaleString()} bytes`);
  console.log(`- Theo chuẩn thập phân (1 GB = 10^9 bytes): ${sizeGB_dec} GB`);
  console.log(`- Theo chuẩn nhị phân (1 GiB = 2^30 bytes): ${sizeGiB_bin} GiB (${sizeMB} MB)`);
  console.log(`- SQLite Page Count: ${pageCount.toLocaleString()} trang`);
  console.log(`- SQLite Page Size: ${pageSize.toLocaleString()} bytes/trang`);
  console.log(`- SQLite Freelist Count: ${freelistCount} trang rảnh`);
  console.log(`- Tích (Page Count * Page Size): ${pragmaCalculatedBytes.toLocaleString()} bytes`);

  // Tiêu chí 5GB
  const pass5GB_Dec = sizeBytes >= 5_000_000_000;
  const pass5GiB_Bin = sizeBytes >= 5_368_709_120;

  console.log("\n2. ĐÁNH GIÁ TIÊU CHUẨN ĐỒ ÁN:");
  console.log(`  [${pass5GB_Dec ? "✔ PASS" : "✖ FAIL"}] Mục tiêu 5.000.000.000 bytes (5 GB thập phân): ${sizeGB_dec} / 5.0000 GB`);
  console.log(`  [${pass5GiB_Bin ? "✔ PASS" : "✖ FAIL"}] Mục tiêu 5.368.709.120 bytes (5 GiB nhị phân): ${sizeGiB_bin} / 5.0000 GiB`);

  // Đếm bản ghi từng bảng
  const tables = [
    "products",
    "product_images",
    "product_variants",
    "product_specifications",
    "product_compatibilities",
    "product_price_histories",
    "categories",
    "brands",
    "users",
    "shipping_addresses",
    "orders",
    "order_items",
    "order_status_history",
    "payments",
    "inventories",
    "inventory_transactions",
    "carts",
    "cart_items",
    "coupons",
    "coupon_usages",
    "reviews",
    "wishlists",
    "banners",
    "store_settings",
    "product_view_events",
    "search_events",
    "cart_events",
    "audit_logs",
    "benchmark_sessions",
    "benchmark_transactions",
    "data_import_jobs",
  ];

  console.log("\n3. THỐNG KÊ CHI TIẾT SỐ LƯỢNG BẢN GHI:");
  console.log("------------------------------------------------------------------");
  console.log(String("Tên Bảng").padEnd(30) + String("Số Bản Ghi").padStart(15) + String("Phân Loại").padStart(20));
  console.log("------------------------------------------------------------------");

  let totalRecords = 0;
  let realRecords = 0;
  let benchmarkRecords = 0;

  for (const tbl of tables) {
    try {
      const res: any = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM ${tbl};`);
      const count = Number(res[0]?.count || 0);
      totalRecords += count;

      const isBigData = [
        "product_view_events",
        "search_events",
        "audit_logs",
        "inventory_transactions",
        "benchmark_transactions",
        "benchmark_sessions",
        "data_import_jobs",
      ].includes(tbl);

      if (isBigData) {
        benchmarkRecords += count;
      } else {
        realRecords += count;
      }

      const typeLabel = isBigData ? "Big Data / Telemetry" : "Dữ Liệu Bán Hàng Thật";
      console.log(tbl.padEnd(30) + count.toLocaleString().padStart(15) + typeLabel.padStart(20));
    } catch {
      // Bảng có thể chưa tạo
    }
  }

  console.log("------------------------------------------------------------------");
  console.log(String("TỔNG CỘNG TẤT CẢ BẢNG:").padEnd(30) + totalRecords.toLocaleString().padStart(15));
  console.log(`- Trong đó Dữ liệu bán hàng thật: ${realRecords.toLocaleString()} bản ghi (giữ nguyên vẹn doanh thu thật)`);
  console.log(`- Trong đó Dữ liệu Big Data/Telemetry/Audit: ${benchmarkRecords.toLocaleString()} bản ghi`);
  console.log("------------------------------------------------------------------");

  // Kiểm tra hiệu năng truy vấn có index
  console.log("\n4. KIỂM THỬ HIỆU NĂNG TRUY VẤN (QUERY BENCHMARK):");
  const t0 = performance.now();
  const searchSample: any = await prisma.$queryRawUnsafe(
    "SELECT id, query, resultCount, executionMs FROM search_events WHERE query LIKE '%iphone%' LIMIT 10;"
  );
  const tSearch = (performance.now() - t0).toFixed(2);
  console.log(`- Truy vấn tìm kiếm trên bảng SearchEvents (LIKE '%iphone%'): ${tSearch} ms (Trả về: ${searchSample.length} kết quả)`);

  const t1 = performance.now();
  const viewSample: any = await prisma.$queryRawUnsafe(
    "SELECT productId, COUNT(*) as views FROM product_view_events GROUP BY productId ORDER BY views DESC LIMIT 5;"
  );
  const tAgg = (performance.now() - t1).toFixed(2);
  console.log(`- Truy vấn thống kê Group By trên ProductViewEvents: ${tAgg} ms (Top 5 sản phẩm xem nhiều nhất)`);

  console.log("\n================================================================================");
  console.log("                HOÀN TẤT BÁO CÁO KIỂM ĐỊNH DUNG LƯỢNG");
  console.log("================================================================================");

  return {
    sizeBytes,
    sizeMB,
    sizeGB_dec,
    sizeGiB_bin,
    pageCount,
    pageSize,
    totalRecords,
    realRecords,
    benchmarkRecords,
    pass5GB_Dec,
    pass5GiB_Bin,
  };
}

if (require.main === module) {
  verifyDatabase()
    .catch((err) => {
      console.error("Lỗi khi kiểm định database:", err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

