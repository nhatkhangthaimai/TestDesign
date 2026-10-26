"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShieldCheck, Tag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatVND } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";

export default function CartPage() {
  const { items, itemCount, subtotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const { success, error } = useToast();

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    description: string;
    discountAmount: number;
  } | null>(null);
  const [checkingCoupon, setCheckingCoupon] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) {
      error("Vui lòng nhập mã giảm giá");
      return;
    }

    setCheckingCoupon(true);
    try {
      const res = await fetch("/api/coupons/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponCode.trim(),
          subtotal,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAppliedCoupon(data.coupon);
        success(`Áp dụng mã "${data.coupon.code}" thành công! Giảm ${formatVND(data.coupon.discountAmount)}`);
      } else {
        error(data.error || "Mã giảm giá không hợp lệ");
        setAppliedCoupon(null);
      }
    } catch {
      error("Lỗi kiểm tra mã giảm giá");
    } finally {
      setCheckingCoupon(false);
    }
  };

  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const shippingFee = subtotal >= 500000 || subtotal === 0 ? 0 : 30000;
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-20 text-center">
        <div className="w-20 h-20 bg-[#f0f0f0] rounded-full flex items-center justify-center mx-auto mb-6 text-[#595959]">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="font-bold text-2xl text-black mb-2">Giỏ hàng của bạn đang trống</h1>
        <p className="text-sm text-[#595959] max-w-md mx-auto mb-8">
          Hãy khám phá những tuyệt tác công nghệ và âm thanh mới nhất đang có ưu đãi hôm nay.
        </p>
        <Link href="/products" className="btn-pill-dark text-base py-3 px-8">
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="section-eyebrow-lockup pb-4 border-b border-[#d8d8d8]">
        <span className="section-eyebrow-bar" />
        <h1 className="section-eyebrow-text">GIỎ HÀNG CỦA BẠN ({itemCount} SẢN PHẨM)</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Cart Items Table */}
        <div className="lg:col-span-8 bg-white border border-[#d8d8d8] rounded-[10px] overflow-hidden">
          <div className="p-4 bg-[#f8f8f8] border-b border-[#d8d8d8] hidden sm:grid grid-cols-12 text-xs font-bold uppercase tracking-wider text-[#595959]">
            <span className="col-span-6">Sản Phẩm</span>
            <span className="col-span-2 text-center">Đơn Giá</span>
            <span className="col-span-2 text-center">Số Lượng</span>
            <span className="col-span-2 text-right">Thành Tiền</span>
          </div>

          <div className="divide-y divide-[#d8d8d8] p-4 sm:p-0">
            {items.map((item) => {
              const lineTotal = item.price * item.quantity;
              return (
                <div
                  key={item.id}
                  className="sm:p-4 sm:grid sm:grid-cols-12 items-center gap-4 py-4 first:pt-0 last:pb-0"
                >
                  {/* Product Details */}
                  <div className="sm:col-span-6 flex gap-3">
                    <div className="relative w-20 h-20 bg-[#f8f8f8] rounded-[6px] overflow-hidden shrink-0 border border-[#d8d8d8]">
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                    <div className="flex flex-col justify-between">
                      <div>
                        <h3 className="font-bold text-sm text-black line-clamp-2 leading-snug">
                          {item.title}
                        </h3>
                        {item.variantName && (
                          <span className="text-xs text-[#595959] block mt-0.5">
                            Phân loại: {item.variantName}
                          </span>
                        )}
                        <span className="text-[11px] font-mono text-[#595959] block mt-0.5">
                          SKU: {item.sku}
                        </span>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-xs text-[#c31833] hover:underline flex items-center gap-1 mt-2 self-start"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xóa</span>
                      </button>
                    </div>
                  </div>

                  {/* Unit Price */}
                  <div className="sm:col-span-2 text-center text-sm font-medium text-[#595959] hidden sm:block">
                    {formatVND(item.price)}
                  </div>

                  {/* Quantity */}
                  <div className="sm:col-span-2 flex items-center justify-between sm:justify-center my-3 sm:my-0">
                    <span className="text-xs text-[#595959] sm:hidden">Số lượng:</span>
                    <div className="flex items-center border border-[#d8d8d8] rounded-[6px] bg-white">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-2.5 py-1 text-xs hover:bg-[#f0f0f0]"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-2.5 py-1 text-xs hover:bg-[#f0f0f0]"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Line Total */}
                  <div className="sm:col-span-2 text-right flex justify-between sm:block">
                    <span className="text-xs text-[#595959] sm:hidden">Thành tiền:</span>
                    <span className="font-bold text-base text-black">{formatVND(lineTotal)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 bg-[#f8f8f8] border-t border-[#d8d8d8] flex justify-between items-center text-xs">
            <button
              onClick={clearCart}
              className="text-[#595959] hover:text-[#c31833] underline"
            >
              Xóa sạch giỏ hàng
            </button>
            <Link href="/products" className="text-black font-bold hover:underline">
              ← Tiếp tục mua sắm
            </Link>
          </div>
        </div>

        {/* Right: Summary & Checkout Box */}
        <div className="lg:col-span-4 space-y-6">
          {/* Coupon Input Form */}
          <div className="bg-white border border-[#d8d8d8] rounded-[10px] p-5 space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-black flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#fa9000]" />
              Mã Giảm Giá / Voucher
            </label>
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <input
                type="text"
                placeholder="Nhập mã (ví dụ: WELCOME10)"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="flex-1 h-10 bg-white text-[#111111] border border-[#d4d4d4] rounded-lg px-3 text-sm uppercase placeholder:text-[#999999] focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
              />
              <button
                type="submit"
                disabled={checkingCoupon}
                className="h-10 px-4 bg-black hover:bg-[#222222] text-white text-xs font-semibold rounded-lg whitespace-nowrap cursor-pointer transition-all active:scale-95 disabled:opacity-60"
              >
                {checkingCoupon ? "Kiểm tra..." : "Áp dụng"}
              </button>
            </form>

            {appliedCoupon && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-[6px] text-xs text-emerald-800 flex justify-between items-center">
                <div>
                  <span className="font-bold">{appliedCoupon.code}</span>
                  <p className="text-[11px]">{appliedCoupon.description}</p>
                </div>
                <button
                  onClick={() => setAppliedCoupon(null)}
                  className="text-xs text-[#c31833] underline"
                >
                  Gỡ bỏ
                </button>
              </div>
            )}
          </div>

          {/* Order Summary Card */}
          <div className="bg-white border border-[#d8d8d8] rounded-[10px] p-6 space-y-4">
            <h3 className="font-bold text-base text-black pb-3 border-b border-[#d8d8d8]">
              Tóm Tắt Đơn Hàng
            </h3>

            <div className="space-y-2.5 text-xs text-[#595959]">
              <div className="flex justify-between">
                <span>Tạm tính hàng ({itemCount} món):</span>
                <span className="font-bold text-black">{formatVND(subtotal)}</span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Giảm giá ({appliedCoupon.code}):</span>
                  <span>-{formatVND(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Phí vận chuyển:</span>
                <span className="font-bold text-black">
                  {shippingFee === 0 ? "MIỄN PHÍ" : formatVND(shippingFee)}
                </span>
              </div>

              {shippingFee > 0 && (
                <p className="text-[11px] text-[#fa9000]">
                  * Mua thêm {formatVND(500000 - subtotal)} để được MIỄN PHÍ VẬN CHUYỂN!
                </p>
              )}
            </div>

            <div className="pt-4 border-t border-[#d8d8d8] flex justify-between items-baseline">
              <span className="font-bold text-sm text-black">Tổng thanh toán:</span>
              <span className="font-black text-2xl text-black">{formatVND(grandTotal)}</span>
            </div>

            <Link
              href={`/checkout${appliedCoupon ? `?coupon=${appliedCoupon.code}` : ""}`}
              className="btn-pill-dark w-full py-3.5 text-center text-sm flex items-center justify-center gap-2"
            >
              <span>Tiến hành đặt hàng</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
