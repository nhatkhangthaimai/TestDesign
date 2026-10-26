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
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="bg-white border border-[#d8d8d8] rounded-[10px] p-8 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-[#fa9000] text-white flex items-center justify-center font-black text-2xl mx-auto rounded-[4px]">
            AJ
          </div>
          <h1 className="font-bold text-2xl text-black">Đăng Ký Thành Viên</h1>
          <p className="text-xs text-[#595959]">
            Nhận ngay voucher giảm giá 10% và trải nghiệm mua sắm bảo mật
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-black mb-1">
              Họ và tên của bạn
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Ví dụ: Trần Quốc Tuấn"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-input-capsule text-xs pl-10"
                required
              />
              <User className="w-4 h-4 text-[#595959] absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-black mb-1">
              Địa chỉ Email
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="email@example.com"
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
              Số điện thoại
            </label>
            <div className="relative">
              <input
                type="tel"
                placeholder="0912345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="text-input-capsule text-xs pl-10"
              />
              <Phone className="w-4 h-4 text-[#595959] absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-black mb-1">
              Mật khẩu (ít nhất 6 ký tự)
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
              <span>Đang khởi tạo tài khoản...</span>
            ) : (
              <>
                <span>HOÀN TẤT ĐĂNG KÝ</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-[#595959] pt-2 border-t border-[#f0f0f0]">
          Đã có tài khoản?{" "}
          <Link href="/login" className="font-bold text-black hover:underline">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
