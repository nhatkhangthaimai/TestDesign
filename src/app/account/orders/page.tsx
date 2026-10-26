"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Package, ArrowLeft, ArrowRight, Clock, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { formatVND, formatDate } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";

export default function AccountOrdersPage() {
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);
  const { success, error } = useToast();

  useEffect(() => {
    if (user) {
      fetch("/api/orders")
        .then((res) => res.json())
        .then((data) => setOrders(data.orders || []))
        .finally(() => setFetching(false));
    } else if (!loading) {
      setFetching(false);
    }
  }, [user, loading]);

  const handleCancelOrder = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?")) return;
    try {
      const res = await fetch(`/api/orders/${id}/cancel`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        success("Đã hủy đơn hàng thành công");
        setOrders((prev) =>
          prev.map((o) => (o.id === id ? { ...o, status: "CANCELLED" } : o))
        );
      } else {
        error(data.error || "Không thể hủy đơn hàng");
      }
    } catch {
      error("Lỗi khi gửi yêu cầu hủy đơn");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#d8d8d8]">
        <div className="section-eyebrow-lockup">
          <span className="section-eyebrow-bar" />
          <h1 className="section-eyebrow-text">LỊCH SỬ ĐƠN HÀNG CỦA TÔI</h1>
        </div>
        <Link href="/account" className="text-xs font-bold text-black hover:underline flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Quay lại tài khoản</span>
        </Link>
      </div>

      {fetching ? (
        <div className="p-16 text-center text-xs text-[#595959]">Đang tải đơn hàng...</div>
      ) : orders.length === 0 ? (
        <div className="bg-white border border-[#d8d8d8] rounded-[10px] p-12 text-center max-w-md mx-auto">
          <Package className="w-12 h-12 text-[#595959] mx-auto mb-3" />
          <h3 className="font-bold text-base text-black">Chưa có đơn hàng nào</h3>
          <p className="text-xs text-[#595959] mt-1 mb-4">
            Khám phá các sản phẩm công nghệ đang được giảm giá ngay hôm nay.
          </p>
          <Link href="/products" className="btn-pill-dark text-xs">
            Mua sắm ngay
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-[#d8d8d8] rounded-[10px] p-6 space-y-4 hover:border-black transition-colors"
            >
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#f0f0f0]">
                <div>
                  <span className="font-mono font-black text-base text-black">
                    {order.orderNumber}
                  </span>
                  <span className="text-xs text-[#595959] ml-3">
                    Ngày đặt: {formatDate(order.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded uppercase ${
                      order.status === "DELIVERED"
                        ? "bg-emerald-100 text-emerald-800"
                        : order.status === "CANCELLED"
                        ? "bg-red-100 text-red-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Items in Order */}
              <div className="divide-y divide-[#f0f0f0] text-xs">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="py-2 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-black">{item.productTitle}</span>
                      <span className="text-[#595959] block text-[11px]">
                        Mã SKU: {item.sku} • Số lượng: {item.quantity} × {formatVND(item.price)}
                      </span>
                    </div>
                    <span className="font-bold text-black">{formatVND(item.total)}</span>
                  </div>
                ))}
              </div>

              {/* Order Footer */}
              <div className="pt-3 border-t border-[#f0f0f0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="text-[#595959]">
                  <span>Giao tới: </span>
                  <strong className="text-black">{order.shippingAddress}, {order.shippingCity}</strong>
                </div>

                <div className="flex items-center gap-4">
                  <div>
                    <span className="text-[#595959]">Tổng tiền: </span>
                    <strong className="text-base font-black text-black">{formatVND(order.total)}</strong>
                  </div>

                  <Link
                    href={`/order-tracking?orderId=${order.orderNumber}`}
                    className="btn-pill-dark text-xs py-1.5 px-3 flex items-center gap-1"
                  >
                    <span>Theo dõi</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  {order.status === "PENDING" && (
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      className="text-xs text-[#c31833] hover:underline"
                    >
                      Hủy đơn
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
