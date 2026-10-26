import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ wishlist: [] });
    }

    const items = await prisma.wishlist.findMany({
      where: { userId: user.id },
      include: {
        product: {
          include: { images: true, category: true },
        },
      },
    });

    return NextResponse.json({ wishlist: items });
  } catch (error) {
    console.error("Fetch wishlist error:", error);
    return NextResponse.json({ error: "Lỗi tải danh sách yêu thích" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
    }

    const { productId } = await req.json();
    if (!productId) {
      return NextResponse.json({ error: "Thiếu productId" }, { status: 400 });
    }

    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId,
        },
      },
    });

    if (existing) {
      await prisma.wishlist.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({
        success: true,
        action: "removed",
        message: "Đã xóa khỏi danh sách yêu thích",
      });
    } else {
      await prisma.wishlist.create({
        data: {
          userId: user.id,
          productId,
        },
      });
      return NextResponse.json({
        success: true,
        action: "added",
        message: "Đã thêm vào danh sách yêu thích",
      });
    }
  } catch (error) {
    console.error("Toggle wishlist error:", error);
    return NextResponse.json({ error: "Lỗi thao tác danh sách yêu thích" }, { status: 500 });
  }
}
