"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import {
  ShieldCheck,
  Truck,
  CreditCard,
  QrCode,
  Wallet,
  Lock,
  ArrowRight,
  AlertCircle,
  Tag,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { formatVND } from "@/lib/utils";

const PROVINCES = [
  "TP. Hồ Chí Minh",
  "Hà Nội",
  "Đà Nẵng",
  "Hải Phòng",
  "Cần Thơ",
  "Bình Dương",
  "Đồng Nai",
  "Quảng Ninh",
  "Bà Rịa - Vũng Tàu",
  "Khánh Hòa",
];

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const { error, success } = useToast();

  const [customerName, setCustomerName] = useState(user?.name || "");
  const [customerEmail, setCustomerEmail] = useState(user?.email || "");
  const [customerPhone, setCustomerPhone] = useState(user?.phone || "");
  const [shippingAddress, setShippingAddress] = useState("");
  const [shippingCity, setShippingCity] = useState("TP. Hồ Chí Minh");
  const [shippingDistrict, setShippingDistrict] = useState("Quận 1");
  const [shippingWard, setShippingWard] = useState("Phường Bến Nghé");
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "VNPAY" | "MOMO" | "BANK_TRANSFER">("COD");

  // Coupon state
  const initialCoupon = searchParams.get("coupon") || "";
  const [couponCode, setCouponCode] = useState(initialCoupon);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedCouponCode, setAppliedCouponCode] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);

  // Sync user info when auth loaded
  useEffect(() => {
    if (user) {
      if (!customerName) setCustomerName(user.name);
      if (!customerEmail) setCustomerEmail(user.email);
      if (!customerPhone && user.phone) setCustomerPhone(user.phone);
    }
  }, [user]);

  // Verify initial coupon if present
  useEffect(() => {
    if (initialCoupon && subtotal > 0) {
      fetch("/api/coupons/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: initialCoupon, subtotal }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setAppliedCouponCode(data.coupon.code);
            setDiscountAmount(data.coupon.discountAmount);
          }
        })
        .catch(() => {});
    }
  }, [initialCoupon, subtotal]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const res = await fetch("/api/coupons/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.trim(), subtotal }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAppliedCouponCode(data.coupon.code);
        setDiscountAmount(data.coupon.discountAmount);
        success(`Áp dụng mã ${data.coupon.code} thành công!`);
      } else {
        error(data.error || "Mã không hợp lệ");
        setAppliedCouponCode(null);
        setDiscountAmount(0);
      }
    } catch {
      error("Lỗi áp dụng voucher");
    }
  };

  const shippingFee = subtotal >= 500000 || subtotal === 0 ? 0 : 30000;
  const finalTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      error("Giỏ hàng đang trống");
      return;
    }

    if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim() || !shippingAddress.trim()) {
      error("Vui lòng điền đầy đủ thông tin giao hàng");
      return;
    }

    setSubmitting(true);
    try {
      const orderPayload = {
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        shippingAddress: shippingAddress.trim(),
        shippingCity,
        shippingDistrict,
        shippingWard,
        note: note.trim() || undefined,
        paymentMethod,
        couponCode: appliedCouponCode,
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId || null,
          quantity: i.quantity,
        })),
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        clearCart();
        success("Đơn hàng của bạn đã được khởi tạo thành công!");
        router.push(`/order-success/${data.order.orderNumber}`);
      } else {
        error(data.error || "Đặt hàng thất bại. Vui lòng thử lại!");
      }
    } catch (err) {
      console.error("Order submit error:", err);
      error("Lỗi kết nối máy chủ khi tạo đơn hàng");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="section-eyebrow-lockup pb-4 border-b border-[#d8d8d8]">
        <span className="section-eyebrow-bar" />
        <h1 className="section-eyebrow-text">THANH TOÁN ĐƠN HÀNG AN TOÀN</h1>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Customer & Shipping Details */}
        <div className="lg:col-span-7 space-y-6">
          {/* Customer Receiver Info */}
          <div className="bg-white border border-[#d8d8d8] rounded-[10px] p-6 space-y-4">
            <h3 className="font-bold text-base text-black flex items-center gap-2 pb-3 border-b border-[#d8d8d8]">
              <span className="w-5 h-5 rounded-full bg-black text-white text-xs flex items-center justify-center font-mono">
                1
              </span>
              Thông Tin Người Nhận
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-black mb-1">
                  Họ và tên người nhận *
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Nguyễn Văn Hùng"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="text-input-capsule text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-black mb-1">
                  Số điện thoại liên hệ *
                </label>
                <input
                  type="tel"
                  placeholder="Ví dụ: 0987654321"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="text-input-capsule text-xs"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-black mb-1">
                  Địa chỉ Email nhận thông báo đơn hàng *
                </label>
                <input
                  type="email"
                  placeholder="Ví dụ: hungnguyen@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="text-input-capsule text-xs"
                  required
                />
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white border border-[#d8d8d8] rounded-[10px] p-6 space-y-4">
            <h3 className="font-bold text-base text-black flex items-center gap-2 pb-3 border-b border-[#d8d8d8]">
              <span className="w-5 h-5 rounded-full bg-black text-white text-xs flex items-center justify-center font-mono">
                2
              </span>
              Địa Chỉ Giao Hàng Tại Việt Nam
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-black mb-1">
                  Tỉnh / Thành phố *
                </label>
                <select
                  value={shippingCity}
                  onChange={(e) => setShippingCity(e.target.value)}
                  className="w-full text-xs border border-[#595959] rounded-[22px] px-3.5 py-2.5 bg-white text-black outline-none"
                >
                  {PROVINCES.map((prov) => (
                    <option key={prov} value={prov}>
                      {prov}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-black mb-1">
                  Quận / Huyện *
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Quận 1"
                  value={shippingDistrict}
                  onChange={(e) => setShippingDistrict(e.target.value)}
                  className="text-input-capsule text-xs"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-black mb-1">
                  Phường / Xã *
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Phường Bến Nghé"
                  value={shippingWard}
                  onChange={(e) => setShippingWard(e.target.value)}
                  className="text-input-capsule text-xs"
                  required
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-black mb-1">
                  Địa chỉ số nhà, tên đường *
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Tòa nhà Bitexco, 2 Hải Triều"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  className="text-input-capsule text-xs"
                  required
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-black mb-1">
                  Ghi chú đơn hàng (Tùy chọn)
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi giao 15 phút..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="text-input-capsule text-xs"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="bg-white border border-[#d8d8d8] rounded-[10px] p-6 space-y-4">
            <h3 className="font-bold text-base text-black flex items-center gap-2 pb-3 border-b border-[#d8d8d8]">
              <span className="w-5 h-5 rounded-full bg-black text-white text-xs flex items-center justify-center font-mono">
                3
              </span>
              Phương Thức Thanh Toán
            </h3>

            <div className="space-y-3">
              {/* Option 1: COD */}
              <label
                className={`flex items-start gap-3 p-3.5 border rounded-[8px] cursor-pointer transition-all ${
                  paymentMethod === "COD"
                    ? "border-black bg-[#fdfdfd] shadow-xs"
                    : "border-[#d8d8d8] hover:border-black"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "COD"}
                  onChange={() => setPaymentMethod("COD")}
                  className="mt-1"
                />
                <div>
                  <span className="font-bold text-xs text-black block">
                    Thanh toán tiền mặt khi nhận hàng (COD)
                  </span>
                  <span className="text-[11px] text-[#595959]">
                    Kiểm tra hàng trước khi thanh toán. An tâm tuyệt đối.
                  </span>
                </div>
              </label>

              {/* Option 2: VNPay */}
              <label
                className={`flex items-start gap-3 p-3.5 border rounded-[8px] cursor-pointer transition-all ${
                  paymentMethod === "VNPAY"
                    ? "border-black bg-[#fdfdfd] shadow-xs"
                    : "border-[#d8d8d8] hover:border-black"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "VNPAY"}
                  onChange={() => setPaymentMethod("VNPAY")}
                  className="mt-1"
                />
                <div>
                  <span className="font-bold text-xs text-black flex items-center gap-2">
                    <span>Cổng thanh toán VNPay QR / Thẻ ATM Nội Địa / Thẻ Quốc Tế</span>
                    <span className="bg-[#c31833] text-white text-[10px] font-bold px-1.5 py-0.2 rounded">
                      Sandbox
                    </span>
                  </span>
                  <span className="text-[11px] text-[#595959]">
                    Hỗ trợ quét mã VNPAY-QR tại hơn 30 ngân hàng và ví điện tử Việt Nam.
                  </span>
                </div>
              </label>

              {/* Option 3: MoMo */}
              <label
                className={`flex items-start gap-3 p-3.5 border rounded-[8px] cursor-pointer transition-all ${
                  paymentMethod === "MOMO"
                    ? "border-black bg-[#fdfdfd] shadow-xs"
                    : "border-[#d8d8d8] hover:border-black"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "MOMO"}
                  onChange={() => setPaymentMethod("MOMO")}
                  className="mt-1"
                />
                <div>
                  <span className="font-bold text-xs text-black flex items-center gap-2">
                    <span>Ví Điện Tử MoMo</span>
                    <span className="bg-[#fa9000] text-black text-[10px] font-bold px-1.5 py-0.2 rounded">
                      Nhanh 2S
                    </span>
                  </span>
                  <span className="text-[11px] text-[#595959]">
                    Thanh toán bảo mật tức thì qua ứng dụng MoMo trên điện thoại.
                  </span>
                </div>
              </label>

              {/* Option 4: Bank Transfer */}
              <label
                className={`flex items-start gap-3 p-3.5 border rounded-[8px] cursor-pointer transition-all ${
                  paymentMethod === "BANK_TRANSFER"
                    ? "border-black bg-[#fdfdfd] shadow-xs"
                    : "border-[#d8d8d8] hover:border-black"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "BANK_TRANSFER"}
                  onChange={() => setPaymentMethod("BANK_TRANSFER")}
                  className="mt-1"
                />
                <div>
                  <span className="font-bold text-xs text-black block">
                    Chuyển khoản ngân hàng trực tiếp (VietQR 24/7)
                  </span>
                  <span className="text-[11px] text-[#595959]">
                    Hệ thống sẽ cung cấp mã QR chuyển khoản tự động ngay sau khi xác nhận đơn.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Review & Submit */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-[#d8d8d8] rounded-[10px] p-6 space-y-5">
            <h3 className="font-bold text-base text-black pb-3 border-b border-[#d8d8d8]">
              Đơn Hàng Của Bạn ({items.length} món)
            </h3>

            {/* Items summary */}
            <div className="space-y-3 max-h-60 overflow-y-auto divide-y divide-[#f0f0f0]">
              {items.map((i) => (
                <div key={i.id} className="pt-2 first:pt-0 flex gap-3 items-center">
                  <div className="relative w-12 h-12 bg-[#f8f8f8] rounded overflow-hidden shrink-0 border border-[#d8d8d8]">
                    <Image src={i.imageUrl} alt={i.title} fill className="object-cover" sizes="48px" />
                  </div>
                  <div className="flex-1 text-xs">
                    <p className="font-bold text-black line-clamp-1">{i.title}</p>
                    {i.variantName && <p className="text-[10px] text-[#595959]">{i.variantName}</p>}
                    <span className="text-[#595959]">SL: {i.quantity} × {formatVND(i.price)}</span>
                  </div>
                  <span className="font-bold text-xs text-black">{formatVND(i.price * i.quantity)}</span>
                </div>
              ))}
            </div>

            {/* Voucher input inside checkout */}
            <div className="pt-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Mã giảm giá..."
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="text-input-capsule text-xs uppercase"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="btn-pill-dark text-xs py-2 px-3 whitespace-nowrap"
                >
                  Áp dụng
                </button>
              </div>
              {appliedCouponCode && (
                <p className="text-xs text-emerald-700 font-bold mt-1.5">
                  ✓ Đã áp dụng mã {appliedCouponCode} (-{formatVND(discountAmount)})
                </p>
              )}
            </div>

            {/* Breakdown */}
            <div className="space-y-2 text-xs text-[#595959] pt-3 border-t border-[#d8d8d8]">
              <div className="flex justify-between">
                <span>Tạm tính:</span>
                <span className="font-bold text-black">{formatVND(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-bold">
                  <span>Giảm giá:</span>
                  <span>-{formatVND(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Phí vận chuyển:</span>
                <span className="font-bold text-black">
                  {shippingFee === 0 ? "MIỄN PHÍ" : formatVND(shippingFee)}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-[#d8d8d8] flex justify-between items-baseline">
              <span className="font-bold text-sm text-black">Tổng thanh toán:</span>
              <span className="font-black text-2xl text-black">{formatVND(finalTotal)}</span>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-pill-dark w-full py-4 text-sm flex items-center justify-center gap-2 font-bold"
            >
              {submitting ? (
                <span>Đang xử lý tạo đơn...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>XÁC NHẬN ĐẶT HÀNG NGAY</span>
                </>
              )}
            </button>

            <div className="text-[11px] text-center text-[#595959] flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Giao dịch mã hóa an toàn 256-bit SSL</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center">Đang tải trang thanh toán...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
