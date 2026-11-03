import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const forgotSchema = z.object({
  email: z.string().email("Địa chỉ email không hợp lệ"),
});

const JWT_SECRET = process.env.JWT_SECRET || "aj_ecommerce_production_secure_jwt_secret_2026_aws_cloud_xyz";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = forgotSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues?.[0]?.message || "Email không hợp lệ" },
        { status: 400 }
      );
    }

    const { email } = parsed.data;
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, email: true },
    });

    if (!user) {
      // Return 200 for security so attackers cannot enumerate valid emails
      return NextResponse.json({
        message: "Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi.",
      });
    }

    // Generate reset token valid for 1 hour
    const resetToken = jwt.sign(
      { id: user.id, email: user.email, type: "password_reset" },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    return NextResponse.json({
      message: "Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi.",
      resetToken, // Provided for testing and API clients
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to process forgot password", details: error.message }, { status: 500 });
  }
}
