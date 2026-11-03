import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const bannerUpdateSchema = z.object({
  title: z.string().min(2).optional(),
  subtitle: z.string().optional().nullable(),
  imageUrl: z.string().optional(),
  linkUrl: z.string().optional().nullable(),
  badgeText: z.string().optional().nullable(),
  position: z.enum(["HERO", "SIDEBAR", "FLASH_SALE"]).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
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
    const parsed = bannerUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues?.[0]?.message || "Dữ liệu không hợp lệ" },
        { status: 400 }
      );
    }

    const banner = await prisma.banner.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({ message: "Cập nhật banner thành công", banner });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to update banner", details: error.message }, { status: 500 });
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
    await prisma.banner.delete({ where: { id } });
    return NextResponse.json({ message: "Xóa banner thành công" });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to delete banner", details: error.message }, { status: 500 });
  }
}

