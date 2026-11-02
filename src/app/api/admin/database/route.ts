import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const DB_PATH = path.resolve(process.cwd(), "prisma/dev.db");

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ROLE_ADMIN") {
      return NextResponse.json({ error: "Không có quyền truy cập quản trị" }, { status: 403 });
    }

    let sizeBytes = 0;
    if (fs.existsSync(DB_PATH)) {
      sizeBytes = fs.statSync(DB_PATH).size;
    }

    const sizeMB = (sizeBytes / (1024 * 1024)).toFixed(2);
    const sizeGB_dec = (sizeBytes / 1_000_000_000).toFixed(4);
    const sizeGiB_bin = (sizeBytes / (1024 * 1024 * 1024)).toFixed(4);

    // Đo qua SQLite Pragma
    let pageCount = 0;
    let pageSize = 4096;
    let freelistCount = 0;

    try {
      const pageCountRes: any = await prisma.$queryRawUnsafe("PRAGMA page_count;");
      const pageSizeRes: any = await prisma.$queryRawUnsafe("PRAGMA page_size;");
      const freelistRes: any = await prisma.$queryRawUnsafe("PRAGMA freelist_count;");

      pageCount = Number(pageCountRes[0]?.page_count || 0);
      pageSize = Number(pageSizeRes[0]?.page_size || 4096);
      freelistCount = Number(freelistRes[0]?.freelist_count || 0);
    } catch {}

    const tables = [
      { name: "products", label: "Sản phẩm", type: "STORE" },
      { name: "product_images", label: "Hình ảnh sản phẩm", type: "STORE" },
      { name: "product_variants", label: "Biến thể sản phẩm", type: "STORE" },
      { name: "product_specifications", label: "Thông số kỹ thuật", type: "STORE" },
      { name: "product_compatibilities", label: "Quan hệ tương thích phụ kiện", type: "STORE" },
      { name: "product_price_histories", label: "Lịch sử biến động giá", type: "STORE" },
      { name: "categories", label: "Danh mục", type: "STORE" },
      { name: "brands", label: "Thương hiệu", type: "STORE" },
      { name: "users", label: "Tài khoản người dùng", type: "STORE" },
      { name: "shipping_addresses", label: "Địa chỉ nhận hàng", type: "STORE" },
      { name: "orders", label: "Đơn hàng thực tế", type: "STORE" },
      { name: "order_items", label: "Chi tiết đơn hàng", type: "STORE" },
      { name: "order_status_history", label: "Lịch sử trạng thái đơn", type: "STORE" },
      { name: "payments", label: "Giao dịch thanh toán", type: "STORE" },
      { name: "inventories", label: "Tồn kho theo kho", type: "STORE" },
      { name: "inventory_transactions", label: "Biến động nhập xuất kho", type: "BIGDATA" },
      { name: "carts", label: "Giỏ hàng", type: "STORE" },
      { name: "cart_items", label: "Mục trong giỏ", type: "STORE" },
      { name: "coupons", label: "Mã giảm giá", type: "STORE" },
      { name: "coupon_usages", label: "Lịch sử dùng coupon", type: "STORE" },
      { name: "reviews", label: "Đánh giá sản phẩm", type: "STORE" },
      { name: "wishlists", label: "Danh sách yêu thích", type: "STORE" },
      { name: "banners", label: "Banner tiếp thị", type: "STORE" },
      { name: "store_settings", label: "Cấu hình cửa hàng", type: "STORE" },
      { name: "product_view_events", label: "Sự kiện xem sản phẩm (Telemetry)", type: "BIGDATA" },
      { name: "search_events", label: "Sự kiện tìm kiếm (Telemetry)", type: "BIGDATA" },
      { name: "cart_events", label: "Tương tác giỏ hàng", type: "BIGDATA" },
      { name: "audit_logs", label: "Nhật ký hệ thống (Audit Logs)", type: "BIGDATA" },
      { name: "benchmark_sessions", label: "Phiên đo kiểm Benchmark", type: "BIGDATA" },
      { name: "benchmark_transactions", label: "Lô giao dịch kiểm thử", type: "BIGDATA" },
      { name: "data_import_jobs", label: "Tiến trình Import theo giai đoạn", type: "BIGDATA" },
    ];

    const tableStats = [];
    let totalRecords = 0;
    let realStoreRecords = 0;
    let bigDataRecords = 0;

    for (const t of tables) {
      let count = 0;
      try {
        const res: any = await prisma.$queryRawUnsafe(`SELECT COUNT(*) as count FROM ${t.name};`);
        count = Number(res[0]?.count || 0);
      } catch {}

      totalRecords += count;
      if (t.type === "BIGDATA") {
        bigDataRecords += count;
      } else {
        realStoreRecords += count;
      }

      tableStats.push({
        table: t.name,
        label: t.label,
        type: t.type,
        count,
      });
    }

    // Benchmark truy vấn nhanh
    const t0 = performance.now();
    let sampleSearchResultCount = 0;
    try {
      const res: any = await prisma.$queryRawUnsafe(
        "SELECT id, query, resultCount FROM search_events WHERE query LIKE '%iphone%' LIMIT 5;"
      );
      sampleSearchResultCount = res.length;
    } catch {}
    const sampleSearchMs = Number((performance.now() - t0).toFixed(2));

    const t1 = performance.now();
    let topViewCount = 0;
    try {
      const res: any = await prisma.$queryRawUnsafe(
        "SELECT productId, COUNT(*) as views FROM product_view_events GROUP BY productId ORDER BY views DESC LIMIT 3;"
      );
      topViewCount = res.length;
    } catch {}
    const sampleGroupByMs = Number((performance.now() - t1).toFixed(2));

    // Lịch sử jobs
    let importJobs: any[] = [];
    try {
      importJobs = await prisma.dataImportJob.findMany({
        take: 10,
        orderBy: { startedAt: "desc" },
      });
    } catch {}

    const pass5GB_Dec = sizeBytes >= 5_000_000_000;
    const pass5GiB_Bin = sizeBytes >= 5_368_709_120;

    return NextResponse.json({
      engine: "SQLite (Local Architecture with TiDB Cloud & PostgreSQL Dual-Support)",
      filePath: DB_PATH,
      sizeBytes,
      sizeMB: Number(sizeMB),
      sizeGB_dec: Number(sizeGB_dec),
      sizeGiB_bin: Number(sizeGiB_bin),
      pageCount,
      pageSize,
      freelistCount,
      targets: {
        goal5GB_Dec: 5_000_000_000,
        goal5GiB_Bin: 5_368_709_120,
        pass5GB_Dec,
        pass5GiB_Bin,
        percentTo5GB: Math.min(100, Number(((sizeBytes / 5_000_000_000) * 100).toFixed(2))),
        percentTo5GiB: Math.min(100, Number(((sizeBytes / 5_368_709_120) * 100).toFixed(2))),
      },
      records: {
        total: totalRecords,
        realStore: realStoreRecords,
        bigData: bigDataRecords,
      },
      tableStats,
      importJobs,
      queryBenchmarks: {
        searchLikeQueryMs: sampleSearchMs,
        groupByQueryMs: sampleGroupByMs,
      },
    });
  } catch (error) {
    console.error("Database metrics error:", error);
    return NextResponse.json({ error: "Lỗi tải thống kê dung lượng database" }, { status: 500 });
  }
}

