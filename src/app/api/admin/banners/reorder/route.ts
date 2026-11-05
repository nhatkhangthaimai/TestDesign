import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user || user.role !== "ROLE_ADMIN") {
      return NextResponse.json({ error: "Không có quyền quản trị" }, { status: 403 });
    }

    const body = await req.json();
    const { items } = body as { items: Array<{ id: string; sortOrder: number }> };

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Danh sách thứ tự không hợp lệ" }, { status: 400 });
    }

    // Batch update sortOrder
    await prisma.$transaction(
      items.map((item) =>
        prisma.banner.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        })
      )
    );

    return NextResponse.json({ message: "Cập nhật thứ tự hiển thị banner thành công" });
  } catch (error: any) {
    console.error("Reorder banners error:", error);
    return NextResponse.json(
      { error: "Lỗi cập nhật thứ tự banner", details: error.message },
      { status: 500 }
    );
  }
}

