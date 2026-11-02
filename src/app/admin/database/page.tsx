"use client";

import React, { useEffect, useState } from "react";
import {
  Database,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  RefreshCw,
  Search,
  Zap,
  Activity,
  ShieldCheck,
  Server,
  Layers,
  ArrowRight,
} from "lucide-react";
import { formatVND } from "@/lib/utils";

interface DatabaseMetrics {
  engine: string;
  filePath: string;
  sizeBytes: number;
  sizeMB: number;
  sizeGB_dec: number;
  sizeGiB_bin: number;
  pageCount: number;
  pageSize: number;
  freelistCount: number;
  targets: {
    goal5GB_Dec: number;
    goal5GiB_Bin: number;
    pass5GB_Dec: boolean;
    pass5GiB_Bin: boolean;
    percentTo5GB: number;
    percentTo5GiB: number;
  };
  records: {
    total: number;
    realStore: number;
    bigData: number;
  };
  tableStats: Array<{
    table: string;
    label: string;
    type: "STORE" | "BIGDATA";
    count: number;
  }>;
  importJobs: Array<{
    id: string;
    jobName: string;
    stage: string;
    targetSize: string;
    status: string;
    recordsProcessed: number;
    currentBytes: string;
    startedAt: string;
    finishedAt: string;
  }>;
  queryBenchmarks: {
    searchLikeQueryMs: number;
    groupByQueryMs: number;
  };
}

