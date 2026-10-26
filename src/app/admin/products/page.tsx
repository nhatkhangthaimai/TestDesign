"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Plus, Trash2, Edit, Check, X, Search, Sparkles } from "lucide-react";
import { formatVND } from "@/lib/utils";
import { useToast } from "@/context/ToastContext";

interface Product {
  id: string;
  title: string;
  slug: string;
  sku: string;
  regularPrice: number;
  salePrice: number | null;
  stock: number;
  status: string;
  isFeatured: boolean;
  isFlashSale: boolean;
  category: { id: string; name: string };
  images: Array<{ url: string }>;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { success, error } = useToast();

  // Create Product Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formSku, setFormSku] = useState("");
  const [formRegularPrice, setFormRegularPrice] = useState("");
  const [formSalePrice, setFormSalePrice] = useState("");
  const [formStock, setFormStock] = useState("");
  const [formCategoryId, setFormCategoryId] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formIsFlashSale, setFormIsFlashSale] = useState(false);

  const fetchProducts = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch("/api/admin/products"),
        fetch("/api/categories"),
      ]);
      if (prodRes.ok) {
        const data = await prodRes.json();
        setProducts(data.products || []);
      }
      if (catRes.ok) {
        const cData = await catRes.json();
        setCategories(cData.categories || []);
        if (cData.categories?.length > 0) {
          setFormCategoryId(cData.categories[0].id);
        }
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleTitleChange = (val: string) => {
    setFormTitle(val);
    // Auto-generate slug
    const generatedSlug = val
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    setFormSlug(generatedSlug);
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        title: formTitle,
        slug: formSlug,
        sku: formSku.toUpperCase(),
        regularPrice: parseFloat(formRegularPrice),
        salePrice: formSalePrice ? parseFloat(formSalePrice) : null,
        stock: parseInt(formStock, 10),
        categoryId: formCategoryId,
        description: formDescription,
        isFeatured: formIsFeatured,
        isFlashSale: formIsFlashSale,
        imageUrls: formImageUrl ? [formImageUrl] : ["https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80"],
        status: "ACTIVE",
      };

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        success("Đã thêm sản phẩm thành công!");
        setIsModalOpen(false);
        // Reset form
        setFormTitle("");
        setFormSlug("");
        setFormSku("");
        setFormRegularPrice("");
        setFormSalePrice("");
        setFormStock("");
        setFormDescription("");
        setFormImageUrl("");
        fetchProducts();
      } else {
        error(data.error || "Lỗi tạo sản phẩm");
      }
    } catch {
      error("Lỗi gửi dữ liệu máy chủ");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string, title: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa/ẩn sản phẩm "${title}"?`)) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        success(data.message || "Đã xóa sản phẩm");
        fetchProducts();
      } else {
        error(data.error || "Lỗi xóa sản phẩm");
      }
    } catch {
      error("Lỗi kết nối");
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2a2a2a]">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            QUẢN LÝ SẢN PHẨM & TỒN KHO
          </h1>
          <p className="text-xs text-[#888888] mt-1">
            Tổng số: {products.length} sản phẩm đang được quản lý trên hệ thống
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-pill-dark bg-[#dba200] text-black font-bold hover:bg-[#ffc500] text-xs py-2 px-4 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Sản Phẩm Mới</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="max-w-md bg-[#1e1e1e] border border-[#2e2e2e] rounded-[6px] p-2 flex items-center gap-2">
        <Search className="w-4 h-4 text-[#888888] ml-2" />
        <input
          type="text"
          placeholder="Tìm theo tên sản phẩm hoặc mã SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent text-xs text-white outline-none w-full"
        />
      </div>

      {/* Product Table */}
      <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-[8px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#141414] text-[#888888] uppercase text-[10px]">
              <tr>
                <th className="p-3">Hình Ảnh</th>
                <th className="p-3">Tên Sản Phẩm</th>
                <th className="p-3">Mã SKU</th>
                <th className="p-3">Danh Mục</th>
                <th className="p-3">Giá Bán</th>
                <th className="p-3">Tồn Kho</th>
                <th className="p-3">Trạng Thái</th>
                <th className="p-3 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a2a]">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-[#252525] transition-colors">
                  <td className="p-3">
                    <div className="relative w-12 h-12 bg-black rounded overflow-hidden border border-[#333333]">
                      {p.images[0] && (
                        <Image src={p.images[0].url} alt={p.title} fill className="object-cover" sizes="48px" />
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="font-bold text-white block">{p.title}</span>
                    <span className="text-[10px] text-[#888888]">/{p.slug}</span>
                  </td>
                  <td className="p-3 font-mono font-bold text-[#dba200]">{p.sku}</td>
                  <td className="p-3 text-[#dddddd]">{p.category?.name}</td>
                  <td className="p-3 font-bold text-white">
                    {formatVND(p.salePrice ?? p.regularPrice)}
                  </td>
                  <td className="p-3 font-bold">
                    <span className={p.stock <= 10 ? "text-[#bc0000]" : "text-white"}>
                      {p.stock} cái
                    </span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        p.status === "ACTIVE"
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                          : "bg-neutral-800 text-neutral-400"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleDeleteProduct(p.id, p.title)}
                      className="p-1.5 text-[#bc0000] hover:bg-[#bc0000]/20 rounded transition-colors"
                      title="Xóa/Ẩn sản phẩm"
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

      {/* CREATE PRODUCT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-xs"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative bg-[#1e1e1e] border border-[#333333] rounded-[10px] shadow-2xl max-w-xl w-full p-6 z-10 max-h-[90vh] overflow-y-auto text-white">
            <div className="flex justify-between items-center pb-3 border-b border-[#2e2e2e] mb-4">
              <h3 className="font-bold text-base uppercase text-[#dba200]">
                Thêm Sản Phẩm Mới Vào Hệ Thống
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#888888] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#888888] mb-1 font-bold">Tên sản phẩm *</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Tai Nghe Sennheiser Momentum 4"
                  value={formTitle}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full bg-[#141414] border border-[#333333] rounded p-2.5 text-white outline-none focus:border-[#dba200]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#888888] mb-1 font-bold">Slug URL *</label>
                  <input
                    type="text"
                    value={formSlug}
                    onChange={(e) => setFormSlug(e.target.value)}
                    className="w-full bg-[#141414] border border-[#333333] rounded p-2.5 text-white outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#888888] mb-1 font-bold">Mã SKU duy nhất *</label>
                  <input
                    type="text"
                    placeholder="SNN-MOM4-BLK"
                    value={formSku}
                    onChange={(e) => setFormSku(e.target.value)}
                    className="w-full bg-[#141414] border border-[#333333] rounded p-2.5 text-white uppercase outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[#888888] mb-1 font-bold">Giá Niêm Yết (VND) *</label>
                  <input
                    type="number"
                    placeholder="9990000"
                    value={formRegularPrice}
                    onChange={(e) => setFormRegularPrice(e.target.value)}
                    className="w-full bg-[#141414] border border-[#333333] rounded p-2.5 text-white outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[#888888] mb-1 font-bold">Giá Khuyến Mãi (VND)</label>
                  <input
                    type="number"
                    placeholder="8490000"
                    value={formSalePrice}
                    onChange={(e) => setFormSalePrice(e.target.value)}
                    className="w-full bg-[#141414] border border-[#333333] rounded p-2.5 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#888888] mb-1 font-bold">Số lượng kho *</label>
                  <input
                    type="number"
                    placeholder="25"
                    value={formStock}
                    onChange={(e) => setFormStock(e.target.value)}
                    className="w-full bg-[#141414] border border-[#333333] rounded p-2.5 text-white outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#888888] mb-1 font-bold">Danh mục sản phẩm *</label>
                <select
                  value={formCategoryId}
                  onChange={(e) => setFormCategoryId(e.target.value)}
                  className="w-full bg-[#141414] border border-[#333333] rounded p-2.5 text-white outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#888888] mb-1 font-bold">Mô tả sản phẩm</label>
                <textarea
                  placeholder="Mô tả các tính năng cốt lõi của sản phẩm..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-[#141414] border border-[#333333] rounded p-2.5 text-white outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[#888888] mb-1 font-bold">Link Ảnh Sản Phẩm (URL)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  className="w-full bg-[#141414] border border-[#333333] rounded p-2.5 text-white outline-none"
                />
              </div>

              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsFeatured}
                    onChange={(e) => setFormIsFeatured(e.target.checked)}
                  />
                  <span>Sản phẩm nổi bật</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-[#c31833] font-bold">
                  <input
                    type="checkbox"
                    checked={formIsFlashSale}
                    onChange={(e) => setFormIsFlashSale(e.target.checked)}
                  />
                  <span>Kích hoạt Flash Sale</span>
                </label>
              </div>

              <div className="pt-4 border-t border-[#2e2e2e] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-[#252525] hover:bg-[#303030] rounded text-xs"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#dba200] hover:bg-[#ffc500] text-black font-bold rounded text-xs"
                >
                  {submitting ? "Đang lưu..." : "Lưu Sản Phẩm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
