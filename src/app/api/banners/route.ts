import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const position = searchParams.get("position") || undefined;
    const device = searchParams.get("device") || undefined; // "DESKTOP" | "MOBILE"
    const now = new Date();

    const banners = await prisma.banner.findMany({
      where: {
        isActive: true,
        ...(position ? { position } : {}),
        ...(device
          ? {
              OR: [{ targetDevice: "ALL" }, { targetDevice: device }, { targetDevice: null }],
            }
          : {}),
        AND: [
          {
            OR: [{ startDate: null }, { startDate: { lte: now } }],
          },
          {
            OR: [{ endDate: null }, { endDate: { gte: now } }],
          },
        ],
      },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ banners });
  } catch (error: any) {
    console.error("Failed to fetch banners:", error);
    return NextResponse.json(
      { error: "Failed to fetch banners", details: error.message },
      { status: 500 }
    );
  }
}