export default function AdminDatabasePage() {
  const [data, setData] = useState<DatabaseMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterType, setFilterType] = useState<"ALL" | "STORE" | "BIGDATA">("ALL");
  const [searchTable, setSearchTable] = useState("");
  const [testLatency, setTestLatency] = useState<{ searchMs: number; groupMs: number } | null>(null);
  const [testingQuery, setTestingQuery] = useState(false);

  const fetchMetrics = async () => {
    try {
      setRefreshing(true);
      const res = await fetch("/api/admin/database");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Fetch DB metrics error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const runLiveQueryBenchmark = async () => {
    setTestingQuery(true);
    await fetchMetrics();
    if (data?.queryBenchmarks) {
      setTestLatency({
        searchMs: data.queryBenchmarks.searchLikeQueryMs,
        groupMs: data.queryBenchmarks.groupByQueryMs,
      });
    }
    setTestingQuery(false);
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-xs text-[#bebebe]">
        <RefreshCw className="w-5 h-5 animate-spin mr-2 text-[#fa9000]" />
        Đang đo lường và thống kê dung lượng database thời gian thực...
      </div>
    );
  }

  const filteredTables = data.tableStats.filter((t) => {
    const matchType = filterType === "ALL" || t.type === filterType;
    const matchSearch =
      t.table.toLowerCase().includes(searchTable.toLowerCase()) ||
      t.label.toLowerCase().includes(searchTable.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#2a2a2a] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-6 bg-[#fa9000]" />
            <h1 className="text-xl font-bold text-white tracking-wide uppercase">
              Báo Cáo Dung Lượng Database & Big Data (5GB+)
            </h1>
          </div>
          <p className="text-xs text-[#bebebe] mt-1">
            Hệ thống đo lường dung lượng thực tế, tách biệt dữ liệu bán hàng chuẩn và bộ dữ liệu mô phỏng lớn
          </p>
        </div>

        <button
          onClick={fetchMetrics}
          disabled={refreshing}
          className="btn-pill-outline bg-[#202020] border-[#383838] text-white hover:bg-[#282828] text-xs flex items-center gap-2 py-2 px-4 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-[#fa9000]" : ""}`} />
          <span>Làm mới chỉ số</span>
        </button>
      </div>

      {/* Main Target Gauge Card */}
      <div className="bg-[#202020] border border-[#2f2f2f] rounded-[10px] p-6 space-y-6">
        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-6 pb-6 border-b border-[#2a2a2a]">
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-[#fa9000] uppercase tracking-wider block">
              DUNG LƯỢNG THỰC TẾ TRÊN ĐĨA (PHYSICAL ON-DISK STORAGE)
            </span>
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-4xl sm:text-5xl font-black text-white tracking-tight">
                {data.sizeGiB_bin} <span className="text-2xl text-[#fa9000]">GiB</span>
              </span>
              <span className="text-sm font-mono text-[#bebebe]">
                ({data.sizeBytes.toLocaleString()} bytes / {data.sizeMB.toLocaleString()} MB)
              </span>
            </div>
            <p className="text-xs text-[#8c8c8c]">
              Tệp cơ sở dữ liệu: <code className="text-[#dba200] font-mono">{data.filePath}</code>
            </p>
          </div>

          {/* Target Status Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-[320px]">
            <div
              className={`p-3 rounded-[8px] border flex items-center gap-3 ${
                data.targets.pass5GB_Dec
                  ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-400"
                  : "bg-amber-950/30 border-amber-500/40 text-amber-300"
              }`}
            >
              {data.targets.pass5GB_Dec ? (
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-5 h-5 shrink-0 text-amber-400" />
              )}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider block">
                  5.000.000.000 Bytes (5GB Thập Phân)
                </span>
                <span className="font-bold text-sm">
                  {data.targets.pass5GB_Dec ? "ĐẠT CHUẨN (PASS)" : `${data.targets.percentTo5GB}%`}
                </span>
              </div>
            </div>

            <div
              className={`p-3 rounded-[8px] border flex items-center gap-3 ${
                data.targets.pass5GiB_Bin
                  ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-400"
                  : "bg-amber-950/30 border-amber-500/40 text-amber-300"
              }`}
            >
              {data.targets.pass5GiB_Bin ? (
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-5 h-5 shrink-0 text-amber-400" />
              )}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider block">
                  5.368.709.120 Bytes (5GiB Nhị Phân)
                </span>
                <span className="font-bold text-sm">
                  {data.targets.pass5GiB_Bin ? "ĐẠT CHUẨN (PASS)" : `${data.targets.percentTo5GiB}%`}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar towards 5GiB */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-[#bebebe] font-medium">Tiến độ đạt mốc chuẩn 5GiB:</span>
            <span className="font-mono font-bold text-white">
              {data.sizeBytes.toLocaleString()} / {data.targets.goal5GiB_Bin.toLocaleString()} bytes ({data.targets.percentTo5GiB}%)
            </span>
          </div>
          <div className="w-full h-3.5 bg-[#141414] rounded-full overflow-hidden border border-[#333333]">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                data.targets.pass5GiB_Bin
                  ? "bg-gradient-to-r from-[#fa9000] via-[#dba200] to-emerald-500"
                  : "bg-gradient-to-r from-[#fa9000] to-[#ffa000]"
              }`}
              style={{ width: `${Math.min(100, data.targets.percentTo5GiB)}%` }}
            />
          </div>
        </div>

        {/* Storage Architecture Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="bg-[#181818] border border-[#2b2b2b] rounded-[8px] p-4 space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#8c8c8c] flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-[#fa9000]" />
              HỆ QUẢN TRỊ & ĐỘNG CƠ LƯU TRỮ
            </span>
            <p className="font-bold text-sm text-white">{data.engine}</p>
            <p className="text-[11px] text-[#888888]">
              {data.pageCount.toLocaleString()} trang x {data.pageSize} bytes/page
            </p>
          </div>

          <div className="bg-[#181818] border border-[#2b2b2b] rounded-[8px] p-4 space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#8c8c8c] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              DỮ LIỆU KINH DOANH THẬT
            </span>
            <p className="font-bold text-sm text-emerald-400 font-mono">
              {data.records.realStore.toLocaleString()} bản ghi
            </p>
            <p className="text-[11px] text-[#888888]">
              Bảo toàn 100% sản phẩm, đơn hàng và khách hàng thật
            </p>
          </div>

          <div className="bg-[#181818] border border-[#2b2b2b] rounded-[8px] p-4 space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#8c8c8c] flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#00cbca]" />
              BIG DATA TELEMETRY & AUDIT
            </span>
            <p className="font-bold text-sm text-[#00cbca] font-mono">
              {data.records.bigData.toLocaleString()} bản ghi
            </p>
            <p className="text-[11px] text-[#888888]">
              Lượt xem, tìm kiếm, nhập xuất kho & nhật ký hệ thống
            </p>
          </div>
        </div>
      </div>

      {/* Query Performance Benchmark Card */}
      <div className="bg-[#202020] border border-[#2f2f2f] rounded-[10px] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#fa9000]" />
              Hiệu Năng Truy Vấn Trên Tập Dữ Liệu Lớn (Big Data Benchmark)
            </h3>
            <p className="text-xs text-[#bebebe]">
              Đo tốc độ thực tế với hàng triệu bản ghi có Indexing và Connection Pooling
            </p>
          </div>

          <button
            onClick={runLiveQueryBenchmark}
            disabled={testingQuery}
            className="btn-pill-dark bg-[#fa9000] text-black font-bold hover:bg-[#ffc500] text-xs py-2 px-4 flex items-center gap-2 cursor-pointer"
          >
            <Zap className={`w-3.5 h-3.5 ${testingQuery ? "animate-spin" : ""}`} />
            <span>Chạy kiểm thử truy vấn ngay</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 bg-[#181818] border border-[#2a2a2a] rounded-[8px] space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-white">Truy Vấn Tìm Kiếm SearchEvents:</span>
              <span className="font-mono font-bold text-emerald-400 text-sm">
                {data.queryBenchmarks.searchLikeQueryMs} ms
              </span>
            </div>
            <code className="block text-[11px] text-[#888888] font-mono bg-[#111111] p-2 rounded">
              SELECT id, query FROM search_events WHERE query LIKE &apos;%iphone%&apos; LIMIT 10;
            </code>
            <p className="text-[11px] text-[#bebebe]">
              Tối ưu bằng B-Tree Index trên trường query và timestamp.
            </p>
          </div>

          <div className="p-4 bg-[#181818] border border-[#2a2a2a] rounded-[8px] space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-white">Truy Vấn Thống Kê Group By ProductViewEvents:</span>
              <span className="font-mono font-bold text-emerald-400 text-sm">
                {data.queryBenchmarks.groupByQueryMs} ms
              </span>
            </div>
            <code className="block text-[11px] text-[#888888] font-mono bg-[#111111] p-2 rounded">
              SELECT productId, COUNT(*) FROM product_view_events GROUP BY productId;
            </code>
            <p className="text-[11px] text-[#bebebe]">
              Tận dụng Composite Index (productId, createdAt) tránh Full Table Scan.
            </p>
          </div>
        </div>
      </div>

      {/* Table Statistics Breakdown */}
      <div className="bg-[#202020] border border-[#2f2f2f] rounded-[10px] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#fa9000]" />
              Chi Tiết Bản Ghi Từng Bảng ({data.tableStats.length} Bảng)
            </h3>
            <p className="text-xs text-[#bebebe]">
              Tổng số bản ghi trong cơ sở dữ liệu: <strong className="text-white font-mono">{data.records.total.toLocaleString()}</strong>
            </p>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm bảng..."
                value={searchTable}
                onChange={(e) => setSearchTable(e.target.value)}
                className="bg-[#181818] border border-[#333333] rounded-[6px] pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-[#666666] outline-none focus:border-[#fa9000]"
              />
              <Search className="w-3.5 h-3.5 text-[#666666] absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>

            <div className="flex border border-[#333333] rounded-[6px] overflow-hidden bg-[#181818] text-xs">
              <button
                onClick={() => setFilterType("ALL")}
                className={`px-3 py-1.5 font-bold transition-colors ${
                  filterType === "ALL" ? "bg-[#fa9000] text-black" : "text-[#bebebe] hover:text-white"
                }`}
              >
                Tất Cả
              </button>
              <button
                onClick={() => setFilterType("STORE")}
                className={`px-3 py-1.5 font-bold transition-colors border-l border-[#333333] ${
                  filterType === "STORE" ? "bg-[#fa9000] text-black" : "text-[#bebebe] hover:text-white"
                }`}
              >
                Cửa Hàng Thật
              </button>
              <button
                onClick={() => setFilterType("BIGDATA")}
                className={`px-3 py-1.5 font-bold transition-colors border-l border-[#333333] ${
                  filterType === "BIGDATA" ? "bg-[#fa9000] text-black" : "text-[#bebebe] hover:text-white"
                }`}
              >
                Big Data (Telemetry)
              </button>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto border border-[#2a2a2a] rounded-[8px]">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#141414] text-[#8c8c8c] uppercase border-b border-[#2a2a2a]">
              <tr>
                <th className="py-3 px-4">Tên Bảng (Database Table)</th>
                <th className="py-3 px-4">Mô Tả Nghiệp Vụ</th>
                <th className="py-3 px-4 text-center">Phân Loại Dữ Liệu</th>
                <th className="py-3 px-4 text-right">Số Bản Ghi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262626]">
              {filteredTables.map((t, idx) => (
                <tr key={t.table} className={idx % 2 === 0 ? "bg-[#1d1d1d]" : "bg-[#202020]"}>
                  <td className="py-2.5 px-4 font-mono font-bold text-white">
                    {t.table}
                  </td>
                  <td className="py-2.5 px-4 text-[#bebebe]">
                    {t.label}
                  </td>
                  <td className="py-2.5 px-4 text-center">
                    {t.type === "BIGDATA" ? (
                      <span className="inline-block bg-[#00cbca]/10 text-[#00cbca] border border-[#00cbca]/30 px-2 py-0.5 rounded text-[10px] font-bold">
                        Big Data / Telemetry
                      </span>
                    ) : (
                      <span className="inline-block bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-bold">
                        Bán Hàng Thật
                      </span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 text-right font-mono font-bold text-white">
                    {t.count.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

