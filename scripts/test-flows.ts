import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";
import { signToken } from "../src/lib/auth";

async function runTests() {
  console.log("==================================================");
  console.log("  CHẠY BÀI KIỂM THỬ TỰ ĐỘNG CÁC LUỒNG HỆ THỐNG");
  console.log("==================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`[PASS] ✓ ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ✗ ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Kiểm tra tài khoản Quản trị viên (Admin)
    const admin = await prisma.user.findUnique({
      where: { email: "admin@ecommerce.vn" },
    });
    assert(admin !== null && admin.role === "ROLE_ADMIN", "Tài khoản ROLE_ADMIN tồn tại và hợp lệ");
    if (admin) {
      const match = await bcrypt.compare("Admin@123456", admin.passwordHash);
      assert(match, "Mật khẩu Admin được mã hóa bằng bcrypt chính xác");
    }

    // 2. Kiểm tra tài khoản Khách hàng (User)
    const customer = await prisma.user.findUnique({
      where: { email: "khachhang@ecommerce.vn" },
      include: { addresses: true },
    });
    assert(customer !== null && customer.role === "ROLE_USER", "Tài khoản ROLE_USER tồn tại");
    assert((customer?.addresses.length || 0) > 0, "Địa chỉ giao hàng mặc định của khách hàng đã có");

    // 3. Kiểm tra Danh mục & Thương hiệu
    const categoriesCount = await prisma.category.count();
    const brandsCount = await prisma.brand.count();
    assert(categoriesCount >= 4, `Số lượng danh mục hoạt động: ${categoriesCount}`);
    assert(brandsCount >= 4, `Số lượng thương hiệu đối tác: ${brandsCount}`);

    // 4. Kiểm tra Danh sách sản phẩm & Tồn kho
    const products = await prisma.product.findMany({
      include: { images: true, variants: true },
    });
    assert(products.length >= 6, `Số lượng sản phẩm trong kho: ${products.length}`);
    const flashSaleItems = products.filter((p) => p.isFlashSale);
    assert(flashSaleItems.length > 0, `Có ${flashSaleItems.length} sản phẩm đang tham gia Flash Sale`);

    // 5. Kiểm tra Mã giảm giá (Coupon)
    const welcomeCoupon = await prisma.coupon.findUnique({
      where: { code: "WELCOME10" },
    });
    assert(welcomeCoupon !== null && welcomeCoupon.isActive, "Voucher WELCOME10 hoạt động");

    // 6. Kiểm tra Luồng Đặt Hàng & Transaction trừ tồn kho
    const testProduct = products[0];
    const initialStock = testProduct.stock;
    const testOrderQty = 2;

    const testOrder = await prisma.$transaction(async (tx) => {
      // Trừ kho
      await tx.product.update({
        where: { id: testProduct.id },
        data: { stock: { decrement: testOrderQty } },
      });

      // Tạo đơn
      return await tx.order.create({
        data: {
          orderNumber: `TEST-ORD-${Date.now()}`,
          userId: customer?.id || null,
          customerName: "Khách Kiểm Thử Tự Động",
          customerEmail: "tester@ecommerce.vn",
          customerPhone: "0900112233",
          shippingAddress: "123 Đường Kiểm Thử",
          shippingCity: "TP. Hồ Chí Minh",
          shippingDistrict: "Quận 1",
          shippingWard: "Bến Nghé",
          subtotal: (testProduct.salePrice ?? testProduct.regularPrice) * testOrderQty,
          total: (testProduct.salePrice ?? testProduct.regularPrice) * testOrderQty,
          status: "PENDING",
          paymentMethod: "COD",
          paymentStatus: "PENDING",
          items: {
            create: [
              {
                productId: testProduct.id,
                productTitle: testProduct.title,
                sku: testProduct.sku,
                price: testProduct.salePrice ?? testProduct.regularPrice,
                quantity: testOrderQty,
                total: (testProduct.salePrice ?? testProduct.regularPrice) * testOrderQty,
              },
            ],
          },
          statusHistory: {
            create: [{ status: "PENDING", note: "Đơn hàng kiểm thử tự động" }],
          },
        },
      });
    });

    assert(testOrder !== null, "Tạo đơn hàng trong Prisma transaction thành công");

    // Kiểm tra tồn kho đã bị trừ chính xác
    const updatedProduct = await prisma.product.findUnique({
      where: { id: testProduct.id },
    });
    assert(
      updatedProduct?.stock === initialStock - testOrderQty,
      `Tồn kho đã được trừ chính xác (${initialStock} -> ${updatedProduct?.stock})`
    );

    // 7. Cập nhật trạng thái đơn hàng (Admin workflow)
    const updatedOrder = await prisma.order.update({
      where: { id: testOrder.id },
      data: {
        status: "DELIVERED",
        paymentStatus: "PAID",
        statusHistory: {
          create: [{ status: "DELIVERED", note: "Giao hàng thành công" }],
        },
      },
      include: { statusHistory: true },
    });

    assert(updatedOrder.status === "DELIVERED", "Admin cập nhật trạng thái đơn hàng sang DELIVERED thành công");
    assert(updatedOrder.statusHistory.length === 2, "Lịch sử trạng thái đơn hàng được ghi nhận đầy đủ");

    // Dọn dẹp đơn test
    await prisma.orderStatusHistory.deleteMany({ where: { orderId: testOrder.id } });
    await prisma.orderItem.deleteMany({ where: { orderId: testOrder.id } });
    await prisma.order.delete({ where: { id: testOrder.id } });
    // Hoàn lại kho
    await prisma.product.update({
      where: { id: testProduct.id },
      data: { stock: { increment: testOrderQty } },
    });

    console.log("\n==================================================");
    console.log(`  KẾT QUẢ KIỂM THỬ: ${passed} PASS / ${failed} FAIL`);
    console.log("==================================================\n");

    if (failed > 0) {
      process.exit(1);
    }
  } catch (e) {
    console.error("Test execution error:", e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
