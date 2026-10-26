"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { User, Package, Heart, ShieldCheck, Mail, Phone, Calendar, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { formatDate, formatVND } from "@/lib/utils";

export default function AccountPage() {
  const { user, loading, isAdmin } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetch("/api/orders")
        .then((res) => res.json())
        .then((data) => setOrders(data.orders || []))
        .catch(() => {});
    }
  }, [user]);

  if (loading) {
    return <div className="p-16 text-center text-xs text-[#595959]">Đang tải hồ sơ...</div>;
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-black">Vui Lòng Đăng Nhập</h2>
        <p className="text-xs text-[#595959]">Bạn cần đăng nhập để xem thông tin tài khoản và đơn hàng của mình.</p>
        <Link href="/login" className="btn-pill-dark">Đăng nhập ngay</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="section-eyebrow-lockup pb-4 border-b border-[#d8d8d8]">
        <span className="section-eyebrow-bar" />
        <h1 className="section-eyebrow-text">TÀI KHOẢN CỦA TÔI</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: User Profile Card */}
        <div className="lg:col-span-4 bg-white border border-[#d8d8d8] rounded-[10px] p-6 space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b border-[#f0f0f0]">
            <div className="w-16 h-16 rounded-full bg-[#fa9000] text-white flex items-center justify-center font-black text-2xl uppercase">
              {user.name.charAt(0)}
            </div>
            <div>
              <h2 className="font-bold text-lg text-black">{user.name}</h2>
              <span className="inline-block text-[10px] bg-[#f0f0f0] px-2 py-0.5 rounded font-bold uppercase text-[#595959] mt-0.5">
                {user.role}
              </span>
            </div>
          </div>

          <div className="space-y-2.5 text-xs text-[#595959]">
            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-black shrink-0" />
              <span>{user.email}</span>
            </div>
            {user.phone && (
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-black shrink-0" />
                <span>{user.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-black shrink-0" />
              <span>Thành viên từ: {formatDate(user.createdAt || new Date())}</span>
            </div>
          </div>

          {isAdmin && (
            <div className="pt-4 border-t border-[#d8d8d8]">
              <Link
                href="/admin"
                className="w-full btn-pill-dark text-xs py-2.5 bg-[#181818] hover:bg-black text-[#dba200] border border-[#dba200]/40 flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>VÀO TRANG QUẢN TRỊ ADMIN</span>
              </Link>
            </div>
          )}
        </div>

        {/* Right: Quick Stats & Recent Orders */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <Link
              href="/account/orders"
              className="p-4 bg-[#f8f8f8] border border-[#d8d8d8] rounded-[10px] hover:border-black transition-colors"
            >
              <Package className="w-5 h-5 text-black mb-2" />
              <span className="text-xs text-[#595959] block">Đơn mua hàng</span>
              <strong className="text-xl font-bold text-black">{orders.length}</strong>
            </Link>

            <Link
              href="/account/wishlist"
              className="p-4 bg-[#f8f8f8] border border-[#d8d8d8] rounded-[10px] hover:border-black transition-colors"
            >
              <Heart className="w-5 h-5 text-[#c31833] mb-2" />
              <span className="text-xs text-[#595959] block">Yêu thích</span>
              <strong className="text-xl font-bold text-black">Xem danh sách</strong>
            </Link>

            <div className="p-4 bg-[#f8f8f8] border border-[#d8d8d8] rounded-[10px] col-span-2 sm:col-span-1">
              <span className="text-xs text-[#595959] block">Tổng chi tiêu:</span>
              <strong className="text-lg font-bold text-black block mt-2">
                {formatVND(
                  orders
                    .filter((o) => o.paymentStatus === "PAID" || o.status === "DELIVERED")
                    .reduce((sum, o) => sum + o.total, 0)
                )}
              </strong>
            </div>
          </div>

          {/* Recent Orders List */}
          <div className="bg-white border border-[#d8d8d8] rounded-[10px] p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-[#d8d8d8]">
              <h3 className="font-bold text-sm text-black uppercase tracking-wider">
                Đơn Hàng Gần Đây
              </h3>
              <Link href="/account/orders" className="text-xs font-bold text-black hover:underline flex items-center gap-1">
                <span>Xem tất cả</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {orders.length === 0 ? (
              <p className="text-xs text-[#595959] py-4">Bạn chưa có đơn đặt hàng nào.</p>
            ) : (
              <div className="divide-y divide-[#f0f0f0]">
                {orders.slice(0, 3).map((o) => (
                  <div key={o.id} className="py-3 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-mono font-bold text-black block">{o.orderNumber}</span>
                      <span className="text-[11px] text-[#595959]">{formatDate(o.createdAt)}</span>
                      <span className="text-[11px] text-[#595959] block">
                        {o.items?.length || 1} sản phẩm • {o.paymentMethod}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-black block">{formatVND(o.total)}</span>
                      <span className="inline-block mt-1 text-[10px] bg-[#f0f0f0] px-2 py-0.5 rounded font-bold uppercase">
                        {o.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
