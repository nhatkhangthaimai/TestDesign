import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/context/ToastContext";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/layout/CartDrawer";

const roboto = Roboto({
  weight: ["300", "400", "500", "700", "900"],
  subsets: ["latin", "vietnamese"],
  variable: "--font-roboto",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AJ Commerce - Nền Tảng Thương Mại Điện Tử Cao Cấp",
  description:
    "Trải nghiệm mua sắm công nghệ đỉnh cao, âm thanh Hi-End, smartphone và đồng hồ thông minh chính hãng với giao diện biên tập sang trọng chuẩn quốc tế.",
  keywords: "thương mại điện tử, công nghệ, iPhone 16 Pro Max, Sony WH-1000XM5, Marshall, Garmin",
  openGraph: {
    title: "AJ Commerce - Nền Tảng Thương Mại Điện Tử Cao Cấp",
    description: "Cửa hàng bán lẻ trực tuyến chính ngạch với trải nghiệm mua sắm hiện đại.",
    type: "website",
    locale: "vi_VN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${roboto.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-[#333333] font-sans">
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <Header />
              <CartDrawer />
              <main className="flex-1">{children}</main>
              <Footer />
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
