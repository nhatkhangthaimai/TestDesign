"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, Loader2, ArrowRight, Tag, TrendingUp, X } from "lucide-react";
import { formatVND, calculateDiscount } from "@/lib/utils";

interface ProductSuggestion {
  id: string;
  title: string;
  slug: string;
  regularPrice: number;
  salePrice?: number | null;
  sku: string;
  stock: number;
  images?: Array<{ url: string; altText?: string | null }>;
  category?: { name: string; slug: string } | null;
  brand?: { name: string; slug: string; logoUrl?: string | null } | null;
}

interface SearchAutocompleteProps {
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  onSearchSubmit?: () => void;
  autoFocus?: boolean;
}

const POPULAR_SEARCHES = [
  "Bàn phím cơ",
  "iPhone 16 Pro Max",
  "Sony WH-1000XM5",
  "Marshall Stanmore III",
  "MacBook Pro M4",
  "Garmin Fenix 8",
];

export default function SearchAutocomplete({
  placeholder = "Tìm kiếm sản phẩm, thương hiệu (iPhone, Sony, Marshall)...",
  className = "",
  inputClassName = "text-input-capsule pr-10 text-sm",
  onSearchSubmit,
  autoFocus = false,
}: SearchAutocompleteProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Debounced search fetch
  useEffect(() => {
    const trimmed = query.trim();

    if (trimmed.length < 2) {
      setSuggestions([]);
      setTotalCount(0);
      setIsLoading(false);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(trimmed)}&limit=6`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.products || []);
          setTotalCount(data.pagination?.total || (data.products ? data.products.length : 0));
        } else {
          setSuggestions([]);
          setTotalCount(0);
        }
      } catch (err) {
        console.error("Search suggestion error:", err);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
        setHasSearched(true);
      }
    }, 280);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      setIsOpen(false);
      router.push(`/products?search=${encodeURIComponent(trimmed)}`);
      onSearchSubmit?.();
    }
  };

  const handleSelectProduct = (slug: string) => {
    setIsOpen(false);
    router.push(`/products/${slug}`);
    onSearchSubmit?.();
  };

  const handleSelectPopular = (term: string) => {
    setQuery(term);
    setIsOpen(false);
    router.push(`/products?search=${encodeURIComponent(term)}`);
    onSearchSubmit?.();
  };

  const clearQuery = () => {
    setQuery("");
    setSuggestions([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const highlightMatch = (text: string, searchWord: string) => {
    const term = searchWord.trim();
    if (!term) return text;
    try {
      const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
      const parts = text.split(regex);
      return parts.map((part, i) =>
        regex.test(part) ? (
          <span key={i} className="text-[#fa9000] font-bold bg-[#fa9000]/10 px-0.5 rounded">
            {part}
          </span>
        ) : (
          part
        )
      );
    } catch {
      return text;
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative w-full flex items-center">
        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          autoFocus={autoFocus}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") setIsOpen(false);
          }}
          className={inputClassName}
        />

        {/* Clear or loading indicator */}
        <div className="absolute right-3.5 flex items-center gap-1.5">
          {isLoading && (
            <Loader2 className="w-4 h-4 text-[#fa9000] animate-spin" />
          )}

          {query && !isLoading && (
            <button
              type="button"
              onClick={clearQuery}
              className="text-[#999] hover:text-black p-0.5 transition-colors"
              title="Xóa từ khóa"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="submit"
            className="text-[#595959] hover:text-[#fa9000] transition-colors p-0.5"
            title="Tìm kiếm"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* DROPDOWN AUTOCOMPLETE POPUP */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#d8d8d8] shadow-2xl rounded-xl overflow-hidden z-50 animate-in fade-in-50 slide-in-from-top-2 duration-150 max-h-[85vh] flex flex-col">
          {/* 1. STATE: LOADING */}
          {isLoading && suggestions.length === 0 && (
            <div className="p-6 flex flex-col items-center justify-center text-center text-[#595959]">
              <Loader2 className="w-6 h-6 text-[#fa9000] animate-spin mb-2" />
              <p className="text-xs font-medium">Đang tìm kiếm sản phẩm cho &ldquo;{query}&rdquo;...</p>
            </div>
          )}

          {/* 2. STATE: HAS SEARCH RESULTS */}
          {!isLoading && suggestions.length > 0 && (
            <div className="flex flex-col overflow-y-auto">
              {/* Header */}
              <div className="px-4 py-2.5 bg-[#f8f9fa] border-b border-[#eee] flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#100e2f] flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#fa9000]" />
                  Gợi Ý Sản Phẩm ({totalCount})
                </span>
                <span className="text-[11px] text-[#777]">Nhấn để xem chi tiết</span>
              </div>

              {/* Items List */}
              <div className="divide-y divide-[#f2f2f2]">
                {suggestions.map((product) => {
                  const regularPrice = product.regularPrice;
                  const salePrice = product.salePrice;
                  const discount = calculateDiscount(regularPrice, salePrice);
                  const imgUrl =
                    product.images?.[0]?.url ||
                    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=200&q=80";

                  return (
                    <div
                      key={product.id}
                      onClick={() => handleSelectProduct(product.slug)}
                      className="px-4 py-3 flex items-center gap-3.5 hover:bg-[#fff9f2] transition-colors cursor-pointer group"
                    >
                      {/* Product Thumbnail */}
                      <div className="relative w-12 h-12 rounded-lg bg-[#f0f0f0] border border-[#e5e5e5] overflow-hidden shrink-0">
                        <Image
                          src={imgUrl}
                          alt={product.title}
                          fill
                          sizes="48px"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          {product.category && (
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-[#100e2f]/5 text-[#100e2f] px-1.5 py-0.5 rounded">
                              {product.category.name}
                            </span>
                          )}
                          {product.brand && (
                            <span className="text-[10px] font-semibold text-[#777]">
                              {product.brand.name}
                            </span>
                          )}
                        </div>

                        <p className="text-xs sm:text-sm font-bold text-[#100e2f] truncate group-hover:text-[#fa9000] transition-colors">
                          {highlightMatch(product.title, query)}
                        </p>

                        {/* Price & Stock */}
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs sm:text-sm font-black text-[#c31833]">
                            {formatVND(salePrice ?? regularPrice)}
                          </span>

                          {salePrice && salePrice < regularPrice && (
                            <>
                              <span className="text-[11px] text-[#999] line-through">
                                {formatVND(regularPrice)}
                              </span>
                              <span className="text-[10px] font-black text-[#c31833] bg-[#c31833]/10 px-1 py-0.2 rounded">
                                -{discount}%
                              </span>
                            </>
                          )}

                          {product.stock > 0 ? (
                            <span className="text-[10px] text-[#16a34a] font-medium ml-auto hidden sm:inline">
                              ● Còn hàng
                            </span>
                          ) : (
                            <span className="text-[10px] text-[#dc2626] font-medium ml-auto hidden sm:inline">
                              Hết hàng
                            </span>
                          )}
                        </div>
                      </div>

                      <ArrowRight className="w-4 h-4 text-[#ccc] group-hover:text-[#fa9000] group-hover:translate-x-0.5 transition-all shrink-0" />
                    </div>
                  );
                })}
              </div>

              {/* Footer View All CTA */}
              <button
                type="button"
                onClick={() => handleSubmit()}
                className="w-full py-3 px-4 bg-[#f8f9fa] hover:bg-[#100e2f] text-[#100e2f] hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors border-t border-[#eee]"
              >
                <span>Xem tất cả kết quả cho &ldquo;{query.trim()}&rdquo; ({totalCount} sản phẩm)</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#fa9000]" />
              </button>
            </div>
          )}

          {/* 3. STATE: EMPTY RESULTS */}
          {!isLoading && hasSearched && suggestions.length === 0 && query.trim().length >= 2 && (
            <div className="p-6 text-center">
              <div className="w-10 h-10 rounded-full bg-[#f5f5f5] flex items-center justify-center mx-auto mb-2 text-[#999]">
                <Search className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-[#100e2f]">
                Không tìm thấy sản phẩm nào khớp với &ldquo;{query}&rdquo;
              </p>
              <p className="text-[11px] text-[#777] mt-1">
                Vui lòng kiểm tra lại chính tả hoặc thử tìm kiếm với từ khóa khác.
              </p>
              <div className="mt-4 pt-3 border-t border-[#f0f0f0]">
                <p className="text-[11px] font-bold text-[#555] mb-2 flex items-center justify-center gap-1">
                  <TrendingUp className="w-3 h-3 text-[#fa9000]" />
                  Gợi ý từ khóa phổ biến:
                </p>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {POPULAR_SEARCHES.slice(0, 4).map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => handleSelectPopular(term)}
                      className="text-[11px] bg-[#f5f5f5] hover:bg-[#fa9000] hover:text-white text-[#444] px-2.5 py-1 rounded-full font-medium transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 4. STATE: INITIAL / TRENDING SEARCHES (WHEN QUERY IS EMPTY OR < 2 CHARS) */}
          {query.trim().length < 2 && (
            <div className="p-4">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#555] uppercase tracking-wider mb-2.5">
                <TrendingUp className="w-3.5 h-3.5 text-[#fa9000]" />
                Tìm Kiếm Phổ Biến
              </div>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SEARCHES.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => handleSelectPopular(term)}
                    className="text-xs bg-[#f8f9fa] hover:bg-[#100e2f] hover:text-white text-[#333] px-3 py-1.5 rounded-full font-medium border border-[#e5e5e5] transition-all flex items-center gap-1.5 group"
                  >
                    <Search className="w-3 h-3 text-[#999] group-hover:text-[#fa9000]" />
                    <span>{term}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

