"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatVND } from "@/lib/utils";

export default function CartDrawer() {
  const { items, itemCount, subtotal, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer Surface - DESIGN.md ex-cart-drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 border-l border-[#d8d8d8] animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#d8d8d8]">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-black" />
            <h2 className="font-bold text-lg text-black uppercase tracking-tight">
              Giỏ Hàng ({itemCount})
            </h2>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 text-[#595959] hover:text-black hover:bg-[#f0f0f0] rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-5 divide-y divide-[#d8d8d8]">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 bg-[#f0f0f0] rounded-full flex items-center justify-center mb-4 text-[#595959]">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <p className="font-bold text-black text-lg mb-1">Giỏ hàng của bạn đang trống</p>
              <p className="text-sm text-[#595959] mb-6">Hãy khám phá các siêu phẩm công nghệ đang có ưu đãi</p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="btn-pill-dark"
              >
                Tiếp tục mua sắm
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="py-4 flex gap-4 first:pt-0 last:pb-0">
                <div className="relative w-20 h-20 bg-[#f0f0f0] rounded-[6px] overflow-hidden shrink-0 border border-[#d8d8d8]">
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-black line-clamp-2 leading-snug">
                      {item.title}
                    </h3>
                    {item.variantName && (
                      <p className="text-xs text-[#595959] mt-0.5">
                        Phân loại: {item.variantName}
                      </p>
                    )}
                    <p className="font-bold text-black text-sm mt-1">
                      {formatVND(item.price)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    {/* Quantity Selector */}
                    <div className="flex items-center border border-[#d8d8d8] rounded-[6px]">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 hover:bg-[#f0f0f0] text-[#595959] hover:text-black transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-black">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 hover:bg-[#f0f0f0] text-[#595959] hover:text-black transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-[#595959] hover:text-[#c31833] p-1 transition-colors"
                      title="Xóa khỏi giỏ"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer with Checkout CTA */}
        {items.length > 0 && (
          <div className="p-5 border-t border-[#d8d8d8] bg-[#fdfdfd] space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-[#595959]">Tạm tính ({itemCount} sản phẩm):</span>
              <span className="font-bold text-lg text-black">{formatVND(subtotal)}</span>
            </div>
            <p className="text-xs text-[#595959]">
              * Phí vận chuyển và voucher sẽ được áp dụng tại bước thanh toán.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link
                href="/cart"
                onClick={() => setIsCartOpen(false)}
                className="btn-pill-outline text-center text-sm py-2.5"
              >
                Xem giỏ hàng
              </Link>
              <Link
                href="/checkout"
                onClick={() => setIsCartOpen(false)}
                className="btn-pill-dark text-center text-sm py-2.5 flex items-center justify-center gap-1.5"
              >
                <span>Thanh toán</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
