import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const couponApplySchema = z.object({
  code: z.string().min(1, "Vui lòng nhập mã giảm giá"),
  subtotal: z.number().min(0, "Giá trị đơn hàng không hợp lệ"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = couponApplySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues?.[0]?.message || "Dữ liệu không hợp lệ" },
        { status: 400 }
      );
    }

    const { code, subtotal } = result.data;
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    if (!coupon || !coupon.isActive) {
      return NextResponse.json(
        { error: "Mã giảm giá không tồn tại hoặc đã hết hạn" },
        { status: 400 }
      );
    }

    if (coupon.expiresAt && new Date() > coupon.expiresAt) {
      return NextResponse.json(
        { error: "Mã giảm giá này đã hết hạn sử dụng" },
        { status: 400 }
      );
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json(
        { error: "Mã giảm giá này đã hết lượt sử dụng" },
        { status: 400 }
      );
    }

    if (subtotal < coupon.minOrderValue) {
      return NextResponse.json(
        {
          error: `Đơn hàng tối thiểu phải từ ${new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(coupon.minOrderValue)} để áp dụng mã này`,
        },
        { status: 400 }
      );
    }

    let discountAmount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      discountAmount = (subtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    // Ensure discount does not exceed subtotal
    discountAmount = Math.min(discountAmount, subtotal);

    return NextResponse.json({
      success: true,
      coupon: {
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountAmount,
      },
    });
  } catch (error) {
    console.error("Apply coupon error:", error);
    return NextResponse.json({ error: "Lỗi xử lý mã giảm giá" }, { status: 500 });
  }
}
