import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(req);
    if (!user || user.role !== "ROLE_ADMIN") {
      return NextResponse.json({ error: "Không có quyền quản trị" }, { status: 403 });
    }

    const { id } = await params;
    const existing = await prisma.banner.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Không tìm thấy banner" }, { status: 404 });
    }

    const updated = await prisma.banner.update({
      where: { id },
      data: { isActive: !existing.isActive },
    });

    return NextResponse.json({
      message: `Đã ${updated.isActive ? "bật" : "tắt"} hiển thị banner`,
      banner: updated,
    });
  } catch (error: any) {
    console.error("Toggle banner error:", error);
    return NextResponse.json(
      { error: "Lỗi chuyển đổi trạng thái banner", details: error.message },
      { status: 500 }
    );
  }
}

