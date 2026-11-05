import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const bannerSchema = z.object({
  title: z.string().min(2, "Tiêu đề banner ít nhất 2 ký tự"),
  subtitle: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  imageUrl: z.string().min(1, "Hình ảnh hoặc ảnh poster là bắt buộc"),
  videoUrl: z.string().optional().nullable(),
  videoMobileUrl: z.string().optional().nullable(),
  posterUrl: z.string().optional().nullable(),
  mediaType: z.enum(["IMAGE", "VIDEO"]).default("IMAGE"),
  linkUrl: z.string().optional().nullable().default("/products"),
  badgeText: z.string().optional().nullable(),
  ctaText: z.string().optional().nullable().default("Khám Phá Ngay"),
  textColor: z.string().optional().nullable().default("#ffffff"),
  overlayColor: z.string().optional().nullable().default("#000000"),
  overlayOpacity: z.number().min(0).max(1).optional().nullable().default(0.4),
  contentPosition: z.enum(["LEFT", "CENTER", "RIGHT"]).default("LEFT"),
  targetDevice: z.enum(["ALL", "DESKTOP", "MOBILE"]).default("ALL"),
  position: z.enum(["HERO", "SIDEBAR", "FLASH_SALE"]).default("HERO"),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
  durationSeconds: z.number().int().min(3).max(60).optional().nullable().default(8),
  startDate: z.string().optional().nullable().transform((val) => (val ? new Date(val) : null)),
  endDate: z.string().optional().nullable().transform((val) => (val ? new Date(val) : null)),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user || user.role !== "ROLE_ADMIN") {
      return NextResponse.json({ error: "Không có quyền quản trị" }, { status: 403 });
    }

    const banners = await prisma.banner.findMany({
      orderBy: [{ position: "asc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ banners });
  } catch (error: any) {
    console.error("Admin fetch banners error:", error);
    return NextResponse.json(
      { error: "Lỗi tải danh sách banner", details: error.message },
      { status: 500 }
    );
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

    // Auto set sortOrder if not specified or 0
    let sortOrder = parsed.data.sortOrder;
    if (!sortOrder) {
      const highest = await prisma.banner.findFirst({
        where: { position: parsed.data.position },
        orderBy: { sortOrder: "desc" },
        select: { sortOrder: true },
      });
      sortOrder = (highest?.sortOrder ?? 0) + 1;
    }

    const banner = await prisma.banner.create({
      data: {
        ...parsed.data,
        sortOrder,
      },
    });

    return NextResponse.json(
      { message: "Tạo banner thành công", banner },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Admin create banner error:", error);
    return NextResponse.json(
      { error: "Lỗi tạo banner mới", details: error.message },
      { status: 500 }
    );
  }
}
