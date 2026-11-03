"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, ArrowLeft } from "lucide-react";

export default function ProductError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Product Detail render error caught by boundary:", error);
  }, [error]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
      <div className="w-16 h-16 bg-[#c31833]/10 text-[#c31833] rounded-full flex items-center justify-center mx-auto">
        <AlertCircle className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-black tracking-tight">
          Không thể hiển thị chi tiết sản phẩm
        </h2>
        <p className="text-sm text-[#595959] max-w-md mx-auto">
          Hệ thống gặp sự cố tạm thời khi tải dữ liệu sản phẩm. Vui lòng thử tải lại trang hoặc quay lại danh mục.
        </p>
      </div>

      <div className="flex items-center justify-center gap-4 pt-4">
        <button
          onClick={() => reset()}
          className="btn-pill-dark px-6 py-2.5 text-xs flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Tải lại trang</span>
        </button>

        <Link
          href="/products"
          className="btn-pill-outline px-6 py-2.5 text-xs flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Xem tất cả sản phẩm</span>
        </Link>
      </div>
    </div>
  );
}
