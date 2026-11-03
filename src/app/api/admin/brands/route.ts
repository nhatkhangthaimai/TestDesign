import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const brandSchema = z.object({
  name: z.string().min(2, "Tên thương hiệu ít nhất 2 ký tự"),
  slug: z.string().min(2, "Slug không hợp lệ"),
  logoUrl: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user || user.role !== "ROLE_ADMIN") {
      return NextResponse.json({ error: "Không có quyền quản trị" }, { status: 403 });
    }

    const brands = await prisma.brand.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { products: true } },
      },
    });

    return NextResponse.json({ brands });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch brands", details: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user || user.role !== "ROLE_ADMIN") {
      return NextResponse.json({ error: "Không có quyền quản trị" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = brandSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues?.[0]?.message || "Dữ liệu không hợp lệ" },
        { status: 400 }
      );
    }

    const existing = await prisma.brand.findUnique({
      where: { slug: parsed.data.slug },
    });
    if (existing) {
      return NextResponse.json({ error: "Slug thương hiệu đã tồn tại" }, { status: 409 });
    }

    const brand = await prisma.brand.create({
      data: parsed.data,
    });

    return NextResponse.json({ message: "Tạo thương hiệu thành công", brand }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to create brand", details: error.message }, { status: 500 });
  }
}

