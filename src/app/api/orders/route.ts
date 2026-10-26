import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const orderCreateSchema = z.object({
  customerName: z.string().min(2, "Vui lòng nhập họ và tên"),
  customerEmail: z.string().email("Địa chỉ email không hợp lệ"),
  customerPhone: z.string().min(9, "Số điện thoại không hợp lệ"),
  shippingAddress: z.string().min(5, "Vui lòng nhập địa chỉ cụ thể (số nhà, tên đường)"),
  shippingCity: z.string().min(2, "Vui lòng chọn Tỉnh/Thành phố"),
  shippingDistrict: z.string().min(2, "Vui lòng chọn Quận/Huyện"),
  shippingWard: z.string().min(2, "Vui lòng chọn Phường/Xã"),
  note: z.string().optional(),
  paymentMethod: z.enum(["COD", "VNPAY", "MOMO", "BANK_TRANSFER"]).default("COD"),
  couponCode: z.string().optional().nullable(),
  items: z
    .array(
      z.object({
        productId: z.string(),
        variantId: z.string().optional().nullable(),
        quantity: z.number().int().positive("Số lượng phải lớn hơn 0"),
      })
    )
    .min(1, "Giỏ hàng không có sản phẩm nào"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = orderCreateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues?.[0]?.message || "Dữ liệu đơn hàng không hợp lệ" },
        { status: 400 }
      );
    }

    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      shippingCity,
      shippingDistrict,
      shippingWard,
      note,
      paymentMethod,
      couponCode,
      items,
    } = result.data;

    const currentUser = await getCurrentUser();

    // 1. Fetch products & variants from DB to verify stock and price (NEVER TRUST CLIENT)
    const productIds = items.map((i) => i.productId);
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { variants: true },
    });

    if (dbProducts.length !== productIds.length) {
      return NextResponse.json(
        { error: "Một số sản phẩm trong giỏ hàng không còn tồn tại trên hệ thống" },
        { status: 400 }
      );
    }

    // 2. Validate stock & calculate true subtotal
    let verifiedSubtotal = 0;
    const verifiedOrderItems: Array<{
      productId: string;
      variantId?: string | null;
      productTitle: string;
      sku: string;
      price: number;
      quantity: number;
      total: number;
    }> = [];

    for (const item of items) {
      const dbProduct = dbProducts.find((p) => p.id === item.productId);
      if (!dbProduct || dbProduct.status !== "ACTIVE") {
        return NextResponse.json(
          { error: `Sản phẩm "${dbProduct?.title || "Không xác định"}" hiện không khả dụng` },
          { status: 400 }
        );
      }

      let price = dbProduct.salePrice ?? dbProduct.regularPrice;
      let sku = dbProduct.sku;
      let currentStock = dbProduct.stock;

      if (item.variantId) {
        const variant = dbProduct.variants.find((v) => v.id === item.variantId);
        if (!variant) {
          return NextResponse.json(
            { error: `Phân loại sản phẩm không hợp lệ cho "${dbProduct.title}"` },
            { status: 400 }
          );
        }
        price = variant.price;
        sku = variant.sku;
        currentStock = variant.stock;
      }

      if (currentStock < item.quantity) {
        return NextResponse.json(
          {
            error: `Sản phẩm "${dbProduct.title}" chỉ còn ${currentStock} cái trong kho, không đủ đáp ứng ${item.quantity} cái`,
          },
          { status: 400 }
        );
      }

      const itemTotal = price * item.quantity;
      verifiedSubtotal += itemTotal;

      verifiedOrderItems.push({
        productId: item.productId,
        variantId: item.variantId || null,
        productTitle: dbProduct.title,
        sku,
        price,
        quantity: item.quantity,
        total: itemTotal,
      });
    }

    // 3. Verify Coupon if present
    let verifiedDiscount = 0;
    let validCouponId: string | null = null;

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.trim().toUpperCase() },
      });

      if (
        coupon &&
        coupon.isActive &&
        (!coupon.expiresAt || new Date() <= coupon.expiresAt) &&
        (!coupon.usageLimit || coupon.usageCount < coupon.usageLimit) &&
        verifiedSubtotal >= coupon.minOrderValue
      ) {
        validCouponId = coupon.id;
        if (coupon.discountType === "PERCENTAGE") {
          verifiedDiscount = (verifiedSubtotal * coupon.discountValue) / 100;
          if (coupon.maxDiscount && verifiedDiscount > coupon.maxDiscount) {
            verifiedDiscount = coupon.maxDiscount;
          }
        } else {
          verifiedDiscount = coupon.discountValue;
        }
        verifiedDiscount = Math.min(verifiedDiscount, verifiedSubtotal);
      }
    }

    // 4. Shipping fee rules: Free shipping for orders >= 500,000 VND
    const shippingFee = verifiedSubtotal >= 500000 ? 0 : 30000;
    const finalTotal = Math.max(0, verifiedSubtotal - verifiedDiscount + shippingFee);

    // 5. Generate Order Number
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ORD-${dateStr}-${randomSuffix}`;

    // 6. Execute atomic transaction
    const newOrder = await prisma.$transaction(async (tx) => {
      // Decrement stock
      for (const item of items) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          });
        }
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Increment coupon usage
      if (validCouponId) {
        await tx.coupon.update({
          where: { id: validCouponId },
          data: { usageCount: { increment: 1 } },
        });
      }

      // Create Order
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: currentUser?.id || null,
          customerName,
          customerEmail,
          customerPhone,
          shippingAddress,
          shippingCity,
          shippingDistrict,
          shippingWard,
          note: note || null,
          subtotal: verifiedSubtotal,
          discount: verifiedDiscount,
          shippingFee,
          total: finalTotal,
          status: "PENDING",
          paymentMethod,
          paymentStatus: paymentMethod === "COD" ? "PENDING" : "PAID",
          couponCode: validCouponId ? couponCode?.trim().toUpperCase() : null,
          items: {
            create: verifiedOrderItems.map((oi) => ({
              productId: oi.productId,
              variantId: oi.variantId,
              productTitle: oi.productTitle,
              sku: oi.sku,
              price: oi.price,
              quantity: oi.quantity,
              total: oi.total,
            })),
          },
          statusHistory: {
            create: [
              {
                status: "PENDING",
                note: `Đơn hàng được khởi tạo thành công với hình thức thanh toán ${paymentMethod}`,
                changedBy: "Khách hàng",
              },
            ],
          },
          payment: {
            create: {
              amount: finalTotal,
              provider: paymentMethod,
              status: paymentMethod === "COD" ? "PENDING" : "PAID",
              transactionRef: `TXN-${orderNumber}`,
              paidAt: paymentMethod !== "COD" ? new Date() : null,
            },
          },
        },
        include: {
          items: true,
          payment: true,
        },
      });

      // Record coupon usage link
      if (validCouponId) {
        await tx.couponUsage.create({
          data: {
            couponId: validCouponId,
            userId: currentUser?.id || null,
            orderId: order.id,
            discountApplied: verifiedDiscount,
          },
        });
      }

      return order;
    });

    return NextResponse.json({
      success: true,
      message: "Đặt hàng thành công",
      order: newOrder,
    });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json({ error: "Lỗi tạo đơn hàng máy chủ" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
        statusHistory: {
          orderBy: { createdAt: "desc" },
        },
        payment: true,
      },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Fetch orders error:", error);
    return NextResponse.json({ error: "Lỗi tải lịch sử đơn hàng" }, { status: 500 });
  }
}
