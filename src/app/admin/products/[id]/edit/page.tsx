"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Eye,
  Trash2,
  Plus,
  Image as ImageIcon,
  Layers,
  Cpu,
  DollarSign,
  Package,
  Sparkles,
  Check,
  AlertCircle,
  UploadCloud,
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { formatVND } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
}

interface Brand {
  id: string;
  name: string;
}

interface ProductImageItem {
  id?: string;
  url: string;
  altText?: string;
  isPrimary?: boolean;
}

interface ProductVariantItem {
  id?: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  attributesJson?: string;
}

interface ProductSpecItem {
  id?: string;
  groupName: string;
  specKey: string;
  specValue: string;
}

export default function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { success, error } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"general" | "pricing" | "inventory" | "images" | "variants" | "specs">("general");

  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  // Form Fields
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [sku, setSku] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");

  const [regularPrice, setRegularPrice] = useState<number | string>("");
  const [salePrice, setSalePrice] = useState<number | string>("");
  const [isFlashSale, setIsFlashSale] = useState(false);
  const [flashSaleStart, setFlashSaleStart] = useState("");
  const [flashSaleEnd, setFlashSaleEnd] = useState("");

  const [stock, setStock] = useState<number | string>("");
  const [status, setStatus] = useState("ACTIVE");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [warrantyMonths, setWarrantyMonths] = useState<number | string>(12);
  const [originCountry, setOriginCountry] = useState("Chính Hãng");

  const [images, setImages] = useState<ProductImageItem[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");

  const [variants, setVariants] = useState<ProductVariantItem[]>([]);
  const [specs, setSpecs] = useState<ProductSpecItem[]>([]);

  // Fetch product data and categories/brands
  useEffect(() => {
    async function loadData() {
      try {
        const [prodRes, catRes, brandRes] = await Promise.all([
          fetch(`/api/admin/products/${id}`),
          fetch("/api/categories"),
          fetch("/api/brands"),
        ]);

        if (!prodRes.ok) {
          error("Không thể tải thông tin sản phẩm");
          router.push("/admin/products");
          return;
        }

        const prodData = await prodRes.json();
        const p = prodData.product;

        setTitle(p.title || "");
        setSlug(p.slug || "");
        setSku(p.sku || "");
        setCategoryId(p.categoryId || "");
        setBrandId(p.brandId || "");
        setDescription(p.description || "");
        setContent(p.content || "");

        setRegularPrice(p.regularPrice ?? "");
        setSalePrice(p.salePrice ?? "");
        setIsFlashSale(Boolean(p.isFlashSale));
        setFlashSaleStart(p.flashSaleStart ? new Date(p.flashSaleStart).toISOString().slice(0, 16) : "");
        setFlashSaleEnd(p.flashSaleEnd ? new Date(p.flashSaleEnd).toISOString().slice(0, 16) : "");

        setStock(p.stock ?? 0);
        setStatus(p.status || "ACTIVE");
        setIsFeatured(Boolean(p.isFeatured));
        setIsBestSeller(Boolean(p.isBestSeller));
        setIsNewArrival(Boolean(p.isNewArrival));
        setWarrantyMonths(p.warrantyMonths ?? 12);
        setOriginCountry(p.originCountry || "Chính Hãng");

        setImages(
          p.images?.map((img: any) => ({
            id: img.id,
            url: img.url,
            altText: img.altText,
            isPrimary: img.isPrimary,
          })) || []
        );

        setVariants(
          p.variants?.map((v: any) => ({
            id: v.id,
            name: v.name,
            sku: v.sku,
            price: Number(v.price),
            stock: Number(v.stock),
            attributesJson: v.attributesJson,
          })) || []
        );

        setSpecs(
          p.specifications?.map((s: any) => ({
            id: s.id,
            groupName: s.groupName,
            specKey: s.specKey,
            specValue: s.specValue,
          })) || []
        );

        if (catRes.ok) {
          const cData = await catRes.json();
          setCategories(cData.categories || []);
        }

        if (brandRes.ok) {
          const bData = await brandRes.json();
          setBrands(bData.brands || []);
        }
      } catch (err: any) {
        error("Lỗi khi tải dữ liệu sản phẩm");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id, router, error]);

  // Auto-generate slug from title
  const handleAutoSlug = () => {
    const generated = title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    setSlug(generated);
  };

  // Image actions
  const handleAddImage = () => {
    if (!newImageUrl.trim()) return;
    setImages((prev) => [
      ...prev,
      {
        url: newImageUrl.trim(),
        altText: title,
        isPrimary: prev.length === 0,
      },
    ]);
    setNewImageUrl("");
  };

  const handleSetPrimaryImage = (index: number) => {
    setImages((prev) =>
      prev.map((img, i) => ({
        ...img,
        isPrimary: i === index,
      }))
    );
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (updated.length > 0 && !updated.some((img) => img.isPrimary)) {
        updated[0].isPrimary = true;
      }
      return updated;
    });
  };

  // Variant actions
  const handleAddVariant = () => {
    const newVariantSku = `${sku || "SKU"}-V${variants.length + 1}`;
    setVariants((prev) => [
      ...prev,
      {
        name: `Biến thể ${prev.length + 1}`,
        sku: newVariantSku,
        price: Number(regularPrice) || 0,
        stock: 10,
        attributesJson: JSON.stringify({}),
      },
    ]);
  };

  const handleUpdateVariant = (index: number, field: keyof ProductVariantItem, val: any) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, [field]: val } : v))
    );
  };

  const handleRemoveVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  // Spec actions
  const handleAddSpec = (group: string = "Hiệu Năng & Cấu Hình") => {
    setSpecs((prev) => [
      ...prev,
      {
        groupName: group,
        specKey: "",
        specValue: "",
      },
    ]);
  };

  const handleUpdateSpec = (index: number, field: keyof ProductSpecItem, val: string) => {
    setSpecs((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: val } : s))
    );
  };

  const handleRemoveSpec = (index: number) => {
    setSpecs((prev) => prev.filter((_, i) => i !== index));
  };

  // Save product handler
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      error("Tên sản phẩm không được để trống");
      return;
    }
    if (!slug.trim()) {
      error("Slug URL không được để trống");
      return;
    }
    if (!sku.trim()) {
      error("Mã SKU không được để trống");
      return;
    }
    if (!regularPrice || Number(regularPrice) <= 0) {
      error("Giá gốc phải lớn hơn 0");
      return;
    }
    if (salePrice && Number(salePrice) >= Number(regularPrice)) {
      error("Giá khuyến mãi phải nhỏ hơn giá gốc");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        slug: slug.trim(),
        sku: sku.trim().toUpperCase(),
        categoryId,
        brandId: brandId || null,
        description: description.trim(),
        content: content.trim(),
        regularPrice: parseFloat(String(regularPrice)),
        salePrice: salePrice ? parseFloat(String(salePrice)) : null,
        stock: parseInt(String(stock || 0), 10),
        status,
        isFeatured,
        isBestSeller,
        isNewArrival,
        isFlashSale,
        flashSaleStart: isFlashSale && flashSaleStart ? new Date(flashSaleStart).toISOString() : null,
        flashSaleEnd: isFlashSale && flashSaleEnd ? new Date(flashSaleEnd).toISOString() : null,
        warrantyMonths: parseInt(String(warrantyMonths || 12), 10),
        originCountry,
        images: images.map((img, idx) => ({
          url: img.url,
          altText: img.altText || title,
          isPrimary: Boolean(img.isPrimary),
          sortOrder: idx + 1,
        })),
        variants: variants.map((v) => ({
          id: v.id,
          name: v.name,
          sku: v.sku.toUpperCase(),
          price: parseFloat(String(v.price)),
          stock: parseInt(String(v.stock), 10),
          attributesJson: v.attributesJson || "{}",
        })),
        specifications: specs
          .filter((s) => s.specKey.trim() && s.specValue.trim())
          .map((s, idx) => ({
            groupName: s.groupName.trim() || "Thông Số Chung",
            specKey: s.specKey.trim(),
            specValue: s.specValue.trim(),
            sortOrder: idx + 1,
          })),
      };

      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        success("Cập nhật sản phẩm thành công!");
        router.refresh();
      } else {
        error(data.error || "Lỗi cập nhật sản phẩm");
      }
    } catch {
      error("Lỗi kết nối máy chủ");
    } finally {
      setSaving(false);
    }
  };

  // Discount percentage calculation
  const regNum = Number(regularPrice) || 0;
  const saleNum = Number(salePrice) || 0;
  const discountPercent = regNum > 0 && saleNum > 0 && saleNum < regNum
    ? Math.round(((regNum - saleNum) / regNum) * 100)
    : 0;

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center text-white text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-[#dba200] border-t-transparent rounded-full animate-spin" />
          <span>Đang tải thông tin sản phẩm...</span>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSaveProduct} className="space-y-6 pb-24">
      {/* Header & Sticky Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2a2a2a]">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-[#888888]">
            <Link href="/admin/products" className="hover:text-white flex items-center gap-1 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quản lý sản phẩm</span>
            </Link>
            <span>/</span>
            <span className="text-[#dba200] font-mono">{sku}</span>
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            CHỈNH SỬA SẢN PHẨM: <span className="text-[#dba200]">{title || "Sản phẩm"}</span>
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            href={`/products/${slug}`}
            target="_blank"
            className="px-3 py-2 bg-[#252525] hover:bg-[#333333] text-white border border-[#3e3e3e] rounded-[6px] text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-blue-400" />
            <span>Xem Website</span>
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="btn-pill-dark bg-[#dba200] text-black font-bold hover:bg-[#ffc500] text-xs py-2 px-5 flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            {saving ? (
              <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{saving ? "Đang Lưu..." : "Lưu Thay Đổi"}</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex flex-wrap items-center gap-1 border-b border-[#2a2a2a] pb-px">
        {[
          { id: "general", label: "Thông Tin Cơ Bản", icon: Layers },
          { id: "pricing", label: "Giá & Khuyến Mãi", icon: DollarSign },
          { id: "inventory", label: "Kho & Trạng Thái", icon: Package },
          { id: "images", label: `Hình Ảnh (${images.length})`, icon: ImageIcon },
          { id: "variants", label: `Biến Thể (${variants.length})`, icon: Sparkles },
          { id: "specs", label: `Thông Số (${specs.length})`, icon: Cpu },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2.5 text-xs font-bold rounded-t-[6px] flex items-center gap-2 transition-colors border-t border-x ${
                isActive
                  ? "bg-[#1e1e1e] text-[#dba200] border-[#333333] border-b-[#1e1e1e]"
                  : "bg-transparent text-[#888888] hover:text-white border-transparent"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: THÔNG TIN CƠ BẢN */}
      {activeTab === "general" && (
        <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-[8px] p-6 space-y-4">
          <div>
            <label className="block text-[#888888] text-xs font-bold mb-1">
              Tên sản phẩm *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Laptop Siêu Nhẹ LG Gram Pro 16 inch 2024"
              className="w-full bg-[#141414] border border-[#333333] rounded p-2.5 text-white text-xs outline-none focus:border-[#dba200]"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[#888888] text-xs font-bold">
                  Đường dẫn Slug URL *
                </label>
                <button
                  type="button"
                  onClick={handleAutoSlug}
                  className="text-[10px] text-[#dba200] hover:underline"
                >
                  Tạo tự động từ tên
                </button>
              </div>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="lg-gram-pro-16-inch-2024"
                className="w-full bg-[#141414] border border-[#333333] rounded p-2.5 text-white text-xs outline-none focus:border-[#dba200]"
                required
              />
            </div>

            <div>
              <label className="block text-[#888888] text-xs font-bold mb-1">
                Mã SKU Quản Lý *
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value.toUpperCase())}
                placeholder="LG-GRAM-PRO16-2024"
                className="w-full bg-[#141414] border border-[#333333] rounded p-2.5 text-white font-mono font-bold text-xs outline-none focus:border-[#dba200]"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#888888] text-xs font-bold mb-1">
                Danh Mục Sản Phẩm *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-[#141414] border border-[#333333] rounded p-2.5 text-white text-xs outline-none focus:border-[#dba200]"
                required
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[#888888] text-xs font-bold mb-1">
                Thương Hiệu (Brand)
              </label>
              <select
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                className="w-full bg-[#141414] border border-[#333333] rounded p-2.5 text-white text-xs outline-none focus:border-[#dba200]"
              >
                <option value="">-- Chọn thương hiệu (tùy chọn) --</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[#888888] text-xs font-bold mb-1">
              Mô Tả Ngắn (Hiển thị ở trang danh sách và phần đầu trang chi tiết)
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tóm tắt điểm nổi bật của sản phẩm..."
              className="w-full bg-[#141414] border border-[#333333] rounded p-2.5 text-white text-xs outline-none focus:border-[#dba200]"
            />
          </div>

          <div>
            <label className="block text-[#888888] text-xs font-bold mb-1">
              Nội Dung Đánh Giá Chi Tiết / Giới Thiệu Tính Năng
            </label>
            <textarea
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Nội dung bài viết đánh giá trải nghiệm thực tế..."
              className="w-full bg-[#141414] border border-[#333333] rounded p-2.5 text-white text-xs outline-none focus:border-[#dba200]"
            />
          </div>
        </div>
      )}

      {/* TAB 2: GIÁ & KHUYẾN MÃI */}
      {activeTab === "pricing" && (
        <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-[8px] p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[#888888] text-xs font-bold mb-1">
                Giá Gốc (VNĐ) *
              </label>
              <input
                type="number"
                value={regularPrice}
                onChange={(e) => setRegularPrice(e.target.value)}
                placeholder="VD: 49990000"
                className="w-full bg-[#141414] border border-[#333333] rounded p-2.5 text-white text-xs outline-none focus:border-[#dba200]"
                required
              />
              <span className="text-[10px] text-[#888888] mt-1 block">
                {formatVND(Number(regularPrice) || 0)}
              </span>
            </div>

            <div>
              <label className="block text-[#888888] text-xs font-bold mb-1">
                Giá Khuyến Mãi (Sale Price)
              </label>
              <input
                type="number"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                placeholder="VD: 44990000"
                className="w-full bg-[#141414] border border-[#333333] rounded p-2.5 text-white text-xs outline-none focus:border-[#dba200]"
              />
              <span className="text-[10px] text-[#888888] mt-1 block">
                {salePrice ? formatVND(Number(salePrice)) : "Không áp dụng"}
              </span>
            </div>

            <div className="flex flex-col justify-center bg-[#141414] border border-[#333333] rounded p-3 text-center">
              <span className="text-[10px] uppercase font-bold text-[#888888]">
                Mức Giảm Giá Thực Tế
              </span>
              <strong className="text-xl font-bold text-[#dba200] mt-1">
                {discountPercent > 0 ? `-${discountPercent}%` : "0% (Giá gốc)"}
              </strong>
            </div>
          </div>

          {/* Flash Sale Settings */}
          <div className="pt-4 border-t border-[#2e2e2e] space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isFlashSale"
                checked={isFlashSale}
                onChange={(e) => setIsFlashSale(e.target.checked)}
                className="w-4 h-4 accent-[#dba200] rounded"
              />
              <label htmlFor="isFlashSale" className="text-xs font-bold text-white cursor-pointer">
                Đưa sản phẩm vào chương trình Flash Sale giờ vàng
              </label>
            </div>

            {isFlashSale && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-[#141414] border border-[#333333] rounded">
                <div>
                  <label className="block text-[#888888] text-xs font-bold mb-1">
                    Thời Gian Bắt Đầu Flash Sale
                  </label>
                  <input
                    type="datetime-local"
                    value={flashSaleStart}
                    onChange={(e) => setFlashSaleStart(e.target.value)}
                    className="w-full bg-[#1e1e1e] border border-[#333333] rounded p-2 text-white text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#888888] text-xs font-bold mb-1">
                    Thời Gian Kết Thúc Flash Sale
                  </label>
                  <input
                    type="datetime-local"
                    value={flashSaleEnd}
                    onChange={(e) => setFlashSaleEnd(e.target.value)}
                    className="w-full bg-[#1e1e1e] border border-[#333333] rounded p-2 text-white text-xs outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: KHO & TRẠNG THÁI */}
      {activeTab === "inventory" && (
        <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-[8px] p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[#888888] text-xs font-bold mb-1">
                Số Lượng Tồn Kho Tổng *
              </label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full bg-[#141414] border border-[#333333] rounded p-2.5 text-white text-xs outline-none focus:border-[#dba200]"
                required
              />
            </div>

            <div>
              <label className="block text-[#888888] text-xs font-bold mb-1">
                Trạng Thái Bán Hàng
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-[#141414] border border-[#333333] rounded p-2.5 text-white text-xs outline-none focus:border-[#dba200]"
              >
                <option value="ACTIVE">ACTIVE - Đang kinh doanh</option>
                <option value="OUT_OF_STOCK">OUT_OF_STOCK - Tạm hết hàng</option>
                <option value="DRAFT">DRAFT - Bản nháp (Ẩn khỏi shop)</option>
              </select>
            </div>

            <div>
              <label className="block text-[#888888] text-xs font-bold mb-1">
                Thời Hạn Bảo Hành (Tháng)
              </label>
              <input
                type="number"
                value={warrantyMonths}
                onChange={(e) => setWarrantyMonths(e.target.value)}
                placeholder="12"
                className="w-full bg-[#141414] border border-[#333333] rounded p-2.5 text-white text-xs outline-none focus:border-[#dba200]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#888888] text-xs font-bold mb-1">
                Nguồn Gốc / Xuất Xứ
              </label>
              <input
                type="text"
                value={originCountry}
                onChange={(e) => setOriginCountry(e.target.value)}
                placeholder="Chính Hãng / Nhập Khẩu"
                className="w-full bg-[#141414] border border-[#333333] rounded p-2.5 text-white text-xs outline-none focus:border-[#dba200]"
              />
            </div>

            <div className="flex flex-col justify-end space-y-2 pt-2">
              <label className="text-xs font-bold text-[#888888]">Huy hiệu nhãn hiển thị:</label>
              <div className="flex items-center gap-6 text-xs text-white">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="accent-[#dba200] rounded"
                  />
                  <span>Sản Phẩm Nổi Bật</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isBestSeller}
                    onChange={(e) => setIsBestSeller(e.target.checked)}
                    className="accent-[#dba200] rounded"
                  />
                  <span>Bán Chạy Nhất</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isNewArrival}
                    onChange={(e) => setIsNewArrival(e.target.checked)}
                    className="accent-[#dba200] rounded"
                  />
                  <span>Hàng Mới Về</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: HÌNH ẢNH SẢN PHẨM */}
      {activeTab === "images" && (
        <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-[8px] p-6 space-y-6">
          {/* Add Image Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="Dán link ảnh HTTPS (ví dụ: https://images.unsplash.com/...)"
              className="flex-1 bg-[#141414] border border-[#333333] rounded p-2.5 text-white text-xs outline-none focus:border-[#dba200]"
            />
            <button
              type="button"
              onClick={handleAddImage}
              className="px-4 py-2 bg-[#2a2a2a] hover:bg-[#383838] text-white border border-[#444444] rounded text-xs font-bold flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-[#dba200]" />
              <span>Thêm Ảnh</span>
            </button>
          </div>

          {/* Image Grid */}
          {images.length === 0 ? (
            <div className="py-12 border border-dashed border-[#333333] rounded text-center text-[#888888] text-xs">
              <ImageIcon className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Chưa có hình ảnh nào. Dán đường link ảnh ở trên để thêm.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className={`relative group bg-black rounded-[8px] overflow-hidden border ${
                    img.isPrimary ? "border-[#dba200] ring-1 ring-[#dba200]" : "border-[#333333]"
                  }`}
                >
                  <div className="relative aspect-square">
                    <Image
                      src={img.url}
                      alt={img.altText || `Ảnh ${idx + 1}`}
                      fill
                      className="object-cover"
                      sizes="200px"
                    />
                  </div>

                  {img.isPrimary && (
                    <span className="absolute top-2 left-2 bg-[#dba200] text-black text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                      Ảnh Chính
                    </span>
                  )}

                  {/* Actions overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                    {!img.isPrimary && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimaryImage(idx)}
                        className="px-2 py-1 bg-[#dba200] text-black text-[10px] font-bold rounded"
                        title="Đặt làm ảnh chính"
                      >
                        Đặt Chính
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="p-1 bg-[#bc0000] text-white rounded hover:bg-red-700"
                      title="Xóa ảnh"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: BIẾN THỂ SẢN PHẨM */}
      {activeTab === "variants" && (
        <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-[8px] p-6 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-[#2e2e2e]">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Danh Sách Biến Thể (Màu sắc, Dung lượng, Cấu hình)
              </h3>
              <p className="text-[11px] text-[#888888] mt-0.5">
                Mỗi biến thể có thể có mã SKU, mức giá và tồn kho riêng biệt.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddVariant}
              className="px-3 py-1.5 bg-[#252525] hover:bg-[#333333] text-[#dba200] border border-[#3e3e3e] rounded text-xs font-bold flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm Biến Thể</span>
            </button>
          </div>

          {variants.length === 0 ? (
            <div className="py-8 text-center text-[#888888] text-xs">
              Sản phẩm này hiện chưa có biến thể (bán theo cấu hình tiêu chuẩn mặc định).
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#141414] text-[#888888] uppercase text-[10px]">
                  <tr>
                    <th className="p-2.5">Tên Biến Thể</th>
                    <th className="p-2.5">Mã SKU Biến Thể</th>
                    <th className="p-2.5">Giá Bán (VNĐ)</th>
                    <th className="p-2.5">Tồn Kho</th>
                    <th className="p-2.5 text-right">Xóa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a2a2a]">
                  {variants.map((v, idx) => (
                    <tr key={idx} className="hover:bg-[#252525]">
                      <td className="p-2.5">
                        <input
                          type="text"
                          value={v.name}
                          onChange={(e) => handleUpdateVariant(idx, "name", e.target.value)}
                          placeholder="VD: 512GB - Xám Không Gian"
                          className="w-full bg-[#141414] border border-[#333333] rounded p-1.5 text-white text-xs outline-none"
                        />
                      </td>
                      <td className="p-2.5">
                        <input
                          type="text"
                          value={v.sku}
                          onChange={(e) => handleUpdateVariant(idx, "sku", e.target.value.toUpperCase())}
                          className="w-full bg-[#141414] border border-[#333333] rounded p-1.5 text-white font-mono text-xs outline-none"
                        />
                      </td>
                      <td className="p-2.5">
                        <input
                          type="number"
                          value={v.price}
                          onChange={(e) => handleUpdateVariant(idx, "price", parseFloat(e.target.value) || 0)}
                          className="w-28 bg-[#141414] border border-[#333333] rounded p-1.5 text-white text-xs outline-none"
                        />
                      </td>
                      <td className="p-2.5">
                        <input
                          type="number"
                          value={v.stock}
                          onChange={(e) => handleUpdateVariant(idx, "stock", parseInt(e.target.value, 10) || 0)}
                          className="w-20 bg-[#141414] border border-[#333333] rounded p-1.5 text-white text-xs outline-none"
                        />
                      </td>
                      <td className="p-2.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemoveVariant(idx)}
                          className="p-1 text-[#bc0000] hover:bg-[#bc0000]/20 rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: THÔNG SỐ KỸ THUẬT */}
      {activeTab === "specs" && (
        <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-[8px] p-6 space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-[#2e2e2e]">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Bảng Thông Số Kỹ Thuật Chi Tiết (Specifications)
              </h3>
              <p className="text-[11px] text-[#888888] mt-0.5">
                Hiển thị trong tab "Thông số kỹ thuật" ở trang chi tiết sản phẩm.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleAddSpec()}
              className="px-3 py-1.5 bg-[#252525] hover:bg-[#333333] text-[#dba200] border border-[#3e3e3e] rounded text-xs font-bold flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm Thông Số</span>
            </button>
          </div>

          {specs.length === 0 ? (
            <div className="py-8 text-center text-[#888888] text-xs">
              Chưa có thông số kỹ thuật nào. Bấm nút "Thêm Thông Số" ở trên để bổ sung.
            </div>
          ) : (
            <div className="space-y-3">
              {specs.map((s, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-2 bg-[#141414] border border-[#333333] p-3 rounded items-center"
                >
                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      value={s.groupName}
                      onChange={(e) => handleUpdateSpec(idx, "groupName", e.target.value)}
                      placeholder="Nhóm (vd: Màn Hình, CPU)"
                      className="w-full bg-[#1e1e1e] border border-[#333333] rounded p-2 text-white text-xs outline-none"
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      value={s.specKey}
                      onChange={(e) => handleUpdateSpec(idx, "specKey", e.target.value)}
                      placeholder="Tên thông số (vd: Độ phân giải)"
                      className="w-full bg-[#1e1e1e] border border-[#333333] rounded p-2 text-white text-xs outline-none"
                    />
                  </div>
                  <div className="sm:col-span-4">
                    <input
                      type="text"
                      value={s.specValue}
                      onChange={(e) => handleUpdateSpec(idx, "specValue", e.target.value)}
                      placeholder="Giá trị (vd: OLED 2.8K 120Hz)"
                      className="w-full bg-[#1e1e1e] border border-[#333333] rounded p-2 text-white text-xs outline-none"
                    />
                  </div>
                  <div className="sm:col-span-1 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemoveSpec(idx)}
                      className="p-1.5 text-[#bc0000] hover:bg-[#bc0000]/20 rounded transition-colors"
                      title="Xóa thông số này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bottom Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#141414]/95 backdrop-blur border-t border-[#2e2e2e] p-4 flex items-center justify-between px-6 sm:px-12">
        <Link
          href="/admin/products"
          className="text-xs text-[#888888] hover:text-white flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Hủy & Quay lại</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="btn-pill-dark bg-[#dba200] text-black font-bold hover:bg-[#ffc500] text-xs py-2.5 px-6 flex items-center gap-2 transition-colors disabled:opacity-50 shadow-lg"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? "Đang Lưu Cập Nhật..." : "Lưu Thay Đổi Sản Phẩm"}</span>
          </button>
        </div>
      </div>
    </form>
  );
}
