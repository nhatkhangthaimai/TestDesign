import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Không tìm thấy đơn hàng" }, { status: 404 });
    }

    // Verify ownership or admin
    if (order.userId !== user.id && user.role !== "ROLE_ADMIN") {
      return NextResponse.json({ error: "Không có quyền thực hiện thao tác này" }, { status: 403 });
    }

    if (order.status !== "PENDING") {
      return NextResponse.json(
        { error: "Chỉ có thể hủy đơn hàng khi đang ở trạng thái Chờ xử lý (PENDING)" },
        { status: 400 }
      );
    }

    // Transaction to update order status and restore inventory
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Restore inventory
      for (const item of order.items) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          });
        }
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }

      // Update status
      return await tx.order.update({
        where: { id },
        data: {
          status: "CANCELLED",
          statusHistory: {
            create: {
              status: "CANCELLED",
              note: `Đơn hàng đã được hủy bởi ${user.name}`,
              changedBy: user.name,
            },
          },
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Hủy đơn hàng thành công",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Cancel order error:", error);
    return NextResponse.json({ error: "Lỗi hủy đơn hàng" }, { status: 500 });
  }
}
