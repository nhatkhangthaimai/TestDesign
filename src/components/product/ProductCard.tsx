"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star, ShoppingBag, Heart, Eye } from "lucide-react";
import { formatVND, calculateDiscount } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";

export interface ProductCardProps {
  id: string;
  title: string;
  slug: string;
  regularPrice: number;
  salePrice?: number | null;
  sku: string;
  stock: number;
  isFlashSale?: boolean;
  ratingsAvg?: number;
  ratingsCount?: number;
  images: Array<{ url: string; altText?: string | null }>;
  category?: { name: string; slug: string };
  brand?: { name: string; slug: string } | null;
  onQuickView?: (slug: string) => void;
}

export default function ProductCard({
  id,
  title,
  slug,
  regularPrice,
  salePrice,
  sku,
  stock,
  isFlashSale,
  ratingsAvg = 5,
  ratingsCount = 0,
  images,
  category,
  brand,
  onQuickView,
}: ProductCardProps) {
  const { addToCart } = useCart();
  const { info } = useToast();
  const [isWishlisted, setIsWishlisted] = useState(false);

  const discount = calculateDiscount(regularPrice, salePrice);
  const primaryImage = images?.[0]?.url || "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80";
  const hoverImage = images?.[1]?.url || primaryImage;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      productId: id,
      title,
      price: salePrice ?? regularPrice,
      quantity: 1,
      imageUrl: primaryImage,
      sku,
      stock,
    });
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: id }),
      });
      if (res.ok) {
        setIsWishlisted(!isWishlisted);
        info(!isWishlisted ? `Đã thêm ${title} vào yêu thích` : `Đã xóa ${title} khỏi yêu thích`);
      } else {
        info("Vui lòng đăng nhập để lưu danh sách yêu thích");
      }
    } catch {
      info("Vui lòng đăng nhập để lưu danh sách yêu thích");
    }
  };

  return (
    <div className="group relative bg-white border border-[#d8d8d8] rounded-[10px] overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-md hover:border-black">
      {/* Media Frame */}
      <div className="relative aspect-square w-full bg-[#f8f8f8] overflow-hidden">
        <Link href={`/products/${slug}`} className="block w-full h-full">
          <Image
            src={primaryImage}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        </Link>

        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {isFlashSale && (
            <span className="bg-[#c31833] text-white text-[11px] font-black uppercase px-2 py-0.5 rounded-[2px] tracking-wider shadow-xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
              FLASH SALE
            </span>
          )}
          {discount > 0 && (
            <span className="bg-black text-white text-[11px] font-bold px-2 py-0.5 rounded-[2px]">
              -{discount}%
            </span>
          )}
          {stock <= 0 && (
            <span className="bg-[#595959] text-white text-[11px] font-bold px-2 py-0.5 rounded-[2px]">
              TẠM HẾT HÀNG
            </span>
          )}
        </div>

        {/* Action Buttons Overlay (Wishlist, Quickview) */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
          <button
            onClick={handleToggleWishlist}
            className={`w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center transition-colors ${
              isWishlisted ? "text-[#c31833]" : "text-[#595959] hover:text-[#c31833]"
            }`}
            title="Thêm vào yêu thích"
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? "fill-[#c31833]" : ""}`} />
          </button>
          {onQuickView && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView(slug);
              }}
              className="w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center text-[#595959] hover:text-black transition-colors"
              title="Xem nhanh"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Content Frame */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Brand Eyebrow */}
          <div className="flex items-center justify-between text-[11px] text-[#595959] mb-1.5">
            <span className="uppercase tracking-wider font-semibold">
              {brand?.name || category?.name || "Chính hãng"}
            </span>
            <span className="font-mono">{sku}</span>
          </div>

          {/* Product Title */}
          <Link href={`/products/${slug}`} className="block">
            <h3 className="font-bold text-sm text-black line-clamp-2 leading-snug hover:text-[#fa9000] transition-colors">
              {title}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex items-center text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-500" />
            </div>
            <span className="text-xs font-bold text-black">{ratingsAvg.toFixed(1)}</span>
            <span className="text-xs text-[#595959]">({ratingsCount})</span>
          </div>
        </div>

        {/* Pricing & Cart Button */}
        <div className="mt-4 pt-3 border-t border-[#f0f0f0] flex items-center justify-between">
          <div>
            <div className="font-bold text-base text-black leading-none">
              {formatVND(salePrice ?? regularPrice)}
            </div>
            {discount > 0 && (
              <div className="text-xs text-[#595959] line-through mt-1">
                {formatVND(regularPrice)}
              </div>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={stock <= 0}
            className="w-9 h-9 rounded-full bg-black text-white hover:bg-[#222222] disabled:bg-[#d8d8d8] flex items-center justify-center transition-colors shadow-xs"
            title={stock > 0 ? "Thêm vào giỏ" : "Hết hàng"}
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
