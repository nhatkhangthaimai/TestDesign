import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ROLE_ADMIN") {
      return NextResponse.json({ error: "Không có quyền quản trị" }, { status: 403 });
    }

    const customers = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        orders: {
          select: {
            id: true,
            total: true,
            status: true,
            paymentStatus: true,
          },
        },
      },
    });

    const formatted = customers.map((c) => {
      const totalSpent = c.orders
        .filter((o) => o.paymentStatus === "PAID" || o.status === "DELIVERED")
        .reduce((sum, o) => sum + o.total, 0);

      return {
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        role: c.role,
        createdAt: c.createdAt,
        orderCount: c.orders.length,
        totalSpent,
      };
    });

    return NextResponse.json({ customers: formatted });
  } catch (error) {
    console.error("Admin fetch customers error:", error);
    return NextResponse.json({ error: "Lỗi tải danh sách khách hàng" }, { status: 500 });
  }
}
