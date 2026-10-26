"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, ShieldCheck, RefreshCw, Truck, Award } from "lucide-react";
import { useToast } from "@/context/ToastContext";

export default function Footer() {
  const [email, setEmail] = useState("");
  const { success, error } = useToast();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      error("Vui lòng nhập địa chỉ email hợp lệ");
      return;
    }
    success("Cảm ơn bạn đã đăng ký nhận bản tin khuyến mãi đặc quyền!");
    setEmail("");
  };

  return (
    <footer className="bg-white border-t border-[#d8d8d8] text-black">
      {/* Commitment / Guarantees Strip */}
      <div className="border-b border-[#d8d8d8] bg-[#fdfdfd] py-8 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-black text-white rounded-[10px] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-[#fa9000]" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-black">100% Chính Hãng</h4>
              <p className="text-xs text-[#595959] mt-0.5">Cam kết hàng nhập khẩu chính ngạch VNA</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-black text-white rounded-[10px] flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6 text-[#fa9000]" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-black">Giao Hàng Hỏa Tốc</h4>
              <p className="text-xs text-[#595959] mt-0.5">Giao nhanh 2H tại TP.HCM & Hà Nội</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-black text-white rounded-[10px] flex items-center justify-center shrink-0">
              <RefreshCw className="w-6 h-6 text-[#fa9000]" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-black">Đổi Trả Trong 30 Ngày</h4>
              <p className="text-xs text-[#595959] mt-0.5">Lỗi 1 đổi 1 nhanh chóng nếu do nhà sản xuất</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-black text-white rounded-[10px] flex items-center justify-center shrink-0">
              <Award className="w-6 h-6 text-[#fa9000]" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-black">Bảo Hành Cao Cấp</h4>
              <p className="text-xs text-[#595959] mt-0.5">Bảo hành ủy quyền chính hãng tại Việt Nam</p>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Card - DESIGN.md newsletter-card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10">
        <div className="bg-[#f0f0f0] border border-[#d8d8d8] p-8 md:p-12 rounded-[10px] flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
            <div className="section-eyebrow-lockup mb-2">
              <span className="section-eyebrow-bar" />
              <span className="section-eyebrow-text">BẢN TIN ĐẶC QUYỀN</span>
            </div>
            <h3 className="font-bold text-2xl md:text-3xl text-black tracking-tight">
              Nhận thông báo ưu đãi Flash Sale & Voucher 500K
            </h3>
            <p className="text-sm text-[#595959] mt-2">
              Đăng ký ngay để không bỏ lỡ các đợt mở bán giới hạn và nhận mã giảm giá 10% cho đơn hàng đầu tiên của bạn.
            </p>
          </div>

          <form onSubmit={handleSubscribe} className="w-full lg:w-auto flex-1 max-w-md flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              placeholder="Nhập địa chỉ email của bạn..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-input-capsule bg-white"
              required
            />
            <button type="submit" className="btn-pill-dark whitespace-nowrap">
              Đăng ký nhận tin
            </button>
          </form>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 border-t border-[#d8d8d8]">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#fa9000] flex items-center justify-center font-black text-white text-xl">
                AJ
              </div>
              <span className="font-bold text-2xl tracking-tight text-black">AJ COMMERCE</span>
            </div>
            <p className="text-sm text-[#595959] leading-relaxed max-w-sm">
              Nền tảng thương mại điện tử chuyên cung cấp thiết bị công nghệ, âm thanh Hi-End và đồng hồ thông minh chính hãng chuẩn quốc tế tại Việt Nam.
            </p>
            <div className="space-y-2 text-xs text-[#595959] pt-2">
              <div className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-black shrink-0" />
                <span>Bitexco Financial Tower, Số 2 Hải Triều, Bến Nghé, Quận 1, TP.HCM</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-black shrink-0" />
                <span className="font-bold text-black">Hotline: 1900 6868 (8:00 - 22:00)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-black shrink-0" />
                <span>Email: contact@aj-commerce.vn</span>
              </div>
            </div>
          </div>

          {/* Column 1: Danh Mục */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider text-black mb-4">
              Danh Mục
            </h4>
            <ul className="space-y-2.5 text-xs text-[#595959]">
              <li>
                <Link href="/products?category=dien-thoai-cong-nghe" className="hover:text-black">
                  Điện Thoại & Tablet
                </Link>
              </li>
              <li>
                <Link href="/products?category=am-thanh-hi-end" className="hover:text-black">
                  Âm Thanh & Tai Nghe
                </Link>
              </li>
              <li>
                <Link href="/products?category=dong-ho-smartwatch" className="hover:text-black">
                  Đồng Hồ Thông Minh
                </Link>
              </li>
              <li>
                <Link href="/products?category=gia-dung-smart-living" className="hover:text-black">
                  Gia Dụng Thông Minh
                </Link>
              </li>
              <li>
                <Link href="/products?filter=flash_sale" className="text-[#c31833] font-bold">
                  Flash Sale Đặc Quyền
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Hỗ Trợ Khách Hàng */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider text-black mb-4">
              Hỗ Trợ Khách Hàng
            </h4>
            <ul className="space-y-2.5 text-xs text-[#595959]">
              <li>
                <Link href="/order-tracking" className="hover:text-black">
                  Tra cứu tình trạng đơn hàng
                </Link>
              </li>
              <li>
                <Link href="/policy/shipping" className="hover:text-black">
                  Chính sách giao hàng
                </Link>
              </li>
              <li>
                <Link href="/policy/returns" className="hover:text-black">
                  Chính sách đổi trả & bảo hành
                </Link>
              </li>
              <li>
                <Link href="/policy/privacy" className="hover:text-black">
                  Bảo mật thông tin khách hàng
                </Link>
              </li>
              <li>
                <Link href="/policy/terms" className="hover:text-black">
                  Điều khoản mua sắm
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Tài Khoản & Quản Trị */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider text-black mb-4">
              Tài Khoản & Vận Hành
            </h4>
            <ul className="space-y-2.5 text-xs text-[#595959]">
              <li>
                <Link href="/login" className="hover:text-black">
                  Đăng nhập tài khoản
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-black">
                  Đăng ký thành viên
                </Link>
              </li>
              <li>
                <Link href="/account/orders" className="hover:text-black">
                  Lịch sử mua sắm
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-black font-bold hover:text-[#fa9000]">
                  Cổng Quản Trị (Admin Portal)
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="bg-[#100e2f] text-white/70 py-4 px-4 sm:px-8 text-xs border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <p>© 2026 AJ COMMERCE. All rights reserved. Nền tảng bán lẻ công nghệ trực tuyến cao cấp.</p>
          <div className="flex items-center gap-4 text-white/60">
            <span>Thanh toán an toàn: COD • VNPay • MoMo • ATM</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
