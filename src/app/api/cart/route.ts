import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const addToCartSchema = z.object({
  productId: z.string().min(1, "Vui lòng chỉ định productId"),
  variantId: z.string().optional().nullable(),
  quantity: z.number().int().min(1, "Số lượng phải ít nhất là 1").default(1),
});

const updateCartSchema = z.object({
  itemId: z.string().optional(),
  productId: z.string().optional(),
  quantity: z.number().int().min(0, "Số lượng không hợp lệ"),
}).refine((data) => data.itemId || data.productId, {
  message: "Phải cung cấp itemId hoặc productId",
});

// Helper to get or create cart for user
async function getOrCreateCart(userId: string) {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            include: { images: true },
          },
          variant: true,
        },
      },
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: {
        items: {
          include: {
            product: {
              include: { images: true },
            },
            variant: true,
          },
        },
      },
    });
  }

  return cart;
}

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({
        cart: { items: [], totalItems: 0, subtotal: 0 },
        message: "Chưa đăng nhập (sử dụng giỏ hàng khách)",
      });
    }

    const cart = await getOrCreateCart(user.id);
    const subtotal = cart.items.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0
    );
    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    return NextResponse.json({
      cart: {
        id: cart.id,
        items: cart.items,
        totalItems,
        subtotal,
      },
    });
  } catch (error) {
    console.error("Get cart error:", error);
    return NextResponse.json({ error: "Lỗi tải giỏ hàng" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Vui lòng đăng nhập để lưu giỏ hàng" }, { status: 401 });
    }

    const body = await req.json();
    const result = addToCartSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues?.[0]?.message || "Dữ liệu không hợp lệ" },
        { status: 400 }
      );
    }

    const { productId, variantId, quantity } = result.data;

    // Verify product & stock
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { variants: true },
    });

    if (!product || product.status !== "ACTIVE") {
      return NextResponse.json({ error: "Sản phẩm không tồn tại hoặc đã ngừng kinh doanh" }, { status: 404 });
    }

    let price = Number(product.salePrice ?? product.regularPrice);
    let stock = product.stock;

    if (variantId) {
      const variant = product.variants.find((v) => v.id === variantId);
      if (!variant) {
        return NextResponse.json({ error: "Phân loại biến thể không hợp lệ" }, { status: 400 });
      }
      price = Number(variant.price);
      stock = variant.stock;
    }

    if (stock < quantity) {
      return NextResponse.json(
        { error: `Kho chỉ còn ${stock} sản phẩm, không đủ số lượng ${quantity}` },
        { status: 400 }
      );
    }

    const cart = await getOrCreateCart(user.id);

    // Check if item already in cart
    const existingItem = cart.items.find(
      (item) => item.productId === productId && (item.variantId || null) === (variantId || null)
    );

    if (existingItem) {
      const newQty = existingItem.quantity + quantity;
      if (newQty > stock) {
        return NextResponse.json(
          { error: `Tổng số lượng trong giỏ (${newQty}) vượt quá tồn kho (${stock})` },
          { status: 400 }
        );
      }
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQty, price },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          variantId: variantId || null,
          quantity,
          price,
        },
      });
    }

    const updatedCart = await getOrCreateCart(user.id);
    const subtotal = updatedCart.items.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0
    );
    const totalItems = updatedCart.items.reduce((sum, item) => sum + item.quantity, 0);

    return NextResponse.json({
      success: true,
      message: "Đã thêm vào giỏ hàng thành công",
      cart: {
        id: updatedCart.id,
        items: updatedCart.items,
        totalItems,
        subtotal,
      },
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    return NextResponse.json({ error: "Lỗi thêm sản phẩm vào giỏ hàng" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
    }

    const body = await req.json();
    const result = updateCartSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues?.[0]?.message || "Dữ liệu không hợp lệ" },
        { status: 400 }
      );
    }

    const { itemId, productId, quantity } = result.data;
    const cart = await getOrCreateCart(user.id);
    const item = cart.items.find((i) => (itemId ? i.id === itemId : i.productId === productId));

    if (!item) {
      return NextResponse.json({ error: "Không tìm thấy sản phẩm trong giỏ" }, { status: 404 });
    }

    if (quantity === 0) {
      await prisma.cartItem.delete({ where: { id: item.id } });
    } else {
      // Check stock
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { variants: true },
      });
      let stock = product?.stock || 0;
      if (item.variantId && product) {
        const v = product.variants.find((variant) => variant.id === item.variantId);
        if (v) stock = v.stock;
      }

      if (quantity > stock) {
        return NextResponse.json(
          { error: `Kho chỉ còn ${stock} sản phẩm` },
          { status: 400 }
        );
      }

      await prisma.cartItem.update({
        where: { id: item.id },
        data: { quantity },
      });
    }

    const updatedCart = await getOrCreateCart(user.id);
    const subtotal = updatedCart.items.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0
    );
    const totalItems = updatedCart.items.reduce((sum, item) => sum + item.quantity, 0);

    return NextResponse.json({
      success: true,
      message: "Cập nhật giỏ hàng thành công",
      items: updatedCart.items,
      totalItems,
      subtotal,
      cart: {
        id: updatedCart.id,
        items: updatedCart.items,
        totalItems,
        subtotal,
      },
    });
  } catch (error) {
    console.error("Update cart error:", error);
    return NextResponse.json({ error: "Lỗi cập nhật giỏ hàng" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get("itemId");
    const cart = await getOrCreateCart(user.id);

    if (itemId) {
      const item = cart.items.find((i) => i.id === itemId);
      if (item) {
        await prisma.cartItem.delete({ where: { id: itemId } });
      }
    } else {
      // Clear entire cart
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }

    const updatedCart = await getOrCreateCart(user.id);
    const subtotal = updatedCart.items.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0
    );
    const totalItems = updatedCart.items.reduce((sum, item) => sum + item.quantity, 0);

    return NextResponse.json({
      success: true,
      message: itemId ? "Đã xóa sản phẩm khỏi giỏ hàng" : "Đã làm trống giỏ hàng",
      itemCount: totalItems,
      cart: {
        id: updatedCart.id,
        items: updatedCart.items,
        totalItems,
        subtotal,
      },
    });
  } catch (error) {
    console.error("Delete cart error:", error);
    return NextResponse.json({ error: "Lỗi xóa sản phẩm khỏi giỏ hàng" }, { status: 500 });
  }
}
