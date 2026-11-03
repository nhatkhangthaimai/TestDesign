import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser(req);

    const payment = await prisma.payment.findFirst({
      where: {
        OR: [{ id }, { orderId: id }, { transactionRef: id }],
      },
      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            userId: true,
            status: true,
            paymentStatus: true,
            total: true,
            customerName: true,
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment record not found" }, { status: 404 });
    }

    if (payment.order.userId && (!user || (user.id !== payment.order.userId && user.role !== "ROLE_ADMIN"))) {
      return NextResponse.json({ error: "Forbidden: You do not own this order" }, { status: 403 });
    }

    return NextResponse.json({
      payment: {
        id: payment.id,
        orderId: payment.orderId,
        orderNumber: payment.order.orderNumber,
        amount: Number(payment.amount),
        provider: payment.provider,
        status: payment.status,
        transactionRef: payment.transactionRef,
        paidAt: payment.paidAt,
        createdAt: payment.createdAt,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch payment status", details: error.message }, { status: 500 });
  }
}

