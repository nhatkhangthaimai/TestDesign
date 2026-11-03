import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { recipientName, phone, street, ward, district, city, isDefault } = body;

    const existing = await prisma.shippingAddress.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== user.id) {
      return NextResponse.json({ error: "Không tìm thấy địa chỉ hoặc không có quyền" }, { status: 404 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (isDefault) {
        await tx.shippingAddress.updateMany({
          where: { userId: user.id },
          data: { isDefault: false },
        });
      }

      return await tx.shippingAddress.update({
        where: { id },
        data: {
          recipientName: recipientName !== undefined ? recipientName.trim() : existing.recipientName,
          phone: phone !== undefined ? phone.trim() : existing.phone,
          street: street !== undefined ? street.trim() : existing.street,
          ward: ward !== undefined ? ward.trim() : existing.ward,
          district: district !== undefined ? district.trim() : existing.district,
          city: city !== undefined ? city.trim() : existing.city,
          isDefault: isDefault !== undefined ? Boolean(isDefault) : existing.isDefault,
        },
      });
    });

    return NextResponse.json({
      success: true,
      message: "Cập nhật địa chỉ thành công",
      address: updated,
    });
  } catch (error: any) {
    console.error("Update address error:", error);
    return NextResponse.json({ error: "Lỗi cập nhật địa chỉ" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.shippingAddress.findUnique({
      where: { id },
    });

    if (!existing || existing.userId !== user.id) {
      return NextResponse.json({ error: "Không tìm thấy địa chỉ hoặc không có quyền" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.shippingAddress.delete({ where: { id } });

      // If the deleted address was default, promote another address to default
      if (existing.isDefault) {
        const nextAddress = await tx.shippingAddress.findFirst({
          where: { userId: user.id },
          orderBy: { createdAt: "desc" },
        });
        if (nextAddress) {
          await tx.shippingAddress.update({
            where: { id: nextAddress.id },
            data: { isDefault: true },
          });
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: "Đã xóa địa chỉ thành công",
    });
  } catch (error: any) {
    console.error("Delete address error:", error);
    return NextResponse.json({ error: "Lỗi xóa địa chỉ" }, { status: 500 });
  }
}
