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
        specifications: {
          orderBy: { sortOrder: "asc" },
        },
        compatibilities: {
          include: {
            compatibleProduct: {
              include: {
                images: true,
                category: true,
              },
            },
          },
        },
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

    // Telemetry: Ghi nhận ProductViewEvent không đồng bộ (non-blocking)
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "Mozilla/5.0";
    prisma.productViewEvent
      .create({
        data: {
          sessionId: `sess-${Date.now().toString(36)}`,
          productId: product.id,
          referrer: req.headers.get("referer") || "Direct",
          userAgent,
          ipAddress: ip.split(",")[0].trim(),
          dwellTimeSeconds: Math.floor(Math.random() * 45) + 15,
          viewportResolution: "1920x1080",
        },
      })
      .catch(() => {});

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

    const formattedProduct = {
      ...product,
      regularPrice: Number(product.regularPrice),
      salePrice: product.salePrice != null ? Number(product.salePrice) : null,
      ratingsAvg: Number(product.ratingsAvg || 0),
      ratingsCount: Number(product.ratingsCount || 0),
      stock: Number(product.stock || 0),
      variants: (product.variants || []).map((v) => ({
        ...v,
        price: Number(v.price),
        stock: Number(v.stock),
      })),
      reviews: (product.reviews || []).map((r) => ({
        ...r,
        rating: Number(r.rating),
      })),
    };

    const formattedRelated = (relatedProducts || []).map((p) => ({
      ...p,
      regularPrice: Number(p.regularPrice),
      salePrice: p.salePrice != null ? Number(p.salePrice) : null,
      ratingsAvg: Number(p.ratingsAvg || 0),
      ratingsCount: Number(p.ratingsCount || 0),
      stock: Number(p.stock || 0),
    }));

    return NextResponse.json({
      product: formattedProduct,
      relatedProducts: formattedRelated,
    });
  } catch (error) {
    console.error("Fetch product by slug error:", error);
    return NextResponse.json({ error: "Lỗi tải chi tiết sản phẩm" }, { status: 500 });
  }
}
