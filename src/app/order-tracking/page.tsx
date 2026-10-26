"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Package, Clock, CheckCircle2, Truck, XCircle, AlertCircle } from "lucide-react";
import { formatVND, formatDate } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";

const STATUS_STEPS = [
  { key: "PENDING", label: "Đã Đặt Hàng" },
  { key: "CONFIRMED", label: "Đã Xác Nhận" },
  { key: "PROCESSING", label: "Đang Đóng Gói" },
  { key: "SHIPPED", label: "Đang Vận Chuyển" },
  { key: "DELIVERED", label: "Giao Thành Công" },
];

function OrderTrackingContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get("orderId") || "";

  const [searchCode, setSearchCode] = useState(initialId);
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { success, error } = useToast();

  const handleSearch = async (idToSearch: string) => {
    if (!idToSearch.trim()) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/orders/${idToSearch.trim()}`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data.order);
      } else {
        setOrder(null);
        setErrorMsg("Không tìm thấy đơn hàng với mã tra cứu này. Vui lòng kiểm tra lại!");
      }
    } catch {
      setErrorMsg("Lỗi kết nối khi tra cứu đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialId) {
      handleSearch(initialId);
    }
  }, [initialId]);

  const handleCancelOrder = async () => {
    if (!order) return;
    if (!confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?")) return;

    try {
      const res = await fetch(`/api/orders/${order.id}/cancel`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        success("Đã hủy đơn hàng thành công");
        setOrder(data.order);
      } else {
        error(data.error || "Không thể hủy đơn hàng");
      }
    } catch {
      error("Lỗi khi gửi yêu cầu hủy đơn");
    }
  };

  const currentStepIndex = order ? STATUS_STEPS.findIndex((s) => s.key === order.status) : -1;
  const isCancelled = order?.status === "CANCELLED";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <div className="section-eyebrow-lockup justify-center">
          <span className="section-eyebrow-bar" />
          <h1 className="section-eyebrow-text">TRA CỨU TIẾN ĐỘ ĐƠN HÀNG</h1>
        </div>
        <p className="text-xs text-[#595959]">
          Nhập mã đơn hàng (ví dụ: ORD-2026-9812) để theo dõi lộ trình vận chuyển và trạng thái xử lý đơn.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="max-w-lg mx-auto bg-white border border-[#d8d8d8] rounded-[10px] p-2 flex gap-2 shadow-xs">
        <input
          type="text"
          placeholder="Nhập mã đơn hàng (ví dụ: ORD-2026-9812)..."
          value={searchCode}
          onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
          className="flex-1 h-11 px-3 text-sm uppercase placeholder:normal-case placeholder:text-[#999999] outline-none bg-transparent"
        />
        <button
          onClick={() => handleSearch(searchCode)}
          disabled={loading}
          className="h-11 px-6 bg-black hover:bg-[#222222] text-white text-xs font-semibold rounded-lg whitespace-nowrap cursor-pointer transition-all active:scale-95 disabled:opacity-60"
        >
          {loading ? "Đang tìm..." : "Tra cứu"}
        </button>
      </div>

      {errorMsg && (
        <div className="max-w-lg mx-auto p-4 bg-red-50 border border-red-200 text-xs text-[#c31833] rounded-[8px] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Order Progress Display */}
      {order && (
        <div className="bg-white border border-[#d8d8d8] rounded-[10px] p-6 sm:p-8 space-y-8 animate-in fade-in duration-300">
          {/* Header Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#d8d8d8]">
            <div>
              <span className="text-xs text-[#595959] uppercase">Mã đơn hàng:</span>
              <h2 className="font-mono font-black text-2xl text-black">{order.orderNumber}</h2>
              <span className="text-xs text-[#595959]">
                Ngày tạo: {formatDate(order.createdAt)}
              </span>
            </div>

            <div className="text-right flex sm:flex-col items-center sm:items-end justify-between">
              <span className="text-xs text-[#595959]">Tổng thanh toán:</span>
              <span className="font-bold text-xl text-black">{formatVND(order.total)}</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded mt-1 uppercase ${
                  order.paymentStatus === "PAID"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                {order.paymentStatus === "PAID" ? "Đã thanh toán" : "Chưa thanh toán"}
              </span>
            </div>
          </div>

          {/* Status Stepper */}
          {isCancelled ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-[8px] text-center text-[#c31833] space-y-1">
              <XCircle className="w-8 h-8 mx-auto" />
              <h3 className="font-bold text-sm">ĐƠN HÀNG ĐÃ BỊ HỦY</h3>
              <p className="text-xs">Đơn hàng này đã bị hủy bỏ và tồn kho đã được hoàn lại.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-black">
                Tiến Trình Đơn Hàng:
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 relative">
                {STATUS_STEPS.map((step, idx) => {
                  const isDone = idx <= currentStepIndex;
                  const isCurrent = idx === currentStepIndex;
                  return (
                    <div
                      key={step.key}
                      className={`p-3 rounded-[6px] border text-center transition-all ${
                        isCurrent
                          ? "border-black bg-black text-white font-bold shadow-xs"
                          : isDone
                          ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                          : "border-[#d8d8d8] bg-[#fdfdfd] text-[#595959] opacity-60"
                      }`}
                    >
                      <span className="text-[10px] block font-mono">BƯỚC {idx + 1}</span>
                      <span className="text-xs font-bold block mt-0.5">{step.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Timeline History */}
          <div className="space-y-3 pt-6 border-t border-[#d8d8d8]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-black">
              Lịch Sử Thay Đổi Trạng Thái
            </h3>
            <div className="space-y-3 divide-y divide-[#f0f0f0]">
              {order.statusHistory?.map((hist: any) => (
                <div key={hist.id} className="pt-3 first:pt-0 flex items-start gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-black mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-black">{hist.status}</span>
                      <span className="text-[11px] text-[#595959]">{formatDate(hist.createdAt)}</span>
                    </div>
                    <p className="text-[#595959] mt-0.5">{hist.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cancel Order Action if Pending */}
          {order.status === "PENDING" && (
            <div className="pt-4 border-t border-[#d8d8d8] flex justify-end">
              <button
                onClick={handleCancelOrder}
                className="text-xs text-[#c31833] border border-[#c31833] rounded-[18px] px-4 py-1.5 font-bold hover:bg-[#c31833] hover:text-white transition-colors"
              >
                Hủy đơn hàng này
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function OrderTrackingPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center">Đang tải...</div>}>
      <OrderTrackingContent />
    </Suspense>
  );
}
