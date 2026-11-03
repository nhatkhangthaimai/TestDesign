import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(req);
    if (!user || user.role !== "ROLE_ADMIN") {
      return NextResponse.json({ error: "Không có quyền quản trị" }, { status: 403 });
    }

    const { id } = await params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
        images: { orderBy: { sortOrder: "asc" } },
        variants: { orderBy: { createdAt: "asc" } },
        specifications: { orderBy: { sortOrder: "asc" } },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Không tìm thấy sản phẩm" }, { status: 404 });
    }

    // Coerce Decimals to JavaScript Numbers for TiDB Cloud compatibility
    const safeProduct = {
      ...product,
      regularPrice: Number(product.regularPrice),
      salePrice: product.salePrice != null ? Number(product.salePrice) : null,
      ratingsAvg: Number(product.ratingsAvg || 0),
      ratingsCount: Number(product.ratingsCount || 0),
      stock: Number(product.stock),
      variants: product.variants.map((v) => ({
        ...v,
        price: Number(v.price),
        stock: Number(v.stock),
      })),
    };

    return NextResponse.json({ product: safeProduct });
  } catch (error) {
    console.error("Admin fetch single product error:", error);
    return NextResponse.json({ error: "Lỗi tải thông tin sản phẩm" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(req);
    if (!user || user.role !== "ROLE_ADMIN") {
      return NextResponse.json({ error: "Không có quyền quản trị" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    // 1. Verify existence
    const existing = await prisma.product.findUnique({
      where: { id },
      include: { images: true, variants: true, specifications: true },
    });

    if (!existing) {
      return NextResponse.json({ error: "Sản phẩm không tồn tại" }, { status: 404 });
    }

    // 2. Validate SKU uniqueness if changing
    const newSku = body.sku ? String(body.sku).trim().toUpperCase() : existing.sku;
    if (newSku !== existing.sku) {
      const duplicateSku = await prisma.product.findUnique({ where: { sku: newSku } });
      if (duplicateSku && duplicateSku.id !== id) {
        return NextResponse.json({ error: `Mã SKU "${newSku}" đã được sử dụng bởi sản phẩm khác` }, { status: 400 });
      }
    }

    // 3. Validate Slug uniqueness if changing
    const newSlug = body.slug ? String(body.slug).trim().toLowerCase() : existing.slug;
    if (newSlug !== existing.slug) {
      const duplicateSlug = await prisma.product.findUnique({ where: { slug: newSlug } });
      if (duplicateSlug && duplicateSlug.id !== id) {
        return NextResponse.json({ error: `Đường dẫn Slug "${newSlug}" đã tồn tại` }, { status: 400 });
      }
    }

    // 4. Validate prices and stock
    const regularPrice = body.regularPrice != null ? parseFloat(body.regularPrice) : Number(existing.regularPrice);
    if (isNaN(regularPrice) || regularPrice < 0) {
      return NextResponse.json({ error: "Giá gốc không hợp lệ" }, { status: 400 });
    }

    let salePrice: number | null = null;
    if (body.salePrice !== undefined && body.salePrice !== null && body.salePrice !== "") {
      salePrice = parseFloat(body.salePrice);
      if (isNaN(salePrice) || salePrice < 0) {
        return NextResponse.json({ error: "Giá khuyến mãi không hợp lệ" }, { status: 400 });
      }
      if (salePrice >= regularPrice) {
        return NextResponse.json({ error: "Giá khuyến mãi phải nhỏ hơn giá gốc" }, { status: 400 });
      }
    }

    const stock = body.stock != null ? parseInt(body.stock, 10) : Number(existing.stock);
    if (isNaN(stock) || stock < 0) {
      return NextResponse.json({ error: "Số lượng tồn kho không hợp lệ" }, { status: 400 });
    }

    // 5. Execute transaction to update product, images, variants, specifications
    const updated = await prisma.$transaction(async (tx) => {
      // A. Update Product base attributes
      const prod = await tx.product.update({
        where: { id },
        data: {
          title: body.title !== undefined ? String(body.title).trim() : undefined,
          slug: newSlug,
          sku: newSku,
          description: body.description !== undefined ? String(body.description).trim() : undefined,
          content: body.content !== undefined ? String(body.content).trim() : undefined,
          regularPrice,
          salePrice,
          stock,
          status: body.status || existing.status,
          isFeatured: body.isFeatured !== undefined ? Boolean(body.isFeatured) : undefined,
          isBestSeller: body.isBestSeller !== undefined ? Boolean(body.isBestSeller) : undefined,
          isNewArrival: body.isNewArrival !== undefined ? Boolean(body.isNewArrival) : undefined,
          isFlashSale: body.isFlashSale !== undefined ? Boolean(body.isFlashSale) : undefined,
          flashSaleStart: body.flashSaleStart ? new Date(body.flashSaleStart) : null,
          flashSaleEnd: body.flashSaleEnd ? new Date(body.flashSaleEnd) : null,
          warrantyMonths: body.warrantyMonths != null ? parseInt(body.warrantyMonths, 10) : undefined,
          originCountry: body.originCountry !== undefined ? body.originCountry : undefined,
          categoryId: body.categoryId || undefined,
          brandId: body.brandId || null,
        },
      });

      // B. Update Images if provided
      if (Array.isArray(body.images)) {
        // Delete current images and recreate with clean order
        await tx.productImage.deleteMany({ where: { productId: id } });
        if (body.images.length > 0) {
          await tx.productImage.createMany({
            data: body.images.map((img: any, idx: number) => ({
              productId: id,
              url: typeof img === "string" ? img : img.url,
              altText: typeof img === "object" && img.altText ? img.altText : prod.title,
              isPrimary: idx === 0 || (typeof img === "object" && Boolean(img.isPrimary)),
              sortOrder: idx + 1,
            })),
          });
        }
      }

      // C. Update Variants if provided
      if (Array.isArray(body.variants)) {
        // Keep track of variant IDs to retain
        const incomingVariantIds = body.variants.filter((v: any) => v.id).map((v: any) => v.id);
        
        // Remove variants not in the incoming list (unless they have orders)
        const variantsToDelete = existing.variants.filter((v) => !incomingVariantIds.includes(v.id));
        for (const v of variantsToDelete) {
          const orderItems = await tx.orderItem.count({ where: { variantId: v.id } });
          if (orderItems === 0) {
            await tx.productVariant.delete({ where: { id: v.id } });
          }
        }

        // Upsert variants
        for (const v of body.variants) {
          const vSku = v.sku ? String(v.sku).trim().toUpperCase() : `${newSku}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
          const vPrice = parseFloat(v.price || regularPrice);
          const vStock = parseInt(v.stock || 0, 10);
          const vAttr = typeof v.attributesJson === "string" ? v.attributesJson : JSON.stringify(v.attributes || {});

          if (v.id) {
            await tx.productVariant.update({
              where: { id: v.id },
              data: {
                name: v.name || "Mặc định",
                sku: vSku,
                price: vPrice,
                stock: vStock,
                attributesJson: vAttr,
              },
            });
          } else {
            await tx.productVariant.create({
              data: {
                productId: id,
                name: v.name || "Mặc định",
                sku: vSku,
                price: vPrice,
                stock: vStock,
                attributesJson: vAttr,
              },
            });
          }
        }
      }

      // D. Update Specifications if provided
      if (Array.isArray(body.specifications)) {
        await tx.productSpecification.deleteMany({ where: { productId: id } });
        if (body.specifications.length > 0) {
          await tx.productSpecification.createMany({
            data: body.specifications
              .filter((s: any) => s.specKey && s.specValue)
              .map((s: any, idx: number) => ({
                productId: id,
                groupName: s.groupName ? String(s.groupName).trim() : "Thông Số Chung",
                specKey: String(s.specKey).trim(),
                specValue: String(s.specValue).trim(),
                sortOrder: idx + 1,
              })),
          });
        }
      }

      return prod;
    });

    return NextResponse.json({
      success: true,
      message: "Cập nhật sản phẩm thành công",
      product: {
        ...updated,
        regularPrice: Number(updated.regularPrice),
        salePrice: updated.salePrice != null ? Number(updated.salePrice) : null,
      },
    });
  } catch (error: any) {
    console.error("Admin update product error:", error);
    return NextResponse.json({ error: error.message || "Lỗi cập nhật sản phẩm" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(req);
    if (!user || user.role !== "ROLE_ADMIN") {
      return NextResponse.json({ error: "Không có quyền quản trị" }, { status: 403 });
    }

    const { id } = await params;

    // Soft delete or hide by setting status to OUT_OF_STOCK / DRAFT if orders exist, or delete
    const orderItemsCount = await prisma.orderItem.count({ where: { productId: id } });

    if (orderItemsCount > 0) {
      // Do not hard delete ordered products to maintain data integrity
      await prisma.product.update({
        where: { id },
        data: { status: "DRAFT" },
      });
      return NextResponse.json({
        success: true,
        message: "Sản phẩm đã có trong đơn hàng, đã chuyển trạng thái thành BẢN NHÁP (DRAFT)",
      });
    }

    await prisma.product.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Đã xóa sản phẩm vĩnh viễn",
    });
  } catch (error) {
    console.error("Admin delete product error:", error);
    return NextResponse.json({ error: "Lỗi xóa sản phẩm" }, { status: 500 });
  }
}
