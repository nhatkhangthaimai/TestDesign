import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const guestItems: Array<{ productId: string; variantId?: string | null; quantity: number }> = body.items || [];

    if (!Array.isArray(guestItems)) {
      return NextResponse.json({ error: "Invalid payload: items must be an array" }, { status: 400 });
    }

    // Find or create user cart
    let cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: { items: true },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: user.id },
        include: { items: true },
      });
    }

    // Merge guest items into DB cart
    for (const item of guestItems) {
      if (!item.productId || !item.quantity || item.quantity <= 0) continue;

      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { id: true, regularPrice: true, salePrice: true, stock: true },
      });

      if (!product) continue;
      const unitPrice = Number(product.salePrice ?? product.regularPrice);

      const existingItem = cart.items.find(
        (ci) => ci.productId === item.productId && ci.variantId === (item.variantId || null)
      );

      if (existingItem) {
        const newQty = Math.min(existingItem.quantity + item.quantity, product.stock);
        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: newQty, price: unitPrice },
        });
      } else {
        const initialQty = Math.min(item.quantity, product.stock);
        if (initialQty > 0) {
          await prisma.cartItem.create({
            data: {
              cartId: cart.id,
              productId: item.productId,
              variantId: item.variantId || null,
              quantity: initialQty,
              price: unitPrice,
            },
          });
        }
      }
    }

    // Return updated cart
    const updatedCart = await prisma.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                slug: true,
                regularPrice: true,
                salePrice: true,
                stock: true,
                images: { where: { isPrimary: true }, take: 1, select: { url: true } },
              },
            },
          },
        },
      },
    });

    const items = (updatedCart?.items || []).map((ci) => {
      const price = Number(ci.product.salePrice ?? ci.product.regularPrice);
      return {
        id: ci.id,
        productId: ci.productId,
        variantId: ci.variantId,
        title: ci.product.title,
        slug: ci.product.slug,
        image: ci.product.images[0]?.url || "/placeholder.jpg",
        price,
        quantity: ci.quantity,
        stock: ci.product.stock,
        subtotal: price * ci.quantity,
      };
    });

    const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

    return NextResponse.json({
      cartId: cart.id,
      items,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      totalAmount,
      message: "Cart synced successfully",
    });
  } catch (error: any) {
    console.error("Cart sync error:", error);
    return NextResponse.json({ error: "Failed to sync cart", details: error.message }, { status: 500 });
  }
}

