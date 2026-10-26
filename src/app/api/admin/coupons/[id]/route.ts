import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ROLE_ADMIN") {
      return NextResponse.json({ error: "Không có quyền quản trị" }, { status: 403 });
    }

    const { id } = await params;
    await prisma.coupon.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Đã xóa mã giảm giá thành công",
    });
  } catch (error) {
    console.error("Admin delete coupon error:", error);
    return NextResponse.json({ error: "Lỗi xóa mã giảm giá" }, { status: 500 });
  }
}
