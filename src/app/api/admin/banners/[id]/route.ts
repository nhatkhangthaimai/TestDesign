import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { bannerSchema } from "../route";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(req);
    if (!user || user.role !== "ROLE_ADMIN") {
      return NextResponse.json({ error: "Không có quyền quản trị" }, { status: 403 });
    }

    const { id } = await params;
    const banner = await prisma.banner.findUnique({
      where: { id },
    });

    if (!banner) {
      return NextResponse.json({ error: "Không tìm thấy banner" }, { status: 404 });
    }

    return NextResponse.json({ banner });
  } catch (error: any) {
    console.error("Admin get banner detail error:", error);
    return NextResponse.json(
      { error: "Lỗi tải thông tin banner", details: error.message },
      { status: 500 }
    );
  }
}

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
    const existing = await prisma.banner.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Không tìm thấy banner để cập nhật" }, { status: 404 });
    }

    const body = await req.json();
    const parsed = bannerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues?.[0]?.message || "Dữ liệu không hợp lệ" },
        { status: 400 }
      );
    }

    const updatedBanner = await prisma.banner.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({
      message: "Cập nhật banner thành công",
      banner: updatedBanner,
    });
  } catch (error: any) {
    console.error("Admin update banner error:", error);
    return NextResponse.json(
      { error: "Lỗi cập nhật banner", details: error.message },
      { status: 500 }
    );
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
    const existing = await prisma.banner.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Không tìm thấy banner để xóa" }, { status: 404 });
    }

    await prisma.banner.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Đã xóa banner thành công",
      deletedId: id,
    });
  } catch (error: any) {
    console.error("Admin delete banner error:", error);
    return NextResponse.json(
      { error: "Lỗi xóa banner", details: error.message },
      { status: 500 }
    );
  }
}
