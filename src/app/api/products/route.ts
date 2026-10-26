import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const brand = searchParams.get("brand");
    const filter = searchParams.get("filter");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const sort = searchParams.get("sort") || "newest";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "12", 10));

    // Construct Prisma where query
    const where: Prisma.ProductWhereInput = {
      status: "ACTIVE",
    };

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { sku: { contains: search } },
      ];
    }

    if (category) {
      where.category = {
        slug: category,
      };
    }

    if (brand) {
      where.brand = {
        slug: brand,
      };
    }

    if (filter === "flash_sale") {
      where.isFlashSale = true;
    } else if (filter === "featured") {
      where.isFeatured = true;
    } else if (filter === "new") {
      where.isNewArrival = true;
    } else if (filter === "best_seller") {
      where.isBestSeller = true;
    }

    if (minPrice || maxPrice) {
      where.salePrice = {
        gte: minPrice ? parseFloat(minPrice) : undefined,
        lte: maxPrice ? parseFloat(maxPrice) : undefined,
      };
    }

    // Determine sorting
    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
    if (sort === "price_asc") {
      orderBy = { salePrice: "asc" };
    } else if (sort === "price_desc") {
      orderBy = { salePrice: "desc" };
    } else if (sort === "rating") {
      orderBy = { ratingsAvg: "desc" };
    } else if (sort === "best_selling") {
      orderBy = { isBestSeller: "desc" };
    }

    const total = await prisma.product.count({ where });
    const products = await prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        images: {
          orderBy: { sortOrder: "asc" },
        },
        category: {
          select: { id: true, name: true, slug: true },
        },
        brand: {
          select: { id: true, name: true, slug: true, logoUrl: true },
        },
        variants: true,
      },
    });

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Fetch products error:", error);
    return NextResponse.json({ error: "Lỗi tải danh sách sản phẩm" }, { status: 500 });
  }
}
