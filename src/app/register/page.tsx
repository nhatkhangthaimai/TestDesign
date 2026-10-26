"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, User, Phone, ArrowRight } from "lucide-react";
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
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await register({ name, email, password, phone });
    setSubmitting(false);

    if (res.success) {
      success("Đăng ký tài khoản thành công! Tặng bạn mã WELCOME10 giảm 10%.");
      router.push("/");
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
            <div className="inline-flex items-center justify-center w-12 h-12 bg-[#fa9000] text-white font-black text-xl rounded-xl shadow-sm mb-4">
              AJ
            </div>
            <h1 className="text-2xl sm:text-[26px] font-bold text-[#111111] tracking-tight mb-2">
              Đăng Ký Thành Viên
            </h1>
            <p className="text-sm text-[#666666] leading-relaxed max-w-xs mx-auto">
              Nhận ngay voucher giảm giá <span className="text-[#fa9000] font-semibold">10%</span> và trải nghiệm mua sắm bảo mật
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#222222] mb-1.5">
                Họ và tên của bạn
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ví dụ: Trần Quốc Tuấn"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-11 bg-white text-[#111111] border border-[#d4d4d4] rounded-lg pl-11 pr-4 text-sm placeholder:text-[#999999] focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                  required
                />
                <User className="w-4 h-4 text-[#888888] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#222222] mb-1.5">
                Địa chỉ Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  placeholder="admin@simpleshop.com"
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
                Số điện thoại
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

            <div>
              <label className="block text-sm font-medium text-[#222222] mb-1.5">
                Mật khẩu (ít nhất 6 ký tự)
              </label>
              <div className="relative">
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 bg-white text-[#111111] border border-[#d4d4d4] rounded-lg pl-11 pr-4 text-sm placeholder:text-[#999999] focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                  required
                  minLength={6}
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
                <span>Đang khởi tạo tài khoản...</span>
              ) : (
                <>
                  <span className="tracking-wide">HOÀN TẤT ĐĂNG KÝ</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-sm text-[#666666] pt-6 mt-6 border-t border-[#f0f0f0]">
            Đã có tài khoản?{" "}
            <Link href="/login" className="font-semibold text-black hover:underline ml-1">
              Đăng nhập ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
