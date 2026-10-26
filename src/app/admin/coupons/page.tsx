"use client";

import React, { useEffect, useState } from "react";
import { Plus, Trash2, Tag, Calendar, Check, X } from "lucide-react";
import { formatVND, formatDate } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";

interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: string;
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number | null;
  usageLimit: number;
  usageCount: number;
  expiresAt?: string | null;
  isActive: boolean;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();

  // Create Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState("");
  const [minOrderValue, setMinOrderValue] = useState("0");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [usageLimit, setUsageLimit] = useState("100");
  const [expiresAt, setExpiresAt] = useState("");

  const fetchCoupons = async () => {
    try {
      const res = await fetch("/api/admin/coupons");
      if (res.ok) {
        const data = await res.json();
        setCoupons(data.coupons || []);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        code: code.trim().toUpperCase(),
        description: description.trim(),
        discountType,
        discountValue: parseFloat(discountValue),
        minOrderValue: parseFloat(minOrderValue) || 0,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        usageLimit: parseInt(usageLimit, 10) || 100,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        isActive: true,
      };

      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        success("Tạo mã giảm giá thành công!");
        setIsModalOpen(false);
        setCode("");
        setDescription("");
        setDiscountValue("");
        fetchCoupons();
      } else {
        error(data.error || "Lỗi tạo mã");
      }
    } catch {
      error("Lỗi gửi dữ liệu");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCoupon = async (id: string, couponCode: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa mã "${couponCode}"?`)) return;
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
      if (res.ok) {
        success(`Đã xóa mã ${couponCode}`);
        fetchCoupons();
      } else {
        error("Lỗi xóa mã");
      }
    } catch {
      error("Lỗi kết nối");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2a2a2a]">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            QUẢN LÝ MÃ GIẢM GIÁ & VOUCHER
          </h1>
          <p className="text-xs text-[#888888] mt-1">
            Tạo và cấu hình các chương trình ưu đãi, khuyến mãi cho khách hàng
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-pill-dark bg-[#dba200] text-black font-bold hover:bg-[#ffc500] text-xs py-2 px-4 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Mã Giảm Giá Mới</span>
        </button>
      </div>

      {/* Coupons Table */}
      <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-[8px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#141414] text-[#888888] uppercase text-[10px]">
              <tr>
                <th className="p-3">Mã Voucher</th>
                <th className="p-3">Mô Tả Chương Trình</th>
                <th className="p-3">Mức Giảm</th>
                <th className="p-3">Đơn Tối Thiểu</th>
                <th className="p-3">Giới Hạn / Đã Dùng</th>
                <th className="p-3">Hạn Sử Dụng</th>
                <th className="p-3 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a2a]">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-[#252525] transition-colors">
                  <td className="p-3 font-mono font-black text-white text-sm">
                    {c.code}
                  </td>
                  <td className="p-3 text-[#dddddd]">{c.description}</td>
                  <td className="p-3 font-bold text-[#dba200]">
                    {c.discountType === "PERCENTAGE"
                      ? `${c.discountValue}% (Tối đa ${formatVND(c.maxDiscount)})`
                      : formatVND(c.discountValue)}
                  </td>
                  <td className="p-3 text-[#888888]">{formatVND(c.minOrderValue)}</td>
                  <td className="p-3 font-bold text-white">
                    {c.usageCount} / {c.usageLimit} lượt
                  </td>
                  <td className="p-3 text-[11px] text-[#888888]">
                    {c.expiresAt ? formatDate(c.expiresAt) : "Vô thời hạn"}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleDeleteCoupon(c.id, c.code)}
                      className="p-1.5 text-[#bc0000] hover:bg-[#bc0000]/20 rounded transition-colors"
                      title="Xóa voucher"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-xs"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative bg-[#1e1e1e] border border-[#333333] rounded-[10px] shadow-2xl max-w-lg w-full p-6 z-10 text-white space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-[#2e2e2e]">
              <h3 className="font-bold text-base uppercase text-[#dba200]">
                Tạo Mã Khuyến Mãi Mới
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#888888] hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#888888] mb-1 font-bold">Mã Code (Chữ in hoa) *</label>
                <input
                  type="text"
                  placeholder="VÍ DỤ: FLASH50K"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full bg-[#141414] border border-[#333333] rounded p-2.5 text-white font-mono uppercase outline-none focus:border-[#dba200]"
                  required
                />
              </div>

              <div>
                <label className="block text-[#888888] mb-1 font-bold">Mô tả hiển thị *</label>
                <input
                  type="text"
                  placeholder="Giảm 50.000đ cho đơn hàng từ 500k"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#141414] border border-[#333333] rounded p-2.5 text-white outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#888888] mb-1 font-bold">Loại giảm giá</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full bg-[#141414] border border-[#333333] rounded p-2.5 text-white outline-none"
                  >
                    <option value="PERCENTAGE">Theo phần trăm (%)</option>
                    <option value="FIXED">Số tiền cố định (VND)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#888888] mb-1 font-bold">
                    {discountType === "PERCENTAGE" ? "Phần trăm giảm (%) *" : "Số tiền giảm (VND) *"}
                  </label>
                  <input
                    type="number"
                    placeholder={discountType === "PERCENTAGE" ? "10" : "50000"}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="w-full bg-[#141414] border border-[#333333] rounded p-2.5 text-white outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#888888] mb-1 font-bold">Đơn tối thiểu (VND)</label>
                  <input
                    type="number"
                    placeholder="500000"
                    value={minOrderValue}
                    onChange={(e) => setMinOrderValue(e.target.value)}
                    className="w-full bg-[#141414] border border-[#333333] rounded p-2.5 text-white outline-none"
                  />
                </div>

                {discountType === "PERCENTAGE" && (
                  <div>
                    <label className="block text-[#888888] mb-1 font-bold">Giảm tối đa (VND)</label>
                    <input
                      type="number"
                      placeholder="200000"
                      value={maxDiscount}
                      onChange={(e) => setMaxDiscount(e.target.value)}
                      className="w-full bg-[#141414] border border-[#333333] rounded p-2.5 text-white outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#888888] mb-1 font-bold">Số lượng lượt dùng</label>
                  <input
                    type="number"
                    placeholder="100"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                    className="w-full bg-[#141414] border border-[#333333] rounded p-2.5 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#888888] mb-1 font-bold">Hạn sử dụng</label>
                  <input
                    type="date"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full bg-[#141414] border border-[#333333] rounded p-2.5 text-white outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#2e2e2e] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-[#252525] hover:bg-[#303030] rounded text-xs"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#dba200] hover:bg-[#ffc500] text-black font-bold rounded text-xs"
                >
                  {submitting ? "Đang tạo..." : "Lưu Voucher"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
