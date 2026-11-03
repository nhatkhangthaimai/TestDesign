"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error boundary triggered:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-white border border-[#d8d8d8] rounded-[10px] p-8 text-center shadow-sm space-y-6">
        <div className="w-16 h-16 bg-[#fa9000]/10 text-[#fa9000] rounded-full flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-black">Đã xảy ra sự cố hiển thị</h2>
          <p className="text-xs text-[#595959] leading-relaxed">
            Hệ thống không thể tải trang bạn yêu cầu lúc này. Chúng tôi đã ghi nhận sự cố để xử lý.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="btn-pill-dark flex-1 py-2.5 text-xs flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Thử lại</span>
          </button>
          <Link
            href="/"
            className="btn-pill-outline flex-1 py-2.5 text-xs flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            <span>Về trang chủ</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

