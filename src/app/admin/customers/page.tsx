"use client";

import React, { useEffect, useState } from "react";
import { Users, Mail, Phone, Calendar, ShoppingBag, ShieldCheck } from "lucide-react";
import { formatVND, formatDate } from "@/lib/utils";

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: string;
  orderCount: number;
  totalSpent: number;
  createdAt: string;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCustomers() {
      try {
        const res = await fetch("/api/admin/customers");
        if (res.ok) {
          const data = await res.json();
          setCustomers(data.customers || []);
        }
      } catch (err) {
        console.error("Customers error:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCustomers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[#2a2a2a]">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          QUẢN LÝ KHÁCH HÀNG & THÀNH VIÊN
        </h1>
        <p className="text-xs text-[#888888] mt-1">
          Danh sách khách hàng đăng ký và tổng chi tiêu lũy kế trên sàn
        </p>
      </div>

      <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-[8px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#141414] text-[#888888] uppercase text-[10px]">
              <tr>
                <th className="p-3">Khách Hàng</th>
                <th className="p-3">Email</th>
                <th className="p-3">Số Điện Thoại</th>
                <th className="p-3">Phân Quyền</th>
                <th className="p-3">Số Đơn Hàng</th>
                <th className="p-3">Tổng Chi Tiêu</th>
                <th className="p-3">Ngày Gia Nhập</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a2a]">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-[#252525] transition-colors">
                  <td className="p-3">
                    <span className="font-bold text-white block">{c.name}</span>
                  </td>
                  <td className="p-3 text-[#dddddd]">{c.email}</td>
                  <td className="p-3 text-[#888888]">{c.phone || "Chưa cập nhật"}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        c.role === "ROLE_ADMIN"
                          ? "bg-[#272967] text-[#dba200] border border-[#dba200]/40"
                          : "bg-neutral-800 text-neutral-300"
                      }`}
                    >
                      {c.role}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-white">{c.orderCount} đơn</td>
                  <td className="p-3 font-bold text-[#dba200]">{formatVND(c.totalSpent)}</td>
                  <td className="p-3 text-[11px] text-[#888888]">{formatDate(c.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
