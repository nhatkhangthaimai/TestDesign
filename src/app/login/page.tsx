"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, ShieldCheck, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const { success, error } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await login(email, password);
    setSubmitting(false);

    if (res.success) {
      success("Đăng nhập thành công! Chào mừng bạn quay trở lại.");
      router.push("/");
    } else {
      error(res.error || "Email hoặc mật khẩu không đúng");
    }
  };

  const fillDemoAccount = (role: "admin" | "user") => {
    if (role === "admin") {
      setEmail("admin@ecommerce.vn");
      setPassword("Admin@123456");
    } else {
      setEmail("khachhang@ecommerce.vn");
      setPassword("User@123456");
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 sm:px-6 bg-[#fafafa]">
      <div className="w-full max-w-md">
        {/* Auth Card */}
        <div className="bg-white border border-[#e5e5e5] rounded-2xl p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-[#fa9000] text-white font-black text-xl rounded-xl shadow-sm mb-4">
              AJ
            </div>
            <h1 className="text-2xl sm:text-[26px] font-bold text-[#111111] tracking-tight mb-2">
              Đăng Nhập Tài Khoản
            </h1>
            <p className="text-sm text-[#666666] leading-relaxed max-w-xs mx-auto">
              Truy cập để quản lý đơn hàng, địa chỉ giao hàng và mã giảm giá thành viên
            </p>
          </div>

          {/* 1-Click Demo Accounts Pill Bar */}
          <div className="bg-[#f8f9fa] border border-[#e5e7eb] rounded-xl p-3.5 mb-6 space-y-2">
            <span className="text-[11px] uppercase font-bold text-[#666666] tracking-wider block">
              Tài khoản mẫu thử nghiệm nhanh:
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fillDemoAccount("admin")}
                className="flex-1 py-2 px-2.5 bg-black text-white rounded-lg text-xs font-semibold hover:bg-[#222222] transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#fa9000]" />
                <span>Admin Cấp Cao</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount("user")}
                className="flex-1 py-2 px-2.5 bg-white border border-[#d4d4d4] text-[#111111] rounded-lg text-xs font-semibold hover:bg-[#f0f0f0] transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
              >
                <User className="w-3.5 h-3.5 text-[#555555]" />
                <span>Khách Hàng</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#222222] mb-1.5">
                Địa chỉ Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="admin@ecommerce.vn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 bg-white text-[#111111] border border-[#d4d4d4] rounded-lg pl-11 pr-4 text-sm placeholder:text-[#999999] focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                  required
                />
                <Mail className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#222222] mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 bg-white text-[#111111] border border-[#d4d4d4] rounded-lg pl-11 pr-4 text-sm placeholder:text-[#999999] focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                  required
                />
                <Lock className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-11 bg-black hover:bg-[#222222] active:scale-[0.99] text-white font-semibold text-sm rounded-lg transition-all flex items-center justify-center gap-2 mt-2 shadow-sm disabled:opacity-60 cursor-pointer"
            >
              {submitting ? (
                <span>Đang xác thực...</span>
              ) : (
                <>
                  <span className="tracking-wide">ĐĂNG NHẬP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-sm text-[#666666] pt-6 mt-6 border-t border-[#f0f0f0]">
            Chưa có tài khoản?{" "}
            <Link href="/register" className="font-semibold text-black hover:underline ml-1">
              Đăng ký tài khoản mới
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
