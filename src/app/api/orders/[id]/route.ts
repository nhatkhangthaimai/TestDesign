import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Fetch single order error:", error);
    return NextResponse.json({ error: "Lỗi tải thông tin đơn hàng" }, { status: 500 });
  }
}
