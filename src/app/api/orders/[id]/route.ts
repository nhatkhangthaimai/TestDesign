import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser(req);

    const order = await prisma.order.findFirst({
      where: {
        OR: [{ id }, { orderNumber: id }],
      },
      include: {
        items: {
          include: {
            product: {
              include: { images: true },
            },
          },
        },
        statusHistory: {
          orderBy: { createdAt: "asc" },
        },
        payment: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Không tìm thấy đơn hàng" }, { status: 404 });
    }

    // Security check: Only the order owner or an ADMIN can view the order details
    if (user) {
      if (user.role !== "ROLE_ADMIN" && order.userId && order.userId !== user.id) {
        return NextResponse.json(
          { error: "Bạn không có quyền truy cập đơn hàng này" },
          { status: 403 }
        );
      }
    } else {
      // For guest lookup, we can check searchParams or require authorization
      const { searchParams } = new URL(req.url);
      const guestPhone = searchParams.get("phone");
      if (!guestPhone || guestPhone !== order.customerPhone) {
        return NextResponse.json(
          { error: "Vui lòng đăng nhập để xem thông tin đơn hàng này" },
          { status: 401 }
        );
      }
    }

    // Coerce numeric values for TiDB Cloud compatibility
    const safeOrder = {
      ...order,
      subtotal: Number(order.subtotal),
      discount: Number(order.discount),
      shippingFee: Number(order.shippingFee),
      total: Number(order.total),
      items: order.items.map((it) => ({
        ...it,
        price: Number(it.price),
        total: Number(it.total),
      })),
      payment: order.payment
        ? {
            ...order.payment,
            amount: Number(order.payment.amount),
          }
        : null,
    };

    return NextResponse.json({ order: safeOrder });
  } catch (error) {
    console.error("Fetch single order error:", error);
    return NextResponse.json({ error: "Lỗi tải thông tin đơn hàng" }, { status: 500 });
  }
}
