"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Tv,
  Plus,
  Pencil,
  Trash2,
  Eye,
  ArrowUp,
  ArrowDown,
  Upload,
  Video,
  ImageIcon,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  RotateCcw,
  Sparkles,
  Play,
  Monitor,
  Smartphone,
  Layers,
  Clock,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";

function getYouTubeVideoId(url: string | null | undefined): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/
  );
  return match ? match[1] : null;
}

interface Banner {
  id: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  imageUrl: string;
  videoUrl?: string | null;
  videoMobileUrl?: string | null;
  posterUrl?: string | null;
  mediaType: "IMAGE" | "VIDEO" | string;
  linkUrl?: string | null;
  badgeText?: string | null;
  ctaText?: string | null;
  textColor?: string | null;
  overlayColor?: string | null;
  overlayOpacity?: number | null;
  contentPosition?: "LEFT" | "CENTER" | "RIGHT" | string | null;
  targetDevice?: "ALL" | "DESKTOP" | "MOBILE" | string | null;
  position: string;
  isActive: boolean;
  sortOrder: number;
  durationSeconds?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  createdAt: string;
}

const PRESET_VIDEOS = [
  {
    name: "Apple Tech Cinematic 1080p",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    posterUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1920&q=85",
  },
  {
    name: "Hi-End Audio Studio 1080p",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4",
    posterUrl: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1920&q=85",
  },
  {
    name: "Modern Laptop Workstation 1080p",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
    posterUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1920&q=85",
  },
];

