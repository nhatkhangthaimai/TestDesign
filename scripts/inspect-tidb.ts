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
  console.log("================================================================================");
  console.log("           THỐNG KÊ DỮ LIỆU ĐÃ DEPLOY LÊN TIDB CLOUD (AWS AP-SOUTHEAST-1)       ");
  console.log("================================================================================");

  let connection;
  try {
    connection = await mysql.createConnection(connectionConfig);
    console.log("✓ Kết nối TiDB Cloud thành công qua cổng 4000 (TLS/SSL)!\n");

    // 1. Thống kê dung lượng từ information_schema
    const [tableInfo]: any = await connection.query(`
      SELECT 
        table_name AS tableName,
        table_rows AS tableRows,
        data_length AS dataLength,
        index_length AS indexLength,
        (data_length + index_length) AS totalBytes
      FROM information_schema.tables 
      WHERE table_schema = 'test'
      ORDER BY totalBytes DESC, tableName ASC;
    `);

    let totalBytes = 0;
    console.log(
      `${"Tên Bảng".padEnd(32)} | ${"Dung Lượng (KB)".padStart(16)} | ${"Index (KB)".padStart(14)}`
    );
    console.log("-".repeat(68));

    for (const t of tableInfo) {
      const bytes = Number(t.totalBytes || 0);
      const dataKb = (Number(t.dataLength || 0) / 1024).toFixed(1);
      const idxKb = (Number(t.indexLength || 0) / 1024).toFixed(1);
      totalBytes += bytes;

      console.log(
        `${String(t.tableName).padEnd(32)} | ${(bytes / 1024).toFixed(1).padStart(16)} | ${idxKb.padStart(14)}`
      );
    }

    console.log("=".repeat(68));
    console.log(`✓ Tổng số bảng đã tạo trên TiDB: ${tableInfo.length} bảng`);
    console.log(`✓ Dung lượng hiện tại: ${(totalBytes / 1024 / 1024).toFixed(3)} MB`);
    console.log(`✓ Hạn mức lưu trữ miễn phí: 5.000 GiB (5,120 MB)`);
    console.log("================================================================================\n");

    // 2. Thống kê số bản ghi thực tế từng bảng
    console.log("2. SỐ LƯỢNG BẢN GHI THỰC TẾ TRONG TỪNG BẢNG (EXACT ROW COUNT):");
    const countQueries = [
      "products",
      "categories",
      "brands",
      "product_variants",
      "product_specifications",
      "product_compatibilities",
      "product_images",
      "product_price_histories",
      "users",
      "shipping_addresses",
      "banners",
      "store_settings",
      "inventories",
      "audit_logs",
      "product_view_events",
      "search_events",
      "inventory_transactions",
    ];

    for (const tbl of countQueries) {
      try {
        const [rows]: any = await connection.query(`SELECT COUNT(*) as c FROM \`${tbl}\``);
        const count = rows[0]?.c ?? 0;
        console.log(`  - ${tbl.padEnd(26)}: ${count.toLocaleString().padStart(6)} bản ghi`);
      } catch (err: any) {
        console.log(`  - ${tbl.padEnd(26)}: (Chưa khởi tạo hoặc lỗi: ${err.message})`);
      }
    }
  } catch (error: any) {
    console.error("Lỗi kết nối TiDB Cloud:", error.message);
  } finally {
    if (connection) await connection.end();
  }
}

main();
