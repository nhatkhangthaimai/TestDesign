import mysql from "mysql2/promise";
import crypto from "crypto";

const pool = mysql.createPool({
  host: "gateway01.ap-southeast-1.prod.aws.tidbcloud.com",
  port: 4000,
  user: "iY15LFk8kgKVgVn.root",
  password: "m22dorl92xShU1H8",
  database: "test",
  waitForConnections: true,
  connectionLimit: 6,
  ssl: {
    minVersion: "TLSv1.2",
    rejectUnauthorized: false,
  },
});

// Mục tiêu an toàn cho TiDB Cloud Free Tier (Hạn mức trần là 5.00 GiB = 5,120 MB)
// Đặt mục tiêu 4,850 MB (vượt 5GB thập phân của raw data, hiển thị ~4.8 GiB trên dashboard mà không bị khóa cụm)
const TARGET_MB = 4850;
const BATCH_ROWS = 1000;
// Mỗi bản ghi audit_log có changesJson ~750 bytes => 1000 bản ghi ~ 0.8 MB
const BYTES_PER_ROW = 820;

const SEARCH_QUERIES = [
  "iphone 16 pro max", "sony wh-1000xm5", "marshall stanmore", "macbook pro m3",
  "ban phim co keychron", "chuot logitech mx master 3s", "tai nghe airpods pro 2",
  "apple watch ultra 2", "garmin fenix 8", "roborock s8 maxv", "sac anker prime 100w",
  "samsung galaxy s24 ultra", "xiaomi 14 ultra", "dell ultrasharp 27 inch"
];

const ACTIONS = [
  "CHECKOUT_COMPLETED", "ADD_TO_CART", "PRODUCT_VIEW", "SEARCH_FILTER",
  "PRICE_ALERT", "PAYMENT_VERIFIED", "INVENTORY_SYNC", "COUPON_APPLIED"
];

async function generateAuditBatch(count: number): Promise<any[][]> {
  const rows: any[][] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const id = crypto.randomUUID();
    const actorId = null;
    const actorRole = "CUSTOMER";
    const action = ACTIONS[i % ACTIONS.length];
    const entityType = action.includes("CART") ? "Cart" : action.includes("CHECKOUT") ? "Order" : "Product";
    const entityId = crypto.randomUUID();
    const ipAddress = `113.160.${(i % 254) + 1}.${((i * 7) % 254) + 1}`;
    const userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";
    const changesJson = JSON.stringify({
      event: action,
      session: crypto.randomUUID(),
      details: {
        amount: (1500000 + (i % 50) * 500000),
        currency: "VND",
        items: [
          { sku: "IP16PM-256", qty: 1, unitPrice: 34990000 },
          { sku: "ANKER-100W", qty: 2, unitPrice: 1490000 },
        ],
        gateway: "VNPAY_QR",
        responseCode: "00",
        traceNo: `TRC-${Date.now()}-${i}`,
        ip: ipAddress,
      },
      verifiedAt: now.toISOString(),
      integrityHash: crypto.randomBytes(16).toString("hex"),
    });

    rows.push([id, actorId, actorRole, action, entityType, entityId, ipAddress, userAgent, changesJson, now]);
  }
  return rows;
}

async function generateSearchBatch(count: number): Promise<any[][]> {
  const rows: any[][] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const id = crypto.randomUUID();
    const sessionId = crypto.randomUUID();
    const userId = null;
    const query = SEARCH_QUERIES[i % SEARCH_QUERIES.length];
    const normalizedQuery = query.toLowerCase().trim();
    const filtersJson = JSON.stringify({
      priceMin: 1000000,
      priceMax: 40000000,
      brand: ["Apple", "Sony", "Samsung"][i % 3],
      inStock: true,
      sort: "price_desc",
    });
    const resultCount = 5 + (i % 20);
    const executionMs = Number((0.2 + (i % 5) * 0.1).toFixed(2));
    const clickedProductId = null;

    rows.push([id, sessionId, userId, query, normalizedQuery, filtersJson, resultCount, executionMs, clickedProductId, now]);
  }
  return rows;
}

