"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, ArrowRight, ArrowLeft, Eye, EyeOff, CheckCircle2, KeyRound, Loader2 } from "lucide-react";
import { useToast } from "@/context/ToastContext";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { success, error } = useToast();

  const tokenParam = searchParams.get("token") || "";
  const [token, setToken] = useState(tokenParam);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanToken = token.trim();
    if (!cleanToken) {
      error("Vui lòng cung cấp mã token đặt lại mật khẩu hợp lệ.");
      return;
    }

    if (newPassword.length < 6) {
      error("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }

    if (newPassword !== confirmPassword) {
      error("Mật khẩu xác nhận không khớp với mật khẩu mới.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: cleanToken,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Không thể đặt lại mật khẩu.");
      }

      setIsSuccess(true);
      success("Đặt lại mật khẩu thành công! Đang chuyển hướng về trang đăng nhập...");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      error(err.message || "Lỗi xử lý máy chủ. Vui lòng kiểm tra lại token.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-12 px-4 sm:px-6 bg-[#fafafa]">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white border border-[#e5e5e5] rounded-2xl p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
          {/* Logo Header */}
          <div className="text-center mb-8">
            <Link
              href="/"
              className="inline-flex items-center justify-center w-12 h-12 bg-[#fa9000] text-white font-black text-base tracking-tighter rounded-xl shadow-sm mb-4 hover:scale-105 transition-transform"
            >
              BBK
            </Link>
            <h1 className="text-2xl sm:text-[26px] font-bold text-[#111111] tracking-tight mb-2">
              Thiết Lập Mật Khẩu Mới
            </h1>
            <p className="text-xs sm:text-sm text-[#666666] leading-relaxed max-w-xs mx-auto">
              {!isSuccess
                ? "Tạo mật khẩu bảo mật mới cho tài khoản của bạn."
                : "Mật khẩu của bạn đã được cập nhật thành công!"}
            </p>
          </div>

          {!isSuccess ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Token field (if not provided in query) */}
              {!tokenParam && (
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-[#222222] mb-1.5">
                    Mã xác thực Token <span className="text-[#c31833]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Dán mã token đặt lại mật khẩu"
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      className="w-full h-11 bg-white text-[#111111] border border-[#d4d4d4] rounded-lg pl-11 pr-4 text-xs font-mono placeholder:font-sans placeholder:text-[#999999] focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                      required
                    />
                    <KeyRound className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              )}

              {/* New Password */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-[#222222] mb-1.5">
                  Mật khẩu mới (ít nhất 6 ký tự) <span className="text-[#c31833]">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full h-11 bg-white text-[#111111] border border-[#d4d4d4] rounded-lg pl-11 pr-11 text-sm placeholder:text-[#999999] focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                    required
                    minLength={6}
                  />
                  <Lock className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#888888] hover:text-black transition-colors"
                    title={showNewPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-[#222222] mb-1.5">
                  Xác nhận lại mật khẩu mới <span className="text-[#c31833]">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full h-11 bg-white text-[#111111] border border-[#d4d4d4] rounded-lg pl-11 pr-11 text-sm placeholder:text-[#999999] focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                    required
                    minLength={6}
                  />
                  <Lock className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#888888] hover:text-black transition-colors"
                    title={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full h-11 bg-black hover:bg-[#222222] active:scale-[0.99] text-white font-bold text-sm rounded-lg transition-all flex items-center justify-center gap-2 mt-4 shadow-sm disabled:opacity-60 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang cập nhật mật khẩu...</span>
                  </>
                ) : (
                  <>
                    <span className="tracking-wide">LƯU MẬT KHẨU MỚI</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-900 leading-relaxed">
                  <p className="font-bold text-sm text-emerald-950 mb-1">
                    Cập nhật thành công!
                  </p>
                  <p>
                    Mật khẩu tài khoản của bạn đã được thay đổi an toàn. Hệ thống đang tự động chuyển hướng đến trang đăng nhập trong giây lát...
                  </p>
                </div>
              </div>

              <Link
                href="/login"
                className="w-full py-2.5 px-4 bg-black hover:bg-[#222222] text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <span>ĐĂNG NHẬP NGAY</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* Footer Back Link */}
          <div className="text-center pt-6 mt-6 border-t border-[#f0f0f0]">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-black hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại trang Đăng Nhập</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-[#fafafa]">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