export default function AdminBannersPage() {
  const { success, error, info } = useToast();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [previewBanner, setPreviewBanner] = useState<Banner | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    mediaType: "VIDEO" as "VIDEO" | "IMAGE",
    imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1920&q=85",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    videoMobileUrl: "",
    posterUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1920&q=85",
    badgeText: "MỞ BÁN ĐẶC QUYỀN 2026",
    ctaText: "Khám Phá Ngay",
    linkUrl: "/products",
    textColor: "#ffffff",
    overlayColor: "#000000",
    overlayOpacity: 0.45,
    contentPosition: "LEFT" as "LEFT" | "CENTER" | "RIGHT",
    targetDevice: "ALL" as "ALL" | "DESKTOP" | "MOBILE",
    position: "HERO",
    isActive: true,
    sortOrder: 1,
    durationSeconds: 8,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const posterInputRef = useRef<HTMLInputElement>(null);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/banners");
      if (!res.ok) throw new Error("Không thể tải danh sách banner");
      const data = await res.json();
      setBanners(data.banners || []);
    } catch (err: any) {
      error(err.message || "Lỗi kết nối");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleOpenAdd = () => {
    setEditingBanner(null);
    setFormData({
      title: "",
      subtitle: "",
      description: "",
      mediaType: "VIDEO",
      imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1920&q=85",
      videoUrl: PRESET_VIDEOS[0].videoUrl,
      videoMobileUrl: "",
      posterUrl: PRESET_VIDEOS[0].posterUrl,
      badgeText: "MỞ BÁN ĐẶC QUYỀN 2026",
      ctaText: "Khám Phá Ngay",
      linkUrl: "/products",
      textColor: "#ffffff",
      overlayColor: "#000000",
      overlayOpacity: 0.45,
      contentPosition: "LEFT",
      targetDevice: "ALL",
      position: "HERO",
      isActive: true,
      sortOrder: banners.length + 1,
      durationSeconds: 8,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || "",
      description: banner.description || "",
      mediaType: (banner.mediaType as any) || (banner.videoUrl ? "VIDEO" : "IMAGE"),
      imageUrl: banner.imageUrl,
      videoUrl: banner.videoUrl || "",
      videoMobileUrl: banner.videoMobileUrl || "",
      posterUrl: banner.posterUrl || banner.imageUrl,
      badgeText: banner.badgeText || "",
      ctaText: banner.ctaText || "Khám Phá Ngay",
      linkUrl: banner.linkUrl || "/products",
      textColor: banner.textColor || "#ffffff",
      overlayColor: banner.overlayColor || "#000000",
      overlayOpacity: banner.overlayOpacity ?? 0.45,
      contentPosition: (banner.contentPosition as any) || "LEFT",
      targetDevice: (banner.targetDevice as any) || "ALL",
      position: banner.position || "HERO",
      isActive: banner.isActive,
      sortOrder: banner.sortOrder,
      durationSeconds: banner.durationSeconds || 8,
    });
    setIsModalOpen(true);
  };

  const handleToggleActive = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/banners/${id}/toggle`, {
        method: "PATCH",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lỗi cập nhật trạng thái");
      success(data.message);
      setBanners((prev) =>
        prev.map((b) => (b.id === id ? { ...b, isActive: !b.isActive } : b))
      );
    } catch (err: any) {
      error(err.message || "Lỗi kết nối");
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa banner "${title}"?`)) return;
    try {
      const res = await fetch(`/api/admin/banners/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lỗi xóa banner");
      success(data.message);
      setBanners((prev) => prev.filter((b) => b.id !== id));
    } catch (err: any) {
      error(err.message || "Lỗi kết nối");
    }
  };

  const handleMoveOrder = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= banners.length) return;

    const newBanners = [...banners];
    const temp = newBanners[index];
    newBanners[index] = newBanners[targetIndex];
    newBanners[targetIndex] = temp;

    // Re-assign sortOrder
    const updatedItems = newBanners.map((b, i) => ({
      ...b,
      sortOrder: i + 1,
    }));

    setBanners(updatedItems);

    try {
      const res = await fetch("/api/admin/banners/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: updatedItems.map((b) => ({ id: b.id, sortOrder: b.sortOrder })),
        }),
      });
      if (!res.ok) throw new Error("Lỗi cập nhật thứ tự");
      success("Đã cập nhật thứ tự hiển thị banner");
    } catch (err: any) {
      error(err.message || "Lỗi cập nhật thứ tự");
      fetchBanners();
    }
  };

  const handleFileUpload = async (file: File, target: "video" | "image" | "poster") => {
    try {
      setUploadingMedia(true);
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Tải file lên thất bại");

      success(`Đã tải lên ${data.fileName}`);

      if (target === "video") {
        setFormData((prev) => ({
          ...prev,
          videoUrl: data.url,
          mediaType: "VIDEO",
        }));
      } else if (target === "image") {
        setFormData((prev) => ({
          ...prev,
          imageUrl: data.url,
        }));
      } else if (target === "poster") {
        setFormData((prev) => ({
          ...prev,
          posterUrl: data.url,
          imageUrl: prev.imageUrl || data.url,
        }));
      }
    } catch (err: any) {
      error(err.message || "Lỗi tải file");
    } finally {
      setUploadingMedia(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      error("Vui lòng nhập tiêu đề banner");
      return;
    }
    if (formData.mediaType === "VIDEO" && !formData.videoUrl?.trim()) {
      error("Vui lòng nhập đường dẫn video hoặc tải video 1080p lên");
      return;
    }
    if (formData.mediaType === "IMAGE" && !formData.imageUrl?.trim()) {
      error("Vui lòng nhập đường dẫn hình ảnh");
      return;
    }

    try {
      setSubmitting(true);
      const url = editingBanner
        ? `/api/admin/banners/${editingBanner.id}`
        : "/api/admin/banners";
      const method = editingBanner ? "PUT" : "POST";

      const payload = {
        ...formData,
        imageUrl: formData.imageUrl || formData.posterUrl || "https://images.unsplash.com/photo-1695048133142-1a20484d2569",
        posterUrl: formData.posterUrl || formData.imageUrl,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Không thể lưu banner");

      success(data.message || "Lưu banner thành công!");
      setIsModalOpen(false);
      fetchBanners();
    } catch (err: any) {
      error(err.message || "Lỗi lưu dữ liệu");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 text-white">
      {/* 1. Header Lockup */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2a2a2a] pb-6">
        <div>
          <div className="flex items-center gap-2.5 text-[#dba200] text-xs font-mono uppercase tracking-widest mb-1.5">
            <Tv className="w-4 h-4" />
            <span>HỆ THỐNG MARKETING & MEDIA QUẢNG BÁ</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            QUẢN LÝ VIDEO BANNER 1080P & HERO MASTHEAD
          </h1>
          <p className="text-xs sm:text-sm text-[#bebebe] mt-1">
            Thiết lập video Full HD 1080p tự động phát, poster dự phòng, tùy biến màu sắc, overlay và điều hướng trang chủ.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="btn-pill-dark bg-[#fa9000] text-black font-extrabold text-xs sm:text-sm py-2.5 px-5 hover:bg-[#ffa000] flex items-center justify-center gap-2 shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Banner Mới</span>
        </button>
      </div>

      {/* 2. Statistical Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-[10px] p-4">
          <span className="text-[11px] font-mono text-[#595959] uppercase block">Tổng Banner</span>
          <span className="text-2xl font-black text-white mt-1 block">{banners.length}</span>
        </div>
        <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-[10px] p-4">
          <span className="text-[11px] font-mono text-[#00cbca] uppercase block">Đang Hiển Thị</span>
          <span className="text-2xl font-black text-white mt-1 block">
            {banners.filter((b) => b.isActive).length}
          </span>
        </div>
        <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-[10px] p-4">
          <span className="text-[11px] font-mono text-[#dba200] uppercase block">Video 1080p HD</span>
          <span className="text-2xl font-black text-white mt-1 block">
            {banners.filter((b) => b.mediaType === "VIDEO" || b.videoUrl).length}
          </span>
        </div>
        <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-[10px] p-4">
          <span className="text-[11px] font-mono text-[#bebebe] uppercase block">Ảnh Tĩnh</span>
          <span className="text-2xl font-black text-white mt-1 block">
            {banners.filter((b) => b.mediaType === "IMAGE" && !b.videoUrl).length}
          </span>
        </div>
      </div>

      {/* 3. Banners List Table & Responsive Cards */}
      <div className="bg-[#1e1e1e] border border-[#2a2a2a] rounded-[10px] overflow-hidden">
        <div className="p-4 border-b border-[#2a2a2a] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#fa9000]" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Danh Sách Banner ({banners.length})
            </span>
          </div>
          <span className="text-xs text-[#595959]">Kéo thả hoặc dùng mũi tên để đổi thứ tự</span>
        </div>

        {loading ? (
          <div className="py-16 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-[#fa9000] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-[#bebebe]">Đang tải danh sách banner...</p>
          </div>
        ) : banners.length === 0 ? (
          <div className="py-16 text-center space-y-4">
            <Tv className="w-12 h-12 text-[#595959] mx-auto opacity-50" />
            <p className="text-sm text-[#bebebe]">Chưa có banner nào được tạo.</p>
            <button
              onClick={handleOpenAdd}
              className="btn-pill-dark bg-[#fa9000] text-black font-bold text-xs py-2 px-4"
            >
              Tạo banner đầu tiên ngay
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#141414] border-b border-[#2a2a2a] text-[#595959] uppercase font-mono text-[10px]">
                <tr>
                  <th className="py-3.5 px-4 w-16 text-center">Thứ Tự</th>
                  <th className="py-3.5 px-4 w-32">Media</th>
                  <th className="py-3.5 px-4">Tiêu Đề & Nội Dung</th>
                  <th className="py-3.5 px-4 w-28 text-center">Định Dạng</th>
                  <th className="py-3.5 px-4 w-28 text-center">Thiết Bị</th>
                  <th className="py-3.5 px-4 w-28 text-center">Trạng Thái</th>
                  <th className="py-3.5 px-4 w-36 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2a2a2a]">
                {banners.map((b, idx) => {
                  const isVid = b.mediaType === "VIDEO" || !!b.videoUrl;
                  return (
                    <tr key={b.id} className="hover:bg-[#252525] transition-colors">
                      {/* Sort Order Controls */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleMoveOrder(idx, "up")}
                            disabled={idx === 0}
                            className={`p-1 rounded hover:bg-[#333] ${idx === 0 ? "opacity-30 cursor-not-allowed" : "text-white"}`}
                            title="Di chuyển lên"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-mono font-bold w-4 text-center">{b.sortOrder}</span>
                          <button
                            onClick={() => handleMoveOrder(idx, "down")}
                            disabled={idx === banners.length - 1}
                            className={`p-1 rounded hover:bg-[#333] ${idx === banners.length - 1 ? "opacity-30 cursor-not-allowed" : "text-white"}`}
                            title="Di chuyển xuống"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Thumbnail Preview */}
                      <td className="py-3 px-4">
                        <div className="relative w-28 h-16 rounded-[4px] overflow-hidden bg-black border border-[#333] group">
                          {isVid ? (
                            <>
                              <Image
                                src={b.posterUrl || b.imageUrl || "https://images.unsplash.com/photo-1695048133142-1a20484d2569"}
                                alt={b.title}
                                fill
                                className="object-cover"
                              />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <div className="w-6 h-6 rounded-full bg-[#fa9000] text-black flex items-center justify-center shadow">
                                  <Play className="w-3 h-3 fill-black ml-0.5" />
                                </div>
                              </div>
                            </>
                          ) : (
                            <Image src={b.imageUrl} alt={b.title} fill className="object-cover" />
                          )}
                        </div>
                      </td>

                      {/* Title & Info */}
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          {b.badgeText && (
                            <span className="inline-block px-1.5 py-0.5 rounded bg-black/60 border border-[#444] text-[10px] text-[#fa9000] font-bold">
                              {b.badgeText}
                            </span>
                          )}
                          <p className="font-bold text-white text-sm leading-snug line-clamp-1">{b.title}</p>
                          {b.subtitle && <p className="text-xs text-[#bebebe] line-clamp-1">{b.subtitle}</p>}
                          <div className="flex items-center gap-3 text-[11px] text-[#595959]">
                            <span>CTA: <strong className="text-white">{b.ctaText || "Khám Phá"}</strong></span>
                            <span>•</span>
                            <span className="font-mono text-[#bebebe] truncate max-w-xs">{b.linkUrl}</span>
                          </div>
                        </div>
                      </td>

                      {/* Format Badge */}
                      <td className="py-3 px-4 text-center">
                        {isVid ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[12px] bg-[#fa9000]/15 text-[#fa9000] border border-[#fa9000]/30 font-bold text-[10px]">
                            <Video className="w-3 h-3" />
                            <span>1080P HD</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-[12px] bg-white/10 text-white/80 border border-white/20 font-bold text-[10px]">
                            <ImageIcon className="w-3 h-3" />
                            <span>HÌNH ẢNH</span>
                          </span>
                        )}
                      </td>

                      {/* Device Target */}
                      <td className="py-3 px-4 text-center">
                        <span className="text-[11px] font-mono text-[#dddddd] px-2 py-0.5 bg-[#2a2a2a] rounded">
                          {b.targetDevice === "MOBILE" ? "Mobile" : b.targetDevice === "DESKTOP" ? "Desktop" : "Tất Cả"}
                        </span>
                      </td>

                      {/* Active Status Switch */}
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleToggleActive(b.id)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[14px] text-[11px] font-bold transition-all ${
                            b.isActive
                              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30"
                              : "bg-[#2a2a2a] text-[#595959] border border-[#333] hover:text-white"
                          }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${b.isActive ? "bg-emerald-400 animate-pulse" : "bg-[#595959]"}`} />
                          <span>{b.isActive ? "ACTIVE" : "ẨN"}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setPreviewBanner(b)}
                            className="p-1.5 rounded hover:bg-[#333] text-[#00cbca]"
                            title="Xem trước Banner"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(b)}
                            className="p-1.5 rounded hover:bg-[#333] text-[#dba200]"
                            title="Chỉnh sửa Banner"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(b.id, b.title)}
                            className="p-1.5 rounded hover:bg-[#333] text-[#bc0000]"
                            title="Xóa Banner"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. MODAL: ADD / EDIT BANNER */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#181818] border border-[#333] rounded-[12px] max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#2a2a2a] flex items-center justify-between bg-[#141414]">
              <div className="flex items-center gap-2.5">
                <Tv className="w-5 h-5 text-[#fa9000]" />
                <h2 className="text-base sm:text-lg font-bold text-white">
                  {editingBanner ? "CHỈNH SỬA BANNER" : "TẠO BANNER MỚI"}
                </h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#595959] hover:text-white p-1 rounded"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Media Type Toggle */}
              <div>
                <label className="block text-xs font-mono uppercase text-[#bebebe] mb-2">
                  Loại Media Quảng Bá
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, mediaType: "VIDEO" })}
                    className={`py-3 px-4 rounded-[8px] border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      formData.mediaType === "VIDEO"
                        ? "bg-[#fa9000] text-black border-[#fa9000] shadow-md"
                        : "bg-[#202020] text-[#bebebe] border-[#333] hover:border-white/40"
                    }`}
                  >
                    <Video className="w-4 h-4" />
                    <span>Video Banner Full HD (1080p)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, mediaType: "IMAGE" })}
                    className={`py-3 px-4 rounded-[8px] border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      formData.mediaType === "IMAGE"
                        ? "bg-[#fa9000] text-black border-[#fa9000] shadow-md"
                        : "bg-[#202020] text-[#bebebe] border-[#333] hover:border-white/40"
                    }`}
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>Banner Hình Ảnh Tĩnh (HD/4K)</span>
                  </button>
                </div>
              </div>

              {/* Video Specific Settings */}
              {formData.mediaType === "VIDEO" && (
                <div className="p-4 bg-[#202020] border border-[#333] rounded-[8px] space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#fa9000] uppercase tracking-wider flex items-center gap-1.5">
                      <Video className="w-4 h-4" /> CẤU HÌNH VIDEO 1080P / YOUTUBE
                    </span>
                    <span className="text-[11px] text-[#bebebe]">MP4, WebM hoặc YouTube Link • Tự động chạy ngầm, không tiếng</span>
                  </div>

                  <div>
                    <label className="block text-xs text-[#bebebe] mb-1">
                      Đường Dẫn Video (1080p MP4 URL hoặc YouTube Link) *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.videoUrl}
                        onChange={(e) => {
                          const val = e.target.value;
                          const yt = getYouTubeVideoId(val);
                          setFormData((prev) => ({
                            ...prev,
                            videoUrl: val,
                            // If poster is empty or standard unsplash, auto-suggest YouTube HD thumbnail
                            posterUrl: yt && (!prev.posterUrl || prev.posterUrl.includes("unsplash"))
                              ? `https://img.youtube.com/vi/${yt}/maxresdefault.jpg`
                              : prev.posterUrl,
                            imageUrl: yt && (!prev.imageUrl || prev.imageUrl.includes("unsplash"))
                              ? `https://img.youtube.com/vi/${yt}/maxresdefault.jpg`
                              : prev.imageUrl,
                          }));
                        }}
                        placeholder="https://.../video.mp4 hoặc https://www.youtube.com/watch?v=..."
                        className="flex-1 bg-[#141414] border border-[#333] rounded-[6px] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#fa9000]"
                      />
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="video/mp4,video/webm"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, "video");
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingMedia}
                        className="btn-pill-outline text-xs px-3.5 py-2 flex items-center gap-1.5 shrink-0 bg-[#252525] border-[#444]"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{uploadingMedia ? "Đang tải..." : "Tải Video Lên"}</span>
                      </button>
                    </div>
                    {getYouTubeVideoId(formData.videoUrl) && (
                      <div className="mt-1.5 flex items-center gap-2 text-[11px] text-[#00cbca]">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          Đã nhận diện YouTube Video ID: <strong>{getYouTubeVideoId(formData.videoUrl)}</strong> (Sẽ phát tự động chế độ nền Cinematic Loop)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Preset Video Samples */}
                  <div>
                    <span className="text-[11px] text-[#595959] block mb-1.5">Chọn nhanh mẫu video chất lượng cao sẵn có:</span>
                    <div className="flex flex-wrap gap-2">
                      {PRESET_VIDEOS.map((p, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setFormData({ ...formData, videoUrl: p.videoUrl, posterUrl: p.posterUrl, imageUrl: p.posterUrl })}
                          className={`text-[11px] px-2.5 py-1 rounded border transition-colors ${
                            formData.videoUrl === p.videoUrl
                              ? "bg-[#fa9000]/20 text-[#fa9000] border-[#fa9000]"
                              : "bg-[#141414] text-[#bebebe] border-[#333] hover:border-white/30"
                          }`}
                        >
                          {p.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Poster Image (Fallback & Before Video Plays) */}
                  <div>
                    <label className="block text-xs text-[#bebebe] mb-1">
                      Ảnh Poster Dự Phòng (Poster Fallback) *
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.posterUrl}
                        onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value, imageUrl: e.target.value })}
                        placeholder="https://.../poster.jpg"
                        className="flex-1 bg-[#141414] border border-[#333] rounded-[6px] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#fa9000]"
                      />
                      <input
                        type="file"
                        ref={posterInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, "poster");
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => posterInputRef.current?.click()}
                        disabled={uploadingMedia}
                        className="btn-pill-outline text-xs px-3.5 py-2 flex items-center gap-1.5 shrink-0 bg-[#252525] border-[#444]"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Tải Ảnh Lên</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Image Specific Settings */}
              {formData.mediaType === "IMAGE" && (
                <div className="p-4 bg-[#202020] border border-[#333] rounded-[8px] space-y-3">
                  <label className="block text-xs text-[#bebebe] mb-1">
                    Đường Dẫn Hình Ảnh (HD/4K) *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder="https://.../banner.jpg"
                      className="flex-1 bg-[#141414] border border-[#333] rounded-[6px] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#fa9000]"
                    />
                    <button
                      type="button"
                      onClick={() => posterInputRef.current?.click()}
                      disabled={uploadingMedia}
                      className="btn-pill-outline text-xs px-3.5 py-2 flex items-center gap-1.5 shrink-0 bg-[#252525] border-[#444]"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Tải Ảnh Lên</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Banner Text Content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#bebebe] mb-1">Tiêu Đề Banner (Title) *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="VD: TUYỆT TÁC CÔNG NGHỆ & ÂM THANH"
                    className="w-full bg-[#202020] border border-[#333] rounded-[6px] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#fa9000]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#bebebe] mb-1">Phụ Đề (Subtitle)</label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="VD: Đỉnh Cao Chống Ồn Thế Hệ Mới"
                    className="w-full bg-[#202020] border border-[#333] rounded-[6px] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#fa9000]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#bebebe] mb-1">Mô Tả Chi Tiết (Description)</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả tóm tắt giá trị cốt lõi hoặc chương trình khuyến mại..."
                  className="w-full bg-[#202020] border border-[#333] rounded-[6px] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#fa9000]"
                />
              </div>

              {/* CTAs and Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-[#bebebe] mb-1">Huy Hiệu (Badge Text)</label>
                  <input
                    type="text"
                    value={formData.badgeText}
                    onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })}
                    placeholder="VD: MỞ BÁN ĐẶC QUYỀN"
                    className="w-full bg-[#202020] border border-[#333] rounded-[6px] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#fa9000]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#bebebe] mb-1">Nút Bấm CTA (Button Text)</label>
                  <input
                    type="text"
                    value={formData.ctaText}
                    onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                    placeholder="VD: Khám Phá Ngay"
                    className="w-full bg-[#202020] border border-[#333] rounded-[6px] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#fa9000]"
                  />
                </div>

                <div>
                  <label className="block text-xs text-[#bebebe] mb-1">Đường Dẫn Điều Hướng (CTA Link)</label>
                  <input
                    type="text"
                    value={formData.linkUrl}
                    onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
                    placeholder="/products hoặc đường dẫn sản phẩm"
                    className="w-full bg-[#202020] border border-[#333] rounded-[6px] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#fa9000]"
                  />
                </div>
              </div>

              {/* Overlay, Alignment & Styling */}
              <div className="p-4 bg-[#202020] border border-[#333] rounded-[8px] space-y-4">
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  TÙY BIẾN GIAO DIỆN & OVERLAY
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Overlay Opacity */}
                  <div>
                    <label className="block text-xs text-[#bebebe] mb-1">
                      Độ Tối Lớp Phủ (Opacity): {Math.round((formData.overlayOpacity ?? 0.45) * 100)}%
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.05}
                      value={formData.overlayOpacity ?? 0.45}
                      onChange={(e) => setFormData({ ...formData, overlayOpacity: parseFloat(e.target.value) })}
                      className="w-full accent-[#fa9000]"
                    />
                  </div>

                  {/* Content Position */}
                  <div>
                    <label className="block text-xs text-[#bebebe] mb-1">Căn Chỉnh Nội Dung</label>
                    <div className="flex border border-[#333] rounded-[6px] overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, contentPosition: "LEFT" })}
                        className={`flex-1 py-1.5 flex justify-center ${formData.contentPosition === "LEFT" ? "bg-[#fa9000] text-black" : "bg-[#141414] text-[#bebebe]"}`}
                        title="Trái"
                      >
                        <AlignLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, contentPosition: "CENTER" })}
                        className={`flex-1 py-1.5 flex justify-center ${formData.contentPosition === "CENTER" ? "bg-[#fa9000] text-black" : "bg-[#141414] text-[#bebebe]"}`}
                        title="Giữa"
                      >
                        <AlignCenter className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, contentPosition: "RIGHT" })}
                        className={`flex-1 py-1.5 flex justify-center ${formData.contentPosition === "RIGHT" ? "bg-[#fa9000] text-black" : "bg-[#141414] text-[#bebebe]"}`}
                        title="Phải"
                      >
                        <AlignRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Target Device */}
                  <div>
                    <label className="block text-xs text-[#bebebe] mb-1">Thiết Bị Hiển Thị</label>
                    <select
                      value={formData.targetDevice}
                      onChange={(e) => setFormData({ ...formData, targetDevice: e.target.value as any })}
                      className="w-full bg-[#141414] border border-[#333] rounded-[6px] px-3 py-2 text-xs text-white focus:outline-none focus:border-[#fa9000]"
                    >
                      <option value="ALL">Tất Cả Thiết Bị (All)</option>
                      <option value="DESKTOP">Chỉ Máy Tính (Desktop)</option>
                      <option value="MOBILE">Chỉ Điện Thoại (Mobile)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                  <div>
                    <label className="block text-[11px] text-[#bebebe] mb-1">Màu Chữ</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formData.textColor}
                        onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                        className="w-8 h-8 rounded border border-[#333] bg-transparent cursor-pointer"
                      />
                      <span className="font-mono text-xs">{formData.textColor}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#bebebe] mb-1">Màu Overlay</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={formData.overlayColor}
                        onChange={(e) => setFormData({ ...formData, overlayColor: e.target.value })}
                        className="w-8 h-8 rounded border border-[#333] bg-transparent cursor-pointer"
                      />
                      <span className="font-mono text-xs">{formData.overlayColor}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] text-[#bebebe] mb-1">Thời Lượng (Giây)</label>
                    <input
                      type="number"
                      min={3}
                      max={60}
                      value={formData.durationSeconds}
                      onChange={(e) => setFormData({ ...formData, durationSeconds: parseInt(e.target.value) || 8 })}
                      className="w-full bg-[#141414] border border-[#333] rounded-[6px] px-3 py-1.5 text-xs text-white"
                    />
                  </div>

                  <div className="flex items-center pt-4">
                    <label className="flex items-center gap-2 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="w-4 h-4 accent-[#fa9000]"
                      />
                      <span className="font-bold text-white">Kích hoạt ngay</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* REAL-TIME INTERACTIVE LIVE PREVIEW BOX */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#dba200] uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="w-4 h-4" /> XEM TRƯỚC GIAO DIỆN (LIVE SIMULATION)
                </span>
                <div className="relative w-full aspect-21/9 rounded-[8px] overflow-hidden bg-black border border-[#444] flex items-center">
                  {formData.mediaType === "VIDEO" && formData.videoUrl ? (
                    getYouTubeVideoId(formData.videoUrl) ? (
                      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
                        <iframe
                          key={`preview-yt-${getYouTubeVideoId(formData.videoUrl)}`}
                          className="w-full h-full border-0 pointer-events-none scale-105"
                          src={`https://www.youtube-nocookie.com/embed/${getYouTubeVideoId(formData.videoUrl)}?autoplay=1&mute=1&controls=0&loop=1&playlist=${getYouTubeVideoId(formData.videoUrl)}&playsinline=1&rel=0&showinfo=0`}
                          title="YouTube Live Preview"
                          allow="autoplay; encrypted-media"
                        />
                      </div>
                    ) : (
                      <video
                        key={formData.videoUrl}
                        className="absolute inset-0 w-full h-full object-cover"
                        autoPlay
                        muted
                        loop
                        playsInline
                        poster={formData.posterUrl || formData.imageUrl}
                      >
                        <source src={formData.videoUrl} type="video/mp4" />
                      </video>
                    )
                  ) : (
                    <Image
                      src={formData.imageUrl || "https://images.unsplash.com/photo-1695048133142-1a20484d2569"}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  )}

                  {/* Darkening Overlay */}
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundColor: formData.overlayColor,
                      opacity: formData.overlayOpacity,
                    }}
                  />

                  {/* Preview Text */}
                  <div className="relative z-10 w-full p-6 sm:p-8">
                    <div
                      className={`max-w-md flex flex-col space-y-2 ${
                        formData.contentPosition === "CENTER"
                          ? "items-center text-center mx-auto"
                          : formData.contentPosition === "RIGHT"
                          ? "items-end text-right ml-auto"
                          : "items-start text-left"
                      }`}
                    >
                      {formData.badgeText && (
                        <span className="px-2 py-0.5 rounded-full bg-black/60 border border-white/20 text-[10px] font-bold text-[#fa9000]">
                          {formData.badgeText}
                        </span>
                      )}
                      <h3
                        className="text-lg sm:text-2xl font-black uppercase leading-tight"
                        style={{ color: formData.textColor }}
                      >
                        {formData.title || "TIÊU ĐỀ BANNER"}
                      </h3>
                      {formData.subtitle && (
                        <p className="text-xs opacity-90 line-clamp-1" style={{ color: formData.textColor }}>
                          {formData.subtitle}
                        </p>
                      )}
                      <div className="pt-2">
                        <span className="btn-pill-dark bg-[#fa9000] text-black font-extrabold text-[11px] py-1.5 px-4 inline-block">
                          {formData.ctaText || "Khám Phá"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#2a2a2a] bg-[#141414] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="btn-pill-outline text-xs px-5 py-2.5"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="btn-pill-dark bg-[#fa9000] text-black font-extrabold text-xs px-6 py-2.5 hover:bg-[#ffa000]"
              >
                {submitting ? "Đang Lưu..." : editingBanner ? "Cập Nhật Banner" : "Lưu Banner Mới"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. PREVIEW MODAL */}
      {previewBanner && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-5xl w-full bg-[#181818] rounded-[12px] border border-[#333] overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-[#2a2a2a] flex items-center justify-between bg-[#141414]">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#00cbca]" />
                <span className="text-xs font-bold text-white uppercase">
                  XEM TRƯỚC BANNER: {previewBanner.title}
                </span>
              </div>
              <button
                onClick={() => setPreviewBanner(null)}
                className="text-[#595959] hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="relative aspect-16/9 md:aspect-21/9 w-full flex items-center bg-black">
              {previewBanner.mediaType === "VIDEO" && previewBanner.videoUrl ? (
                <video
                  className="absolute inset-0 w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  poster={previewBanner.posterUrl || previewBanner.imageUrl}
                >
                  <source src={previewBanner.videoUrl} type="video/mp4" />
                </video>
              ) : (
                <Image
                  src={previewBanner.imageUrl}
                  alt={previewBanner.title}
                  fill
                  className="object-cover"
                />
              )}

              {/* Overlay */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundColor: previewBanner.overlayColor || "#000000",
                  opacity: previewBanner.overlayOpacity ?? 0.45,
                }}
              />

              {/* Content */}
              <div className="relative z-10 w-full p-8 md:p-12">
                <div
                  className={`max-w-xl flex flex-col space-y-3 ${
                    previewBanner.contentPosition === "CENTER"
                      ? "items-center text-center mx-auto"
                      : previewBanner.contentPosition === "RIGHT"
                      ? "items-end text-right ml-auto"
                      : "items-start text-left"
                  }`}
                >
                  {previewBanner.badgeText && (
                    <span className="px-3 py-1 rounded-full bg-black/60 border border-white/20 text-xs font-bold text-[#fa9000]">
                      {previewBanner.badgeText}
                    </span>
                  )}
                  <h2
                    className="text-2xl md:text-4xl font-black uppercase leading-tight"
                    style={{ color: previewBanner.textColor || "#ffffff" }}
                  >
                    {previewBanner.title}
                  </h2>
                  {previewBanner.subtitle && (
                    <p
                      className="text-sm md:text-base opacity-90"
                      style={{ color: previewBanner.textColor || "#ffffff" }}
                    >
                      {previewBanner.subtitle}
                    </p>
                  )}
                  <div className="pt-3">
                    <span className="btn-pill-dark bg-[#fa9000] text-black font-extrabold text-xs md:text-sm py-2.5 px-6 inline-block">
                      {previewBanner.ctaText || "Khám Phá Ngay"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

