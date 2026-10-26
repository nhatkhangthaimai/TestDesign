"use client";

import React, { useEffect, useState } from "react";
import {
  Download,
  Search,
  CheckCircle,
  Truck,
  Package,
  XCircle,
  Eye,
  Filter,
} from "lucide-react";
import { formatVND, formatDate } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: string;
  shippingCity: string;
  total: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  items: Array<{
    id: string;
    productTitle: string;
    sku: string;
    price: number;
    quantity: number;
    total: number;
  }>;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const { success, error } = useToast();

  const fetchOrders = async () => {
    try {
      const url = `/api/admin/orders?status=${statusFilter}&search=${encodeURIComponent(search)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, search]);

  const handleUpdateStatus = async (orderId: string, nextStatus: string, paymentStatus?: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: nextStatus,
          paymentStatus: paymentStatus || (nextStatus === "DELIVERED" ? "PAID" : undefined),
          note: `Quản trị viên chuyển trạng thái sang ${nextStatus}`,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        success(`Đã cập nhật đơn hàng sang trạng thái ${nextStatus}`);
        fetchOrders();
        if (selectedOrder?.id === orderId) {
          setSelectedOrder(data.order);
        }
      } else {
        error(data.error || "Lỗi cập nhật trạng thái");
      }
    } catch {
      error("Lỗi kết nối");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2a2a2a]">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            QUẢN LÝ ĐƠN HÀNG TOÀN HỆ THỐNG
          </h1>
          <p className="text-xs text-[#888888] mt-1">
            Tổng cộng {orders.length} đơn hàng theo tiêu chí lọc
          </p>
        </div>

        <a
          href="/api/admin/orders/export"
          download
          className="flex items-center gap-2 px-4 py-2 bg-[#202020] hover:bg-[#282828] text-white border border-[#333333] rounded-[6px] text-xs font-semibold self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5 text-[#00cbca]" />
          <span>Xuất File CSV</span>
        </a>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-[6px] p-2 flex items-center gap-2 flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#888888] ml-2" />
          <input
            type="text"
            placeholder="Tìm theo mã đơn, tên khách, số điện thoại..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-xs text-white outline-none w-full"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-1.5 text-xs">
          {[
            { key: "ALL", label: "Tất cả" },
            { key: "PENDING", label: "Chờ xác nhận" },
            { key: "PROCESSING", label: "Đang đóng gói" },
            { key: "SHIPPED", label: "Đang giao" },
            { key: "DELIVERED", label: "Giao thành công" },
            { key: "CANCELLED", label: "Đã hủy" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 rounded-[4px] font-semibold transition-colors ${
                statusFilter === tab.key
                  ? "bg-[#dba200] text-black font-bold"
                  : "bg-[#1e1e1e] text-[#dddddd] hover:bg-[#282828]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-[8px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#141414] text-[#888888] uppercase text-[10px]">
              <tr>
                <th className="p-3">Mã Đơn Hàng</th>
                <th className="p-3">Khách Hàng</th>
                <th className="p-3">Giao Hàng</th>
                <th className="p-3">Tổng Tiền</th>
                <th className="p-3">Thanh Toán</th>
                <th className="p-3">Trạng Thái</th>
                <th className="p-3">Ngày Đặt</th>
                <th className="p-3 text-right">Hành Động Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a2a]">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-[#252525] transition-colors">
                  <td className="p-3 font-mono font-bold text-white">
                    <button
                      onClick={() => setSelectedOrder(o)}
                      className="hover:text-[#dba200] text-left underline"
                    >
                      {o.orderNumber}
                    </button>
                  </td>
                  <td className="p-3">
                    <span className="font-bold text-white block">{o.customerName}</span>
                    <span className="text-[10px] text-[#888888]">{o.customerPhone}</span>
                  </td>
                  <td className="p-3 text-[#dddddd] max-w-[180px] truncate">
                    {o.shippingAddress}, {o.shippingCity}
                  </td>
                  <td className="p-3 font-bold text-white">{formatVND(o.total)}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        o.paymentStatus === "PAID"
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                          : "bg-amber-950 text-amber-400 border border-amber-800"
                      }`}
                    >
                      {o.paymentStatus}
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        o.status === "DELIVERED"
                          ? "bg-emerald-900/60 text-emerald-300"
                          : o.status === "CANCELLED"
                          ? "bg-red-950 text-red-400"
                          : o.status === "PROCESSING"
                          ? "bg-blue-950 text-blue-300"
                          : "bg-neutral-800 text-neutral-300"
                      }`}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td className="p-3 text-[11px] text-[#888888]">{formatDate(o.createdAt)}</td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {o.status === "PENDING" && (
                        <button
                          onClick={() => handleUpdateStatus(o.id, "PROCESSING")}
                          className="px-2 py-1 bg-blue-900 hover:bg-blue-800 text-blue-200 rounded text-[10px] font-bold"
                          title="Chuyển sang đóng gói"
                        >
                          Xác nhận & Đóng gói
                        </button>
                      )}
                      {o.status === "PROCESSING" && (
                        <button
                          onClick={() => handleUpdateStatus(o.id, "SHIPPED")}
                          className="px-2 py-1 bg-[#272967] hover:bg-[#343785] text-[#dba200] rounded text-[10px] font-bold"
                          title="Chuyển bưu tá vận chuyển"
                        >
                          Giao Bưu Tá
                        </button>
                      )}
                      {o.status === "SHIPPED" && (
                        <button
                          onClick={() => handleUpdateStatus(o.id, "DELIVERED", "PAID")}
                          className="px-2 py-1 bg-emerald-900 hover:bg-emerald-800 text-emerald-200 rounded text-[10px] font-bold"
                          title="Hoàn tất đơn hàng"
                        >
                          Giao Thành Công
                        </button>
                      )}
                      {o.status !== "CANCELLED" && o.status !== "DELIVERED" && (
                        <button
                          onClick={() => handleUpdateStatus(o.id, "CANCELLED")}
                          className="px-2 py-1 bg-[#bc0000]/20 hover:bg-[#bc0000]/40 text-[#bc0000] rounded text-[10px] font-bold"
                          title="Hủy đơn"
                        >
                          Hủy
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ORDER DETAILS MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-xs"
            onClick={() => setSelectedOrder(null)}
          />
          <div className="relative bg-[#1e1e1e] border border-[#333333] rounded-[10px] shadow-2xl max-w-2xl w-full p-6 z-10 text-white space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-[#2e2e2e]">
              <div>
                <span className="text-[10px] text-[#888888] uppercase">CHI TIẾT ĐƠN HÀNG</span>
                <h3 className="font-mono font-bold text-lg text-[#dba200]">
                  {selectedOrder.orderNumber}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-[#888888] hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-[#141414] p-4 rounded border border-[#2a2a2a]">
              <div>
                <span className="text-[#888888] block">Khách hàng:</span>
                <strong className="text-white text-sm">{selectedOrder.customerName}</strong>
                <p className="text-[#888888]">{selectedOrder.customerPhone}</p>
                <p className="text-[#888888]">{selectedOrder.customerEmail}</p>
              </div>
              <div>
                <span className="text-[#888888] block">Giao đến:</span>
                <p className="text-white">{selectedOrder.shippingAddress}</p>
                <p className="text-[#888888]">{selectedOrder.shippingCity}</p>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase text-[#888888]">Các món trong đơn:</span>
              <div className="divide-y divide-[#2a2a2a] text-xs">
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="py-2 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-white">{item.productTitle}</span>
                      <span className="block text-[10px] text-[#888888]">
                        SKU: {item.sku} • SL: {item.quantity} × {formatVND(item.price)}
                      </span>
                    </div>
                    <span className="font-bold text-white">{formatVND(item.total)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-[#2e2e2e] flex justify-between items-baseline text-sm">
              <span className="font-bold text-[#dddddd]">Tổng thanh toán:</span>
              <span className="font-black text-xl text-white">{formatVND(selectedOrder.total)}</span>
            </div>

            <div className="pt-3 border-t border-[#2e2e2e] flex justify-end gap-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-[#252525] hover:bg-[#303030] rounded text-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
