"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, User, Phone, ArrowRight, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const { success, error } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) {
      error("Vui lòng điền đầy đủ các trường bắt buộc.");
      return;
    }

    if (password.length < 6) {
      error("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    setSubmitting(true);
    const res = await register({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      phone: phone.trim() || undefined,
    });
    setSubmitting(false);

    if (res.success) {
      success("Đăng ký tài khoản thành công! Tặng bạn mã WELCOME10 giảm 10%.");
      router.push("/account");
    } else {
      error(res.error || "Đăng ký thất bại");
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
              Đăng Ký Thành Viên
            </h1>
            <p className="text-xs sm:text-sm text-[#666666] leading-relaxed max-w-xs mx-auto">
              Nhận ngay voucher giảm giá <span className="text-[#fa9000] font-semibold">10%</span> và trải nghiệm mua sắm bảo mật
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-[#222222] mb-1.5">
                Họ và tên của bạn <span className="text-[#c31833]">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ví dụ: Nguyễn Văn An"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 bg-white text-[#111111] border border-[#d4d4d4] rounded-lg pl-11 pr-4 text-sm placeholder:text-[#999999] focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                  required
                />
                <User className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-[#222222] mb-1.5">
                Địa chỉ Email <span className="text-[#c31833]">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 bg-white text-[#111111] border border-[#d4d4d4] rounded-lg pl-11 pr-4 text-sm placeholder:text-[#999999] focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                  required
                />
                <Mail className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-[#222222] mb-1.5">
                Số điện thoại (tùy chọn)
              </label>
              <div className="relative">
                <input
                  type="tel"
                  placeholder="0912345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full h-11 bg-white text-[#111111] border border-[#d4d4d4] rounded-lg pl-11 pr-4 text-sm placeholder:text-[#999999] focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                />
                <Phone className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-[#222222] mb-1.5">
                Mật khẩu (ít nhất 6 ký tự) <span className="text-[#c31833]">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 bg-white text-[#111111] border border-[#d4d4d4] rounded-lg pl-11 pr-11 text-sm placeholder:text-[#999999] focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                  required
                  minLength={6}
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

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-11 bg-black hover:bg-[#222222] active:scale-[0.99] text-white font-bold text-sm rounded-lg transition-all flex items-center justify-center gap-2 mt-4 shadow-sm disabled:opacity-60 cursor-pointer"
            >
              {submitting ? (
                <span>Đang khởi tạo tài khoản...</span>
              ) : (
                <>
                  <span className="tracking-wide">HOÀN TẤT ĐĂNG KÝ</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Privacy Note */}
          <div className="mt-5 p-3 bg-[#f8f9fa] border border-[#eeeeee] rounded-lg flex items-center gap-2 text-[11px] text-[#666666]">
            <ShieldCheck className="w-4 h-4 text-[#16a34a] shrink-0" />
            <span>Mọi tài khoản đăng ký mới mặc định được bảo vệ theo phân quyền Khách Hàng tiêu chuẩn.</span>
          </div>

          <div className="text-center text-xs sm:text-sm text-[#666666] pt-6 mt-6 border-t border-[#f0f0f0]">
            Đã có tài khoản?{" "}
            <Link href="/login" className="font-bold text-black hover:underline ml-1">
              Đăng nhập ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
