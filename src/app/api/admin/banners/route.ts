import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const bannerSchema = z.object({
  title: z.string().min(2, "Tiêu đề banner ít nhất 2 ký tự"),
  subtitle: z.string().optional().nullable(),
  imageUrl: z.string().min(1, "Hình ảnh là bắt buộc"),
  linkUrl: z.string().optional().nullable().default("/products"),
  badgeText: z.string().optional().nullable(),
  position: z.enum(["HERO", "SIDEBAR", "FLASH_SALE"]).default("HERO"),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user || user.role !== "ROLE_ADMIN") {
      return NextResponse.json({ error: "Không có quyền quản trị" }, { status: 403 });
    }

    const banners = await prisma.banner.findMany({
      orderBy: [{ position: "asc" }, { sortOrder: "asc" }],
    });

    return NextResponse.json({ banners });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch banners", details: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user || user.role !== "ROLE_ADMIN") {
      return NextResponse.json({ error: "Không có quyền quản trị" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = bannerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues?.[0]?.message || "Dữ liệu không hợp lệ" },
        { status: 400 }
      );
    }

    const banner = await prisma.banner.create({
      data: parsed.data,
    });

    return NextResponse.json({ message: "Tạo banner thành công", banner }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to create banner", details: error.message }, { status: 500 });
  }
}
