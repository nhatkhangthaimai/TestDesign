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
    const { status, paymentStatus, note } = body;

    const existingOrder = await prisma.order.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Không tìm thấy đơn hàng" }, { status: 404 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: { id },
        data: {
          status: status || existingOrder.status,
          paymentStatus: paymentStatus || existingOrder.paymentStatus,
          statusHistory: status
            ? {
                create: {
                  status,
                  note: note || `Cập nhật trạng thái sang ${status}`,
                  changedBy: user.name,
                },
              }
            : undefined,
        },
        include: {
          items: true,
          payment: true,
          statusHistory: { orderBy: { createdAt: "asc" } },
        },
      });

      // Also update payment record if paymentStatus changed to PAID
      if (paymentStatus === "PAID" && existingOrder.paymentStatus !== "PAID") {
        await tx.payment.updateMany({
          where: { orderId: id },
          data: { status: "PAID", paidAt: new Date() },
        });
      }

      return order;
    });

    return NextResponse.json({
      success: true,
      message: "Cập nhật đơn hàng thành công",
      order: updated,
    });
  } catch (error) {
    console.error("Admin update order error:", error);
    return NextResponse.json({ error: "Lỗi cập nhật đơn hàng" }, { status: 500 });
  }
}
