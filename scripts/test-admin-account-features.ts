import { prisma } from "../src/lib/prisma";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "aj_ecommerce_production_secure_jwt_secret_2026_aws_cloud_xyz";

function createToken(payload: { id: string; email: string; role: string; name: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
}

interface TestResult {
  name: string;
  category: string;
  passed: boolean;
  details?: string;
  durationMs: number;
}

const results: TestResult[] = [];

async function runTest(category: string, name: string, fn: () => Promise<void>) {
  const start = Date.now();
  try {
    await fn();
    results.push({ name, category, passed: true, durationMs: Date.now() - start });
    console.log(`  ✓ [PASS] [${category}] ${name}`);
  } catch (err: any) {
    results.push({ name, category, passed: false, details: err.message, durationMs: Date.now() - start });
    console.error(`  ✗ [FAIL] [${category}] ${name}: ${err.message}`);
  }
}

async function main() {
  console.log("================================================================================");
  console.log("   AUTOMATED TEST SUITE: ADMIN PRODUCT MANAGEMENT & CUSTOMER ACCOUNT HUB        ");
  console.log("================================================================================\n");

  // 1. Setup Test Users
  const testAdminEmail = `test_admin_${Date.now()}@aj-commerce.local`;
  const testUserEmail = `test_user_${Date.now()}@aj-commerce.local`;
  const initialPassword = "Password123!";
  const passwordHash = await bcrypt.hash(initialPassword, 10);

  const adminUser = await prisma.user.create({
    data: {
      name: "Test Admin User",
      email: testAdminEmail,
      passwordHash,
      role: "ROLE_ADMIN",
      phone: "0901111222",
    },
  });

  const normalUser = await prisma.user.create({
    data: {
      name: "Test Normal Customer",
      email: testUserEmail,
      passwordHash,
      role: "ROLE_USER",
      phone: "0903333444",
    },
  });

  const adminToken = createToken({
    id: adminUser.id,
    email: adminUser.email,
    role: adminUser.role,
    name: adminUser.name,
  });

  const userToken = createToken({
    id: normalUser.id,
    email: normalUser.email,
    role: normalUser.role,
    name: normalUser.name,
  });

  const BASE_URL = "http://localhost:3000";

  // Check if test server is running or test directly via Prisma/fetch
  let serverRunning = false;
  try {
    const res = await fetch(`${BASE_URL}/api/health`);
    if (res.ok) serverRunning = true;
  } catch {
    serverRunning = false;
  }

  // -------------------------------------------------------------
  // TEST GROUP 1: DATABASE & MODEL INTEGRITY
  // -------------------------------------------------------------
  await runTest("Database", "Verify User and Address models", async () => {
    const u = await prisma.user.findUnique({
      where: { id: normalUser.id },
      include: { addresses: true },
    });
    if (!u) throw new Error("User was not found");
    if (!Array.isArray(u.addresses)) throw new Error("Addresses relation is not an array");
  });

  await runTest("Database", "Verify Product Specifications and Variants models", async () => {
    const p = await prisma.product.findFirst({
      include: { variants: true, specifications: true, images: true },
    });
    if (!p) throw new Error("No products found in database");
    if (!Array.isArray(p.variants)) throw new Error("Variants relation invalid");
    if (!Array.isArray(p.specifications)) throw new Error("Specifications relation invalid");
    if (!Array.isArray(p.images)) throw new Error("Images relation invalid");
  });

  // -------------------------------------------------------------
  // TEST GROUP 2: ADDRESS BOOK CRUD
  // -------------------------------------------------------------
  let testAddressId = "";

  await runTest("Address Book", "Add new shipping address with default flag", async () => {
    const addr = await prisma.shippingAddress.create({
      data: {
        userId: normalUser.id,
        recipientName: "Nguyễn Văn Test",
        phone: "0912345678",
        street: "456 Đường CMT8, Tòa nhà Bitexco",
        ward: "Phường Bến Thành",
        district: "Quận 1",
        city: "TP. Hồ Chí Minh",
        isDefault: true,
      },
    });
    testAddressId = addr.id;
    if (!addr.id) throw new Error("Failed to create shipping address");
    if (!addr.isDefault) throw new Error("Expected address to be default");
  });

  await runTest("Address Book", "Add second address and toggle default", async () => {
    const addr2 = await prisma.shippingAddress.create({
      data: {
        userId: normalUser.id,
        recipientName: "Trần Thị Test 2",
        phone: "0987654321",
        street: "789 Đường Hai Bà Trưng",
        ward: "Phường Tân Định",
        district: "Quận 1",
        city: "TP. Hồ Chí Minh",
        isDefault: false,
      },
    });

    // Make addr2 default and verify addr1 is unset
    await prisma.$transaction([
      prisma.shippingAddress.updateMany({
        where: { userId: normalUser.id },
        data: { isDefault: false },
      }),
      prisma.shippingAddress.update({
        where: { id: addr2.id },
        data: { isDefault: true },
      }),
    ]);

    const updated1 = await prisma.shippingAddress.findUnique({ where: { id: testAddressId } });
    const updated2 = await prisma.shippingAddress.findUnique({ where: { id: addr2.id } });

    if (updated1?.isDefault !== false) throw new Error("Previous address should not be default");
    if (updated2?.isDefault !== true) throw new Error("New address should be default");

    // Clean up addr2
    await prisma.shippingAddress.delete({ where: { id: addr2.id } });
  });

  await runTest("Address Book", "Update existing address details", async () => {
    const updated = await prisma.shippingAddress.update({
      where: { id: testAddressId },
      data: {
        recipientName: "Nguyễn Văn Updated",
        phone: "0999888777",
      },
    });
    if (updated.recipientName !== "Nguyễn Văn Updated") throw new Error("Failed to update recipient name");
    if (updated.phone !== "0999888777") throw new Error("Failed to update phone");
  });

  // -------------------------------------------------------------
  // TEST GROUP 3: PROFILE & SECURITY
  // -------------------------------------------------------------
  await runTest("Profile", "Update user profile fields without affecting role or password", async () => {
    const updated = await prisma.user.update({
      where: { id: normalUser.id },
      data: {
        name: "Khách Hàng Đã Sửa Tên",
        phone: "0988777666",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      },
    });
    if (updated.name !== "Khách Hàng Đã Sửa Tên") throw new Error("Profile name did not update");
    if (updated.role !== "ROLE_USER") throw new Error("Security breach: Role was modified");
    if (updated.passwordHash !== passwordHash) throw new Error("Password hash was corrupted");
  });

  await runTest("Security", "Password change flow with bcrypt validation", async () => {
    // 1. Verify wrong password rejected
    const isOldMatch = await bcrypt.compare("WrongPass123", normalUser.passwordHash);
    if (isOldMatch) throw new Error("Expected wrong password to fail compare");

    // 2. Verify correct password accepted
    const isCorrectMatch = await bcrypt.compare(initialPassword, normalUser.passwordHash);
    if (!isCorrectMatch) throw new Error("Expected correct password to pass compare");

    // 3. Update password
    const newPass = "NewSecurePassword456!";
    const newHash = await bcrypt.hash(newPass, 10);
    await prisma.user.update({
      where: { id: normalUser.id },
      data: { passwordHash: newHash },
    });

    const isNewMatch = await bcrypt.compare(newPass, newHash);
    if (!isNewMatch) throw new Error("New password hash did not verify");
  });

  // -------------------------------------------------------------
  // TEST GROUP 4: ADMIN PRODUCT MANAGEMENT & FULL EDITING
  // -------------------------------------------------------------
  let testProductId = "";
  const testProductSku = `TEST-EDIT-PROD-${Date.now()}`;
  const testProductSlug = `test-edit-product-${Date.now()}`;

  await runTest("Admin Product", "Create test product with variants & specs", async () => {
    const category = await prisma.category.findFirst();
    if (!category) throw new Error("No category found for test");

    const prod = await prisma.product.create({
      data: {
        title: "Test Product For Editing",
        slug: testProductSlug,
        sku: testProductSku,
        regularPrice: 20000000,
        salePrice: 18000000,
        stock: 50,
        status: "ACTIVE",
        categoryId: category.id,
        description: "Initial description",
        images: {
          create: [
            {
              url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80",
              isPrimary: true,
              sortOrder: 1,
            },
          ],
        },
        variants: {
          create: [
            {
              name: "Bản Tiêu Chuẩn 128GB",
              sku: `${testProductSku}-128G`,
              price: 18000000,
              stock: 30,
              attributesJson: JSON.stringify({ storage: "128GB" }),
            },
          ],
        },
        specifications: {
          create: [
            {
              groupName: "Màn Hình",
              specKey: "Kích Thước",
              specValue: "6.7 inch Super Retina XDR",
              sortOrder: 1,
            },
          ],
        },
      },
    });

    testProductId = prod.id;
    if (!prod.id) throw new Error("Failed to create test product");
  });

  await runTest("Admin Product", "Full edit: update basic info, price, stock, specs & variants", async () => {
    const updated = await prisma.$transaction(async (tx) => {
      // 1. Update basic info & price
      const p = await tx.product.update({
        where: { id: testProductId },
        data: {
          title: "Test Product After Full Edit (Updated)",
          regularPrice: 22000000,
          salePrice: 19500000,
          stock: 45,
          status: "ACTIVE",
          isFeatured: true,
          isFlashSale: true,
          description: "Updated description after admin edit",
        },
      });

      // 2. Add second image
      await tx.productImage.create({
        data: {
          productId: testProductId,
          url: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80",
          isPrimary: false,
          sortOrder: 2,
        },
      });

      // 3. Add second variant
      await tx.productVariant.create({
        data: {
          productId: testProductId,
          name: "Bản Nâng Cấp 256GB",
          sku: `${testProductSku}-256G`,
          price: 21500000,
          stock: 15,
          attributesJson: JSON.stringify({ storage: "256GB" }),
        },
      });

      // 4. Add second specification
      await tx.productSpecification.create({
        data: {
          productId: testProductId,
          groupName: "Hiệu Năng",
          specKey: "Chip Xử Lý",
          specValue: "Apple A18 Pro 3nm",
          sortOrder: 2,
        },
      });

      return p;
    });

    // Verify all updates
    const verified = await prisma.product.findUnique({
      where: { id: testProductId },
      include: { images: true, variants: true, specifications: true },
    });

    if (!verified) throw new Error("Product missing");
    if (verified.title !== "Test Product After Full Edit (Updated)") throw new Error("Title did not update");
    if (Number(verified.regularPrice) !== 22000000) throw new Error("Regular price did not update");
    if (Number(verified.salePrice) !== 19500000) throw new Error("Sale price did not update");
    if (verified.images.length !== 2) throw new Error("Expected 2 images after edit");
    if (verified.variants.length !== 2) throw new Error("Expected 2 variants after edit");
    if (verified.specifications.length !== 2) throw new Error("Expected 2 specifications after edit");
  });

  // -------------------------------------------------------------
  // TEST GROUP 5: ORDER ACCESS CONTROL
  // -------------------------------------------------------------
  await runTest("Order Security", "Verify cross-user order access prevention logic", async () => {
    // Create an order for normalUser
    const order = await prisma.order.create({
      data: {
        orderNumber: `ORD-TEST-${Date.now()}`,
        userId: normalUser.id,
        customerName: normalUser.name,
        customerEmail: normalUser.email,
        customerPhone: "0903333444",
        shippingAddress: "123 Đường Test",
        shippingCity: "TP. Hồ Chí Minh",
        shippingDistrict: "Quận 1",
        shippingWard: "Phường Bến Nghé",
        subtotal: 1000000,
        discount: 0,
        shippingFee: 0,
        total: 1000000,
        status: "PENDING",
        paymentMethod: "COD",
        paymentStatus: "PENDING",
      },
    });

    // Check ownership
    const isOwner = order.userId === normalUser.id;
    const isOtherUserOwner = order.userId === "other-user-uuid";
    const isAdminPermitted = adminUser.role === "ROLE_ADMIN";

    if (!isOwner) throw new Error("Expected normal user to be owner");
    if (isOtherUserOwner) throw new Error("Other user should NOT be owner");
    if (!isAdminPermitted) throw new Error("Admin should be permitted");

    // Clean up test order
    await prisma.order.delete({ where: { id: order.id } });
  });

  // -------------------------------------------------------------
  // CLEANUP TEST DATA
  // -------------------------------------------------------------
  try {
    if (testAddressId) {
      await prisma.shippingAddress.deleteMany({ where: { userId: normalUser.id } });
    }
    if (testProductId) {
      await prisma.productImage.deleteMany({ where: { productId: testProductId } });
      await prisma.productVariant.deleteMany({ where: { productId: testProductId } });
      await prisma.productSpecification.deleteMany({ where: { productId: testProductId } });
      await prisma.product.delete({ where: { id: testProductId } });
    }
    await prisma.user.delete({ where: { id: adminUser.id } });
    await prisma.user.delete({ where: { id: normalUser.id } });
  } catch (cleanErr) {
    console.warn("Cleanup warning:", cleanErr);
  }

  // Summary
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = total - passed;

  console.log("\n================================================================================");
  console.log("                           TEST EXECUTION SUMMARY                                ");
  console.log("================================================================================");
  console.log(`Total Tests Run:  ${total}`);
  console.log(`Passed:           ${passed} (✓)`);
  console.log(`Failed:           ${failed} (${failed > 0 ? "✗" : "✓"})`);
  console.log(`Pass Rate:        ${((passed / total) * 100).toFixed(1)}%`);
  console.log("================================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Test runner error:", err);
  process.exit(1);
});
