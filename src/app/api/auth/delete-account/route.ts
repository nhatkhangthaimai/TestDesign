import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const userPayload = await getCurrentUser(req);
    if (!userPayload) {
      return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
    }

    const body = await req.json();
    const { password, reason } = body;

    if (!password) {
      return NextResponse.json({ error: "Vui lòng nhập mật khẩu xác nhận" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userPayload.id },
      include: {
        orders: {
          where: {
            status: { in: ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED"] },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Tài khoản không tồn tại" }, { status: 404 });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: "Mật khẩu xác nhận không chính xác" }, { status: 400 });
    }

    // Check active orders
    if (user.orders.length > 0) {
      return NextResponse.json(
        {
          error: `Bạn đang có ${user.orders.length} đơn hàng đang được xử lý hoặc đang giao. Không thể xóa tài khoản cho đến khi đơn hàng hoàn thành hoặc bị hủy.`,
        },
        { status: 400 }
      );
    }

    // Execute deletion / anonymization in transaction
    await prisma.$transaction(async (tx) => {
      // 1. Delete user addresses, cart, wishlists
      await tx.shippingAddress.deleteMany({ where: { userId: user.id } });
      await tx.wishlist.deleteMany({ where: { userId: user.id } });
      await tx.cart.deleteMany({ where: { userId: user.id } });

      // 2. Anonymize user record to maintain order history integrity
      await tx.user.update({
        where: { id: user.id },
        data: {
          name: "Người dùng đã xóa tài khoản",
          email: `deleted_${user.id.substring(0, 8)}_${Date.now()}@aj-commerce.local`,
          phone: null,
          passwordHash: "DELETED",
          avatar: null,
        },
      });
    });

    // Clear auth cookie
    const response = NextResponse.json({
      success: true,
      message: "Tài khoản của bạn đã được xóa thành công. Cảm ơn bạn đã sử dụng BBKCommerce.",
    });

    response.cookies.set("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      expires: new Date(0),
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Delete account error:", error);
    return NextResponse.json({ error: "Lỗi xóa tài khoản", details: error.message }, { status: 500 });
  }
}
