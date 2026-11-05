"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Truck,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  VolumeX,
  Play,
  Pause,
} from "lucide-react";

export interface BannerItem {
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
  position?: string;
  isActive: boolean;
  sortOrder: number;
  durationSeconds?: number | null;
}

interface HeroBannerProps {
  initialBanners?: BannerItem[];
}

export default function HeroBanner({ initialBanners = [] }: HeroBannerProps) {
  const [banners, setBanners] = useState<BannerItem[]>(initialBanners);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [videoError, setVideoError] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(initialBanners.length === 0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  // Fetch banners from API if not provided via props
  useEffect(() => {
    async function loadBanners() {
      try {
        const res = await fetch("/api/banners?position=HERO");
        if (res.ok) {
          const data = await res.json();
          if (data.banners && data.banners.length > 0) {
            setBanners(data.banners);
          }
        }
      } catch (err) {
        console.error("Error fetching hero banners:", err);
      } finally {
        setLoading(false);
      }
    }

    if (initialBanners.length === 0) {
      loadBanners();
    }
  }, [initialBanners]);

  const activeBanners = banners.filter((b) => b.isActive);
  const currentBanner = activeBanners[currentIndex] || activeBanners[0];

  // Auto-slide effect
  useEffect(() => {
    if (!isPlaying || activeBanners.length <= 1) return;

    const duration = (currentBanner?.durationSeconds || 8) * 1000;
    timerRef.current = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [currentIndex, isPlaying, activeBanners.length, currentBanner?.durationSeconds]);

  // Restart video playback on active slide
  useEffect(() => {
    if (currentBanner && currentBanner.mediaType === "VIDEO") {
      const vid = videoRefs.current[currentBanner.id];
      if (vid) {
        vid.currentTime = 0;
        vid.play().catch(() => {
          // Autoplay was prevented by browser policy, keep poster visible
        });
      }
    }
  }, [currentIndex, currentBanner]);

  const handlePrev = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setCurrentIndex((prev) => (prev === 0 ? activeBanners.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
  };

  if (loading) {
    return (
      <div className="w-full bg-[#181818] min-h-[460px] md:min-h-[580px] animate-pulse flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#fa9000] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Fallback default banner if no banners in database
  if (!currentBanner) {
    return (
      <section className="relative w-full bg-[#181818] text-white min-h-[520px] md:min-h-[620px] flex items-center overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-16 w-full z-10">
          <div className="max-w-2xl space-y-6">
            <span className="inline-flex items-center gap-2 bg-[#fa9000]/20 border border-[#fa9000] rounded-full px-4 py-1 text-xs font-bold text-[#fa9000] uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#fa9000] animate-ping" />
              AJ COMMERCE 2026
            </span>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
              ĐỈNH CAO CÔNG NGHỆ & ÂM THANH HI-END
            </h1>
            <p className="text-sm sm:text-base text-white/80 leading-relaxed">
              Khám phá bộ sưu tập thiết bị cao cấp chính hãng nguyên seal với trải nghiệm biên tập sang trọng chuẩn quốc tế.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link href="/products" className="btn-pill-dark bg-[#fa9000] text-black font-bold px-8 py-3.5 hover:bg-[#ffa000]">
                <span>Khám phá ngay</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const isVideo = currentBanner.mediaType === "VIDEO" && currentBanner.videoUrl && !videoError[currentBanner.id];
  const overlayOpacity = currentBanner.overlayOpacity ?? 0.45;
  const overlayColor = currentBanner.overlayColor || "#000000";
  const textColor = currentBanner.textColor || "#ffffff";
  const contentAlign =
    currentBanner.contentPosition === "CENTER"
      ? "text-center items-center mx-auto"
      : currentBanner.contentPosition === "RIGHT"
      ? "text-right items-end ml-auto"
      : "text-left items-start mr-auto";

  return (
    <section className="relative w-full bg-[#100e2f] overflow-hidden group select-none">
      {/* 1. HERO MEDIA CONTAINER (VIDEO OR IMAGE) */}
      <div className="relative w-full min-h-[460px] sm:min-h-[520px] md:min-h-[580px] lg:min-h-[640px] flex items-center">
        {/* VIDEO BACKGROUND (1080P FULL HD) */}
        {isVideo ? (
          <div className="absolute inset-0 w-full h-full overflow-hidden">
            <video
              ref={(el) => {
                videoRefs.current[currentBanner.id] = el;
              }}
              key={currentBanner.id}
              className="w-full h-full object-cover object-center transition-opacity duration-1000 scale-100 group-hover:scale-105 transition-transform duration-7000 ease-out"
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              poster={currentBanner.posterUrl || currentBanner.imageUrl}
              onError={() => {
                console.warn("Video failed to play, switching to poster image fallback");
                setVideoError((prev) => ({ ...prev, [currentBanner.id]: true }));
              }}
            >
              {currentBanner.videoMobileUrl && (
                <source src={currentBanner.videoMobileUrl} media="(max-width: 768px)" type="video/mp4" />
              )}
              <source src={currentBanner.videoUrl!} type="video/mp4" />
            </video>
          </div>
        ) : (
          /* IMAGE BACKGROUND (HIGH RESOLUTION) */
          <div className="absolute inset-0 w-full h-full overflow-hidden">
            <Image
              src={currentBanner.imageUrl}
              alt={currentBanner.title}
              fill
              priority
              className="object-cover object-center scale-100 group-hover:scale-105 transition-transform duration-7000 ease-out"
              sizes="100vw"
            />
          </div>
        )}

        {/* 2. CUSTOMIZABLE DARKENING OVERLAY */}
        <div
          className="absolute inset-0 transition-all duration-500 pointer-events-none"
          style={{
            backgroundColor: overlayColor,
            opacity: overlayOpacity,
          }}
        />

        {/* Editorial Vignette & Gradient Bottom Edge */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

        {/* 3. HERO CONTENT OVERLAY */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 py-16 sm:py-24">
          <div className={`max-w-2xl flex flex-col space-y-5 sm:space-y-6 ${contentAlign}`}>
            {/* Eyebrow / Badge */}
            {currentBanner.badgeText && (
              <div className="inline-flex items-center gap-2 bg-black/40 backdrop-blur-md border border-white/20 rounded-[18px] px-3.5 py-1 text-xs font-bold tracking-wider self-start sm:self-auto">
                <span className="w-2 h-2 rounded-full bg-[#c31833] animate-pulse" />
                <span style={{ color: textColor }}>{currentBanner.badgeText}</span>
                {isVideo && (
                  <span className="ml-1 px-1.5 py-0.2 rounded bg-[#fa9000] text-black text-[10px] font-black uppercase tracking-tight">
                    1080P HD
                  </span>
                )}
              </div>
            )}

            {/* Main Headline */}
            <h1
              className="font-black text-3xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.1] uppercase drop-shadow-md"
              style={{ color: textColor }}
            >
              {currentBanner.title}
            </h1>

            {/* Subtitle / Tagline */}
            {currentBanner.subtitle && (
              <h2
                className="text-lg sm:text-xl md:text-2xl font-semibold tracking-wide drop-shadow-sm opacity-95"
                style={{ color: textColor }}
              >
                {currentBanner.subtitle}
              </h2>
            )}

            {/* Description Body */}
            {currentBanner.description && (
              <p
                className="text-sm sm:text-base leading-relaxed max-w-xl opacity-90 drop-shadow-xs"
                style={{ color: textColor }}
              >
                {currentBanner.description}
              </p>
            )}

            {/* Call To Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2">
              <Link
                href={currentBanner.linkUrl || "/products"}
                className="btn-pill-dark bg-[#fa9000] text-black font-extrabold text-sm sm:text-base py-3 px-7 sm:px-8 hover:bg-[#ffa000] shadow-lg transition-transform active:scale-95 flex items-center gap-2"
              >
                <span>{currentBanner.ctaText || "Khám Phá Ngay"}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/products?filter=flash_sale"
                className="btn-pill-outline bg-black/30 backdrop-blur-md border-white/40 text-white font-bold text-sm sm:text-base py-3 px-6 hover:bg-white hover:text-black transition-all"
              >
                <span>Flash Sale 2026</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 4. PREV / NEXT CONTROLS (Only visible if > 1 banner) */}
        {activeBanners.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-black/80 backdrop-blur-md text-white border border-white/20 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95 shadow-md"
              title="Banner trước"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={handleNext}
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/40 hover:bg-black/80 backdrop-blur-md text-white border border-white/20 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95 shadow-md"
              title="Banner kế tiếp"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* 5. CAROUSEL DOT INDICATORS & PLAY/PAUSE */}
        {activeBanners.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
            {activeBanners.map((b, idx) => (
              <button
                key={b.id}
                onClick={() => {
                  if (timerRef.current) clearTimeout(timerRef.current);
                  setCurrentIndex(idx);
                }}
                className={`transition-all rounded-full ${
                  idx === currentIndex
                    ? "w-8 h-2 bg-[#fa9000]"
                    : "w-2 h-2 bg-white/50 hover:bg-white"
                }`}
                title={`Chuyển đến banner ${idx + 1}`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}

            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="ml-1 text-white/70 hover:text-white transition-colors"
              title={isPlaying ? "Tạm dừng tự động chuyển" : "Tiếp tục tự động chuyển"}
            >
              {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </button>
          </div>
        )}
      </div>

      {/* 6. SERVICE TRUST BADGES STRIP (Al Jazeera Editorial Bottom Anchor) */}
      <div className="bg-[#181818] border-t border-[#2a2a2a] text-white/80 py-3.5 px-4 sm:px-8 text-xs font-semibold">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 items-center">
          <div className="flex items-center gap-2.5">
            <Truck className="w-4 h-4 text-[#fa9000] shrink-0" />
            <span className="truncate">Giao 2H Hỏa Tốc Toàn Quốc</span>
          </div>
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#fa9000] shrink-0" />
            <span className="truncate">Bảo Hành Chính Hãng 12-24T</span>
          </div>
          <div className="flex items-center gap-2.5">
            <RotateCcw className="w-4 h-4 text-[#fa9000] shrink-0" />
            <span className="truncate">Đổi Mới 30 Ngày Nguyên Seal</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-[#fa9000] shrink-0" />
            <span className="truncate">Trả Góp 0% • Miễn Phí Ship</span>
          </div>
        </div>
      </div>
    </section>
  );
}

