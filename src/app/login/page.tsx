"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, ArrowRight, Eye, EyeOff, CheckSquare, Square, Shield } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, user, loading, isAdmin } = useAuth();
  const { success, error, info } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // If already logged in, redirect immediately based on role
  useEffect(() => {
    if (!loading && user) {
      if (isAdmin) {
        router.replace("/admin");
      } else {
        router.replace("/account");
      }
    }
  }, [user, loading, isAdmin, router]);

  // Show error toast if redirected from protected route
  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "unauthorized_admin_access") {
      error("Bạn không có quyền truy cập khu vực Quản trị viên (Admin). Vui lòng đăng nhập bằng tài khoản quản trị.");
    } else if (errorParam === "session_expired") {
      info("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    }
  }, [searchParams, error, info]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      error("Vui lòng nhập đầy đủ email và mật khẩu.");
      return;
    }

    setSubmitting(true);
    const res = await login(cleanEmail, password);
    setSubmitting(false);

    if (res.success && res.user) {
      success(`Đăng nhập thành công! Chào mừng ${res.user.name || "bạn quay trở lại"}.`);

      // Determine redirect target safely
      const redirectParam = searchParams.get("redirect");
      const isSafeRedirect =
        redirectParam &&
        redirectParam.startsWith("/") &&
        !redirectParam.startsWith("//") &&
        !redirectParam.includes("://");

      const userIsAdmin =
        res.user.role === "ROLE_ADMIN" ||
        res.user.role === "ADMIN" ||
        res.user.role === "SUPER_ADMIN";

      if (userIsAdmin) {
        // Admin user goes to /admin or safe /admin redirect
        const target =
          isSafeRedirect && redirectParam.startsWith("/admin")
            ? redirectParam
            : "/admin";
        router.push(target);
      } else {
        // Regular customer goes to /account or safe non-admin redirect
        const target =
          isSafeRedirect && !redirectParam.startsWith("/admin")
            ? redirectParam
            : "/account";
        router.push(target);
      }
    } else {
      // Generic security error message
      error(res.error || "Email hoặc mật khẩu không chính xác.");
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 sm:px-6 bg-[#fafafa]">
      <div className="w-full max-w-md">
        {/* Auth Card */}
        <div className="bg-white border border-[#e5e5e5] rounded-2xl p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
          {/* Header */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center justify-center w-12 h-12 bg-[#fa9000] text-white font-black text-base tracking-tighter rounded-xl shadow-sm mb-4 hover:scale-105 transition-transform">
              BBK
            </Link>
            <h1 className="text-2xl sm:text-[26px] font-bold text-[#111111] tracking-tight mb-2">
              Đăng Nhập Tài Khoản
            </h1>
            <p className="text-xs sm:text-sm text-[#666666] leading-relaxed max-w-xs mx-auto">
              Hệ thống tự động xác thực và điều hướng theo phân quyền tài khoản của bạn
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-[#222222] mb-1.5">
                Địa chỉ Email <span className="text-[#c31833]">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 bg-white text-[#111111] border border-[#d4d4d4] rounded-lg pl-11 pr-4 text-sm placeholder:text-[#999999] focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                  required
                />
                <Mail className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs sm:text-sm font-semibold text-[#222222]">
                  Mật khẩu <span className="text-[#c31833]">*</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-[#666666] hover:text-black hover:underline"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Nhập mật khẩu của bạn"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 bg-white text-[#111111] border border-[#d4d4d4] rounded-lg pl-11 pr-11 text-sm placeholder:text-[#999999] focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                  required
                />
                <Lock className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#888888] hover:text-black transition-colors"
                  title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label
                onClick={() => setRememberMe(!rememberMe)}
                className="flex items-center gap-2 text-xs text-[#555555] cursor-pointer select-none"
              >
                {rememberMe ? (
                  <CheckSquare className="w-4 h-4 text-black" />
                ) : (
                  <Square className="w-4 h-4 text-[#999999]" />
                )}
                <span>Ghi nhớ đăng nhập trên thiết bị này</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-11 bg-black hover:bg-[#222222] active:scale-[0.99] text-white font-bold text-sm rounded-lg transition-all flex items-center justify-center gap-2 mt-4 shadow-sm disabled:opacity-60 cursor-pointer"
            >
              {submitting ? (
                <span>Đang xác thực thông tin...</span>
              ) : (
                <>
                  <span className="tracking-wide">ĐĂNG NHẬP</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Security Note */}
          <div className="mt-5 p-3 bg-[#f8f9fa] border border-[#eeeeee] rounded-lg flex items-center gap-2 text-[11px] text-[#666666]">
            <Shield className="w-4 h-4 text-[#16a34a] shrink-0" />
            <span>Kết nối xác thực mã hóa SSL chuẩn quân đội. Quyền hạn tự động phân định qua máy chủ bảo mật.</span>
          </div>

          {/* Footer Link */}
          <div className="text-center text-xs sm:text-sm text-[#666666] pt-6 mt-6 border-t border-[#f0f0f0]">
            Chưa có tài khoản?{" "}
            <Link href="/register" className="font-bold text-black hover:underline ml-1">
              Đăng ký tài khoản mới
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-[#fafafa]">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
