import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });
    return NextResponse.json({ brands });
  } catch (error) {
    console.error("Fetch brands error:", error);
    return NextResponse.json({ error: "Lỗi tải thương hiệu" }, { status: 500 });
  }
}
