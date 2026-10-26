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
    <div className="max-w-md mx-auto px-4 py-16">
      {/* Auth Card - DESIGN.md ex-auth-form-card */}
      <div className="bg-white border border-[#d8d8d8] rounded-[10px] p-8 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-[#fa9000] text-white flex items-center justify-center font-black text-2xl mx-auto rounded-[4px]">
            AJ
          </div>
          <h1 className="font-bold text-2xl text-black">Đăng Nhập Tài Khoản</h1>
          <p className="text-xs text-[#595959]">
            Truy cập để quản lý đơn hàng, địa chỉ giao hàng và nhận mã giảm giá thành viên
          </p>
        </div>

        {/* 1-Click Demo Accounts Pill Bar */}
        <div className="bg-[#f8f8f8] border border-[#d8d8d8] rounded-[8px] p-3 space-y-2">
          <span className="text-[10px] uppercase font-bold text-[#595959] tracking-wider block">
            TÀI KHOẢN MẪU THỬ NGHIỆM NHANH:
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fillDemoAccount("admin")}
              className="flex-1 py-1.5 px-2 bg-black text-white rounded-[4px] text-[11px] font-bold hover:bg-[#222222] transition-colors flex items-center justify-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#fa9000]" />
              <span>Admin Cấp Cao</span>
            </button>
            <button
              type="button"
              onClick={() => fillDemoAccount("user")}
              className="flex-1 py-1.5 px-2 bg-white border border-[#d8d8d8] text-black rounded-[4px] text-[11px] font-bold hover:bg-[#f0f0f0] transition-colors flex items-center justify-center gap-1"
            >
              <User className="w-3.5 h-3.5" />
              <span>Khách Hàng</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-black mb-1">
              Địa chỉ Email
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="admin@ecommerce.vn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="text-input-capsule text-xs pl-10"
                required
              />
              <Mail className="w-4 h-4 text-[#595959] absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-black mb-1">
              Mật khẩu
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-input-capsule text-xs pl-10"
                required
              />
              <Lock className="w-4 h-4 text-[#595959] absolute left-3.5 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-pill-dark w-full py-3 text-sm flex items-center justify-center gap-2 font-bold"
          >
            {submitting ? (
              <span>Đang kiểm tra...</span>
            ) : (
              <>
                <span>ĐĂNG NHẬP</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-[#595959] pt-2 border-t border-[#f0f0f0]">
          Chưa có tài khoản?{" "}
          <Link href="/register" className="font-bold text-black hover:underline">
            Đăng ký tài khoản mới
          </Link>
        </div>
      </div>
    </div>
  );
}
