"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  ShoppingBag,
  User as UserIcon,
  Menu,
  X,
  ShieldCheck,
  LogOut,
  Package,
  Heart,
  ChevronDown,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export default function Header() {
  const router = useRouter();
  const { itemCount, setIsCartOpen } = useCart();
  const { user, logout, isAdmin } = useAuth();

  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#d8d8d8] shadow-xs">
      {/* Top Utility Bar */}
      <div className="bg-[#100e2f] text-white text-xs py-1.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-bold tracking-wide text-[#dba200]">
              <span className="w-2 h-2 rounded-full bg-[#fa9000] animate-ping" />
              HOTLINE TƯ VẤN VIP: 1900 6868
            </span>
            <span className="hidden md:inline text-white/60">|</span>
            <span className="hidden md:inline text-white/80">
              Miễn phí giao hàng toàn quốc cho đơn từ 500.000₫
            </span>
          </div>

          <div className="flex items-center gap-4">
            {isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-1.5 bg-[#272967] hover:bg-[#343785] text-[#dba200] px-2.5 py-0.5 rounded text-xs font-bold border border-[#dba200]/40 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>TRANG QUẢN TRỊ ADMIN</span>
              </Link>
            )}
            <Link href="/order-tracking" className="text-white/80 hover:text-white transition-colors">
              Tra cứu đơn hàng
            </Link>
          </div>
        </div>
      </div>

      {/* Main Masthead - DESIGN.md nav-bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5">
        <div className="flex items-center justify-between gap-4 md:gap-8">
          {/* Logo Block - DESIGN.md logo-block */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 bg-[#fa9000] flex items-center justify-center font-black text-white text-xl tracking-tighter shadow-xs">
              AJ
            </div>
            <div>
              <span className="font-bold text-xl md:text-2xl text-black tracking-tight block leading-none">
                COMMERCE
              </span>
              <span className="text-[10px] tracking-widest text-[#595959] uppercase block font-semibold mt-0.5">
                Premium Editorial Store
              </span>
            </div>
          </Link>

          {/* Desktop Search Capsule - DESIGN.md text-input */}
          <form
            onSubmit={handleSearch}
            className="hidden lg:flex flex-1 max-w-lg items-center relative"
          >
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm, thương hiệu (iPhone, Sony, Marshall)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-input-capsule pr-10 text-sm"
            />
            <button
              type="submit"
              className="absolute right-3.5 text-[#595959] hover:text-black transition-colors"
              title="Tìm kiếm"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Nav Actions Right */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Live Flash Sale Badge Pill */}
            <Link
              href="/products?filter=flash_sale"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-[18px] border border-[#c31833] text-[#c31833] text-xs font-black hover:bg-[#c31833] hover:text-white transition-all duration-200"
            >
              <span className="live-dot" />
              <span>FLASH SALE</span>
            </Link>

            {/* Cart Button Pill */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="btn-pill-dark relative py-2 px-4 text-sm"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Giỏ hàng</span>
              {itemCount > 0 && (
                <span className="bg-[#fa9000] text-black font-black text-xs px-2 py-0.5 rounded-full">
                  {itemCount}
                </span>
              )}
            </button>

            {/* User Account Dropdown / Auth */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 border border-[#d8d8d8] rounded-[18px] hover:border-black transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-[#fa9000] text-white flex items-center justify-center font-bold text-xs uppercase">
                    {user.name.charAt(0)}
                  </div>
                  <span className="text-xs font-bold text-black max-w-[90px] truncate hidden md:inline">
                    {user.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#595959]" />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-[#d8d8d8] shadow-xl rounded-[10px] py-2 z-50">
                    <div className="px-4 py-2 border-b border-[#f0f0f0]">
                      <p className="font-bold text-xs text-black">{user.name}</p>
                      <p className="text-[11px] text-[#595959] truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] bg-[#f0f0f0] px-2 py-0.5 rounded font-bold uppercase text-[#595959]">
                        {user.role}
                      </span>
                    </div>

                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-[#c31833] hover:bg-[#f0f0f0]"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        Trang Quản Trị Admin
                      </Link>
                    )}

                    <Link
                      href="/account"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-black hover:bg-[#f0f0f0]"
                    >
                      <UserIcon className="w-4 h-4 text-[#595959]" />
                      Hồ Sơ Của Tôi
                    </Link>

                    <Link
                      href="/account/orders"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-black hover:bg-[#f0f0f0]"
                    >
                      <Package className="w-4 h-4 text-[#595959]" />
                      Đơn Hàng Đã Mua
                    </Link>

                    <Link
                      href="/account/wishlist"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-black hover:bg-[#f0f0f0]"
                    >
                      <Heart className="w-4 h-4 text-[#595959]" />
                      Danh Sách Yêu Thích
                    </Link>

                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-[#c31833] hover:bg-[#f0f0f0] border-t border-[#f0f0f0]"
                    >
                      <LogOut className="w-4 h-4" />
                      Đăng Xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="text-xs font-bold text-black hover:text-[#fa9000] transition-colors py-2 px-3"
                >
                  Đăng Nhập
                </Link>
                <Link
                  href="/register"
                  className="hidden sm:inline-flex btn-pill-outline text-xs py-1.5 px-3.5"
                >
                  Đăng Ký
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-1.5 text-black hover:bg-[#f0f0f0] rounded-md"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <form onSubmit={handleSearch} className="mt-3 lg:hidden relative">
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-input-capsule pr-10 text-xs py-2"
          />
          <button
            type="submit"
            className="absolute right-3.5 top-2.5 text-[#595959]"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Primary Category Navigation Bar */}
      <nav className="bg-white border-t border-[#d8d8d8] hidden lg:block">
        <div className="max-w-7xl mx-auto px-8 flex items-center justify-between">
          <div className="flex items-center gap-8 text-sm font-semibold py-2.5">
            <Link href="/" className="text-black hover:text-[#fa9000] transition-colors">
              Trang Chủ
            </Link>
            <Link href="/products" className="text-black hover:text-[#fa9000] transition-colors">
              Tất Cả Sản Phẩm
            </Link>
            <Link
              href="/products?category=dien-thoai-cong-nghe"
              className="text-[#595959] hover:text-black transition-colors"
            >
              Điện Thoại & Công Nghệ
            </Link>
            <Link
              href="/products?category=am-thanh-hi-end"
              className="text-[#595959] hover:text-black transition-colors"
            >
              Âm Thanh Hi-End
            </Link>
            <Link
              href="/products?category=dong-ho-smartwatch"
              className="text-[#595959] hover:text-black transition-colors"
            >
              Đồng Hồ & Smartwatch
            </Link>
            <Link
              href="/products?category=gia-dung-smart-living"
              className="text-[#595959] hover:text-black transition-colors"
            >
              Gia Dụng Thông Minh
            </Link>
            <Link
              href="/products?filter=flash_sale"
              className="flex items-center gap-1.5 text-[#c31833] font-bold"
            >
              <span className="w-2 h-2 rounded-full bg-[#c31833] animate-pulse" />
              Flash Sale Đặc Quyền
            </Link>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#595959]">
            <span className="font-bold uppercase text-[11px] text-black">HOT VOUCHER:</span>
            <span className="bg-[#f0f0f0] px-2 py-0.5 rounded font-mono font-bold text-black">
              WELCOME10
            </span>
            <span>(Giảm 10%)</span>
          </div>
        </div>
      </nav>

      {/* Trending Bar - DESIGN.md Trending Strip */}
      <div className="bg-[#f0f0f0] border-t border-[#d8d8d8] py-1.5 px-4 sm:px-8 overflow-x-auto text-xs">
        <div className="max-w-7xl mx-auto flex items-center gap-4 whitespace-nowrap">
          <span className="font-black text-black uppercase tracking-wider text-[11px]">
            XU HƯỚNG:
          </span>
          <Link
            href="/products?search=iPhone"
            className="text-[#595959] hover:text-black hover:underline"
          >
            iPhone 16 Pro Max
          </Link>
          <span className="text-[#d8d8d8]">•</span>
          <Link
            href="/products?search=Sony"
            className="text-[#595959] hover:text-black hover:underline"
          >
            Tai nghe Sony WH-1000XM5
          </Link>
          <span className="text-[#d8d8d8]">•</span>
          <Link
            href="/products?search=Marshall"
            className="text-[#595959] hover:text-black hover:underline"
          >
            Loa Marshall Stanmore III
          </Link>
          <span className="text-[#d8d8d8]">•</span>
          <Link
            href="/products?search=Garmin"
            className="text-[#595959] hover:text-black hover:underline"
          >
            Garmin Fenix 8 Sapphire
          </Link>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-[#d8d8d8] p-4 space-y-3">
          <div className="flex flex-col gap-2 font-medium text-sm">
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-1.5 text-black hover:text-[#fa9000]"
            >
              Trang Chủ
            </Link>
            <Link
              href="/products"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-1.5 text-black hover:text-[#fa9000]"
            >
              Tất Cả Sản Phẩm
            </Link>
            <Link
              href="/products?category=dien-thoai-cong-nghe"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-1.5 text-[#595959]"
            >
              Điện Thoại & Công Nghệ
            </Link>
            <Link
              href="/products?category=am-thanh-hi-end"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-1.5 text-[#595959]"
            >
              Âm Thanh Hi-End
            </Link>
            <Link
              href="/products?category=dong-ho-smartwatch"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-1.5 text-[#595959]"
            >
              Đồng Hồ & Smartwatch
            </Link>
            <Link
              href="/products?category=gia-dung-smart-living"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-1.5 text-[#595959]"
            >
              Gia Dụng Thông Minh
            </Link>
            <Link
              href="/products?filter=flash_sale"
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-1.5 text-[#c31833] font-bold flex items-center gap-2"
            >
              <span className="live-dot" />
              Flash Sale Đặc Quyền
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
