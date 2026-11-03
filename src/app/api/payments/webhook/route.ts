import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { transactionRef, orderId, status, provider, signature } = body;

    if (!transactionRef && !orderId) {
      return NextResponse.json({ error: "Missing transactionRef or orderId" }, { status: 400 });
    }

    // Find the payment record
    const payment = await prisma.payment.findFirst({
      where: {
        OR: [
          ...(transactionRef ? [{ transactionRef }] : []),
          ...(orderId ? [{ orderId }] : []),
        ],
      },
      include: { order: true },
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found for given reference" }, { status: 404 });
    }

    // Idempotency: If already paid, return success immediately
    if (payment.status === "PAID") {
      return NextResponse.json({
        success: true,
        message: "Payment was already settled previously (idempotent response)",
      });
    }

    const isSuccess = status === "SUCCESS" || status === "PAID" || status === "00";
    const newStatus = isSuccess ? "PAID" : "FAILED";

    // Update payment
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: newStatus,
        paidAt: isSuccess ? new Date() : null,
        rawResponseJson: JSON.stringify(body),
      },
    });

    // Update order
    if (isSuccess) {
      await prisma.order.update({
        where: { id: payment.orderId },
        data: {
          paymentStatus: "PAID",
          status: payment.order.status === "PENDING" ? "CONFIRMED" : payment.order.status,
        },
      });

      await prisma.orderStatusHistory.create({
        data: {
          orderId: payment.orderId,
          status: "CONFIRMED",
          note: `Thanh toán trực tuyến thành công qua cổng ${provider || payment.provider} (Mã GD: ${transactionRef || payment.transactionRef})`,
          changedBy: `Gateway-${provider || payment.provider}`,
        },
      });
    } else {
      await prisma.order.update({
        where: { id: payment.orderId },
        data: {
          paymentStatus: "FAILED",
        },
      });

      await prisma.orderStatusHistory.create({
        data: {
          orderId: payment.orderId,
          status: payment.order.status,
          note: `Giao dịch thanh toán trực tuyến thất bại (Mã GD: ${transactionRef || payment.transactionRef})`,
          changedBy: `Gateway-${provider || payment.provider}`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Webhook processed. Payment marked as ${newStatus}`,
      orderId: payment.orderId,
    });
  } catch (error: any) {
    console.error("Payment webhook error:", error);
    return NextResponse.json({ error: "Failed to process webhook", details: error.message }, { status: 500 });
  }
}

