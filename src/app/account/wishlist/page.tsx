"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, ArrowLeft } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";

export default function WishlistPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/wishlist")
      .then((res) => res.json())
      .then((data) => setItems(data.wishlist || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between pb-4 border-b border-[#d8d8d8]">
        <div className="section-eyebrow-lockup">
          <span className="section-eyebrow-bar" />
          <h1 className="section-eyebrow-text">DANH SÁCH YÊU THÍCH ({items.length})</h1>
        </div>
        <Link href="/account" className="text-xs font-bold text-black hover:underline flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Quay lại tài khoản</span>
        </Link>
      </div>

      {loading ? (
        <div className="p-16 text-center text-xs text-[#595959]">Đang tải danh sách...</div>
      ) : items.length === 0 ? (
        <div className="bg-white border border-[#d8d8d8] rounded-[10px] p-12 text-center max-w-md mx-auto">
          <Heart className="w-12 h-12 text-[#c31833] mx-auto mb-3" />
          <h3 className="font-bold text-base text-black">Chưa có sản phẩm yêu thích</h3>
          <p className="text-xs text-[#595959] mt-1 mb-4">
            Nhấn vào biểu tượng trái tim trên các sản phẩm để lưu lại xem sau.
          </p>
          <Link href="/products" className="btn-pill-dark text-xs">
            Khám phá sản phẩm
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((w) => (
            <ProductCard key={w.id} {...w.product} />
          ))}
        </div>
      )}
    </div>
  );
}
