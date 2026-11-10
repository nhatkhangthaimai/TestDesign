"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, ShieldCheck, KeyRound, Loader2 } from "lucide-react";
import { useToast } from "@/context/ToastContext";

function ForgotPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { success, error } = useToast();

  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [submitting, setSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      error("Vui lòng nhập địa chỉ email của bạn.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Không thể gửi yêu cầu đặt lại mật khẩu.");
      }

      setIsSubmitted(true);
      if (data.resetToken) {
        setResetToken(data.resetToken);
      }
      success("Yêu cầu đã được tiếp nhận thành công!");
    } catch (err: any) {
      error(err.message || "Lỗi xử lý máy chủ. Vui lòng thử lại sau.");
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
              Quên Mật Khẩu?
            </h1>
            <p className="text-xs sm:text-sm text-[#666666] leading-relaxed max-w-xs mx-auto">
              {!isSubmitted
                ? "Nhập email đăng ký của bạn để nhận liên kết thiết lập lại mật khẩu an toàn."
                : "Kiểm tra hướng dẫn bên dưới để hoàn tất việc đổi mật khẩu."}
            </p>
          </div>

          {!isSubmitted ? (
            /* STEP 1: ENTER EMAIL FORM */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-[#222222] mb-1.5">
                  Địa chỉ Email tài khoản <span className="text-[#c31833]">*</span>
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

              <button
                type="submit"
                disabled={submitting}
                className="w-full h-11 bg-black hover:bg-[#222222] active:scale-[0.99] text-white font-bold text-sm rounded-lg transition-all flex items-center justify-center gap-2 mt-4 shadow-sm disabled:opacity-60 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang gửi yêu cầu...</span>
                  </>
                ) : (
                  <>
                    <span className="tracking-wide">GỬI LIÊN KẾT ĐẶT LẠI</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="mt-5 p-3 bg-[#f8f9fa] border border-[#eeeeee] rounded-lg flex items-center gap-2 text-[11px] text-[#666666]">
                <ShieldCheck className="w-4 h-4 text-[#16a34a] shrink-0" />
                <span>Hệ thống bảo vệ quyền riêng tư: không công khai việc email có tồn tại hay không.</span>
              </div>
            </form>
          ) : (
            /* STEP 2: CONFIRMATION & RESET ACTION */
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-900 leading-relaxed">
                  <p className="font-bold text-sm text-emerald-950 mb-1">
                    Yêu cầu đã được ghi nhận!
                  </p>
                  <p>
                    Nếu địa chỉ email <strong className="font-semibold text-black">{email}</strong> có trong hệ thống, hướng dẫn đặt lại mật khẩu đã được khởi tạo.
                  </p>
                </div>
              </div>

              {/* Quick Reset Button for testing/direct flow */}
              {resetToken && (
                <div className="p-4 bg-[#fff9f0] border border-[#fa9000]/40 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#b45309]">
                    <KeyRound className="w-4 h-4 text-[#fa9000]" />
                    <span>Liên kết đặt lại mật khẩu tức thì:</span>
                  </div>
                  <Link
                    href={`/reset-password?token=${encodeURIComponent(resetToken)}`}
                    className="w-full py-2.5 px-4 bg-[#fa9000] hover:bg-[#ea8000] active:scale-[0.99] text-black font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <span>TIẾN HÀNH ĐẶT LẠI MẬT KHẨU NGAY</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setIsSubmitted(false);
                  setResetToken(null);
                }}
                className="w-full py-2.5 text-xs text-[#555555] hover:text-black font-semibold transition-colors"
              >
                Gửi lại với địa chỉ email khác
              </button>
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

export default function ForgotPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-200px)] flex items-center justify-center bg-[#fafafa]">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <ForgotPasswordContent />
    </Suspense>
  );
}
