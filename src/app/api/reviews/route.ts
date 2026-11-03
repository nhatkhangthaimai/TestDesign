import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const reviewSchema = z.object({
  productId: z.string().min(1, "Vui lòng chỉ định productId"),
  rating: z.number().int().min(1).max(5),
  title: z.string().optional(),
  comment: z.string().min(5, "Nội dung đánh giá phải có ít nhất 5 ký tự"),
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10", 10)));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (productId) {
      where.productId = productId;
    }

    const [total, reviews] = await Promise.all([
      prisma.review.count({ where }),
      prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      }),
    ]);

    let ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    if (productId) {
      const allRatings = await prisma.review.findMany({
        where: { productId },
        select: { rating: true },
      });
      for (const r of allRatings) {
        ratingDistribution[r.rating] = (ratingDistribution[r.rating] || 0) + 1;
      }
    }

    return NextResponse.json({
      reviews,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
      ratingDistribution,
    });
  } catch (error) {
    console.error("Fetch reviews error:", error);
    return NextResponse.json({ error: "Lỗi tải đánh giá sản phẩm" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser(req);
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

    // Verify product exists
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: "Sản phẩm không tồn tại" }, { status: 404 });
    }

    // Check if user has bought this product
    const purchasedOrder = await prisma.order.findFirst({
      where: {
        userId: user.id,
        status: "DELIVERED",
        items: {
          some: { productId },
        },
      },
    });

    const review = await prisma.review.create({
      data: {
        productId,
        userId: user.id,
        rating,
        title: title || null,
        comment,
        isVerifiedPurchase: Boolean(purchasedOrder),
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

export async function DELETE(req: Request) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing review id" }, { status: 400 });
    }

    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    if (review.userId !== user.id && user.role !== "ROLE_ADMIN") {
      return NextResponse.json({ error: "Không có quyền xóa đánh giá này" }, { status: 403 });
    }

    await prisma.review.delete({ where: { id } });

    // Recalculate
    const aggregations = await prisma.review.aggregate({
      where: { productId: review.productId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await prisma.product.update({
      where: { id: review.productId },
      data: {
        ratingsAvg: aggregations._count.rating > 0 ? Math.round((aggregations._avg.rating || 5) * 10) / 10 : 0,
        ratingsCount: aggregations._count.rating,
      },
    });

    return NextResponse.json({ success: true, message: "Đã xóa đánh giá thành công" });
  } catch (error: any) {
    return NextResponse.json({ error: "Lỗi xóa đánh giá", details: error.message }, { status: 500 });
  }
}
