import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const couponCreateSchema = z.object({
  code: z.string().min(3, "Mã giảm giá phải có ít nhất 3 ký tự"),
  description: z.string().min(3, "Mô tả giảm giá quá ngắn"),
  discountType: z.enum(["PERCENTAGE", "FIXED"]),
  discountValue: z.number().positive("Giá trị giảm giá phải lớn hơn 0"),
  minOrderValue: z.number().min(0).default(0),
  maxDiscount: z.number().positive().optional().nullable(),
  usageLimit: z.number().int().positive().default(100),
  expiresAt: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ROLE_ADMIN") {
      return NextResponse.json({ error: "Không có quyền quản trị" }, { status: 403 });
    }

    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { usages: true },
        },
      },
    });

    return NextResponse.json({ coupons });
  } catch (error) {
    console.error("Admin fetch coupons error:", error);
    return NextResponse.json({ error: "Lỗi tải mã giảm giá" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ROLE_ADMIN") {
      return NextResponse.json({ error: "Không có quyền quản trị" }, { status: 403 });
    }

    const body = await req.json();
    const result = couponCreateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues?.[0]?.message || "Dữ liệu không hợp lệ" },
        { status: 400 }
      );
    }

    const data = result.data;
    const existing = await prisma.coupon.findUnique({
      where: { code: data.code.toUpperCase() },
    });

    if (existing) {
      return NextResponse.json({ error: "Mã giảm giá này đã tồn tại" }, { status: 409 });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: data.code.toUpperCase(),
        description: data.description,
        discountType: data.discountType,
        discountValue: data.discountValue,
        minOrderValue: data.minOrderValue,
        maxDiscount: data.maxDiscount || null,
        usageLimit: data.usageLimit,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        isActive: data.isActive,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Tạo mã giảm giá thành công",
      coupon,
    });
  } catch (error) {
    console.error("Admin create coupon error:", error);
    return NextResponse.json({ error: "Lỗi tạo mã giảm giá" }, { status: 500 });
  }
}
