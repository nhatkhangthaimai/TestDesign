import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

const cfg = {
  host: "gateway01.ap-southeast-1.prod.aws.tidbcloud.com",
  port: 4000,
  user: "iY15LFk8kgKVgVn.root",
  password: "m22dorl92xShU1H8",
  database: "test",
  ssl: { minVersion: "TLSv1.2", rejectUnauthorized: false }
};

async function check() {
  const conn = await mysql.createConnection(cfg);
  const [users]: any = await conn.query(
    "SELECT email, passwordHash, role, name FROM users WHERE email IN ('admin@ecommerce.vn', 'khachhang@ecommerce.vn', 'hoang.nam@gmail.com', 'lan.anh@outlook.com')"
  );

  console.log("CHECKING USERS & PASSWORDS IN TIDB CLOUD:");
  for (const u of users) {
    console.log(`\nEmail: ${u.email} | Role: ${u.role} | Tên: ${u.name}`);
    const passwordsToTry = ["Admin@123456", "User@123456", "123456", "admin123", "password"];
    let matched = false;
    for (const p of passwordsToTry) {
      const match = await bcrypt.compare(p, u.passwordHash);
      if (match) {
        console.log(`  ==> MẬT KHẨU HỢP LỆ: "${p}"`);
        matched = true;
        break;
      }
    }
    if (!matched) {
      console.log(`  ==> Chưa tìm thấy mật khẩu khớp trong danh sách thử nghiệm.`);
    }
  }
  await conn.end();
}

check().catch(console.error);

