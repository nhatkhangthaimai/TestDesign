"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { CheckCircle2, Package, ArrowRight, ShieldCheck, Truck, Home } from "lucide-react";
import { formatVND, formatDate } from "@/lib/utils";

interface OrderDetail {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: string;
  shippingCity: string;
  shippingDistrict: string;
  shippingWard: string;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  createdAt: string;
  items: Array<{
    id: string;
    productTitle: string;
    sku: string;
    price: number;
    quantity: number;
    total: number;
  }>;
}

export default function OrderSuccessPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = use(params);
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Launch celebratory confetti
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // Ignore if canvas is not ready
    }

    async function loadOrder() {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data.order);
        }
      } catch (err) {
        console.error("Error loading order:", err);
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-[#595959]">Đang tải thông tin đơn hàng...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-12 space-y-8">
      {/* Header Banner */}
      <div className="bg-white border border-[#d8d8d8] rounded-[10px] p-8 text-center space-y-4">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div>
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest block mb-1">
            ĐẶT HÀNG THÀNH CÔNG
          </span>
          <h1 className="font-bold text-2xl sm:text-3xl text-black">
            Cảm Ơn Quý Khách Đã Mua Sắm!
          </h1>
          <p className="text-sm text-[#595959] mt-2">
            Mã đơn hàng của bạn là:{" "}
            <span className="font-mono font-bold text-black text-base">
              {order?.orderNumber || orderId}
            </span>
          </p>
          <p className="text-xs text-[#595959] mt-1">
            Một email xác nhận chi tiết đã được gửi đến{" "}
            <strong className="text-black">{order?.customerEmail}</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Link
            href={`/order-tracking?orderId=${order?.orderNumber || orderId}`}
            className="btn-pill-dark text-xs py-2.5 px-6 flex items-center gap-1.5"
          >
            <Package className="w-4 h-4" />
            <span>Theo dõi tiến độ đơn hàng</span>
          </Link>
          <Link
            href="/"
            className="btn-pill-outline text-xs py-2.5 px-6 flex items-center gap-1.5"
          >
            <Home className="w-4 h-4" />
            <span>Về trang chủ</span>
          </Link>
        </div>
      </div>

      {/* Order Details Receipt */}
      {order && (
        <div className="bg-white border border-[#d8d8d8] rounded-[10px] p-6 space-y-6">
          <h3 className="font-bold text-base text-black pb-3 border-b border-[#d8d8d8]">
            Thông Tin Chi Tiết Đơn Hàng
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[#595959] block">Người nhận:</span>
              <strong className="text-black text-sm">{order.customerName}</strong>
              <p className="text-[#595959] mt-0.5">{order.customerPhone}</p>
            </div>

            <div>
              <span className="text-[#595959] block">Địa chỉ nhận hàng:</span>
              <p className="text-black font-medium leading-snug">
                {order.shippingAddress}, {order.shippingWard}, {order.shippingDistrict}, {order.shippingCity}
              </p>
            </div>

            <div>
              <span className="text-[#595959] block">Phương thức thanh toán:</span>
              <strong className="text-black">{order.paymentMethod}</strong>
              <span className="block text-[11px] text-[#595959]">
                Trạng thái: {order.paymentStatus === "PAID" ? "Đã thanh toán" : "Thanh toán khi nhận hàng"}
              </span>
            </div>

            <div>
              <span className="text-[#595959] block">Thời gian đặt:</span>
              <strong className="text-black">{formatDate(order.createdAt)}</strong>
            </div>
          </div>

          {/* Items List */}
          <div className="pt-4 border-t border-[#d8d8d8]">
            <h4 className="font-bold text-xs uppercase tracking-wider text-black mb-3">
              Danh Sách Sản Phẩm
            </h4>
            <div className="divide-y divide-[#f0f0f0] text-xs">
              {order.items.map((item) => (
                <div key={item.id} className="py-2.5 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-black">{item.productTitle}</span>
                    <span className="block text-[11px] text-[#595959]">
                      SKU: {item.sku} • Số lượng: {item.quantity}
                    </span>
                  </div>
                  <span className="font-bold text-black">{formatVND(item.total)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Breakdown */}
          <div className="pt-4 border-t border-[#d8d8d8] space-y-1.5 text-xs text-[#595959]">
            <div className="flex justify-between">
              <span>Tạm tính:</span>
              <span className="font-bold text-black">{formatVND(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Giảm giá voucher:</span>
                <span>-{formatVND(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Phí vận chuyển:</span>
              <span className="font-bold text-black">{formatVND(order.shippingFee)}</span>
            </div>
            <div className="pt-2 border-t border-[#d8d8d8] flex justify-between text-base">
              <span className="font-bold text-black">Tổng cộng:</span>
              <span className="font-black text-black">{formatVND(order.total)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
