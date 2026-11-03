import mysql from "mysql2/promise";
import crypto from "crypto";

const connectionConfig = {
  host: "gateway01.ap-southeast-1.prod.aws.tidbcloud.com",
  port: 4000,
  user: "iY15LFk8kgKVgVn.root",
  password: "m22dorl92xShU1H8",
  database: "test",
  ssl: {
    minVersion: "TLSv1.2",
    rejectUnauthorized: false,
  },
};

async function main() {
  console.log("--> Đang kiểm tra tốc độ nạp lô vào TiDB Cloud...");
  const conn = await mysql.createConnection(connectionConfig);

  const t0 = Date.now();
  const rows: any[] = [];
  const batchSize = 1000;

  for (let i = 0; i < batchSize; i++) {
    const id = crypto.randomUUID();
    const actorId = null;
    const actorRole = "USER";
    const action = "USER_CHECKOUT_EVENT";
    const entityType = "Order";
    const entityId = crypto.randomUUID();
    const ipAddress = `192.168.1.${(i % 250) + 1}`;
    const userAgent =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36";
    const changesJson = JSON.stringify({
      orderId: crypto.randomUUID(),
      total: 35000000,
      currency: "VND",
      items: [
        { sku: "IP16PM-256-DESERT", qty: 1, price: 34990000 },
        { sku: "ANKER-PRIME-100W", qty: 1, price: 1490000 },
      ],
      shipping: { city: "Hồ Chí Minh", method: "EXPRESS", fee: 0 },
      payment: { gateway: "VNPAY", transactionNo: `VNP${Date.now()}` },
      timestamp: new Date().toISOString(),
    });
    const createdAt = new Date();

    rows.push([
      id,
      actorId,
      actorRole,
      action,
      entityType,
      entityId,
      ipAddress,
      userAgent,
      changesJson,
      createdAt,
    ]);
  }

  const sql = `
    INSERT INTO audit_logs (
      id, actorId, actorRole, action, entityType, entityId, ipAddress, userAgent, changesJson, createdAt
    ) VALUES ?
  `;

  await conn.query(sql, [rows]);
  const duration = (Date.now() - t0) / 1000;
  console.log(`✓ Đã nạp thành công 1,000 bản ghi audit_logs vào TiDB Cloud trong ${duration.toFixed(2)}s!`);
  
  const [res]: any = await conn.query("SELECT COUNT(*) as c FROM audit_logs");
  console.log(`✓ Tổng số audit_logs hiện tại trên TiDB: ${res[0].c}`);

  await conn.end();
}

main().catch(console.error);
