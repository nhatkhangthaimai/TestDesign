import mysql from "mysql2/promise";

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
  console.log("--> Đang kết nối TiDB Cloud...");
  const conn = await mysql.createConnection(connectionConfig);

  const columns = [
    "ADD COLUMN IF NOT EXISTS description TEXT NULL",
    "ADD COLUMN IF NOT EXISTS videoUrl TEXT NULL",
    "ADD COLUMN IF NOT EXISTS videoMobileUrl TEXT NULL",
    "ADD COLUMN IF NOT EXISTS posterUrl TEXT NULL",
    "ADD COLUMN IF NOT EXISTS mediaType VARCHAR(20) NOT NULL DEFAULT 'IMAGE'",
    "ADD COLUMN IF NOT EXISTS ctaText VARCHAR(100) NULL DEFAULT 'Khám Phá Ngay'",
    "ADD COLUMN IF NOT EXISTS textColor VARCHAR(50) NULL DEFAULT '#ffffff'",
    "ADD COLUMN IF NOT EXISTS overlayColor VARCHAR(50) NULL DEFAULT '#000000'",
    "ADD COLUMN IF NOT EXISTS overlayOpacity DOUBLE NULL DEFAULT 0.4",
    "ADD COLUMN IF NOT EXISTS contentPosition VARCHAR(50) NULL DEFAULT 'LEFT'",
    "ADD COLUMN IF NOT EXISTS targetDevice VARCHAR(50) NULL DEFAULT 'ALL'",
    "ADD COLUMN IF NOT EXISTS durationSeconds INT NULL DEFAULT 8",
    "ADD COLUMN IF NOT EXISTS startDate DATETIME(3) NULL",
    "ADD COLUMN IF NOT EXISTS endDate DATETIME(3) NULL",
  ];

  for (const col of columns) {
    try {
      await conn.query(`ALTER TABLE banners ${col}`);
      console.log(`✓ Đã thêm cột: ${col}`);
    } catch (e: any) {
      console.error(`! Lỗi khi thêm: ${col} - ${e.message}`);
    }
  }

  const [cols]: any = await conn.query("DESCRIBE banners");
  console.log("\nDanh sách các cột trong bảng banners hiện tại:");
  console.table(cols.map((c: any) => ({ Field: c.Field, Type: c.Type, Null: c.Null, Default: c.Default })));

  await conn.end();
  console.log("✓ Hoàn tất migration cho banners!");
}

main().catch(console.error);

