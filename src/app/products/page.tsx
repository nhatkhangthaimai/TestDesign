"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  Filter,
  Grid,
  List,
  Search,
  X,
  SlidersHorizontal,
  Star,
  ShoppingBag,
  Check,
} from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import { formatVND, calculateDiscount } from "@/lib/utils";
import { useCart } from "@/context/CartContext";

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
  variants?: Array<{
    id: string;
    name: string;
    sku: string;
    price: number;
    stock: number;
  }>;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  _count?: { products: number };
}

interface Brand {
  id: string;
  name: string;
  slug: string;
  _count?: { products: number };
}

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Quick View Modal State
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [quickViewQty, setQuickViewQty] = useState(1);
  const { addToCart } = useCart();

  // Read initial query params
  const currentCategory = searchParams.get("category") || "";
  const currentBrand = searchParams.get("brand") || "";
  const currentFilter = searchParams.get("filter") || "";
  const currentSort = searchParams.get("sort") || "newest";
  const currentSearch = searchParams.get("search") || "";
  const currentMinPrice = searchParams.get("minPrice") || "";
  const currentMaxPrice = searchParams.get("maxPrice") || "";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 1,
  });

  // URL Query Updater helper
  const updateQuery = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      // Reset page to 1 on filter change if not specifically updating page
      if (!updates.page) {
        params.delete("page");
      }
      router.push(`/products?${params.toString()}`);
    },
    [router, searchParams]
  );

  // Fetch products
  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        const query = searchParams.toString();
        const res = await fetch(`/api/products?${query}`);
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || []);
          setPagination(data.pagination || { total: 0, page: 1, limit: 12, totalPages: 1 });
        }
      } catch (err) {
        console.error("Error loading products:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, [searchParams]);

  // Fetch categories & brands once
  useEffect(() => {
    async function loadMeta() {
      try {
        const [catRes, brandRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/brands"),
        ]);
        if (catRes.ok) {
          const c = await catRes.json();
          setCategories(c.categories || []);
        }
        if (brandRes.ok) {
          const b = await brandRes.json();
          setBrands(b.brands || []);
        }
      } catch (err) {
        console.error("Error loading categories/brands:", err);
      }
    }
    loadMeta();
  }, []);

  const openQuickView = async (slug: string) => {
    try {
      const res = await fetch(`/api/products/${slug}`);
      if (res.ok) {
        const data = await res.json();
        setQuickViewProduct(data.product);
        setQuickViewQty(1);
      }
    } catch {
      // Ignore error
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Page Header Lockup */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#d8d8d8]">
        <div>
          <div className="section-eyebrow-lockup">
            <span className="section-eyebrow-bar" />
            <h1 className="section-eyebrow-text">DANH MỤC SẢN PHẨM</h1>
          </div>
          <p className="text-sm text-[#595959] mt-1">
            Hiển thị {pagination.total} sản phẩm công nghệ & âm thanh cao cấp
          </p>
        </div>

        {/* View Mode & Mobile Filter Trigger */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden btn-pill-outline text-xs py-1.5 px-3 flex items-center gap-1.5"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Bộ lọc</span>
          </button>

          <div className="flex items-center border border-[#d8d8d8] rounded-[6px] overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 transition-colors ${
                viewMode === "grid" ? "bg-black text-white" : "text-[#595959] hover:text-black"
              }`}
              title="Xem dạng lưới"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 transition-colors ${
                viewMode === "list" ? "bg-black text-white" : "text-[#595959] hover:text-black"
              }`}
              title="Xem dạng danh sách"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#595959] hidden sm:inline">Sắp xếp:</span>
            <select
              value={currentSort}
              onChange={(e) => updateQuery({ sort: e.target.value })}
              className="text-xs border border-[#d8d8d8] rounded-[6px] px-3 py-2 bg-white text-black outline-none font-medium"
            >
              <option value="newest">Mới nhất</option>
              <option value="price_asc">Giá: Thấp đến Cao</option>
              <option value="price_desc">Giá: Cao đến Thấp</option>
              <option value="best_selling">Bán chạy nhất</option>
              <option value="rating">Đánh giá cao nhất</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid with Sidebar Filter */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar Filter (Desktop) */}
        <aside className="hidden lg:block space-y-6">
          {/* Active Filter Badges */}
          {(currentCategory || currentBrand || currentFilter || currentSearch) && (
            <div className="p-4 bg-[#f8f8f8] border border-[#d8d8d8] rounded-[10px] space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-black">
                <span>ĐANG LỌC:</span>
                <button
                  onClick={() => router.push("/products")}
                  className="text-[#c31833] hover:underline"
                >
                  Xóa tất cả
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {currentCategory && (
                  <span className="inline-flex items-center gap-1 bg-white border border-[#d8d8d8] px-2 py-0.5 rounded-[4px] text-xs">
                    {categories.find((c) => c.slug === currentCategory)?.name || currentCategory}
                    <button onClick={() => updateQuery({ category: null })}>
                      <X className="w-3 h-3 text-[#595959]" />
                    </button>
                  </span>
                )}
                {currentBrand && (
                  <span className="inline-flex items-center gap-1 bg-white border border-[#d8d8d8] px-2 py-0.5 rounded-[4px] text-xs">
                    Thương hiệu: {currentBrand}
                    <button onClick={() => updateQuery({ brand: null })}>
                      <X className="w-3 h-3 text-[#595959]" />
                    </button>
                  </span>
                )}
                {currentSearch && (
                  <span className="inline-flex items-center gap-1 bg-white border border-[#d8d8d8] px-2 py-0.5 rounded-[4px] text-xs">
                    Từ khóa: &ldquo;{currentSearch}&rdquo;
                    <button onClick={() => updateQuery({ search: null })}>
                      <X className="w-3 h-3 text-[#595959]" />
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Special Collections */}
          <div className="space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-black">
              Bộ Sưu Tập
            </h3>
            <div className="flex flex-col gap-1.5 text-sm">
              <button
                onClick={() => updateQuery({ filter: null })}
                className={`text-left py-1 px-2 rounded-[4px] text-xs transition-colors ${
                  !currentFilter ? "bg-black text-white font-bold" : "text-[#595959] hover:text-black"
                }`}
              >
                Tất cả sản phẩm
              </button>
              <button
                onClick={() => updateQuery({ filter: "flash_sale" })}
                className={`text-left py-1 px-2 rounded-[4px] text-xs transition-colors flex items-center justify-between ${
                  currentFilter === "flash_sale"
                    ? "bg-[#c31833] text-white font-bold"
                    : "text-[#c31833] font-bold hover:bg-[#c31833]/10"
                }`}
              >
                <span>Flash Sale Giờ Vàng</span>
                <span className="w-2 h-2 rounded-full bg-[#c31833] animate-pulse" />
              </button>
              <button
                onClick={() => updateQuery({ filter: "best_seller" })}
                className={`text-left py-1 px-2 rounded-[4px] text-xs transition-colors ${
                  currentFilter === "best_seller"
                    ? "bg-black text-white font-bold"
                    : "text-[#595959] hover:text-black"
                }`}
              >
                Bán chạy nhất
              </button>
              <button
                onClick={() => updateQuery({ filter: "new" })}
                className={`text-left py-1 px-2 rounded-[4px] text-xs transition-colors ${
                  currentFilter === "new"
                    ? "bg-black text-white font-bold"
                    : "text-[#595959] hover:text-black"
                }`}
              >
                Hàng mới về
              </button>
            </div>
          </div>

          {/* Categories List */}
          <div className="space-y-3 pt-4 border-t border-[#d8d8d8]">
            <h3 className="font-bold text-xs uppercase tracking-wider text-black">
              Danh Mục Sản Phẩm
            </h3>
            <div className="space-y-1.5 text-xs">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() =>
                    updateQuery({ category: currentCategory === c.slug ? null : c.slug })
                  }
                  className={`w-full flex items-center justify-between py-1 px-2 rounded-[4px] transition-colors ${
                    currentCategory === c.slug
                      ? "bg-black text-white font-bold"
                      : "text-[#595959] hover:text-black hover:bg-[#f0f0f0]"
                  }`}
                >
                  <span>{c.name}</span>
                  {c._count && <span className="text-[10px] opacity-75">({c._count.products})</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Brands List */}
          <div className="space-y-3 pt-4 border-t border-[#d8d8d8]">
            <h3 className="font-bold text-xs uppercase tracking-wider text-black">
              Thương Hiệu
            </h3>
            <div className="space-y-1.5 text-xs">
              {brands.map((b) => (
                <button
                  key={b.id}
                  onClick={() => updateQuery({ brand: currentBrand === b.slug ? null : b.slug })}
                  className={`w-full flex items-center justify-between py-1 px-2 rounded-[4px] transition-colors ${
                    currentBrand === b.slug
                      ? "bg-black text-white font-bold"
                      : "text-[#595959] hover:text-black hover:bg-[#f0f0f0]"
                  }`}
                >
                  <span>{b.name}</span>
                  {b._count && <span className="text-[10px] opacity-75">({b._count.products})</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-3 pt-4 border-t border-[#d8d8d8]">
            <h3 className="font-bold text-xs uppercase tracking-wider text-black">
              Mức Giá (VND)
            </h3>
            <div className="space-y-1.5 text-xs">
              <button
                onClick={() => updateQuery({ minPrice: null, maxPrice: "10000000" })}
                className="w-full text-left py-1 px-2 text-[#595959] hover:text-black rounded"
              >
                Dưới 10.000.000₫
              </button>
              <button
                onClick={() => updateQuery({ minPrice: "10000000", maxPrice: "30000000" })}
                className="w-full text-left py-1 px-2 text-[#595959] hover:text-black rounded"
              >
                10.000.000₫ - 30.000.000₫
              </button>
              <button
                onClick={() => updateQuery({ minPrice: "30000000", maxPrice: null })}
                className="w-full text-left py-1 px-2 text-[#595959] hover:text-black rounded"
              >
                Trên 30.000.000₫
              </button>
            </div>
          </div>
        </aside>

        {/* Right Product Grid */}
        <div className="lg:col-span-3 space-y-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-80 bg-[#f0f0f0] animate-pulse rounded-[10px]" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="border border-[#d8d8d8] rounded-[10px] p-12 text-center bg-[#fdfdfd]">
              <Search className="w-12 h-12 text-[#595959] mx-auto mb-3" />
              <h3 className="font-bold text-lg text-black">Không tìm thấy sản phẩm phù hợp</h3>
              <p className="text-sm text-[#595959] mt-1 mb-4">
                Hãy thử thay đổi từ khóa tìm kiếm hoặc bỏ các tiêu chí lọc đang chọn
              </p>
              <button
                onClick={() => router.push("/products")}
                className="btn-pill-dark text-xs"
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} {...p} onQuickView={openQuickView} />
              ))}
            </div>
          ) : (
            /* List View */
            <div className="space-y-4">
              {products.map((p) => {
                const discount = calculateDiscount(p.regularPrice, p.salePrice);
                return (
                  <div
                    key={p.id}
                    className="p-4 bg-white border border-[#d8d8d8] rounded-[10px] flex flex-col sm:flex-row gap-4 items-center justify-between hover:border-black transition-colors"
                  >
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="relative w-24 h-24 bg-[#f8f8f8] rounded-[6px] overflow-hidden shrink-0">
                        {p.images[0] && (
                          <Image
                            src={p.images[0].url}
                            alt={p.title}
                            fill
                            className="object-cover"
                            sizes="96px"
                          />
                        )}
                      </div>
                      <div>
                        <span className="text-[11px] font-mono text-[#595959] uppercase block">
                          {p.sku}
                        </span>
                        <h3 className="font-bold text-base text-black">{p.title}</h3>
                        <div className="flex items-center gap-1.5 mt-1 text-amber-500 text-xs">
                          <Star className="w-3.5 h-3.5 fill-amber-500" />
                          <span className="font-bold text-black">{p.ratingsAvg.toFixed(1)}</span>
                          <span className="text-[#595959]">({p.ratingsCount} đánh giá)</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 self-end sm:self-auto">
                      <div className="text-right">
                        <div className="font-bold text-base text-black">
                          {formatVND(p.salePrice ?? p.regularPrice)}
                        </div>
                        {discount > 0 && (
                          <div className="text-xs text-[#595959] line-through">
                            {formatVND(p.regularPrice)}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() =>
                          addToCart({
                            productId: p.id,
                            title: p.title,
                            price: p.salePrice ?? p.regularPrice,
                            quantity: 1,
                            imageUrl: p.images[0]?.url || "",
                            sku: p.sku,
                            stock: p.stock,
                          })
                        }
                        className="btn-pill-dark text-xs py-2 px-4 whitespace-nowrap"
                      >
                        Thêm vào giỏ
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-8 border-t border-[#d8d8d8]">
              {Array.from({ length: pagination.totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                const isActive = pageNum === pagination.page;
                return (
                  <button
                    key={pageNum}
                    onClick={() => updateQuery({ page: String(pageNum) })}
                    className={`w-9 h-9 rounded-[6px] text-xs font-bold transition-colors ${
                      isActive
                        ? "bg-black text-white"
                        : "bg-white border border-[#d8d8d8] text-black hover:bg-[#f0f0f0]"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* QUICK VIEW MODAL */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setQuickViewProduct(null)}
          />
          <div className="relative bg-white border border-[#d8d8d8] rounded-[10px] shadow-2xl max-w-2xl w-full p-6 z-10 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-4 right-4 text-[#595959] hover:text-black p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              <div className="relative aspect-square w-full bg-[#f8f8f8] rounded-[8px] overflow-hidden border border-[#d8d8d8]">
                {quickViewProduct.images[0] && (
                  <Image
                    src={quickViewProduct.images[0].url}
                    alt={quickViewProduct.title}
                    fill
                    className="object-cover"
                    sizes="300px"
                  />
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-mono text-[#595959] uppercase block">
                    SKU: {quickViewProduct.sku}
                  </span>
                  <h3 className="font-bold text-lg text-black mt-1 leading-snug">
                    {quickViewProduct.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="font-bold text-xl text-black">
                      {formatVND(quickViewProduct.salePrice ?? quickViewProduct.regularPrice)}
                    </span>
                    {quickViewProduct.salePrice &&
                      quickViewProduct.salePrice < quickViewProduct.regularPrice && (
                        <span className="text-xs text-[#595959] line-through">
                          {formatVND(quickViewProduct.regularPrice)}
                        </span>
                      )}
                  </div>
                </div>

                <p className="text-xs text-[#595959] line-clamp-3">
                  {quickViewProduct.title} - Sản phẩm chính ngạch, bảo hành chính hãng 12 tháng tại Việt Nam.
                </p>

                <div className="flex items-center gap-3 pt-2">
                  <div className="flex items-center border border-[#d8d8d8] rounded-[6px]">
                    <button
                      onClick={() => setQuickViewQty(Math.max(1, quickViewQty - 1))}
                      className="px-2.5 py-1 text-sm font-bold"
                    >
                      -
                    </button>
                    <span className="px-3 text-xs font-bold">{quickViewQty}</span>
                    <button
                      onClick={() => setQuickViewQty(quickViewQty + 1)}
                      className="px-2.5 py-1 text-sm font-bold"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      addToCart({
                        productId: quickViewProduct.id,
                        title: quickViewProduct.title,
                        price: quickViewProduct.salePrice ?? quickViewProduct.regularPrice,
                        quantity: quickViewQty,
                        imageUrl: quickViewProduct.images[0]?.url || "",
                        sku: quickViewProduct.sku,
                        stock: quickViewProduct.stock,
                      });
                      setQuickViewProduct(null);
                    }}
                    className="btn-pill-dark text-xs flex-1 py-2.5"
                  >
                    Thêm vào giỏ
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center">Đang tải sản phẩm...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
