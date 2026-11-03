import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const couponUpdateSchema = z.object({
  description: z.string().optional(),
  discountType: z.enum(["PERCENTAGE", "FIXED"]).optional(),
  discountValue: z.number().positive().optional(),
  minOrderValue: z.number().min(0).optional(),
  maxDiscount: z.number().positive().optional().nullable(),
  usageLimit: z.number().int().positive().optional(),
  expiresAt: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(req);
    if (!user || user.role !== "ROLE_ADMIN") {
      return NextResponse.json({ error: "Không có quyền quản trị" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = couponUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues?.[0]?.message || "Dữ liệu không hợp lệ" },
        { status: 400 }
      );
    }

    const updated = await prisma.coupon.update({
      where: { id },
      data: {
        ...parsed.data,
        expiresAt: parsed.data.expiresAt !== undefined ? (parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null) : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Cập nhật mã giảm giá thành công",
      coupon: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Lỗi cập nhật mã giảm giá", details: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(req);
    if (!user || user.role !== "ROLE_ADMIN") {
      return NextResponse.json({ error: "Không có quyền quản trị" }, { status: 403 });
    }

    const { id } = await params;
    await prisma.coupon.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Đã xóa mã giảm giá thành công",
    });
  } catch (error: any) {
    console.error("Admin delete coupon error:", error);
    return NextResponse.json({ error: "Lỗi xóa mã giảm giá", details: error.message }, { status: 500 });
  }
}
