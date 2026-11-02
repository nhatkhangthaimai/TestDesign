import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const target = process.argv[2]?.toLowerCase();
const envPath = path.resolve(process.cwd(), ".env");

if (target !== "local" && target !== "tidb") {
  console.log("Cách dùng:");
  console.log("  npx tsx scripts/switch-db.ts local  --> Chuyển sang Database SQLite 5GB trên máy");
  console.log("  npx tsx scripts/switch-db.ts tidb   --> Chuyển sang Database TiDB Cloud phân tán");
  process.exit(1);
}

let envContent = fs.readFileSync(envPath, "utf-8");

const TIDB_URL =
  "mysql://iY15LFk8kgKVgVn.root:m22dorl92xShU1H8@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/test?sslaccept=strict";
const LOCAL_URL = "file:./dev.db";

if (target === "local") {
  console.log("--> Đang chuyển cấu hình sang SQLite 5GB Cục bộ...");
  envContent = envContent.replace(
    /DATABASE_URL=.*/g,
    `DATABASE_URL="${LOCAL_URL}"`
  );
  fs.writeFileSync(envPath, envContent, "utf-8");
  console.log("✓ Đã cập nhật .env sang Local SQLite 5GB");
  console.log("--> Đang tạo Prisma Client cho SQLite...");
  execSync("npx prisma generate", { stdio: "inherit" });
  console.log("✓ Hoàn tất! Bạn có thể chạy `npm run dev` hoặc `npm run build && npm run start` để dùng 5GB data trên máy.");
} else if (target === "tidb") {
  console.log("--> Đang chuyển cấu hình sang TiDB Cloud...");
  envContent = envContent.replace(
    /DATABASE_URL=.*/g,
    `DATABASE_URL="${TIDB_URL}"`
  );
  fs.writeFileSync(envPath, envContent, "utf-8");
  console.log("✓ Đã cập nhật .env sang TiDB Cloud");
  console.log("--> Đang tạo Prisma Client cho TiDB (MySQL)...");
  execSync("npx prisma generate --schema prisma/schema.tidb.prisma", { stdio: "inherit" });
  console.log("✓ Hoàn tất! Bạn có thể chạy `npm run dev` hoặc `npm run build && npm run start` để dùng TiDB Cloud.");
}

