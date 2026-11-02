import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();

// Các mốc dung lượng theo yêu cầu
const STAGE_TARGETS: Record<number, { name: string; bytes: number }> = {
  1: { name: "Giai đoạn 1 (100MB)", bytes: 105_000_000 },
  2: { name: "Giai đoạn 2 (500MB)", bytes: 525_000_000 },
  3: { name: "Giai đoạn 3 (1GB)", bytes: 1_075_000_000 },
  4: { name: "Giai đoạn 4 (3GB)", bytes: 3_225_000_000 },
  5: { name: "Giai đoạn 5 (5GiB Chuẩn)", bytes: 5_370_000_000 }, // Vượt 5.368.709.120 bytes (5GiB)
};

const DB_PATH = path.resolve(process.cwd(), "prisma/dev.db");
const CHECKPOINT_PATH = path.resolve(process.cwd(), "scripts/data/checkpoint.json");

// Mẫu dữ liệu chuẩn thương mại điện tử
const SEARCH_QUERIES = [
  "iphone 16 pro max titan tu nhien",
  "samsung galaxy s24 ultra 512gb",
  "tai nghe chong on sony wh-1000xm5",
  "loa bluetooth marshall stanmore iii",
  "dong ho the thao garmin fenix 8 sapphire",
  "apple watch ultra 2 49mm",
  "macbook pro 16 m3 max 36gb",
  "robot hut bui roborock s8 maxv ultra",
  "may loc khong khi xiaomi 4 pro",
  "cu sac nhanh anker prime 100w gan",
  "ban phim co keychron q1 pro",
  "chuot cong thai hoc logitech mx master 3s",
  "man hinh dell ultrasharp u2724de 2k",
  "tai nghe apple airpods max usb-c",
  "sennheiser momentum 4 wireless",
  "bose quietcomfort ultra headphones",
  "xiaomi 14 ultra camera leica",
  "oppo find x7 ultra periscope",
  "google pixel 9 pro xl gemini",
  "thinkpad x1 carbon gen 12 oled",
];

const REFERRERS = [
  "https://www.google.com/search?q=aj+commerce+dien+thoai+chinh+hang",
  "https://www.facebook.com/ajcommerce.vietnam/ads/campaign_tech_2026",
  "https://www.tiktok.com/@ajcommerce/video/review_iphone16_promax",
  "https://tinhte.vn/thread/danh-gia-chi-tiet-sony-wh1000xm5.3529182/",
  "https://vnexpress.net/so-hoa/san-pham-cong-nghe-noi-bat-2026",
  "https://aljazeera.com/economy/technology-retail-trends-asia",
  "Direct",
  "https://news.google.com/",
];

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Safari/605.1.15",
  "Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.6723.86 Mobile Safari/537.36",
  "Mozilla/5.0 (iPad; CPU OS 17_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/130.0.6723.90 Mobile/15E148 Safari/604.1",
];

const AUDIT_ACTIONS = [
  "INVENTORY_RESTOCKED",
  "PRICE_UPDATED",
  "PRODUCT_CONTENT_AUDITED",
  "SECURITY_SCAN_PASSED",
  "PROMOTION_TIER_ADJUSTED",
  "WAREHOUSE_TRANSFER_CONFIRMED",
  "CATEGORY_INDEX_REBUILT",
  "BENCHMARK_TELEMETRY_LOGGED",
];

function getDatabaseSize(): number {
  if (!fs.existsSync(DB_PATH)) return 0;
  return fs.statSync(DB_PATH).size;
}

function formatBytes(bytes: number): string {
  const gb = bytes / (1024 * 1024 * 1024);
  const mb = bytes / (1024 * 1024);
  return `${bytes.toLocaleString()} bytes (${mb.toFixed(2)} MB / ${gb.toFixed(3)} GiB)`;
}

interface Checkpoint {
  currentStage: number;
  targetBytes: number;
  currentBytes: number;
  totalRecordsInserted: number;
  lastUpdated: string;
  isCompleted: boolean;
}

function saveCheckpoint(data: Checkpoint) {
  fs.writeFileSync(CHECKPOINT_PATH, JSON.stringify(data, null, 2), "utf8");
}

