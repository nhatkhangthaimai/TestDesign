import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.shippingAddress.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== user.id) {
      return NextResponse.json({ error: "Không tìm thấy địa chỉ hoặc không có quyền" }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.shippingAddress.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      }),
      prisma.shippingAddress.update({
        where: { id },
        data: { isDefault: true },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Đã đặt làm địa chỉ mặc định",
    });
  } catch (error: any) {
    console.error("Set default address error:", error);
    return NextResponse.json({ error: "Lỗi cài đặt địa chỉ mặc định" }, { status: 500 });
  }
}
