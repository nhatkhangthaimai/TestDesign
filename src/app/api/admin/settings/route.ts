import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const settings = await prisma.storeSetting.findMany();
    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Fetch settings error:", error);
    return NextResponse.json({ error: "Lỗi tải cấu hình" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "ROLE_ADMIN") {
      return NextResponse.json({ error: "Không có quyền quản trị" }, { status: 403 });
    }

    const { settings } = await req.json();
    if (Array.isArray(settings)) {
      for (const s of settings) {
        await prisma.storeSetting.upsert({
          where: { key: s.key },
          update: { value: s.value },
          create: { key: s.key, value: s.value, description: s.description },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Cập nhật cấu hình cửa hàng thành công",
    });
  } catch (error) {
    console.error("Update settings error:", error);
    return NextResponse.json({ error: "Lỗi cập nhật cấu hình" }, { status: 500 });
  }
}