export async function runGenerator(targetBytes: number, stageNum?: number) {
  const startBytes = getDatabaseSize();
  console.log("================================================================================");
  console.log("  AJ COMMERCE - HỆ THỐNG SINH DỮ LIỆU THƯƠNG MẠI ĐIỆN TỬ QUY MÔ LỚN (5GB+)");
  console.log("================================================================================");
  console.log(`Dung lượng ban đầu: ${formatBytes(startBytes)}`);
  console.log(`Dung lượng mục tiêu: ${formatBytes(targetBytes)}`);
  if (stageNum) {
    console.log(`Giai đoạn thực thi: ${STAGE_TARGETS[stageNum]?.name || `Giai đoạn ${stageNum}`}`);
  }
  console.log("--------------------------------------------------------------------------------");

  if (startBytes >= targetBytes) {
    console.log(`✓ Dung lượng hiện tại (${formatBytes(startBytes)}) ĐÃ ĐẠT mục tiêu (${formatBytes(targetBytes)})!`);
    console.log("Không cần ghi thêm dữ liệu.");
    return;
  }

  // Lấy danh sách Product IDs thực tế để tham chiếu khóa ngoại
  const products = await prisma.product.findMany({ select: { id: true, regularPrice: true, title: true, sku: true } });
  if (products.length === 0) {
    console.error("Lỗi: Không tìm thấy sản phẩm nào trong database! Vui lòng chạy seed-catalog trước.");
    return;
  }
  const productIds = products.map((p) => p.id);

  // Tạo hoặc cập nhật Benchmark Session
  const sessionCode = `BENCHMARK-5GB-RUN-${Date.now().toString(36).toUpperCase()}`;
  const benchmarkSession = await prisma.benchmarkSession.create({
    data: {
      sessionCode,
      targetSizeBytes: BigInt(targetBytes),
      currentSizeBytes: BigInt(startBytes),
      status: "IN_PROGRESS",
      notes: `Tiến trình sinh dữ liệu giai đoạn ${stageNum || "Tự chọn"} tới đích ${formatBytes(targetBytes)}`,
    },
  });

  // Tối ưu hóa SQLite cho bulk insert
  try {
    await prisma.$queryRawUnsafe("PRAGMA journal_mode = WAL;");
    await prisma.$queryRawUnsafe("PRAGMA synchronous = NORMAL;");
  } catch {}

  let currentBytes = startBytes;
  let totalInserted = 0;
  let batchIndex = 0;
  const startTime = Date.now();
  let lastLogTime = Date.now();

  const BATCH_SIZE = 4000; // 4,000 bản ghi mỗi transaction

  console.log(`--> Bắt đầu nạp dữ liệu theo lô (${BATCH_SIZE} bản ghi/lô)...`);

  while (currentBytes < targetBytes) {
    batchIndex++;

    // Chuẩn bị batch câu lệnh SQL trực tiếp cho tốc độ tối đa
    const viewEventRows: string[] = [];
    const searchEventRows: string[] = [];
    const auditLogRows: string[] = [];
    const invTxRows: string[] = [];

    const nowTs = new Date();

    for (let i = 0; i < BATCH_SIZE / 4; i++) {
      const p = products[i % products.length];
      const sessId = `sess-${randomUUID().substring(0, 18)}`;
      const ip = `14.${160 + (i % 80)}.${(i * 3) % 255}.${(i * 7) % 255}`;
      const ua = USER_AGENTS[i % USER_AGENTS.length];
      const ref = REFERRERS[i % REFERRERS.length];
      const query = SEARCH_QUERIES[i % SEARCH_QUERIES.length];
      const action = AUDIT_ACTIONS[i % AUDIT_ACTIONS.length];

      // 1. ProductViewEvent row
      viewEventRows.push(
        `('${randomUUID()}', '${sessId}', NULL, '${p.id}', '${ref.replace(/'/g, "''")}', '${ua.replace(/'/g, "''")}', '${ip}', ${15 + (i % 300)}, '1920x1080', '${nowTs.toISOString()}')`
      );

      // 2. SearchEvent row
      const filters = JSON.stringify({
        category: "dien-thoai-cong-nghe",
        sort: "best_seller",
        page: 1,
        limit: 12,
        clientIp: ip,
        facets: { inStockOnly: true, warrantyYears: 1, freeDelivery: true },
        clientMetadata: { screenWidth: 1920, screenHeight: 1080, colorDepth: 24, language: "vi-VN" },
      });
      searchEventRows.push(
        `('${randomUUID()}', '${sessId}', NULL, '${query.replace(/'/g, "''")}', '${query.replace(/'/g, "''")}', '${filters.replace(/'/g, "''")}', ${12 + (i % 20)}, ${(12.4 + (i % 25)).toFixed(2)}, '${p.id}', '${nowTs.toISOString()}')`
      );

      // 3. AuditLog row (Payload kiểm toán doanh nghiệp chuẩn SOC2 / PCI-DSS với State Snapshot đầy đủ)
      const auditPayload = JSON.stringify({
        actor: { type: "SERVICE_WORKER", role: "ROLE_ADMIN", workerId: `wrk-${i % 8}`, clusterNode: "hn-edge-node-01" },
        entity: { type: "ProductCatalog", id: p.id, sku: p.sku, title: p.title },
        action,
        previousState: {
          stock: 45 + (i % 100),
          regularPrice: p.regularPrice,
          auditStatus: "VERIFIED",
          healthScore: 98.5,
          lastSync: "2026-10-01T00:00:00.000Z",
        },
        newState: {
          stock: 45 + (i % 100) + 15,
          regularPrice: p.regularPrice,
          auditStatus: "VERIFIED",
          healthScore: 99.8,
          lastSync: nowTs.toISOString(),
        },
        systemContext: {
          traceId: randomUUID(),
          spanId: randomUUID().substring(0, 16),
          cpuLoadPercent: 24.5 + (i % 15),
          memoryAllocatedBytes: 134217728 + i * 1024,
          diskIoLatencyMs: 0.85,
          databaseEngine: "Distributed-Storage-Engine-v2",
        },
        securitySignature: `sha256-${randomUUID().replace(/-/g, "")}${randomUUID().replace(/-/g, "")}`,
        timestamp: nowTs.toISOString(),
      });
      auditLogRows.push(
        `('${randomUUID()}', NULL, 'SYSTEM', '${action}', 'Product', '${p.id}', '${ip}', '${ua.replace(/'/g, "''")}', '${auditPayload.replace(/'/g, "''")}', '${nowTs.toISOString()}')`
      );

      // 4. InventoryTransaction row
      const refNum = `WH-TX-2026-${(100000 + i).toString()}`;
      invTxRows.push(
        `('${randomUUID()}', '${p.id}', NULL, 'WH-HCM-01', 'ADJUST', ${10 + (i % 50)}, '${refNum}', 'Kiểm kê định kỳ tự động lô ${batchIndex} - Hệ thống tự động cân đối tồn kho kho trung tâm', '${nowTs.toISOString()}')`
      );
    }

    // Thực thi transaction nguyên tử trong SQLite qua Prisma $transaction
    await prisma.$transaction([
      prisma.$executeRawUnsafe(
        `INSERT INTO product_view_events (id, sessionId, userId, productId, referrer, userAgent, ipAddress, dwellTimeSeconds, viewportResolution, createdAt) VALUES ${viewEventRows.join(",")};`
      ),
      prisma.$executeRawUnsafe(
        `INSERT INTO search_events (id, sessionId, userId, query, normalizedQuery, filtersJson, resultCount, executionMs, clickedProductId, createdAt) VALUES ${searchEventRows.join(",")};`
      ),
      prisma.$executeRawUnsafe(
        `INSERT INTO audit_logs (id, actorId, actorRole, action, entityType, entityId, ipAddress, userAgent, changesJson, createdAt) VALUES ${auditLogRows.join(",")};`
      ),
      prisma.$executeRawUnsafe(
        `INSERT INTO inventory_transactions (id, productId, variantId, warehouseCode, transactionType, quantity, referenceNumber, note, createdAt) VALUES ${invTxRows.join(",")};`
      ),
    ]);

    totalInserted += BATCH_SIZE;

    // Đo lại dung lượng thực tế sau mỗi 3 lô
    if (batchIndex % 3 === 0 || Date.now() - lastLogTime > 2000) {
      currentBytes = getDatabaseSize();
      const pct = Math.min(100, (currentBytes / targetBytes) * 100);
      const elapsedSec = (Date.now() - startTime) / 1000;
      const speedMb = (currentBytes - startBytes) / (1024 * 1024) / (elapsedSec || 1);
      const remainingBytes = Math.max(0, targetBytes - currentBytes);
      const etaSec = speedMb > 0 ? remainingBytes / (1024 * 1024) / speedMb : 0;

      console.log(
        `[Lô #${batchIndex.toString().padStart(4)}] Đã ghi ${totalInserted.toLocaleString()} bản ghi | Dung lượng: ${(currentBytes / 1024 / 1024).toFixed(1)} MB (${pct.toFixed(1)}%) | Tốc độ: ${speedMb.toFixed(1)} MB/s | ETA: ${etaSec.toFixed(0)}s`
      );
      lastLogTime = Date.now();

      // Lưu checkpoint
      saveCheckpoint({
        currentStage: stageNum || 1,
        targetBytes,
        currentBytes,
        totalRecordsInserted: totalInserted,
        lastUpdated: new Date().toISOString(),
        isCompleted: currentBytes >= targetBytes,
      });
    }
  }

  // Kết thúc phiên benchmark
  const finalBytes = getDatabaseSize();
  const totalElapsedSec = (Date.now() - startTime) / 1000;

  await prisma.benchmarkSession.update({
    where: { id: benchmarkSession.id },
    data: {
      currentSizeBytes: BigInt(finalBytes),
      status: "COMPLETED",
      totalRecords: totalInserted,
      completedAt: new Date(),
    },
  });

  // Ghi nhận bản ghi DataImportJob
  if (stageNum) {
    await prisma.dataImportJob.create({
      data: {
        jobName: `IMPORT_STAGE_${stageNum}`,
        stage: `STAGE_${stageNum}`,
        targetSize: formatBytes(targetBytes),
        status: "COMPLETED",
        recordsProcessed: totalInserted,
        currentBytes: BigInt(finalBytes),
        startedAt: new Date(startTime),
        finishedAt: new Date(),
      },
    });
  }

  saveCheckpoint({
    currentStage: stageNum || 5,
    targetBytes,
    currentBytes: finalBytes,
    totalRecordsInserted: totalInserted,
    lastUpdated: new Date().toISOString(),
    isCompleted: true,
  });

  console.log("================================================================================");
  console.log("  KẾT QUẢ HOÀN THÀNH");
  console.log("================================================================================");
  console.log(`✓ Tổng thời gian thực thi: ${totalElapsedSec.toFixed(1)} giây`);
  console.log(`✓ Tổng số bản ghi mới nạp: ${totalInserted.toLocaleString()} bản ghi`);
  console.log(`✓ Dung lượng cuối cùng trên đĩa: ${formatBytes(finalBytes)}`);
  console.log(`✓ Đạt chuẩn 5.000.000.000 bytes (5GB thập phân): ${finalBytes >= 5_000_000_000 ? "ĐẠT (PASS)" : "CHƯA ĐẠT"}`);
  console.log(`✓ Đạt chuẩn 5.368.709.120 bytes (5GiB nhị phân): ${finalBytes >= 5_368_709_120 ? "ĐẠT (PASS)" : "CHƯA ĐẠT"}`);
  console.log("================================================================================");
}

// Xử lý tham số dòng lệnh CLI
async function main() {
  const args = process.argv.slice(2);
  let stage = 1;
  let targetBytes = STAGE_TARGETS[1].bytes;

  if (args.includes("--stage")) {
    const stageIdx = args.indexOf("--stage");
    stage = parseInt(args[stageIdx + 1], 10) || 1;
    targetBytes = STAGE_TARGETS[stage]?.bytes || STAGE_TARGETS[1].bytes;
  } else if (args.includes("--target-bytes")) {
    const bytesIdx = args.indexOf("--target-bytes");
    targetBytes = parseInt(args[bytesIdx + 1], 10) || STAGE_TARGETS[1].bytes;
  } else if (args.includes("--target-mb")) {
    const mbIdx = args.indexOf("--target-mb");
    const mb = parseInt(args[mbIdx + 1], 10) || 100;
    targetBytes = mb * 1024 * 1024;
  } else if (args.includes("--full-5gb") || args.includes("--5gb")) {
    stage = 5;
    targetBytes = STAGE_TARGETS[5].bytes;
  }

  await runGenerator(targetBytes, stage);
}

if (require.main === module) {
  main()
    .catch((err) => {
      console.error("Lỗi thực thi generator:", err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
