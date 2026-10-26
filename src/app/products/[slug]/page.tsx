"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Star,
  ShoppingBag,
  Heart,
  Truck,
  ShieldCheck,
  RotateCcw,
  Check,
  ArrowRight,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import { formatVND, formatDate, calculateDiscount } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";

interface ProductDetail {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string | null;
  regularPrice: number;
  salePrice: number | null;
  sku: string;
  stock: number;
  isFlashSale: boolean;
  ratingsAvg: number;
  ratingsCount: number;
  images: Array<{ id: string; url: string; altText?: string | null }>;
  category: { id: string; name: string; slug: string };
  brand?: { id: string; name: string; slug: string; logoUrl?: string | null } | null;
  variants: Array<{
    id: string;
    name: string;
    sku: string;
    price: number;
    stock: number;
    attributesJson: string;
  }>;
  reviews: Array<{
    id: string;
    rating: number;
    title?: string | null;
    comment: string;
    createdAt: string;
    user: { id: string; name: string; avatar?: string | null };
  }>;
}

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const { addToCart } = useCart();
  const { success, error, info } = useToast();
  const { user } = useAuth();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Gallery state
  const [selectedImage, setSelectedImage] = useState<string>("");

  // Variant & Quantity State
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"desc" | "shipping" | "reviews">("desc");

  // Review Form State
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${slug}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data.product);
          setRelatedProducts(data.relatedProducts || []);
          if (data.product.images?.length > 0) {
            setSelectedImage(data.product.images[0].url);
          }
          if (data.product.variants?.length > 0) {
            setSelectedVariantId(data.product.variants[0].id);
          }
        }
      } catch (err) {
        console.error("Error loading product:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16 text-center">
        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-[#595959]">Đang tải chi tiết sản phẩm...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16 text-center">
        <h2 className="text-2xl font-bold text-black mb-2">Sản phẩm không tồn tại</h2>
        <p className="text-sm text-[#595959] mb-6">Sản phẩm có thể đã ngừng kinh doanh hoặc đường dẫn bị thay đổi.</p>
        <Link href="/products" className="btn-pill-dark">
          Quay lại danh mục sản phẩm
        </Link>
      </div>
    );
  }

  const selectedVariant = product.variants.find((v) => v.id === selectedVariantId);
  const currentPrice = selectedVariant ? selectedVariant.price : (product.salePrice ?? product.regularPrice);
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;
  const currentSku = selectedVariant ? selectedVariant.sku : product.sku;
  const discount = calculateDiscount(product.regularPrice, currentPrice);

  const handleAddToCart = () => {
    if (quantity > currentStock) {
      error(`Rất tiếc, kho chỉ còn ${currentStock} sản phẩm`);
      return;
    }
    addToCart({
      productId: product.id,
      variantId: selectedVariantId,
      variantName: selectedVariant?.name || null,
      title: product.title,
      price: currentPrice,
      quantity,
      imageUrl: selectedImage || product.images[0]?.url || "",
      sku: currentSku,
      stock: currentStock,
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/checkout");
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      info("Vui lòng đăng nhập để gửi đánh giá");
      return;
    }
    if (!reviewComment.trim()) {
      error("Vui lòng nhập nội dung đánh giá");
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          rating: reviewRating,
          comment: reviewComment,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        success("Cảm ơn bạn đã gửi đánh giá sản phẩm!");
        setReviewComment("");
        // Append to current product reviews
        setProduct((prev) =>
          prev
            ? {
                ...prev,
                reviews: [
                  {
                    id: data.review.id,
                    rating: reviewRating,
                    comment: reviewComment,
                    createdAt: new Date().toISOString(),
                    user: { id: user.id, name: user.name, avatar: user.avatar },
                  },
                  ...prev.reviews,
                ],
              }
            : prev
        );
      } else {
        error(data.error || "Gửi đánh giá thất bại");
      }
    } catch {
      error("Lỗi gửi đánh giá");
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-12">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-[#595959]">
        <Link href="/" className="hover:text-black">Trang Chủ</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-black">Sản Phẩm</Link>
        <span>/</span>
        <Link href={`/products?category=${product.category.slug}`} className="hover:text-black">
          {product.category.name}
        </Link>
        <span>/</span>
        <span className="text-black font-semibold truncate max-w-[200px]">{product.title}</span>
      </nav>

      {/* Main Product Showcase: Gallery + Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Gallery Column */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square w-full bg-[#f8f8f8] border border-[#d8d8d8] rounded-[10px] overflow-hidden">
            {selectedImage && (
              <Image
                src={selectedImage}
                alt={product.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            )}
            {product.isFlashSale && (
              <span className="absolute top-4 left-4 bg-[#c31833] text-white text-xs font-black uppercase px-3 py-1 rounded-[2px] tracking-wider flex items-center gap-1.5 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                FLASH SALE ĐẶC BIỆT
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.url)}
                  className={`relative w-20 h-20 bg-[#f8f8f8] rounded-[6px] overflow-hidden shrink-0 border-2 transition-all ${
                    selectedImage === img.url ? "border-black shadow-xs" : "border-[#d8d8d8] opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image src={img.url} alt="Thumbnail" fill className="object-cover" sizes="80px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info & Purchase Controls */}
        <div className="lg:col-span-6 space-y-6">
          {/* Header & Meta */}
          <div>
            <div className="flex items-center justify-between text-xs text-[#595959] mb-1.5">
              <span className="uppercase font-bold tracking-wider">
                Thương hiệu: {product.brand?.name || "Chính hãng"}
              </span>
              <span className="font-mono">Mã SKU: {currentSku}</span>
            </div>

            <h1 className="font-bold text-2xl sm:text-3xl text-black leading-tight">
              {product.title}
            </h1>

            {/* Ratings */}
            <div className="flex items-center gap-2 mt-2.5">
              <div className="flex items-center text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.ratingsAvg)
                        ? "fill-amber-500"
                        : "text-[#d8d8d8]"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-black">{product.ratingsAvg.toFixed(1)}</span>
              <span className="text-xs text-[#595959]">
                ({product.reviews.length} khách hàng đã đánh giá)
              </span>
            </div>
          </div>

          {/* Price Box */}
          <div className="p-4 bg-[#f8f8f8] border border-[#d8d8d8] rounded-[10px] flex items-baseline gap-4">
            <span className="font-bold text-2xl sm:text-3xl text-black">
              {formatVND(currentPrice)}
            </span>
            {discount > 0 && (
              <>
                <span className="text-base text-[#595959] line-through">
                  {formatVND(product.regularPrice)}
                </span>
                <span className="bg-[#c31833] text-white text-xs font-black px-2 py-0.5 rounded-[2px]">
                  Tiết kiệm {discount}%
                </span>
              </>
            )}
          </div>

          {/* Variants Selector */}
          {product.variants.length > 0 && (
            <div className="space-y-2.5 pt-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-black">
                Chọn Phân Loại / Phiên Bản:
              </label>
              <div className="flex flex-wrap gap-2.5">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariantId(v.id)}
                    className={`px-4 py-2 rounded-[6px] text-xs font-bold border transition-all ${
                      selectedVariantId === v.id
                        ? "border-black bg-black text-white shadow-xs"
                        : "border-[#d8d8d8] bg-white text-black hover:border-black"
                    }`}
                  >
                    <span>{v.name}</span>
                    <span className="block text-[10px] font-normal opacity-80 mt-0.5">
                      {formatVND(v.price)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stock Level Alert */}
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                currentStock > 10
                  ? "bg-emerald-500"
                  : currentStock > 0
                  ? "bg-amber-500 animate-ping"
                  : "bg-[#c31833]"
              }`}
            />
            {currentStock > 10 ? (
              <span className="text-emerald-700">Còn hàng trong kho ({currentStock} sản phẩm sẵn có)</span>
            ) : currentStock > 0 ? (
              <span className="text-amber-700 font-bold">Chỉ còn {currentStock} sản phẩm cuối cùng!</span>
            ) : (
              <span className="text-[#c31833] font-bold">Hiện đang tạm hết hàng</span>
            )}
          </div>

          {/* Quantity Selector & CTAs */}
          <div className="pt-2 space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold uppercase tracking-wider text-black">
                Số lượng:
              </span>
              <div className="flex items-center border border-[#d8d8d8] rounded-[6px] bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1.5 text-sm font-bold hover:bg-[#f0f0f0]"
                >
                  -
                </button>
                <span className="w-10 text-center text-xs font-bold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1.5 text-sm font-bold hover:bg-[#f0f0f0]"
                >
                  +
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={currentStock <= 0}
                className="btn-pill-outline py-3 text-sm flex items-center justify-center gap-2 w-full"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Thêm vào giỏ hàng</span>
              </button>
              <button
                onClick={handleBuyNow}
                disabled={currentStock <= 0}
                className="btn-pill-dark py-3 text-sm flex items-center justify-center gap-2 w-full"
              >
                <span>Mua ngay</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Guarantee Badges */}
          <div className="p-4 bg-[#f8f8f8] border border-[#d8d8d8] rounded-[10px] grid grid-cols-3 gap-2 text-center text-xs">
            <div className="flex flex-col items-center gap-1">
              <Truck className="w-5 h-5 text-black" />
              <span className="font-bold text-black">Miễn phí ship</span>
              <span className="text-[10px] text-[#595959]">Đơn từ 500K</span>
            </div>
            <div className="flex flex-col items-center gap-1 border-x border-[#d8d8d8]">
              <ShieldCheck className="w-5 h-5 text-black" />
              <span className="font-bold text-black">Bảo hành 12T</span>
              <span className="text-[10px] text-[#595959]">Chính hãng VNA</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <RotateCcw className="w-5 h-5 text-black" />
              <span className="font-bold text-black">Đổi trả 30 ngày</span>
              <span className="text-[10px] text-[#595959]">Lỗi do nhà sx</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs: Description, Shipping, Reviews */}
      <div className="pt-8 border-t border-[#d8d8d8]">
        {/* Tab Buttons */}
        <div className="flex border-b border-[#d8d8d8] gap-8">
          <button
            onClick={() => setActiveTab("desc")}
            className={`pb-3 text-sm font-bold tracking-wider uppercase transition-colors relative ${
              activeTab === "desc" ? "text-black border-b-2 border-black" : "text-[#595959] hover:text-black"
            }`}
          >
            Mô Tả Chi Tiết
          </button>
          <button
            onClick={() => setActiveTab("shipping")}
            className={`pb-3 text-sm font-bold tracking-wider uppercase transition-colors relative ${
              activeTab === "shipping" ? "text-black border-b-2 border-black" : "text-[#595959] hover:text-black"
            }`}
          >
            Chính Sách Vận Chuyển & Bảo Hành
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`pb-3 text-sm font-bold tracking-wider uppercase transition-colors relative ${
              activeTab === "reviews" ? "text-black border-b-2 border-black" : "text-[#595959] hover:text-black"
            }`}
          >
            Đánh Giá Của Khách Hàng ({product.reviews.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="py-6">
          {activeTab === "desc" && (
            <div className="max-w-3xl space-y-4 text-sm leading-relaxed text-[#333333]">
              <p className="font-medium text-base text-black">{product.description}</p>
              {product.content && (
                <div className="pt-2 text-justify space-y-3">
                  <p>{product.content}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "shipping" && (
            <div className="max-w-3xl space-y-4 text-sm leading-relaxed text-[#333333]">
              <h4 className="font-bold text-black text-base">Quy Định Vận Chuyển:</h4>
              <ul className="list-disc pl-5 space-y-2">
                <li>Giao hàng hỏa tốc trong 2 giờ tại nội thành Hà Nội & TP. Hồ Chí Minh.</li>
                <li>Giao hàng tiêu chuẩn toàn quốc từ 1 - 3 ngày làm việc thông qua VNPost / Viettel Post.</li>
                <li>Được kiểm tra hàng (đồng kiểm ngoại quan) trước khi thanh toán tiền mặt (COD).</li>
              </ul>
              <h4 className="font-bold text-black text-base pt-2">Chính Sách Đổi Trả & Bảo Hành:</h4>
              <ul className="list-disc pl-5 space-y-2">
                <li>Bảo hành 12 tháng tại các trung tâm bảo hành ủy quyền trên toàn quốc.</li>
                <li>1 đổi 1 trong vòng 30 ngày nếu phát sinh lỗi kỹ thuật từ nhà sản xuất.</li>
              </ul>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-8 max-w-3xl">
              {/* Write Review Form */}
              <div className="bg-[#f8f8f8] border border-[#d8d8d8] rounded-[10px] p-6 space-y-4">
                <h4 className="font-bold text-sm text-black uppercase tracking-wider">
                  Viết Đánh Giá Của Bạn
                </h4>
                <form onSubmit={handleSubmitReview} className="space-y-3">
                  <div>
                    <label className="block text-xs text-[#595959] mb-1">Mức độ hài lòng:</label>
                    <div className="flex gap-1 text-amber-500">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          type="button"
                          key={star}
                          onClick={() => setReviewRating(star)}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`w-5 h-5 ${
                              star <= reviewRating ? "fill-amber-500" : "text-[#d8d8d8]"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <textarea
                      placeholder="Chia sẻ trải nghiệm sử dụng thực tế của bạn về sản phẩm này..."
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      rows={3}
                      className="w-full bg-white border border-[#d8d8d8] rounded-[6px] p-3 text-xs outline-none focus:border-black"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="btn-pill-dark text-xs py-2 px-5"
                  >
                    {submittingReview ? "Đang gửi..." : "Gửi Đánh Giá"}
                  </button>
                </form>
              </div>

              {/* Reviews List */}
              <div className="space-y-4 divide-y divide-[#d8d8d8]">
                {product.reviews.length === 0 ? (
                  <p className="text-xs text-[#595959] py-4">Chưa có đánh giá nào cho sản phẩm này.</p>
                ) : (
                  product.reviews.map((rev) => (
                    <div key={rev.id} className="pt-4 first:pt-0 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-black">{rev.user.name}</span>
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                            Đã mua hàng
                          </span>
                        </div>
                        <span className="text-[11px] text-[#595959]">{formatDate(rev.createdAt)}</span>
                      </div>
                      <div className="flex text-amber-500">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                        ))}
                      </div>
                      <p className="text-xs text-[#333333] leading-relaxed">{rev.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="pt-8 border-t border-[#d8d8d8]">
          <div className="section-eyebrow-lockup mb-6">
            <span className="section-eyebrow-bar" />
            <h2 className="section-eyebrow-text">SẢN PHẨM CÙNG DANH MỤC</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
