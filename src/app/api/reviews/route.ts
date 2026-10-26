import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const reviewSchema = z.object({
  productId: z.string(),
  rating: z.number().int().min(1).max(5),
  title: z.string().optional(),
  comment: z.string().min(5, "Nội dung đánh giá phải có ít nhất 5 ký tự"),
});

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Vui lòng đăng nhập để gửi đánh giá" }, { status: 401 });
    }

    const body = await req.json();
    const result = reviewSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues?.[0]?.message || "Dữ liệu không hợp lệ" },
        { status: 400 }
      );
    }

    const { productId, rating, title, comment } = result.data;

    const review = await prisma.review.create({
      data: {
        productId,
        userId: user.id,
        rating,
        title: title || null,
        comment,
        isVerifiedPurchase: true,
      },
    });

    // Recalculate product rating average
    const aggregations = await prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await prisma.product.update({
      where: { id: productId },
      data: {
        ratingsAvg: Math.round((aggregations._avg.rating || 5) * 10) / 10,
        ratingsCount: aggregations._count.rating,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Cảm ơn bạn đã gửi đánh giá sản phẩm!",
      review,
    });
  } catch (error) {
    console.error("Create review error:", error);
    return NextResponse.json({ error: "Lỗi gửi đánh giá" }, { status: 500 });
  }
}
