"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Flame,
  Clock,
  Copy,
  Check,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import { useToast } from "@/context/ToastContext";

interface Product {
  id: string;
  title: string;
  slug: string;
  regularPrice: number;
  salePrice: number | null;
  sku: string;
  stock: number;
  isFlashSale: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  isFeatured: boolean;
  ratingsAvg: number;
  ratingsCount: number;
  images: Array<{ url: string; altText?: string | null }>;
  category?: { name: string; slug: string };
  brand?: { name: string; slug: string } | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  _count?: { products: number };
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"bestseller" | "new" | "featured">("bestseller");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Flash Sale Countdown State
  const [timeLeft, setTimeLeft] = useState({
    hours: 14,
    minutes: 36,
    seconds: 48,
  });

  const { success } = useToast();

  useEffect(() => {
    async function loadData() {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch("/api/products?limit=12"),
          fetch("/api/categories"),
        ]);
        if (prodRes.ok) {
          const pData = await prodRes.json();
          setProducts(pData.products || []);
        }
        if (catRes.ok) {
          const cData = await catRes.json();
          setCategories(cData.categories || []);
        }
      } catch (err) {
        console.error("Error loading home page data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Countdown timer tick
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    success(`Đã sao chép mã giảm giá "${code}" vào bộ nhớ tạm!`);
    setTimeout(() => setCopiedCode(null), 3000);
  };

  const flashSaleProducts = products.filter((p) => p.isFlashSale);
  const tabProducts =
    activeTab === "bestseller"
      ? products.filter((p) => p.isBestSeller)
      : activeTab === "new"
      ? products.filter((p) => p.isNewArrival)
      : products.filter((p) => p.isFeatured);

  return (
    <div className="space-y-16 pb-16">
      {/* 1. HERO MASTHEAD BANNER - DESIGN.md editorial style */}
      <section className="border-b border-[#d8d8d8] bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 md:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 bg-[#f0f0f0] border border-[#d8d8d8] rounded-[18px] px-3.5 py-1 text-xs">
                <span className="w-2 h-2 rounded-full bg-[#c31833] animate-pulse" />
                <span className="font-bold text-black uppercase tracking-wider">
                  MỞ BÁN ĐẶC QUYỀN 2026
                </span>
                <span className="text-[#595959]">•</span>
                <span className="text-[#595959]">Chính hãng VNA</span>
              </div>

              <h1 className="font-bold text-4xl sm:text-5xl lg:text-6xl text-black tracking-tight leading-[1.1]">
                TUYỆT TÁC CÔNG NGHỆ & ÂM THANH ĐỈNH CAO
              </h1>

              <p className="text-base sm:text-lg text-[#595959] max-w-xl leading-relaxed">
                Khám phá bộ sưu tập iPhone 16 Pro Max khung Titan, tai nghe chống ồn Sony WH-1000XM5 và loa hi-end Marshall. Trải nghiệm mua sắm bảo mật với cam kết 100% nguyên seal.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link href="/products" className="btn-pill-dark text-base py-3 px-7">
                  <span>Khám phá ngay</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/products?filter=flash_sale" className="btn-pill-outline text-base py-3 px-7">
                  Flash Sale hôm nay
                </Link>
              </div>

              {/* Service Badges */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#d8d8d8] text-xs">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#fa9000]" />
                  <span className="font-bold text-black">Giao 2H Hỏa Tốc</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#fa9000]" />
                  <span className="font-bold text-black">Bảo Hành 12 Tháng</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-[#fa9000]" />
                  <span className="font-bold text-black">Đổi Trả 30 Ngày</span>
                </div>
              </div>
            </div>

            {/* Right Hero Image Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative aspect-4/3 w-full bg-[#f8f8f8] border border-[#d8d8d8] rounded-[10px] overflow-hidden shadow-lg">
                <Image
                  src="https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1000&q=85"
                  alt="iPhone 16 Pro Max Titan"
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 45vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                  <span className="bg-[#fa9000] text-black text-xs font-black px-2.5 py-1 rounded-[2px] uppercase tracking-wider self-start mb-2">
                    HOT DEAL
                  </span>
                  <h3 className="font-bold text-xl sm:text-2xl text-white">
                    iPhone 16 Pro Max 256GB Titan Tự Nhiên
                  </h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-bold text-lg text-[#ffa000]">31.490.000 ₫</span>
                    <Link
                      href="/products/iphone-16-pro-max-256gb"
                      className="text-xs font-bold underline hover:text-[#ffa000] transition-colors"
                    >
                      Xem chi tiết →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FLASH SALE SECTION - DESIGN.md Live Red apparatus */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="bg-[#fdfdfd] border-2 border-[#c31833] rounded-[10px] p-6 sm:p-8">
          {/* Header Lockup */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#d8d8d8]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#c31833] text-white rounded-[6px] flex items-center justify-center">
                <Flame className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="live-dot" />
                  <span className="text-xs font-black uppercase tracking-wider text-[#c31833]">
                    ĐANG DIỄN RA
                  </span>
                </div>
                <h2 className="font-bold text-2xl sm:text-3xl text-black tracking-tight">
                  FLASH SALE GIỜ VÀNG
                </h2>
              </div>
            </div>

            {/* Countdown Clock */}
            <div className="flex items-center gap-2 self-start md:self-auto">
              <span className="text-xs text-[#595959] uppercase font-bold flex items-center gap-1.5 mr-2">
                <Clock className="w-4 h-4 text-[#c31833]" />
                Kết thúc sau:
              </span>
              <div className="flex items-center gap-1.5 font-mono font-black text-white text-base">
                <span className="bg-[#000000] px-2.5 py-1.5 rounded-[4px]">
                  {String(timeLeft.hours).padStart(2, "0")}
                </span>
                <span className="text-black font-bold">:</span>
                <span className="bg-[#000000] px-2.5 py-1.5 rounded-[4px]">
                  {String(timeLeft.minutes).padStart(2, "0")}
                </span>
                <span className="text-black font-bold">:</span>
                <span className="bg-[#c31833] px-2.5 py-1.5 rounded-[4px]">
                  {String(timeLeft.seconds).padStart(2, "0")}
                </span>
              </div>
            </div>
          </div>

          {/* Flash Sale Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-6">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-80 bg-[#f0f0f0] animate-pulse rounded-[10px]" />
                ))
              : flashSaleProducts.slice(0, 4).map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
          </div>

          <div className="text-center pt-6 mt-6 border-t border-[#d8d8d8]">
            <Link
              href="/products?filter=flash_sale"
              className="inline-flex items-center gap-2 text-sm font-bold text-[#c31833] hover:underline uppercase tracking-wide"
            >
              <span>Xem toàn bộ ưu đãi Flash Sale hôm nay</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 3. POPULAR CATEGORIES GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="section-eyebrow-lockup mb-6">
          <span className="section-eyebrow-bar" />
          <h2 className="section-eyebrow-text">DANH MỤC SẢN PHẨM PHỔ BIẾN</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="group relative bg-[#f8f8f8] border border-[#d8d8d8] rounded-[10px] overflow-hidden hover:border-black transition-all duration-300"
            >
              <div className="relative aspect-16/10 w-full overflow-hidden bg-black/5">
                {cat.imageUrl && (
                  <Image
                    src={cat.imageUrl}
                    alt={cat.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 25vw"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <h3 className="font-bold text-lg text-white group-hover:text-[#ffa000] transition-colors leading-tight">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-white/80 line-clamp-1 mt-0.5">
                    {cat.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. PRODUCT SHOWCASE TABS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#d8d8d8] mb-8">
          <div className="section-eyebrow-lockup">
            <span className="section-eyebrow-bar" />
            <h2 className="section-eyebrow-text">BỘ SƯU TẬP CHỌN LỌC</h2>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("bestseller")}
              className={`px-4 py-1.5 rounded-[18px] text-xs font-bold transition-colors ${
                activeTab === "bestseller"
                  ? "bg-black text-white"
                  : "bg-[#f0f0f0] text-black hover:bg-[#d8d8d8]"
              }`}
            >
              Bán chạy nhất
            </button>
            <button
              onClick={() => setActiveTab("new")}
              className={`px-4 py-1.5 rounded-[18px] text-xs font-bold transition-colors ${
                activeTab === "new"
                  ? "bg-black text-white"
                  : "bg-[#f0f0f0] text-black hover:bg-[#d8d8d8]"
              }`}
            >
              Hàng mới về
            </button>
            <button
              onClick={() => setActiveTab("featured")}
              className={`px-4 py-1.5 rounded-[18px] text-xs font-bold transition-colors ${
                activeTab === "featured"
                  ? "bg-black text-white"
                  : "bg-[#f0f0f0] text-black hover:bg-[#d8d8d8]"
              }`}
            >
              Nổi bật
            </button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {tabProducts.map((p) => (
            <ProductCard key={p.id} {...p} />
          ))}
        </div>
      </section>

      {/* 5. VOUCHER & PROMO TICKETS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="section-eyebrow-lockup mb-6">
          <span className="section-eyebrow-bar" />
          <h2 className="section-eyebrow-text">MÃ GIẢM GIÁ ĐỘC QUYỀN</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Coupon 1 */}
          <div className="bg-[#f8f8f8] border-2 border-dashed border-[#d8d8d8] rounded-[10px] p-5 flex flex-col justify-between hover:border-black transition-colors">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="bg-[#fa9000] text-white text-[10px] font-black px-2 py-0.5 rounded-[2px] uppercase">
                  KHÁCH HÀNG MỚI
                </span>
                <span className="text-xs text-[#595959]">HSD: 31/12/2026</span>
              </div>
              <h3 className="font-bold text-lg text-black">Giảm 10% Tối Đa 200.000₫</h3>
              <p className="text-xs text-[#595959] mt-1">
                Áp dụng cho đơn hàng đầu tiên từ 500.000₫
              </p>
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#d8d8d8]">
              <span className="font-mono font-black text-sm text-black tracking-wider">
                WELCOME10
              </span>
              <button
                onClick={() => handleCopyCode("WELCOME10")}
                className="btn-pill-dark text-xs py-1.5 px-3 flex items-center gap-1.5"
              >
                {copiedCode === "WELCOME10" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Đã lưu</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Lưu mã</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Coupon 2 */}
          <div className="bg-[#f8f8f8] border-2 border-dashed border-[#d8d8d8] rounded-[10px] p-5 flex flex-col justify-between hover:border-black transition-colors">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="bg-[#c31833] text-white text-[10px] font-black px-2 py-0.5 rounded-[2px] uppercase">
                  FLASH SALE
                </span>
                <span className="text-xs text-[#595959]">HSD: 31/12/2026</span>
              </div>
              <h3 className="font-bold text-lg text-black">Giảm Ngay 100.000₫</h3>
              <p className="text-xs text-[#595959] mt-1">
                Áp dụng cho mọi đơn hàng từ 1.000.000₫
              </p>
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#d8d8d8]">
              <span className="font-mono font-black text-sm text-black tracking-wider">
                FLASHSALE100K
              </span>
              <button
                onClick={() => handleCopyCode("FLASHSALE100K")}
                className="btn-pill-dark text-xs py-1.5 px-3 flex items-center gap-1.5"
              >
                {copiedCode === "FLASHSALE100K" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Đã lưu</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Lưu mã</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Coupon 3 */}
          <div className="bg-[#f8f8f8] border-2 border-dashed border-[#d8d8d8] rounded-[10px] p-5 flex flex-col justify-between hover:border-black transition-colors">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="bg-[#dba200] text-white text-[10px] font-black px-2 py-0.5 rounded-[2px] uppercase">
                  VIP LUXURY
                </span>
                <span className="text-xs text-[#595959]">HSD: 31/12/2026</span>
              </div>
              <h3 className="font-bold text-lg text-black">Giảm Ngay 500.000₫</h3>
              <p className="text-xs text-[#595959] mt-1">
                Áp dụng cho đơn hàng công nghệ từ 10.000.000₫
              </p>
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#d8d8d8]">
              <span className="font-mono font-black text-sm text-black tracking-wider">
                VIP500K
              </span>
              <button
                onClick={() => handleCopyCode("VIP500K")}
                className="btn-pill-dark text-xs py-1.5 px-3 flex items-center gap-1.5"
              >
                {copiedCode === "VIP500K" ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Đã lưu</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Lưu mã</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. BRAND SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="section-eyebrow-lockup mb-6">
          <span className="section-eyebrow-bar" />
          <h2 className="section-eyebrow-text">THƯƠNG HIỆU HỢP TÁC CHIẾN LƯỢC</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Link
            href="/products?brand=apple"
            className="p-6 bg-white border border-[#d8d8d8] rounded-[10px] text-center hover:border-black transition-colors"
          >
            <span className="font-bold text-xl text-black block">Apple</span>
            <span className="text-xs text-[#595959] mt-1 block">Authorized Reseller</span>
          </Link>
          <Link
            href="/products?brand=sony"
            className="p-6 bg-white border border-[#d8d8d8] rounded-[10px] text-center hover:border-black transition-colors"
          >
            <span className="font-bold text-xl text-black block">Sony</span>
            <span className="text-xs text-[#595959] mt-1 block">Official Hi-Res Audio</span>
          </Link>
          <Link
            href="/products?brand=marshall"
            className="p-6 bg-white border border-[#d8d8d8] rounded-[10px] text-center hover:border-black transition-colors"
          >
            <span className="font-bold text-xl text-black block">Marshall</span>
            <span className="text-xs text-[#595959] mt-1 block">Ash Authorized Vietnam</span>
          </Link>
          <Link
            href="/products?brand=garmin"
            className="p-6 bg-white border border-[#d8d8d8] rounded-[10px] text-center hover:border-black transition-colors"
          >
            <span className="font-bold text-xl text-black block">Garmin</span>
            <span className="text-xs text-[#595959] mt-1 block">Premium GPS Sports</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
