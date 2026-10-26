import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const productCreateSchema = z.object({
  title: z.string().min(2, "Tiêu đề sản phẩm quá ngắn"),
  slug: z.string().min(2, "Slug không hợp lệ"),
  description: z.string().min(5, "Mô tả sản phẩm quá ngắn"),
  content: z.string().optional(),
  regularPrice: z.number().positive("Giá niêm yết phải lớn hơn 0"),
  salePrice: z.number().positive().optional().nullable(),
  sku: z.string().min(2, "SKU không hợp lệ"),
  stock: z.number().int().min(0, "Tồn kho không được âm"),
  categoryId: z.string().min(1, "Vui lòng chọn danh mục"),
  brandId: z.string().optional().nullable(),
  isFeatured: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  isFlashSale: z.boolean().default(false),
  flashSaleEnd: z.string().optional().nullable(),
  status: z.enum(["ACTIVE", "DRAFT", "OUT_OF_STOCK"]).default("ACTIVE"),
  imageUrls: z.array(z.string()).default([]),
  variants: z
    .array(
      z.object({
        name: z.string(),
        sku: z.string(),
        price: z.number().positive(),
        stock: z.number().int().min(0),
        attributesJson: z.string().default("{}"),
      })
    )
    .default([]),
});

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ROLE_ADMIN") {
      return NextResponse.json({ error: "Không có quyền quản trị" }, { status: 403 });
    }

    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        brand: true,
        images: true,
        variants: true,
      },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Admin fetch products error:", error);
    return NextResponse.json({ error: "Lỗi tải sản phẩm quản trị" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ROLE_ADMIN") {
      return NextResponse.json({ error: "Không có quyền quản trị" }, { status: 403 });
    }

    const body = await req.json();
    const result = productCreateSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues?.[0]?.message || "Dữ liệu không hợp lệ" },
        { status: 400 }
      );
    }

    const data = result.data;

    // Check duplicate slug or sku
    const existingSku = await prisma.product.findUnique({ where: { sku: data.sku } });
    if (existingSku) {
      return NextResponse.json({ error: "Mã SKU này đã tồn tại" }, { status: 409 });
    }

    const existingSlug = await prisma.product.findUnique({ where: { slug: data.slug } });
    if (existingSlug) {
      return NextResponse.json({ error: "Đường dẫn (slug) này đã tồn tại" }, { status: 409 });
    }

    const newProduct = await prisma.product.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        content: data.content,
        regularPrice: data.regularPrice,
        salePrice: data.salePrice ?? data.regularPrice,
        sku: data.sku,
        stock: data.stock,
        categoryId: data.categoryId,
        brandId: data.brandId || null,
        isFeatured: data.isFeatured,
        isNewArrival: data.isNewArrival,
        isBestSeller: data.isBestSeller,
        isFlashSale: data.isFlashSale,
        flashSaleEnd: data.flashSaleEnd ? new Date(data.flashSaleEnd) : null,
        status: data.status,
        images: {
          create: data.imageUrls.map((url, idx) => ({
            url,
            isPrimary: idx === 0,
            sortOrder: idx,
          })),
        },
        variants: {
          create: data.variants.map((v) => ({
            name: v.name,
            sku: v.sku,
            price: v.price,
            stock: v.stock,
            attributesJson: v.attributesJson,
          })),
        },
      },
      include: {
        images: true,
        variants: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Tạo sản phẩm thành công",
      product: newProduct,
    });
  } catch (error) {
    console.error("Admin create product error:", error);
    return NextResponse.json({ error: "Lỗi tạo sản phẩm" }, { status: 500 });
  }
}
