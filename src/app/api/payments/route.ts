import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const paymentInitSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  provider: z.enum(["COD", "VNPAY", "MOMO", "BANK_TRANSFER"]).default("COD"),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    const body = await req.json();
    const parsed = paymentInitSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues?.[0]?.message || "Invalid payload" },
        { status: 400 }
      );
    }

    const { orderId, provider } = parsed.data;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payment: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Verify ownership if order has userId
    if (order.userId && (!user || (user.id !== order.userId && user.role !== "ROLE_ADMIN"))) {
      return NextResponse.json({ error: "Forbidden: You do not own this order" }, { status: 403 });
    }

    if (order.paymentStatus === "PAID") {
      return NextResponse.json({ error: "Order is already paid" }, { status: 400 });
    }

    const paymentAmount = Number(order.total);
    const transactionRef = `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    let paymentStatus = "PENDING";
    let paymentUrl = null;

    if (provider === "COD") {
      paymentStatus = "PENDING"; // Paid upon delivery
    } else if (provider === "VNPAY" || provider === "MOMO" || provider === "BANK_TRANSFER") {
      // Return simulated secure checkout gateway URL
      paymentUrl = `/checkout/payment-gateway?orderId=${order.id}&provider=${provider}&ref=${transactionRef}`;
    }

    // Upsert payment record
    const payment = await prisma.payment.upsert({
      where: { orderId: order.id },
      create: {
        orderId: order.id,
        amount: paymentAmount,
        provider,
        status: paymentStatus,
        transactionRef,
      },
      update: {
        amount: paymentAmount,
        provider,
        status: paymentStatus,
        transactionRef,
      },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentMethod: provider,
        transactionId: transactionRef,
      },
    });

    return NextResponse.json({
      message: "Payment initialized successfully",
      paymentId: payment.id,
      orderId: order.id,
      orderNumber: order.orderNumber,
      amount: paymentAmount,
      provider,
      status: paymentStatus,
      transactionRef,
      paymentUrl,
    });
  } catch (error: any) {
    console.error("Payment init error:", error);
    return NextResponse.json({ error: "Failed to initialize payment", details: error.message }, { status: 500 });
  }
}
