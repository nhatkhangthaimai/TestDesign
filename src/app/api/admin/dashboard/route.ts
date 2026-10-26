import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ROLE_ADMIN") {
      return NextResponse.json({ error: "Không có quyền quản trị" }, { status: 403 });
    }

    // 1. Total revenue (from delivered or paid orders)
    const paidOrders = await prisma.order.findMany({
      where: {
        OR: [{ paymentStatus: "PAID" }, { status: "DELIVERED" }],
      },
      select: { total: true },
    });
    const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);

    // 2. Order counts by status
    const totalOrders = await prisma.order.count();
    const pendingOrders = await prisma.order.count({ where: { status: "PENDING" } });
    const processingOrders = await prisma.order.count({ where: { status: "PROCESSING" } });
    const deliveredOrders = await prisma.order.count({ where: { status: "DELIVERED" } });

    // 3. Customer & Product counts
    const totalCustomers = await prisma.user.count({ where: { role: "ROLE_USER" } });
    const totalProducts = await prisma.product.count();
    const lowStockProducts = await prisma.product.findMany({
      where: { stock: { lte: 15 } },
      select: { id: true, title: true, sku: true, stock: true },
      take: 5,
    });

    // 4. Recent Orders
    const recentOrders = await prisma.order.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
      },
    });

    // 5. Daily sales trend (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000);
    const weeklyOrders = await prisma.order.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true, total: true },
    });

    return NextResponse.json({
      metrics: {
        totalRevenue,
        totalOrders,
        pendingOrders,
        processingOrders,
        deliveredOrders,
        totalCustomers,
        totalProducts,
        lowStockCount: lowStockProducts.length,
      },
      lowStockProducts,
      recentOrders,
      weeklyOrders,
    });
  } catch (error) {
    console.error("Admin dashboard stats error:", error);
    return NextResponse.json({ error: "Lỗi tải thống kê quản trị" }, { status: 500 });
  }
}
