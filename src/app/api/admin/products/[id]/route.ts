import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ROLE_ADMIN") {
      return NextResponse.json({ error: "Không có quyền quản trị" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();

    const updated = await prisma.product.update({
      where: { id },
      data: {
        title: body.title,
        regularPrice: body.regularPrice ? parseFloat(body.regularPrice) : undefined,
        salePrice: body.salePrice ? parseFloat(body.salePrice) : undefined,
        stock: body.stock != null ? parseInt(body.stock, 10) : undefined,
        status: body.status,
        isFeatured: body.isFeatured,
        isBestSeller: body.isBestSeller,
        isNewArrival: body.isNewArrival,
        isFlashSale: body.isFlashSale,
        description: body.description,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Cập nhật sản phẩm thành công",
      product: updated,
    });
  } catch (error) {
    console.error("Admin update product error:", error);
    return NextResponse.json({ error: "Lỗi cập nhật sản phẩm" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
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
