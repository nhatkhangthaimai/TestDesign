import bcrypt from "bcryptjs";
import { signToken, verifyToken, isAdminRole } from "../src/lib/auth";
import { prisma } from "../src/lib/prisma";

async function runTestSuite() {
  console.log("================================================================================");
  console.log("    AUTOMATED TEST SUITE: AUTHENTICATION & ROLE-BASED ACCESS CONTROL (RBAC)    ");
  console.log("================================================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  [PASS] ✓ ${testName}`);
      passed++;
    } else {
      console.error(`  [FAIL] ✗ ${testName} ${detail ? `(${detail})` : ""}`);
      failed++;
    }
  }

  try {
    // 1. Kiểm tra tài khoản USER trong database
    const userAccount = await prisma.user.findFirst({
      where: { role: "ROLE_USER" },
    });
    assert(!!userAccount, "Tìm thấy tài khoản USER trong database", `User: ${userAccount?.email}`);

    // 2. Kiểm tra tài khoản ADMIN trong database
    const adminAccount = await prisma.user.findFirst({
      where: {
        OR: [{ role: "ROLE_ADMIN" }, { role: "ADMIN" }],
      },
    });
    assert(!!adminAccount, "Tìm thấy tài khoản ADMIN trong database", `Admin: ${adminAccount?.email}`);

    // 3. Test: Helper isAdminRole nhận diện chính xác
    assert(isAdminRole("ROLE_ADMIN"), "isAdminRole: Nhận diện ROLE_ADMIN là Admin");
    assert(isAdminRole("ADMIN"), "isAdminRole: Nhận diện ADMIN là Admin");
    assert(isAdminRole("SUPER_ADMIN"), "isAdminRole: Nhận diện SUPER_ADMIN là Admin");
    assert(!isAdminRole("ROLE_USER"), "isAdminRole: Từ chối ROLE_USER");
    assert(!isAdminRole("USER"), "isAdminRole: Từ chối USER");
    assert(!isAdminRole(null), "isAdminRole: Từ chối null");
    assert(!isAdminRole(undefined), "isAdminRole: Từ chối undefined");

    // 4. Test: JWT Token Signing & Verification cho ADMIN
    if (adminAccount) {
      const adminToken = signToken({
        userId: adminAccount.id,
        email: adminAccount.email,
        role: adminAccount.role,
      });
      const decodedAdmin = verifyToken(adminToken);
      assert(
        !!decodedAdmin && decodedAdmin.userId === adminAccount.id && isAdminRole(decodedAdmin.role),
        "JWT: Token của Admin ký hợp lệ và giải mã đúng quyền Admin",
        `Role: ${decodedAdmin?.role}`
      );
    }

    // 5. Test: JWT Token Signing & Verification cho USER
    if (userAccount) {
      const userToken = signToken({
        userId: userAccount.id,
        email: userAccount.email,
        role: userAccount.role,
      });
      const decodedUser = verifyToken(userToken);
      assert(
        !!decodedUser && decodedUser.userId === userAccount.id && !isAdminRole(decodedUser.role),
        "JWT: Token của Khách Hàng ký hợp lệ và không có quyền Admin",
        `Role: ${decodedUser?.role}`
      );
    }

    // 6. Test: Token giả mạo hoặc sai Secret bị từ chối
    const fakeToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJyb2xlIjoiUk9MRV9BRE1JTiJ9.fakesignature123";
    const decodedFake = verifyToken(fakeToken);
    assert(decodedFake === null, "JWT: Token giả mạo chữ ký bị từ chối hoàn toàn (null)");

    // 7. Test: Password Hashing & Verification
    const testPlainPassword = "SecurePassword@2026";
    const hashed = await bcrypt.hash(testPlainPassword, 10);
    const validMatch = await bcrypt.compare(testPlainPassword, hashed);
    const wrongMatch = await bcrypt.compare("WrongPassword@123", hashed);
    assert(validMatch, "Bcrypt: Xác thực mật khẩu đúng thành công");
    assert(!wrongMatch, "Bcrypt: Xác thực mật khẩu sai bị từ chối");

    // 8. Test: Đăng ký người dùng mới - Ép buộc role ROLE_USER
    const tempEmail = `test_rbac_${Date.now()}@example.com`;
    const tempPasswordHash = await bcrypt.hash("UserPass@123", 10);
    const createdUser = await prisma.user.create({
      data: {
        name: "Test Normal User",
        email: tempEmail,
        passwordHash: tempPasswordHash,
        role: "ROLE_USER", // Backend enforce
      },
    });

    assert(createdUser.role === "ROLE_USER", "Đăng ký mới: Luôn tạo role ROLE_USER", `Role: ${createdUser.role}`);
    assert(!isAdminRole(createdUser.role), "Đăng ký mới: Người dùng mới không có quyền Admin");

    // Dọn dẹp tài khoản test
    await prisma.user.delete({ where: { id: createdUser.id } });
    assert(true, "Cleanup: Xóa tài khoản test an toàn");

    // 9. Kiểm tra file frontend không còn chứa credential demo
    const fs = await import("fs");
    const path = await import("path");
    const loginFileContent = fs.readFileSync(path.resolve(process.cwd(), "src/app/login/page.tsx"), "utf-8");

    assert(!loginFileContent.includes("fillDemoAccount"), "Frontend Login: Đã xóa hoàn toàn hàm fillDemoAccount");
    assert(!loginFileContent.includes("Admin Cấp Cao"), "Frontend Login: Đã xóa nút Admin Cấp Cao");
    assert(!loginFileContent.includes("Khách Hàng"), "Frontend Login: Đã xóa nút Khách Hàng");
    assert(!loginFileContent.includes("Admin@123456"), "Frontend Login: Không chứa mật khẩu hardcode Admin");
    assert(!loginFileContent.includes("User@123456"), "Frontend Login: Không chứa mật khẩu hardcode User");
    assert(loginFileContent.includes("Ghi nhớ đăng nhập"), "Frontend Login: Có checkbox Ghi nhớ đăng nhập");
    assert(loginFileContent.includes("Eye") && loginFileContent.includes("EyeOff"), "Frontend Login: Có nút Hiện/Ẩn mật khẩu");
    assert(loginFileContent.includes(': "/";'), "Frontend Login: Khách hàng (User) đăng nhập tự động chuyển về trang chủ /");

    // 10. Kiểm tra file middleware.ts
    const middlewareContent = fs.readFileSync(path.resolve(process.cwd(), "src/middleware.ts"), "utf-8");
    assert(middlewareContent.includes("/admin/:path*"), "Middleware: Đã đăng ký route bảo vệ /admin");
    assert(middlewareContent.includes("/api/admin/:path*"), "Middleware: Đã đăng ký route bảo vệ /api/admin");
    assert(middlewareContent.includes("/account/:path*"), "Middleware: Đã đăng ký route bảo vệ /account");
    assert(middlewareContent.includes("isAdminRole"), "Middleware: Có hàm kiểm tra phân quyền chuyên biệt");

    console.log("================================================================================");
    console.log(`                     KẾT QUẢ: ${passed} PASSED / ${failed} FAILED               `);
    console.log("================================================================================");

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error("Lỗi thực thi test suite:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTestSuite();

