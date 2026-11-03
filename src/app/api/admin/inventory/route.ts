import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const inventoryAdjustSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  variantId: z.string().optional().nullable(),
  warehouseCode: z.string().default("WH-HCM-01"),
  quantityChange: z.number().int(),
  transactionType: z.enum(["RECEIVE", "SHIP", "ADJUST", "RETURN", "AUDIT"]).default("ADJUST"),
  note: z.string().optional().nullable(),
  referenceNumber: z.string().optional().nullable(),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user || user.role !== "ROLE_ADMIN") {
      return NextResponse.json({ error: "Không có quyền quản trị" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const lowStockOnly = searchParams.get("lowStock") === "true";
    const warehouse = searchParams.get("warehouse");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const skip = (page - 1) * limit;

    const where: any = {};
    if (warehouse) {
      where.warehouseCode = warehouse;
    }

    // Fetch inventory
    const [inventories, totalCount] = await Promise.all([
      prisma.inventory.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: "desc" },
        include: {
          product: {
            select: {
              id: true,
              title: true,
              sku: true,
              stock: true,
              regularPrice: true,
              category: { select: { name: true } },
            },
          },
          variant: {
            select: { id: true, name: true, sku: true, stock: true },
          },
        },
      }),
      prisma.inventory.count({ where }),
    ]);

    const formatted = inventories.map((inv) => ({
      id: inv.id,
      productId: inv.productId,
      productTitle: inv.product.title,
      productSku: inv.variant?.sku || inv.product.sku,
      category: inv.product.category?.name,
      variantId: inv.variantId,
      variantName: inv.variant?.name || "Tiêu chuẩn",
      warehouseCode: inv.warehouseCode,
      quantity: inv.quantity,
      reservedQty: inv.reservedQty,
      availableQty: Math.max(0, inv.quantity - inv.reservedQty),
      safetyStock: inv.safetyStock,
      isLowStock: inv.quantity <= inv.safetyStock,
      lastCountAt: inv.lastCountAt,
    }));

    const result = lowStockOnly ? formatted.filter((item) => item.isLowStock) : formatted;

    return NextResponse.json({
      inventories: result,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error: any) {
    console.error("Inventory error:", error);
    return NextResponse.json({ error: "Failed to fetch inventory", details: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user || user.role !== "ROLE_ADMIN") {
      return NextResponse.json({ error: "Không có quyền quản trị" }, { status: 403 });
    }

    const body = await req.json();
    const parsed = inventoryAdjustSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues?.[0]?.message || "Invalid payload" },
        { status: 400 }
      );
    }

    const {
      productId,
      variantId,
      warehouseCode,
      quantityChange,
      transactionType,
      note,
      referenceNumber,
    } = parsed.data;

    // Find or create inventory row
    let inventory = await prisma.inventory.findFirst({
      where: {
        productId,
        variantId: variantId || null,
        warehouseCode,
      },
    });

    if (!inventory) {
      inventory = await prisma.inventory.create({
        data: {
          productId,
          variantId: variantId || null,
          warehouseCode,
          quantity: Math.max(0, quantityChange),
          safetyStock: 10,
        },
      });
    } else {
      const newQty = Math.max(0, inventory.quantity + quantityChange);
      inventory = await prisma.inventory.update({
        where: { id: inventory.id },
        data: { quantity: newQty, lastCountAt: new Date() },
      });
    }

    // Sync product stock
    const totalProductStock = await prisma.inventory.aggregate({
      where: { productId },
      _sum: { quantity: true },
    });

    await prisma.product.update({
      where: { id: productId },
      data: {
        stock: totalProductStock._sum.quantity || 0,
        status: (totalProductStock._sum.quantity || 0) > 0 ? "ACTIVE" : "OUT_OF_STOCK",
      },
    });

    // Record inventory transaction
    const txn = await prisma.inventoryTransaction.create({
      data: {
        productId,
        variantId: variantId || null,
        warehouseCode,
        transactionType,
        quantity: quantityChange,
        referenceNumber: referenceNumber || `ADJ-${Date.now()}`,
        note: note || `Điều chỉnh kho bởi Admin ${user.email}`,
      },
    });

    return NextResponse.json({
      message: "Điều chỉnh kho thành công",
      inventory,
      transaction: txn,
    });
  } catch (error: any) {
    console.error("Inventory adjustment error:", error);
    return NextResponse.json({ error: "Failed to adjust inventory", details: error.message }, { status: 500 });
  }
}
