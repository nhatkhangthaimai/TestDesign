"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  User as UserIcon,
  Package,
  Heart,
  ShieldCheck,
  Mail,
  Phone,
  Calendar,
  ArrowRight,
  MapPin,
  Lock,
  Settings,
  Edit3,
  Plus,
  Trash2,
  Check,
  X,
  AlertCircle,
  Eye,
  EyeOff,
  ShoppingBag,
  ExternalLink,
  RotateCcw,
  LogOut,
  Bell,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { formatDate, formatVND } from "@/lib/utils";

const SAMPLE_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=200&q=80",
];

const VIETNAM_PROVINCES = [
  "TP. Hồ Chí Minh",
  "Hà Nội",
  "Đà Nẵng",
  "Hải Phòng",
  "Cần Thơ",
  "Bình Dương",
  "Đồng Nai",
  "Quảng Ninh",
  "Bà Rịa - Vũng Tàu",
  "Khánh Hòa",
];

export default function AccountPage() {
  const { user, loading, isAdmin, refreshUser, logout } = useAuth();
  const { addToCart } = useCart();
  const { success, error, info } = useToast();
  const router = useRouter();

  // Active Tab
  const [activeTab, setActiveTab] = useState<
    "overview" | "profile" | "orders" | "addresses" | "wishlist" | "security" | "settings"
  >("overview");

  // Data States
  const [orders, setOrders] = useState<any[]>([]);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [loadingWishlist, setLoadingWishlist] = useState(false);

  // Tab 2: Profile Form State
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileAvatar, setProfileAvatar] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Tab 3: Order Details Modal State
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [orderFilter, setOrderFilter] = useState<string>("ALL");

  // Tab 4: Address Form / Modal State
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [addrRecipient, setAddrRecipient] = useState("");
  const [addrPhone, setAddrPhone] = useState("");
  const [addrStreet, setAddrStreet] = useState("");
  const [addrWard, setAddrWard] = useState("");
  const [addrDistrict, setAddrDistrict] = useState("");
  const [addrCity, setAddrCity] = useState("TP. Hồ Chí Minh");
  const [addrIsDefault, setAddrIsDefault] = useState(false);
  const [submittingAddress, setSubmittingAddress] = useState(false);

  // Tab 6: Password Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Tab 7: Settings & Delete Account Modal State
  const [emailNotify, setEmailNotify] = useState(true);
  const [promoNotify, setPromoNotify] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteConfirmPassword, setDeleteConfirmPassword] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);

  // Sync profile form when user loaded
  useEffect(() => {
    if (user) {
      setProfileName(user.name || "");
      setProfilePhone(user.phone || "");
      setProfileAvatar(user.avatar || "");
    }
  }, [user]);

  // Load orders
  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch("/api/orders");
      const data = await res.json();
      setOrders(data.orders || []);
    } catch {
      // ignore
    } finally {
      setLoadingOrders(false);
    }
  }, []);

  // Load addresses
  const fetchAddresses = useCallback(async () => {
    setLoadingAddresses(true);
    try {
      const res = await fetch("/api/addresses");
      const data = await res.json();
      setAddresses(data.addresses || []);
    } catch {
      // ignore
    } finally {
      setLoadingAddresses(false);
    }
  }, []);

  // Load wishlist
  const fetchWishlist = useCallback(async () => {
    setLoadingWishlist(true);
    try {
      const res = await fetch("/api/wishlist");
      const data = await res.json();
      setWishlist(data.wishlist || []);
    } catch {
      // ignore
    } finally {
      setLoadingWishlist(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchOrders();
      fetchAddresses();
      fetchWishlist();
    }
  }, [user, fetchOrders, fetchAddresses, fetchWishlist]);

  // Handle Tab 2: Profile Update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      error("Họ và tên không được để trống");
      return;
    }

    setSavingProfile(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profileName.trim(),
          phone: profilePhone.trim() || null,
          avatar: profileAvatar || null,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        success("Đã cập nhật hồ sơ cá nhân thành công!");
        await refreshUser();
      } else {
        error(data.error || "Lỗi cập nhật hồ sơ");
      }
    } catch {
      error("Lỗi kết nối máy chủ");
    } finally {
      setSavingProfile(false);
    }
  };

  // Handle Tab 3: Cancel Order
  const handleCancelOrder = async (orderId: string) => {
    if (!confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?")) return;
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        success("Đã hủy đơn hàng thành công");
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: "CANCELLED" } : o))
        );
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder((prev: any) => ({ ...prev, status: "CANCELLED" }));
        }
      } else {
        error(data.error || "Không thể hủy đơn hàng");
      }
    } catch {
      error("Lỗi khi gửi yêu cầu hủy đơn");
    }
  };

  // Handle Tab 3: Re-order items
  const handleReorder = (order: any) => {
    if (!order.items || order.items.length === 0) return;
    let addedCount = 0;
    order.items.forEach((item: any) => {
      if (item.product) {
        addToCart({
          productId: item.product.id,
          variantId: item.variantId || null,
          variantName: item.variantName || null,
          title: item.title,
          price: Number(item.price),
          quantity: item.quantity,
          imageUrl: item.product.images?.[0]?.url || "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80",
          sku: item.product.sku || "AJ-SKU",
          stock: item.product.stock || 50,
        });
        addedCount += item.quantity;
      }
    });
    success(`Đã thêm ${addedCount} sản phẩm từ đơn hàng vào giỏ!`);
    router.push("/cart");
  };

  // Handle Tab 4: Open Add/Edit Address Modal
  const handleOpenAddressModal = (addr?: any) => {
    if (addr) {
      setEditingAddressId(addr.id);
      setAddrRecipient(addr.recipientName || "");
      setAddrPhone(addr.phone || "");
      setAddrStreet(addr.street || "");
      setAddrWard(addr.ward || "");
      setAddrDistrict(addr.district || "");
      setAddrCity(addr.city || "TP. Hồ Chí Minh");
      setAddrIsDefault(Boolean(addr.isDefault));
    } else {
      setEditingAddressId(null);
      setAddrRecipient(user?.name || "");
      setAddrPhone(user?.phone || "");
      setAddrStreet("");
      setAddrWard("");
      setAddrDistrict("");
      setAddrCity("TP. Hồ Chí Minh");
      setAddrIsDefault(addresses.length === 0);
    }
    setIsAddressModalOpen(true);
  };

  // Handle Tab 4: Submit Address
  const handleSubmitAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrRecipient.trim() || !addrPhone.trim() || !addrStreet.trim() || !addrCity.trim()) {
      error("Vui lòng điền đầy đủ các trường thông tin bắt buộc (*)");
      return;
    }

    setSubmittingAddress(true);
    try {
      const payload = {
        recipientName: addrRecipient.trim(),
        phone: addrPhone.trim(),
        street: addrStreet.trim(),
        ward: addrWard.trim(),
        district: addrDistrict.trim(),
        city: addrCity.trim(),
        isDefault: addrIsDefault,
      };

      const url = editingAddressId ? `/api/addresses/${editingAddressId}` : "/api/addresses";
      const method = editingAddressId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        success(editingAddressId ? "Đã cập nhật địa chỉ thành công!" : "Đã thêm địa chỉ mới thành công!");
        setIsAddressModalOpen(false);
        fetchAddresses();
      } else {
        error(data.error || "Lỗi lưu địa chỉ");
      }
    } catch {
      error("Lỗi kết nối máy chủ");
    } finally {
      setSubmittingAddress(false);
    }
  };

  // Handle Tab 4: Delete Address
  const handleDeleteAddress = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) return;
    try {
      const res = await fetch(`/api/addresses/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        success("Đã xóa địa chỉ thành công");
        fetchAddresses();
      } else {
        error(data.error || "Lỗi xóa địa chỉ");
      }
    } catch {
      error("Lỗi kết nối");
    }
  };

  // Handle Tab 4: Set Default Address
  const handleSetDefaultAddress = async (id: string) => {
    try {
      const res = await fetch(`/api/addresses/${id}/default`, { method: "POST" });
      if (res.ok) {
        success("Đã cập nhật địa chỉ mặc định");
        fetchAddresses();
      } else {
        error("Lỗi cập nhật địa chỉ mặc định");
      }
    } catch {
      error("Lỗi kết nối");
    }
  };

  // Handle Tab 5: Remove from Wishlist
  const handleRemoveWishlist = async (productId: string) => {
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      if (res.ok) {
        setWishlist((prev) => prev.filter((it) => it.product?.id !== productId));
        success("Đã xóa khỏi danh sách yêu thích");
      }
    } catch {
      error("Lỗi xóa sản phẩm");
    }
  };

  // Handle Tab 6: Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      error("Vui lòng nhập mật khẩu hiện tại");
      return;
    }
    if (newPassword.length < 6) {
      error("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }
    if (newPassword !== confirmPassword) {
      error("Mật khẩu xác nhận không khớp");
      return;
    }

    setChangingPassword(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        success("Đổi mật khẩu thành công!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        error(data.error || "Không thể đổi mật khẩu");
      }
    } catch {
      error("Lỗi kết nối máy chủ");
    } finally {
      setChangingPassword(false);
    }
  };

  // Handle Tab 7: Delete Account Request
  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deleteConfirmPassword) {
      error("Vui lòng nhập mật khẩu để xác nhận xóa");
      return;
    }

    setDeletingAccount(true);
    try {
      const res = await fetch("/api/auth/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deleteConfirmPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        success("Tài khoản của bạn đã được xóa thành công.");
        window.location.href = "/";
      } else {
        error(data.error || "Lỗi xóa tài khoản");
      }
    } catch {
      error("Lỗi kết nối máy chủ");
    } finally {
      setDeletingAccount(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center text-xs text-[#595959]">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
          <span>Đang tải thông tin tài khoản...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-black">Vui Lòng Đăng Nhập</h2>
        <p className="text-xs text-[#595959]">
          Bạn cần đăng nhập để quản lý hồ sơ, đơn hàng và sổ địa chỉ giao hàng.
        </p>
        <Link href="/login" className="btn-pill-dark inline-block px-8 py-2.5">
          Đăng nhập ngay
        </Link>
      </div>
    );
  }

  // Filter orders by status
  const filteredOrders = orders.filter((o) => {
    if (orderFilter === "ALL") return true;
    return o.status === orderFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="section-eyebrow-lockup pb-4 border-b border-[#d8d8d8] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="section-eyebrow-bar" />
          <h1 className="section-eyebrow-text">QUẢN LÝ TÀI KHOẢN KHÁCH HÀNG</h1>
        </div>
        <div className="text-xs text-[#595959]">
          Xin chào, <strong className="text-black">{user.name}</strong>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT SIDEBAR: NAVIGATION TABS & PROFILE CARD */}
        <div className="lg:col-span-4 space-y-4">
          {/* User Compact Card */}
          <div className="bg-white border border-[#d8d8d8] rounded-[10px] p-5 space-y-4">
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-full overflow-hidden bg-[#fa9000] text-white flex items-center justify-center font-black text-2xl uppercase shrink-0 border border-[#e5e5e5]">
                {user.avatar ? (
                  <Image src={user.avatar} alt={user.name} fill className="object-cover" sizes="64px" />
                ) : (
                  <span>{user.name.charAt(0)}</span>
                )}
              </div>
              <div className="overflow-hidden">
                <h2 className="font-bold text-base text-black truncate">{user.name}</h2>
                <p className="text-xs text-[#595959] truncate">{user.email}</p>
                <span className="inline-block text-[10px] bg-[#f0f0f0] px-2 py-0.5 rounded font-bold uppercase text-[#595959] mt-1">
                  {user.role}
                </span>
              </div>
            </div>

            {isAdmin && (
              <div className="pt-2">
                <Link
                  href="/admin"
                  className="w-full btn-pill-dark text-xs py-2 bg-[#181818] hover:bg-black text-[#dba200] border border-[#dba200]/40 flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>VÀO TRANG QUẢN TRỊ ADMIN</span>
                </Link>
              </div>
            )}
          </div>

          {/* Navigation Tabs List */}
          <div className="bg-white border border-[#d8d8d8] rounded-[10px] overflow-hidden divide-y divide-[#f0f0f0]">
            {[
              { id: "overview", label: "Tổng quan tài khoản", icon: UserIcon },
              { id: "profile", label: "Chỉnh sửa hồ sơ cá nhân", icon: Edit3 },
              { id: "orders", label: `Đơn hàng của tôi (${orders.length})`, icon: Package },
              { id: "addresses", label: `Sổ địa chỉ (${addresses.length})`, icon: MapPin },
              { id: "wishlist", label: `Sản phẩm yêu thích (${wishlist.length})`, icon: Heart },
              { id: "security", label: "Bảo mật & Đổi mật khẩu", icon: Lock },
              { id: "settings", label: "Cài đặt tài khoản", icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full px-4 py-3 text-left text-xs font-bold flex items-center justify-between transition-colors ${
                    isActive
                      ? "bg-[#181818] text-white"
                      : "bg-white text-[#222222] hover:bg-[#f8f8f8]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? "text-[#fa9000]" : "text-[#595959]"}`} />
                    <span>{tab.label}</span>
                  </div>
                  <ArrowRight className={`w-3.5 h-3.5 ${isActive ? "text-[#fa9000]" : "text-[#999999]"}`} />
                </button>
              );
            })}
          </div>

          {/* Quick Logout Button */}
          <button
            onClick={logout}
            className="w-full py-2.5 px-4 bg-white border border-[#d8d8d8] hover:border-black rounded-[8px] text-xs font-bold text-red-600 hover:bg-red-50 flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng Xuất Khỏi Tài Khoản</span>
          </button>
        </div>

        {/* RIGHT CONTENT PANEL */}
        <div className="lg:col-span-8 space-y-6">
          {/* ============================================================== */}
          {/* TAB 1: TỔNG QUAN TÀI KHOẢN */}
          {/* ============================================================== */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Quick Stat Tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setActiveTab("orders")}
                  className="p-4 bg-[#f8f8f8] border border-[#d8d8d8] rounded-[10px] hover:border-black text-left transition-all"
                >
                  <Package className="w-5 h-5 text-black mb-2" />
                  <span className="text-xs text-[#595959] block">Đơn mua hàng</span>
                  <strong className="text-xl font-bold text-black">{orders.length}</strong>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("wishlist")}
                  className="p-4 bg-[#f8f8f8] border border-[#d8d8d8] rounded-[10px] hover:border-black text-left transition-all"
                >
                  <Heart className="w-5 h-5 text-[#c31833] mb-2" />
                  <span className="text-xs text-[#595959] block">Yêu thích</span>
                  <strong className="text-xl font-bold text-black">{wishlist.length} món</strong>
                </button>

                <div className="p-4 bg-[#f8f8f8] border border-[#d8d8d8] rounded-[10px] col-span-2 sm:col-span-1">
                  <span className="text-xs text-[#595959] block">Tổng chi tiêu:</span>
                  <strong className="text-lg font-bold text-black block mt-2">
                    {formatVND(
                      orders
                        .filter((o) => o.paymentStatus === "PAID" || o.status === "DELIVERED")
                        .reduce((sum, o) => sum + Number(o.total || 0), 0)
                    )}
                  </strong>
                </div>
              </div>

              {/* User Detailed Overview Card */}
              <div className="bg-white border border-[#d8d8d8] rounded-[10px] p-6 space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-[#d8d8d8]">
                  <h3 className="font-bold text-sm text-black uppercase tracking-wider">
                    Thông Tin Tài Khoản
                  </h3>
                  <button
                    onClick={() => setActiveTab("profile")}
                    className="text-xs font-bold text-[#fa9000] hover:underline flex items-center gap-1"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Chỉnh sửa hồ sơ</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#595959]">
                  <div>
                    <span className="block text-[11px] text-[#888888]">Họ và tên:</span>
                    <strong className="text-black text-sm">{user.name}</strong>
                  </div>
                  <div>
                    <span className="block text-[11px] text-[#888888]">Địa chỉ Email:</span>
                    <strong className="text-black text-sm">{user.email}</strong>
                  </div>
                  <div>
                    <span className="block text-[11px] text-[#888888]">Số điện thoại:</span>
                    <strong className="text-black text-sm">{user.phone || "Chưa cập nhật"}</strong>
                  </div>
                  <div>
                    <span className="block text-[11px] text-[#888888]">Ngày tham gia:</span>
                    <strong className="text-black text-sm">{formatDate(user.createdAt || new Date())}</strong>
                  </div>
                </div>
              </div>

              {/* Recent Orders Overview */}
              <div className="bg-white border border-[#d8d8d8] rounded-[10px] p-6 space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-[#d8d8d8]">
                  <h3 className="font-bold text-sm text-black uppercase tracking-wider">
                    Đơn Hàng Gần Đây
                  </h3>
                  <button
                    onClick={() => setActiveTab("orders")}
                    className="text-xs font-bold text-black hover:underline flex items-center gap-1"
                  >
                    <span>Xem tất cả ({orders.length})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {orders.length === 0 ? (
                  <p className="text-xs text-[#595959] py-4">Bạn chưa có đơn đặt hàng nào.</p>
                ) : (
                  <div className="divide-y divide-[#f0f0f0]">
                    {orders.slice(0, 3).map((o) => (
                      <div key={o.id} className="py-3 flex justify-between items-center text-xs">
                        <div>
                          <span className="font-mono font-bold text-black block">{o.orderNumber}</span>
                          <span className="text-[11px] text-[#595959]">{formatDate(o.createdAt)}</span>
                          <span className="text-[11px] text-[#595959] block">
                            {o.items?.length || 1} sản phẩm • {o.paymentMethod}
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="font-bold text-black block">{formatVND(o.total)}</span>
                          <span
                            className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                              o.status === "DELIVERED"
                                ? "bg-emerald-100 text-emerald-800"
                                : o.status === "CANCELLED"
                                ? "bg-red-100 text-red-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {o.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 2: CHỈNH SỬA THÔNG TIN CÁ NHÂN */}
          {/* ============================================================== */}
          {activeTab === "profile" && (
            <div className="bg-white border border-[#d8d8d8] rounded-[10px] p-6 space-y-6">
              <div className="pb-3 border-b border-[#d8d8d8]">
                <h3 className="font-bold text-base text-black uppercase tracking-wider">
                  Chỉnh Sửa Hồ Sơ Cá Nhân
                </h3>
                <p className="text-xs text-[#595959] mt-0.5">
                  Cập nhật họ tên, số điện thoại và ảnh đại diện hiển thị trên AJ Commerce.
                </p>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-5 text-xs">
                {/* Avatar Section */}
                <div className="space-y-3">
                  <label className="block font-bold text-black">Ảnh đại diện</label>
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden bg-[#fa9000] text-white flex items-center justify-center font-bold text-xl uppercase shrink-0 border border-[#d8d8d8]">
                      {profileAvatar ? (
                        <Image src={profileAvatar} alt={profileName} fill className="object-cover" sizes="64px" />
                      ) : (
                        <span>{profileName.charAt(0) || "U"}</span>
                      )}
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <input
                        type="text"
                        value={profileAvatar}
                        onChange={(e) => setProfileAvatar(e.target.value)}
                        placeholder="Dán URL link ảnh đại diện..."
                        className="w-full h-10 border border-[#d4d4d4] rounded-lg px-3 text-xs outline-none focus:border-black"
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-[#888888]">Hoặc chọn avatar mẫu:</span>
                        <div className="flex items-center gap-1.5">
                          {SAMPLE_AVATARS.map((av, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setProfileAvatar(av)}
                              className="relative w-7 h-7 rounded-full overflow-hidden border border-[#d8d8d8] hover:scale-110 transition-transform"
                            >
                              <Image src={av} alt="Sample" fill className="object-cover" sizes="28px" />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block font-bold text-black mb-1.5">Họ và tên *</label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="Ví dụ: Thái Mai Nhật Khang"
                    className="w-full h-11 border border-[#d4d4d4] rounded-lg px-3.5 text-xs outline-none focus:border-black"
                    required
                  />
                </div>

                {/* Email (Readonly) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block font-bold text-black">Địa chỉ Email đăng nhập</label>
                    <span className="text-[10px] text-[#888888] bg-[#f0f0f0] px-2 py-0.5 rounded">
                      Cố định bảo mật
                    </span>
                  </div>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full h-11 bg-[#f8f8f8] border border-[#e5e5e5] rounded-lg px-3.5 text-xs text-[#777777] cursor-not-allowed"
                  />
                  <p className="text-[11px] text-[#888888] mt-1">
                    Để thay đổi email đăng nhập, vui lòng liên hệ bộ phận hỗ trợ khách hàng.
                  </p>
                </div>

                {/* Phone */}
                <div>
                  <label className="block font-bold text-black mb-1.5">Số điện thoại liên hệ</label>
                  <input
                    type="tel"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    placeholder="Ví dụ: 0987654321"
                    className="w-full h-11 border border-[#d4d4d4] rounded-lg px-3.5 text-xs outline-none focus:border-black"
                  />
                </div>

                <div className="pt-3 border-t border-[#f0f0f0] flex justify-end">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="btn-pill-dark px-6 py-2.5 text-xs flex items-center gap-2"
                  >
                    {savingProfile ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Check className="w-4 h-4 text-[#fa9000]" />
                    )}
                    <span>{savingProfile ? "Đang Lưu..." : "Lưu Thông Tin Hồ Sơ"}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 3: ĐƠN HÀNG CỦA TÔI */}
          {/* ============================================================== */}
          {activeTab === "orders" && (
            <div className="space-y-4">
              <div className="bg-white border border-[#d8d8d8] rounded-[10px] p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#d8d8d8]">
                  <h3 className="font-bold text-base text-black uppercase tracking-wider">
                    Lịch Sử Đơn Hàng ({orders.length})
                  </h3>
                  {/* Filter Pills */}
                  <div className="flex flex-wrap items-center gap-1 text-[11px]">
                    {[
                      { id: "ALL", label: "Tất cả" },
                      { id: "PENDING", label: "Chờ xử lý" },
                      { id: "SHIPPED", label: "Đang giao" },
                      { id: "DELIVERED", label: "Đã giao" },
                      { id: "CANCELLED", label: "Đã hủy" },
                    ].map((f) => (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setOrderFilter(f.id)}
                        className={`px-2.5 py-1 rounded-full font-bold transition-all ${
                          orderFilter === f.id
                            ? "bg-black text-white"
                            : "bg-[#f0f0f0] text-[#595959] hover:bg-[#e5e5e5]"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {loadingOrders ? (
                  <div className="py-12 text-center text-xs text-[#595959]">Đang tải danh sách đơn hàng...</div>
                ) : filteredOrders.length === 0 ? (
                  <div className="py-12 text-center text-xs text-[#595959] space-y-2">
                    <Package className="w-10 h-10 mx-auto text-[#999999]" />
                    <p className="font-bold text-black text-sm">Không tìm thấy đơn hàng nào</p>
                    <p>Hãy khám phá các sản phẩm công nghệ tuyệt vời trên AJ Commerce.</p>
                    <Link href="/products" className="btn-pill-dark inline-block px-4 py-2 mt-2">
                      Mua sắm ngay
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredOrders.map((order) => (
                      <div
                        key={order.id}
                        className="border border-[#e5e5e5] rounded-[10px] p-5 space-y-3 hover:border-black transition-colors"
                      >
                        {/* Order Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#f0f0f0] text-xs">
                          <div>
                            <span className="font-mono font-bold text-black text-sm">
                              {order.orderNumber}
                            </span>
                            <span className="text-[11px] text-[#595959] ml-2">
                              • Ngày đặt: {formatDate(order.createdAt)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                order.status === "DELIVERED"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : order.status === "CANCELLED"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {order.status}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                order.paymentStatus === "PAID"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                                  : "bg-amber-50 text-amber-700 border border-amber-300"
                              }`}
                            >
                              {order.paymentStatus}
                            </span>
                          </div>
                        </div>

                        {/* Order Items Preview */}
                        <div className="space-y-2 text-xs">
                          {order.items?.map((it: any) => (
                            <div key={it.id} className="flex items-center justify-between gap-4 py-1">
                              <div className="flex items-center gap-3">
                                {it.product?.images?.[0] && (
                                  <div className="relative w-10 h-10 rounded border border-[#e5e5e5] overflow-hidden shrink-0">
                                    <Image src={it.product.images[0].url} alt="" fill className="object-cover" sizes="40px" />
                                  </div>
                                )}
                                <div>
                                  <span className="font-bold text-black block line-clamp-1">{it.title}</span>
                                  <span className="text-[11px] text-[#777777]">
                                    {formatVND(it.price)} × {it.quantity}
                                    {it.variantName ? ` • ${it.variantName}` : ""}
                                  </span>
                                </div>
                              </div>
                              <span className="font-bold text-black shrink-0">{formatVND(it.total)}</span>
                            </div>
                          ))}
                        </div>

                        {/* Order Footer & Actions */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#f0f0f0] text-xs">
                          <div className="text-[#595959]">
                            Tổng thanh toán: <strong className="text-black text-sm">{formatVND(order.total)}</strong>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedOrder(order)}
                              className="px-3 py-1.5 border border-[#d4d4d4] rounded text-black font-bold hover:bg-[#f5f5f5]"
                            >
                              Xem chi tiết
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReorder(order)}
                              className="px-3 py-1.5 bg-[#181818] text-white rounded font-bold hover:bg-black flex items-center gap-1"
                            >
                              <RotateCcw className="w-3 h-3 text-[#fa9000]" />
                              <span>Mua lại</span>
                            </button>
                            {order.status === "PENDING" && (
                              <button
                                type="button"
                                onClick={() => handleCancelOrder(order.id)}
                                className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded font-bold hover:bg-red-100"
                              >
                                Hủy đơn
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 4: SỔ ĐỊA CHỈ GIAO HÀNG */}
          {/* ============================================================== */}
          {activeTab === "addresses" && (
            <div className="bg-white border border-[#d8d8d8] rounded-[10px] p-6 space-y-6">
              <div className="flex justify-between items-center pb-3 border-b border-[#d8d8d8]">
                <div>
                  <h3 className="font-bold text-base text-black uppercase tracking-wider">
                    Sổ Địa Chỉ Nhận Hàng ({addresses.length})
                  </h3>
                  <p className="text-xs text-[#595959] mt-0.5">
                    Quản lý danh sách địa chỉ nhận hàng để thanh toán nhanh hơn tại trang Checkout.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenAddressModal()}
                  className="btn-pill-dark px-3.5 py-2 text-xs flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-[#fa9000]" />
                  <span>Thêm Địa Chỉ Mới</span>
                </button>
              </div>

              {loadingAddresses ? (
                <div className="py-12 text-center text-xs text-[#595959]">Đang tải sổ địa chỉ...</div>
              ) : addresses.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#595959] space-y-2">
                  <MapPin className="w-10 h-10 mx-auto text-[#999999]" />
                  <p className="font-bold text-black text-sm">Chưa có địa chỉ giao hàng nào</p>
                  <p>Thêm địa chỉ giao hàng đầu tiên để tiết kiệm thời gian đặt hàng.</p>
                  <button
                    onClick={() => handleOpenAddressModal()}
                    className="btn-pill-dark inline-block px-4 py-2 mt-2"
                  >
                    Thêm địa chỉ ngay
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className={`p-4 rounded-[10px] border relative space-y-2 text-xs transition-all ${
                        addr.isDefault
                          ? "border-[#fa9000] bg-[#fffaf2]"
                          : "border-[#d8d8d8] bg-white hover:border-black"
                      }`}
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-[#f0f0f0]">
                        <div className="flex items-center gap-2">
                          <strong className="text-sm font-bold text-black">{addr.recipientName}</strong>
                          {addr.isDefault && (
                            <span className="text-[9px] bg-[#fa9000] text-black font-bold px-1.5 py-0.5 rounded uppercase">
                              Mặc định
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenAddressModal(addr)}
                            className="p-1 text-[#595959] hover:text-black"
                            title="Sửa địa chỉ"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="p-1 text-red-500 hover:text-red-700"
                            title="Xóa địa chỉ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="text-[#595959] space-y-1">
                        <p className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-black shrink-0" />
                          <span>{addr.phone}</span>
                        </p>
                        <p className="flex items-start gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-black shrink-0 mt-0.5" />
                          <span>
                            {addr.street}
                            {addr.ward ? `, ${addr.ward}` : ""}
                            {addr.district ? `, ${addr.district}` : ""}
                            {`, ${addr.city}`}
                          </span>
                        </p>
                      </div>

                      {!addr.isDefault && (
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => handleSetDefaultAddress(addr.id)}
                            className="text-[11px] font-bold text-[#fa9000] hover:underline"
                          >
                            Đặt làm mặc định
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 5: DANH SÁCH YÊU THÍCH */}
          {/* ============================================================== */}
          {activeTab === "wishlist" && (
            <div className="bg-white border border-[#d8d8d8] rounded-[10px] p-6 space-y-6">
              <div className="pb-3 border-b border-[#d8d8d8]">
                <h3 className="font-bold text-base text-black uppercase tracking-wider">
                  Sản Phẩm Yêu Thích ({wishlist.length})
                </h3>
                <p className="text-xs text-[#595959] mt-0.5">
                  Các sản phẩm bạn đã bấm lưu tim để theo dõi giá và mua sau.
                </p>
              </div>

              {loadingWishlist ? (
                <div className="py-12 text-center text-xs text-[#595959]">Đang tải danh sách yêu thích...</div>
              ) : wishlist.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#595959] space-y-2">
                  <Heart className="w-10 h-10 mx-auto text-[#c31833]" />
                  <p className="font-bold text-black text-sm">Chưa có sản phẩm nào trong yêu thích</p>
                  <p>Bấm biểu tượng trái tim ở góc các sản phẩm để lưu lại tại đây.</p>
                  <Link href="/products" className="btn-pill-dark inline-block px-4 py-2 mt-2">
                    Khám phá sản phẩm
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {wishlist.map((it) => {
                    const prod = it.product;
                    if (!prod) return null;
                    return (
                      <div
                        key={it.id}
                        className="border border-[#e5e5e5] rounded-[10px] p-3 flex flex-col justify-between hover:border-black transition-colors"
                      >
                        <div>
                          <div className="relative aspect-square rounded overflow-hidden bg-[#f0f0f0] mb-2">
                            {prod.images?.[0] && (
                              <Image src={prod.images[0].url} alt={prod.title} fill className="object-cover" sizes="200px" />
                            )}
                          </div>
                          <Link href={`/products/${prod.slug}`} className="font-bold text-xs text-black line-clamp-2 hover:underline">
                            {prod.title}
                          </Link>
                          <div className="mt-1 flex items-baseline gap-2">
                            <span className="font-bold text-black text-xs">
                              {formatVND(prod.salePrice ?? prod.regularPrice)}
                            </span>
                            {prod.salePrice && (
                              <span className="text-[10px] text-[#888888] line-through">
                                {formatVND(prod.regularPrice)}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="pt-3 border-t border-[#f0f0f0] mt-3 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              addToCart({
                                productId: prod.id,
                                title: prod.title,
                                price: Number(prod.salePrice ?? prod.regularPrice),
                                imageUrl: prod.images?.[0]?.url || "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80",
                                quantity: 1,
                                sku: prod.sku || "AJ-SKU",
                                stock: Number(prod.stock) || 50,
                              });
                              success(`Đã thêm "${prod.title}" vào giỏ hàng!`);
                            }}
                            className="flex-1 py-1.5 bg-[#181818] hover:bg-black text-white text-[11px] font-bold rounded flex items-center justify-center gap-1"
                          >
                            <ShoppingBag className="w-3 h-3 text-[#fa9000]" />
                            <span>Thêm Giỏ</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveWishlist(prod.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                            title="Xóa khỏi yêu thích"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 6: BẢO MẬT & ĐỔI MẬT KHẨU */}
          {/* ============================================================== */}
          {activeTab === "security" && (
            <div className="bg-white border border-[#d8d8d8] rounded-[10px] p-6 space-y-6">
              <div className="pb-3 border-b border-[#d8d8d8]">
                <h3 className="font-bold text-base text-black uppercase tracking-wider">
                  Bảo Mật Tài Khoản & Đổi Mật Khẩu
                </h3>
                <p className="text-xs text-[#595959] mt-0.5">
                  Đảm bảo tài khoản luôn an toàn bằng cách sử dụng mật khẩu mạnh từ 6 ký tự trở lên.
                </p>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md text-xs">
                {/* Current Password */}
                <div>
                  <label className="block font-bold text-black mb-1.5">Mật khẩu hiện tại *</label>
                  <div className="relative">
                    <input
                      type={showCurrentPw ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Nhập mật khẩu đang dùng..."
                      className="w-full h-11 border border-[#d4d4d4] rounded-lg px-3.5 pr-10 text-xs outline-none focus:border-black"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPw(!showCurrentPw)}
                      className="absolute right-3 top-3 text-[#777777] hover:text-black"
                    >
                      {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block font-bold text-black mb-1.5">Mật khẩu mới *</label>
                  <div className="relative">
                    <input
                      type={showNewPw ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Ít nhất 6 ký tự..."
                      className="w-full h-11 border border-[#d4d4d4] rounded-lg px-3.5 pr-10 text-xs outline-none focus:border-black"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPw(!showNewPw)}
                      className="absolute right-3 top-3 text-[#777777] hover:text-black"
                    >
                      {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block font-bold text-black mb-1.5">Xác nhận mật khẩu mới *</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới..."
                    className="w-full h-11 border border-[#d4d4d4] rounded-lg px-3.5 text-xs outline-none focus:border-black"
                    required
                  />
                  {newPassword && confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-[11px] text-red-500 mt-1">Mật khẩu xác nhận không khớp!</p>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={changingPassword}
                    className="btn-pill-dark px-6 py-2.5 text-xs flex items-center gap-2"
                  >
                    {changingPassword ? (
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Lock className="w-3.5 h-3.5 text-[#fa9000]" />
                    )}
                    <span>{changingPassword ? "Đang Cập Nhật..." : "Cập Nhật Mật Khẩu"}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB 7: CÀI ĐẶT TÀI KHOẢN & YÊU CẦU XÓA */}
          {/* ============================================================== */}
          {activeTab === "settings" && (
            <div className="bg-white border border-[#d8d8d8] rounded-[10px] p-6 space-y-6">
              <div className="pb-3 border-b border-[#d8d8d8]">
                <h3 className="font-bold text-base text-black uppercase tracking-wider">
                  Cài Đặt & Quyền Riêng Tư
                </h3>
                <p className="text-xs text-[#595959] mt-0.5">
                  Tùy chỉnh thông báo và quản lý an toàn quyền riêng tư tài khoản của bạn.
                </p>
              </div>

              {/* Notification Preferences */}
              <div className="space-y-4">
                <h4 className="font-bold text-xs text-black uppercase flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#fa9000]" />
                  <span>Tùy Chọn Thông Báo</span>
                </h4>
                <div className="space-y-3 text-xs">
                  <label className="flex items-center justify-between p-3 border border-[#e5e5e5] rounded-lg cursor-pointer hover:bg-[#fafafa]">
                    <div>
                      <strong className="block text-black">Email cập nhật trạng thái đơn hàng</strong>
                      <span className="text-[#595959] text-[11px]">Nhận thông báo khi đơn được xác nhận, đóng gói và giao hàng.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailNotify}
                      onChange={(e) => setEmailNotify(e.target.checked)}
                      className="w-4 h-4 accent-black rounded"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 border border-[#e5e5e5] rounded-lg cursor-pointer hover:bg-[#fafafa]">
                    <div>
                      <strong className="block text-black">Tin tức khuyến mãi & Flash Sale</strong>
                      <span className="text-[#595959] text-[11px]">Nhận mã voucher giảm giá và thông tin các sự kiện công nghệ hot.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={promoNotify}
                      onChange={(e) => setPromoNotify(e.target.checked)}
                      className="w-4 h-4 accent-black rounded"
                    />
                  </label>
                </div>
              </div>

              {/* Danger Zone: Delete Account */}
              <div className="pt-6 border-t border-[#f0f0f0] space-y-3">
                <h4 className="font-bold text-xs text-red-600 uppercase flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>Vùng Nguy Hiểm</span>
                </h4>
                <div className="p-4 border border-red-200 bg-red-50/50 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="text-xs text-[#595959] space-y-0.5">
                    <strong className="block text-red-700">Yêu cầu xóa tài khoản vĩnh viễn</strong>
                    <p className="text-[11px]">
                      Khi xóa, thông tin cá nhân và sổ địa chỉ sẽ bị hủy bỏ hoàn toàn. Bạn không thể hoàn tác hành động này.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold shrink-0 shadow-xs"
                  >
                    Xóa Tài Khoản
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* MODAL: CHI TIẾT ĐƠN HÀNG */}
      {/* ============================================================== */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setSelectedOrder(null)} />
          <div className="relative bg-white border border-[#d8d8d8] rounded-[12px] shadow-2xl max-w-2xl w-full p-6 z-10 max-h-[90vh] overflow-y-auto space-y-5 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-[#f0f0f0]">
              <div>
                <h3 className="font-bold text-base text-black flex items-center gap-2">
                  <span>CHI TIẾT ĐƠN HÀNG</span>
                  <span className="font-mono text-[#fa9000]">{selectedOrder.orderNumber}</span>
                </h3>
                <span className="text-[11px] text-[#595959]">
                  Ngày tạo: {formatDate(selectedOrder.createdAt)}
                </span>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-[#888888] hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Recipient & Shipping Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#f8f8f8] p-4 rounded-lg">
              <div>
                <span className="font-bold text-black block mb-1">Thông tin nhận hàng:</span>
                <p className="font-medium text-black">{selectedOrder.customerName}</p>
                <p className="text-[#595959]">{selectedOrder.customerPhone}</p>
                <p className="text-[#595959]">{selectedOrder.customerEmail}</p>
              </div>
              <div>
                <span className="font-bold text-black block mb-1">Địa chỉ giao nhận:</span>
                <p className="text-[#595959]">
                  {selectedOrder.shippingAddress}, {selectedOrder.shippingWard}, {selectedOrder.shippingDistrict}, {selectedOrder.shippingCity}
                </p>
                {selectedOrder.note && (
                  <p className="text-[11px] text-amber-800 bg-amber-50 p-1.5 rounded mt-1.5">
                    Ghi chú: {selectedOrder.note}
                  </p>
                )}
              </div>
            </div>

            {/* Items List */}
            <div className="space-y-2">
              <span className="font-bold text-black block">Danh sách sản phẩm ({selectedOrder.items?.length || 0}):</span>
              <div className="divide-y divide-[#f0f0f0] border border-[#e5e5e5] rounded-lg p-3">
                {selectedOrder.items?.map((it: any) => (
                  <div key={it.id} className="py-2.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      {it.product?.images?.[0] && (
                        <div className="relative w-12 h-12 rounded border border-[#e5e5e5] overflow-hidden shrink-0">
                          <Image src={it.product.images[0].url} alt="" fill className="object-cover" sizes="48px" />
                        </div>
                      )}
                      <div>
                        <strong className="block text-black line-clamp-1">{it.title}</strong>
                        <span className="text-[11px] text-[#777777]">
                          Đơn giá: {formatVND(it.price)} × {it.quantity}
                          {it.variantName ? ` • ${it.variantName}` : ""}
                        </span>
                      </div>
                    </div>
                    <strong className="text-black shrink-0">{formatVND(it.total)}</strong>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Calculation */}
            <div className="bg-[#f8f8f8] p-4 rounded-lg space-y-1.5 text-right">
              <div className="flex justify-between text-xs text-[#595959]">
                <span>Tạm tính tiền hàng:</span>
                <span className="font-medium text-black">{formatVND(selectedOrder.subtotal)}</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between text-xs text-red-600">
                  <span>Giảm giá khuyến mãi:</span>
                  <span>-{formatVND(selectedOrder.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-xs text-[#595959]">
                <span>Phí vận chuyển:</span>
                <span className="font-medium text-black">
                  {selectedOrder.shippingFee > 0 ? formatVND(selectedOrder.shippingFee) : "Miễn phí (0đ)"}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-black pt-2 border-t border-[#e5e5e5]">
                <span>Tổng số tiền:</span>
                <span className="text-base text-[#c31833]">{formatVND(selectedOrder.total)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-[#595959]">
                Hình thức thanh toán: <strong className="text-black">{selectedOrder.paymentMethod}</strong>
              </span>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="btn-pill-dark px-4 py-2"
              >
                Đóng cửa sổ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: THÊM / SỬA ĐỊA CHỈ */}
      {/* ============================================================== */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsAddressModalOpen(false)} />
          <div className="relative bg-white border border-[#d8d8d8] rounded-[12px] shadow-2xl max-w-lg w-full p-6 z-10 space-y-4 text-xs">
            <div className="flex justify-between items-center pb-3 border-b border-[#f0f0f0]">
              <h3 className="font-bold text-sm text-black uppercase tracking-wider">
                {editingAddressId ? "Chỉnh Sửa Địa Chỉ Giao Hàng" : "Thêm Địa Chỉ Giao Hàng Mới"}
              </h3>
              <button onClick={() => setIsAddressModalOpen(false)} className="text-[#888888] hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitAddress} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-black mb-1">Tên người nhận *</label>
                  <input
                    type="text"
                    value={addrRecipient}
                    onChange={(e) => setAddrRecipient(e.target.value)}
                    placeholder="VD: Nguyễn Văn A"
                    className="w-full h-10 border border-[#d4d4d4] rounded px-3 text-xs outline-none focus:border-black"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-black mb-1">Số điện thoại *</label>
                  <input
                    type="tel"
                    value={addrPhone}
                    onChange={(e) => setAddrPhone(e.target.value)}
                    placeholder="VD: 0987654321"
                    className="w-full h-10 border border-[#d4d4d4] rounded px-3 text-xs outline-none focus:border-black"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-black mb-1">Tỉnh / Thành phố *</label>
                <select
                  value={addrCity}
                  onChange={(e) => setAddrCity(e.target.value)}
                  className="w-full h-10 border border-[#d4d4d4] rounded px-3 text-xs outline-none focus:border-black"
                  required
                >
                  {VIETNAM_PROVINCES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-black mb-1">Quận / Huyện</label>
                  <input
                    type="text"
                    value={addrDistrict}
                    onChange={(e) => setAddrDistrict(e.target.value)}
                    placeholder="VD: Quận 1"
                    className="w-full h-10 border border-[#d4d4d4] rounded px-3 text-xs outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="block font-bold text-black mb-1">Phường / Xã</label>
                  <input
                    type="text"
                    value={addrWard}
                    onChange={(e) => setAddrWard(e.target.value)}
                    placeholder="VD: Phường Bến Nghé"
                    className="w-full h-10 border border-[#d4d4d4] rounded px-3 text-xs outline-none focus:border-black"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-black mb-1">Số nhà, tên đường chi tiết *</label>
                <input
                  type="text"
                  value={addrStreet}
                  onChange={(e) => setAddrStreet(e.target.value)}
                  placeholder="VD: 123 Lê Lợi, Tòa nhà Bitexco"
                  className="w-full h-10 border border-[#d4d4d4] rounded px-3 text-xs outline-none focus:border-black"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="addrDefault"
                  checked={addrIsDefault}
                  onChange={(e) => setAddrIsDefault(e.target.checked)}
                  className="w-4 h-4 accent-black rounded"
                />
                <label htmlFor="addrDefault" className="font-bold text-black cursor-pointer text-xs">
                  Đặt làm địa chỉ nhận hàng mặc định
                </label>
              </div>

              <div className="pt-3 border-t border-[#f0f0f0] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="px-4 py-2 border border-[#d4d4d4] rounded font-bold hover:bg-[#f5f5f5]"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submittingAddress}
                  className="btn-pill-dark px-5 py-2"
                >
                  {submittingAddress ? "Đang lưu..." : "Lưu Địa Chỉ"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: XÁC NHẬN XÓA TÀI KHOẢN */}
      {/* ============================================================== */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setIsDeleteModalOpen(false)} />
          <div className="relative bg-white border border-red-300 rounded-[12px] shadow-2xl max-w-md w-full p-6 z-10 space-y-4 text-xs">
            <div className="flex items-center gap-3 text-red-600 pb-3 border-b border-red-100">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="font-bold text-base text-black">XÁC NHẬN XÓA TÀI KHOẢN</h3>
            </div>

            <div className="space-y-2 text-[#595959]">
              <p>
                Hành động này sẽ <strong>hủy bỏ vĩnh viễn</strong> quyền truy cập của bạn vào hệ thống AJ Commerce.
              </p>
              <ul className="list-disc pl-4 space-y-1 text-[11px]">
                <li>Thông tin cá nhân và sổ địa chỉ sẽ bị xóa.</li>
                <li>Không thể xóa nếu bạn có đơn hàng đang trong quá trình vận chuyển.</li>
                <li>Bạn sẽ bị đăng xuất ngay sau khi hoàn tất.</li>
              </ul>
            </div>

            <form onSubmit={handleDeleteAccount} className="space-y-3 pt-2">
              <div>
                <label className="block font-bold text-black mb-1">
                  Nhập mật khẩu hiện tại để xác nhận:
                </label>
                <input
                  type="password"
                  value={deleteConfirmPassword}
                  onChange={(e) => setDeleteConfirmPassword(e.target.value)}
                  placeholder="Mật khẩu của bạn..."
                  className="w-full h-10 border border-red-300 rounded px-3 text-xs outline-none focus:border-red-600"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 border border-[#d4d4d4] rounded font-bold hover:bg-[#f5f5f5]"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={deletingAccount}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded"
                >
                  {deletingAccount ? "Đang xóa..." : "Xác Nhận Xóa"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
