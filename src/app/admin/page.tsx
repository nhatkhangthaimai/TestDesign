"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  DollarSign,
  ShoppingBag,
  Clock,
  Users,
  AlertTriangle,
  Download,
  Plus,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { formatVND, formatDate } from "@/lib/utils";

interface DashboardData {
  metrics: {
    totalRevenue: number;
    totalOrders: number;
    pendingOrders: number;
    processingOrders: number;
    deliveredOrders: number;
    totalCustomers: number;
    totalProducts: number;
    lowStockCount: number;
  };
  lowStockProducts: Array<{
    id: string;
    title: string;
    sku: string;
    stock: number;
  }>;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    total: number;
    status: string;
    paymentStatus: string;
    createdAt: string;
  }>;
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/dashboard");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return <div className="text-xs text-[#595959] p-8">Đang đồng bộ dữ liệu quản trị...</div>;
  }

  const metrics = data?.metrics;

  return (
    <div className="space-y-8">
      {/* Header and Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2a2a2a]">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            TỔNG QUAN TÌNH HÌNH KINH DOANH
          </h1>
          <p className="text-xs text-[#888888] mt-1">
            Số liệu tài chính, quản lý tồn kho và đơn hàng theo thời gian thực
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/api/admin/orders/export"
            download
            className="flex items-center gap-2 px-4 py-2 bg-[#202020] hover:bg-[#282828] text-white border border-[#333333] rounded-[6px] text-xs font-semibold transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#00cbca]" />
            <span>Xuất file CSV Đơn Hàng</span>
          </a>

          <Link
            href="/admin/products"
            className="flex items-center gap-2 px-4 py-2 bg-[#dba200] hover:bg-[#ffc500] text-black rounded-[6px] text-xs font-bold transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Sản Phẩm Mới</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid - DESIGN.md Royal Indigo Panels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Revenue */}
        <div className="bg-[#272967] border border-[#3b3e8c] p-5 rounded-[8px] space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-[#dba200] font-bold uppercase tracking-wider">
            <span>TỔNG DOANH THU THỰC</span>
            <DollarSign className="w-4 h-4" />
          </div>
          <div className="font-black text-2xl text-white">
            {formatVND(metrics?.totalRevenue || 0)}
          </div>
          <div className="text-[11px] text-white/70 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span>Doanh thu từ các đơn hàng thành công</span>
          </div>
        </div>

        {/* Metric 2: Total Orders */}
        <div className="bg-[#1e1e1e] border border-[#2e2e2e] p-5 rounded-[8px] space-y-3">
          <div className="flex items-center justify-between text-xs text-[#dddddd] font-bold uppercase tracking-wider">
            <span>TỔNG SỐ ĐƠN HÀNG</span>
            <ShoppingBag className="w-4 h-4 text-[#fa9000]" />
          </div>
          <div className="font-black text-2xl text-white">{metrics?.totalOrders || 0}</div>
          <div className="text-[11px] text-[#888888]">
            {metrics?.deliveredOrders || 0} đơn đã giao thành công
          </div>
        </div>

        {/* Metric 3: Pending Orders */}
        <div className="bg-[#1e1e1e] border border-[#2e2e2e] p-5 rounded-[8px] space-y-3">
          <div className="flex items-center justify-between text-xs text-[#c31833] font-bold uppercase tracking-wider">
            <span>ĐƠN CẦN XỬ LÝ</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="font-black text-2xl text-white">{metrics?.pendingOrders || 0}</div>
          <div className="text-[11px] text-[#888888]">
            Cần xác nhận và xuất kho ngay
          </div>
        </div>

        {/* Metric 4: Total Customers & Low Stock */}
        <div className="bg-[#1e1e1e] border border-[#2e2e2e] p-5 rounded-[8px] space-y-3">
          <div className="flex items-center justify-between text-xs text-[#00cbca] font-bold uppercase tracking-wider">
            <span>KHÁCH HÀNG & TỒN KHO</span>
            <Users className="w-4 h-4" />
          </div>
          <div className="font-black text-2xl text-white">
            {metrics?.totalCustomers || 0}{" "}
            <span className="text-xs font-normal text-[#888888]">khách</span>
          </div>
          <div className="text-[11px] text-[#bc0000] font-bold">
            {metrics?.lowStockCount || 0} sản phẩm sắp hết hàng
          </div>
        </div>
      </div>

      {/* Two Column Layout: Recent Orders & Low Stock Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Recent Orders Table */}
        <div className="lg:col-span-8 bg-[#1e1e1e] border border-[#2e2e2e] rounded-[8px] p-6 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-[#2e2e2e]">
            <h3 className="font-bold text-sm text-white uppercase tracking-wider">
              Đơn Hàng Gần Đây Cần Theo Dõi
            </h3>
            <Link
              href="/admin/orders"
              className="text-xs text-[#dba200] hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Xem toàn bộ đơn</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#141414] text-[#888888] uppercase text-[10px]">
                <tr>
                  <th className="p-3">Mã Đơn</th>
                  <th className="p-3">Khách Hàng</th>
                  <th className="p-3">Tổng Tiền</th>
                  <th className="p-3">Thanh Toán</th>
                  <th className="p-3">Trạng Thái</th>
                  <th className="p-3">Thời Gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a2a]">
                {data?.recentOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-[#252525] transition-colors">
                    <td className="p-3 font-mono font-bold text-white">{o.orderNumber}</td>
                    <td className="p-3">
                      <span className="font-bold text-white block">{o.customerName}</span>
                      <span className="text-[10px] text-[#888888]">{o.customerPhone}</span>
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
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#141414] text-[#dddddd] border border-[#333333]">
                        {o.status}
                      </span>
                    </td>
                    <td className="p-3 text-[11px] text-[#888888]">{formatDate(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Low Stock Alerts */}
        <div className="lg:col-span-4 bg-[#1e1e1e] border border-[#2e2e2e] rounded-[8px] p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#2e2e2e]">
            <AlertTriangle className="w-4 h-4 text-[#bc0000]" />
            <h3 className="font-bold text-sm text-white uppercase tracking-wider">
              Cảnh Báo Tồn Kho Thấp
            </h3>
          </div>

          <div className="divide-y divide-[#2a2a2a]">
            {data?.lowStockProducts.map((p) => (
              <div key={p.id} className="py-3 flex justify-between items-center text-xs">
                <div>
                  <h4 className="font-bold text-white line-clamp-1">{p.title}</h4>
                  <span className="text-[10px] font-mono text-[#888888]">SKU: {p.sku}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-sm text-[#bc0000]">{p.stock} cái</span>
                  <span className="block text-[10px] text-[#888888]">còn lại</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <Link
              href="/admin/products"
              className="w-full btn-pill-dark bg-[#282828] text-white hover:bg-black text-xs py-2 flex items-center justify-center gap-1.5"
            >
              <span>Quản lý kho hàng</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
