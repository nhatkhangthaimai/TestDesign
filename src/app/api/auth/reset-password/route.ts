import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const resetSchema = z.object({
  token: z.string().min(1, "Token đặt lại mật khẩu là bắt buộc"),
  newPassword: z.string().min(6, "Mật khẩu mới phải có ít nhất 6 ký tự"),
});

const JWT_SECRET = process.env.JWT_SECRET || "aj_ecommerce_production_secure_jwt_secret_2026_aws_cloud_xyz";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = resetSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues?.[0]?.message || "Dữ liệu không hợp lệ" },
        { status: 400 }
      );
    }

    const { token, newPassword } = parsed.data;

    let payload: any;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ error: "Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn" }, { status: 400 });
    }

    if (payload.type !== "password_reset" || !payload.id) {
      return NextResponse.json({ error: "Token không đúng loại yêu cầu" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
    });

    if (!user) {
      return NextResponse.json({ error: "Người dùng không tồn tại" }, { status: 404 });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return NextResponse.json({ message: "Đặt lại mật khẩu thành công. Vui lòng đăng nhập bằng mật khẩu mới." });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to reset password", details: error.message }, { status: 500 });
  }
}

