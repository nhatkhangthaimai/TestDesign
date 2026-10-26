"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Tag,
  Settings,
  ArrowLeft,
  ShieldAlert,
  ShieldCheck,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout, isAdmin } = useAuth();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== "ROLE_ADMIN") {
        setAuthorized(false);
      } else {
        setAuthorized(true);
      }
    }
  }, [user, loading]);

  if (loading || authorized === null) {
    return (
      <div className="min-h-screen bg-[#181818] flex items-center justify-center text-white text-xs">
        Đang xác thực quyền truy cập quản trị...
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-[#181818] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#202020] border border-[#bc0000] rounded-[10px] p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#bc0000]/20 text-[#bc0000] flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">YÊU CẦU QUYỀN QUẢN TRỊ VIÊN</h2>
          <p className="text-xs text-[#dddddd] leading-relaxed">
            Khu vực này được bảo mật và chỉ dành riêng cho tài khoản có phân quyền{" "}
            <strong className="text-[#dba200]">ROLE_ADMIN</strong>.
          </p>
          <div className="pt-4 flex flex-col gap-2">
            <Link
              href="/login"
              className="btn-pill-dark bg-[#dba200] text-black font-bold hover:bg-[#ffc500]"
            >
              Đăng nhập bằng tài khoản Admin
            </Link>
            <Link href="/" className="text-xs text-[#dddddd] hover:underline pt-2">
              ← Quay lại cửa hàng công khai
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { href: "/admin", label: "Tổng Quan (Dashboard)", icon: LayoutDashboard },
    { href: "/admin/products", label: "Quản Lý Sản Phẩm", icon: Package },
    { href: "/admin/orders", label: "Quản Lý Đơn Hàng", icon: ShoppingBag },
    { href: "/admin/customers", label: "Quản Lý Khách Hàng", icon: Users },
    { href: "/admin/coupons", label: "Mã Giảm Giá / Voucher", icon: Tag },
  ];

  return (
    <div className="min-h-screen bg-[#181818] text-[#dddddd] flex flex-col">
      {/* Top Admin Utility Strip - DESIGN.md network-utility-strip */}
      <div className="bg-[#100e2f] border-b border-[#272967] py-2 px-6 flex justify-between items-center text-xs">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-[#fa9000] text-white flex items-center justify-center font-black text-sm">
            AJ
          </div>
          <span className="font-bold tracking-wider text-white">
            AJ COMMERCE • HỆ THỐNG QUẢN TRỊ DOANH NGHIỆP
          </span>
          <span className="bg-[#dba200] text-black text-[10px] font-black px-1.5 py-0.2 rounded uppercase">
            ENTERPRISE
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 text-[#dba200] hover:text-white transition-colors"
          >
            <span>Xem Cửa Hàng Trực Tiếp</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          <span className="text-[#595959]">|</span>

          <span className="font-bold text-white flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#00cbca]" />
            {user?.name}
          </span>

          <button
            onClick={() => logout()}
            className="text-[#bc0000] hover:text-white transition-colors flex items-center gap-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>

      {/* Main Admin Shell */}
      <div className="flex-1 flex">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-[#141414] border-r border-[#2a2a2a] p-4 flex flex-col justify-between shrink-0 hidden md:flex">
          <div className="space-y-6">
            <div className="px-3 pt-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#595959] block">
                DANH MỤC QUẢN TRỊ
              </span>
            </div>

            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-[6px] text-xs font-semibold transition-all ${
                      isActive
                        ? "bg-[#272967] text-white border-l-4 border-[#dba200] shadow-sm"
                        : "text-[#dddddd] hover:bg-[#202020] hover:text-white"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-[#dba200]" : "text-[#595959]"}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="p-3 bg-[#1e1e1e] rounded-[6px] border border-[#2a2a2a] text-[11px] text-[#595959] space-y-1">
            <p className="font-bold text-[#dddddd]">Hệ thống: v2.6-PROD</p>
            <p>Database: PostgreSQL Ready</p>
            <p>Server Status: 100% Operational</p>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
