import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
    }

    const addresses = await prisma.shippingAddress.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ addresses });
  } catch (error: any) {
    console.error("Fetch addresses error:", error);
    return NextResponse.json({ error: "Lỗi tải sổ địa chỉ" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
    }

    const body = await req.json();
    const { recipientName, phone, street, ward, district, city, isDefault } = body;

    if (!recipientName?.trim()) {
      return NextResponse.json({ error: "Họ tên người nhận không được để trống" }, { status: 400 });
    }
    if (!phone?.trim()) {
      return NextResponse.json({ error: "Số điện thoại không được để trống" }, { status: 400 });
    }
    if (!street?.trim()) {
      return NextResponse.json({ error: "Địa chỉ chi tiết không được để trống" }, { status: 400 });
    }
    if (!city?.trim()) {
      return NextResponse.json({ error: "Tỉnh / Thành phố không được để trống" }, { status: 400 });
    }

    // Check if user currently has any addresses
    const count = await prisma.shippingAddress.count({ where: { userId: user.id } });
    // First address is default by default
    const shouldBeDefault = Boolean(isDefault) || count === 0;

    const newAddress = await prisma.$transaction(async (tx) => {
      if (shouldBeDefault) {
        await tx.shippingAddress.updateMany({
          where: { userId: user.id },
          data: { isDefault: false },
        });
      }

      return await tx.shippingAddress.create({
        data: {
          userId: user.id,
          recipientName: recipientName.trim(),
          phone: phone.trim(),
          street: street.trim(),
          ward: ward?.trim() || "",
          district: district?.trim() || "",
          city: city.trim(),
          isDefault: shouldBeDefault,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Thêm địa chỉ giao hàng thành công",
      address: newAddress,
    });
  } catch (error: any) {
    console.error("Create address error:", error);
    return NextResponse.json({ error: "Lỗi thêm địa chỉ" }, { status: 500 });
  }
}
