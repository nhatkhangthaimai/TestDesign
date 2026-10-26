import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ROLE_ADMIN") {
      return NextResponse.json({ error: "Không có quyền quản trị" }, { status: 403 });
    }

    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
    });

    const headers = [
      "Mã đơn hàng",
      "Khách hàng",
      "Số điện thoại",
      "Email",
      "Địa chỉ",
      "Thành phố",
      "Tạm tính",
      "Giảm giá",
      "Phí ship",
      "Tổng thanh toán (VND)",
      "Trạng thái đơn hàng",
      "Trạng thái thanh toán",
      "Hình thức thanh toán",
      "Mã giảm giá",
      "Ngày đặt hàng",
    ];

    const rows = orders.map((o) => [
      `"${o.orderNumber}"`,
      `"${o.customerName.replace(/"/g, '""')}"`,
      `"${o.customerPhone}"`,
      `"${o.customerEmail}"`,
      `"${o.shippingAddress.replace(/"/g, '""')}"`,
      `"${o.shippingCity}"`,
      o.subtotal,
      o.discount,
      o.shippingFee,
      o.total,
      `"${o.status}"`,
      `"${o.paymentStatus}"`,
      `"${o.paymentMethod}"`,
      `"${o.couponCode || ""}"`,
      `"${o.createdAt.toISOString()}"`,
    ]);

    const csvContent =
      "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

    return new Response(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="orders_export_${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (error) {
    console.error("Export CSV error:", error);
    return NextResponse.json({ error: "Lỗi xuất file CSV" }, { status: 500 });
  }
}
