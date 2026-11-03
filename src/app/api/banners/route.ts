import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const position = searchParams.get("position");

    const banners = await prisma.banner.findMany({
      where: {
        isActive: true,
        ...(position ? { position } : {}),
      },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ banners });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch banners", details: error.message }, { status: 500 });
  }
}
