import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const startTime = performance.now();
  let dbStatus = "HEALTHY";
  let dbLatencyMs = 0;
  let errorDetail: string | null = null;

  try {
    const t0 = performance.now();
    await prisma.$queryRawUnsafe("SELECT 1;");
    dbLatencyMs = Math.round(performance.now() - t0);
  } catch (error: any) {
    dbStatus = "UNHEALTHY";
    errorDetail = error?.message || "Lỗi kết nối cơ sở dữ liệu";
  }

  const memoryUsage = process.memoryUsage();
  const memoryMB = {
    rss: Math.round(memoryUsage.rss / (1024 * 1024)),
    heapTotal: Math.round(memoryUsage.heapTotal / (1024 * 1024)),
    heapUsed: Math.round(memoryUsage.heapUsed / (1024 * 1024)),
  };

  const isHealthy = dbStatus === "HEALTHY";
  const statusCode = isHealthy ? 200 : 503;

  return NextResponse.json(
    {
      status: isHealthy ? "UP" : "DOWN",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
      responseTimeMs: Math.round(performance.now() - startTime),
      services: {
        database: {
          status: dbStatus,
          latencyMs: dbLatencyMs,
          ...(errorDetail ? { error: errorDetail } : {}),
        },
        memory: memoryMB,
        nodeVersion: process.version,
        environment: process.env.NODE_ENV || "development",
      },
    },
    { status: statusCode }
  );
}
