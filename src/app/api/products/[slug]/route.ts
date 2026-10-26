import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
        },
        category: true,
        brand: true,
        variants: true,
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Sản phẩm không tồn tại" }, { status: 404 });
    }

    // Also fetch related products in the same category
    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        status: "ACTIVE",
      },
      take: 4,
      include: {
        images: true,
        category: true,
      },
    });

    return NextResponse.json({
      product,
      relatedProducts,
    });
  } catch (error) {
    console.error("Fetch product by slug error:", error);
    return NextResponse.json({ error: "Lỗi tải chi tiết sản phẩm" }, { status: 500 });
  }
}
