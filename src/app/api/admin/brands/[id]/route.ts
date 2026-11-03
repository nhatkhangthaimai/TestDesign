import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const brandUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  slug: z.string().min(2).optional(),
  logoUrl: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
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
    const parsed = brandUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues?.[0]?.message || "Dữ liệu không hợp lệ" },
        { status: 400 }
      );
    }

    const brand = await prisma.brand.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json({ message: "Cập nhật thương hiệu thành công", brand });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to update brand", details: error.message }, { status: 500 });
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
    const productCount = await prisma.product.count({ where: { brandId: id } });
    if (productCount > 0) {
      // Disconnect from products or reject
      return NextResponse.json(
        { error: `Không thể xóa thương hiệu vì đang có ${productCount} sản phẩm liên kết` },
        { status: 400 }
      );
    }

    await prisma.brand.delete({ where: { id } });
    return NextResponse.json({ message: "Xóa thương hiệu thành công" });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to delete brand", details: error.message }, { status: 500 });
  }
}