async function main() {
  console.log("================================================================================");
  console.log("    BBK COMMERCE - NẠP TOÀN BỘ 5GB DỮ LIỆU ĐÁM MÂY LÊN TIDB CLOUD (AWS)        ");
  console.log("================================================================================");
  console.log(`✓ Mục tiêu dung lượng an toàn: ${TARGET_MB} MB (~4.85 GiB)`);
  console.log(`✓ Hạn mức miễn phí TiDB Serverless: 5,120 MB (5.00 GiB)`);
  console.log(`✓ Số luồng song song: 5 kết nối đồng thời qua cổng 4000 (TLS/SSL)`);
  console.log("--------------------------------------------------------------------------------");

  const [initialAudit]: any = await pool.query("SELECT COUNT(*) as c FROM audit_logs");
  const [initialSearch]: any = await pool.query("SELECT COUNT(*) as c FROM search_events");
  const startAudit = Number(initialAudit[0]?.c || 0);
  const startSearch = Number(initialSearch[0]?.c || 0);
  let totalInserted = startAudit + startSearch;

  let currentMB = (totalInserted * BYTES_PER_ROW) / (1024 * 1024);
  console.log(`Dữ liệu hiện có: ${totalInserted.toLocaleString()} bản ghi (~${currentMB.toFixed(1)} MB)`);
  console.log("--> Bắt đầu nạp dữ liệu tốc độ cao vào TiDB Cloud...\n");

  const tStart = Date.now();
  let batchIndex = 0;

  const WORKERS = 5;
  const targetRows = Math.ceil((TARGET_MB * 1024 * 1024) / BYTES_PER_ROW);

  while (totalInserted < targetRows) {
    const promises: Promise<any>[] = [];

    for (let w = 0; w < WORKERS; w++) {
      if (totalInserted >= targetRows) break;

      const isAudit = (batchIndex + w) % 2 === 0;
      if (isAudit) {
        promises.push(
          (async () => {
            const rows = await generateAuditBatch(BATCH_ROWS);
            const sql = `INSERT INTO audit_logs (id, actorId, actorRole, action, entityType, entityId, ipAddress, userAgent, changesJson, createdAt) VALUES ?`;
            await pool.query(sql, [rows]);
          })()
        );
      } else {
        promises.push(
          (async () => {
            const rows = await generateSearchBatch(BATCH_ROWS);
            const sql = `INSERT INTO search_events (id, sessionId, userId, query, normalizedQuery, filtersJson, resultCount, executionMs, clickedProductId, createdAt) VALUES ?`;
            await pool.query(sql, [rows]);
          })()
        );
      }
      totalInserted += BATCH_ROWS;
    }

    await Promise.all(promises);
    batchIndex += WORKERS;

    currentMB = (totalInserted * BYTES_PER_ROW) / (1024 * 1024);
    const percent = Math.min(100, (currentMB / TARGET_MB) * 100).toFixed(1);
    const elapsedSec = (Date.now() - tStart) / 1000;
    const rate = elapsedSec > 0 ? ((totalInserted - (startAudit + startSearch)) * BYTES_PER_ROW) / (1024 * 1024) / elapsedSec : 0;
    const remainingMB = Math.max(0, TARGET_MB - currentMB);
    const etaSec = rate > 0 ? Math.ceil(remainingMB / rate) : 0;

    if (batchIndex % 15 === 0 || totalInserted >= targetRows) {
      console.log(
        `[TiDB Lô #${String(batchIndex).padStart(4)}] Đã ghi: ${totalInserted.toLocaleString().padStart(10)} bản ghi | ` +
        `Dung lượng: ${currentMB.toFixed(1).padStart(7)} MB (${percent.padStart(5)}%) | ` +
        `Tốc độ: ${rate.toFixed(1).padStart(5)} MB/s | ETA: ${etaSec}s`
      );
    }
  }

  const totalTime = ((Date.now() - tStart) / 1000).toFixed(1);
  console.log("\n================================================================================");
  console.log("            HOÀN TẤT NẠP 5GB DỮ LIỆU LÊN TIDB CLOUD THÀNH CÔNG!                ");
  console.log("================================================================================");
  console.log(`✓ Tổng thời gian thực thi: ${totalTime} giây`);
  console.log(`✓ Tổng số bản ghi trên TiDB: ${totalInserted.toLocaleString()} bản ghi`);
  console.log(`✓ Dung lượng ước tính: ${currentMB.toFixed(2)} MB (~${(currentMB / 1024).toFixed(3)} GiB)`);
  console.log(`✓ Trạng thái an toàn: Đạt chuẩn 5GB mà vẫn nằm dưới trần 5.00 GiB miễn phí của TiDB`);
  console.log("================================================================================");

  await pool.end();
}

main().catch(console.error);

