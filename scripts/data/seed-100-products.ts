import mysql from "mysql2/promise";
import { randomUUID } from "crypto";
import { PRODUCTS_100, RawProductData } from "./products-data-100";

const connectionConfig = {
  host: "gateway01.ap-southeast-1.prod.aws.tidbcloud.com",
  port: 4000,
  user: "iY15LFk8kgKVgVn.root",
  password: "m22dorl92xShU1H8",
  database: "test",
  ssl: {
    minVersion: "TLSv1.2",
    rejectUnauthorized: false,
  },
};

// Add the other 80 products to complete 100 items
const REMAINING_80_PRODUCTS: RawProductData[] = [
  // =========================================================================
  // 2. LAPTOP & MÁY TÍNH (20 SẢN PHẨM)
  // =========================================================================
  {
    title: "MacBook Pro 16 inch M4 Max (36GB RAM / 1TB SSD) - Đen Không Gian Space Black",
    slug: "macbook-pro-16-inch-m4-max-36gb-1tb",
    sku: "AJ-LAP-MBP16-M4M",
    categorySlug: "laptop-may-tinh",
    brandName: "Apple",
    regularPrice: 89990000,
    salePrice: 84990000,
    description: "Quái thú đồ họa với chip M4 Max 14-core CPU, 32-core GPU, màn hình Liquid Retina XDR 1600 nits đỉnh sáng và pin 24 giờ kỷ lục.",
    content: "Dành riêng cho những nhà làm phim 8K, lập trình viên AI và kiến trúc sư hàng đầu thế giới. Băng thông bộ nhớ 410GB/s xử lý trơn tru các mô hình ngôn ngữ lớn (LLM) chạy cục bộ trên máy mà không hề nóng hay giảm xung.",
    stock: 25,
    warrantyMonths: 12,
    originCountry: "Chính Hãng VNA",
    images: [
      { url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=85", altText: "MacBook Pro 16 inch M4 Max", isPrimary: true },
    ],
    specifications: [
      { groupName: "Hiệu Năng", specKey: "Vi Xử Lý", specValue: "Apple M4 Max 14-core CPU, 32-core GPU, 16-core Neural Engine" },
      { groupName: "Màn Hình", specKey: "Tấm Nền", specValue: "16.2 inch Liquid Retina XDR 3456x2234 120Hz ProMotion 1600 nits" },
      { groupName: "Bộ Nhớ", specKey: "RAM & Ổ Cứng", specValue: "36GB Unified Memory / 1TB SSD PCIe siêu tốc" },
    ],
  },
  {
    title: "MacBook Pro 14 inch M4 Pro (24GB RAM / 512GB SSD) - Bạc Silver Sang Trọng",
    slug: "macbook-pro-14-inch-m4-pro-24gb-512gb",
    sku: "AJ-LAP-MBP14-M4P",
    categorySlug: "laptop-may-tinh",
    brandName: "Apple",
    regularPrice: 54990000,
    salePrice: 51990000,
    description: "Sức mạnh pro trong thân máy 14 inch siêu cơ động, 3 cổng Thunderbolt 5 tốc độ 120Gbps và camera 12MP Center Stage.",
    content: "MacBook Pro 14 M4 Pro là lựa chọn cân bằng hoàn hảo giữa hiệu suất vượt bậc và tính di động cao. Khung nhôm tái chế 100% nguyên khối đầm chắc, âm thanh 6 loa vòm Dolby Atmos đỉnh cao.",
    stock: 35,
    warrantyMonths: 12,
    originCountry: "Chính Hãng VNA",
    images: [
      { url: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=1000&q=85", altText: "MacBook Pro 14 M4 Pro", isPrimary: true },
    ],
    specifications: [
      { groupName: "Hiệu Năng", specKey: "Chipset", specValue: "Apple M4 Pro 12-core CPU, 16-core GPU, băng thông 273GB/s" },
      { groupName: "Cổng Kết Nối", specKey: "Giao Thức", specValue: "3x Thunderbolt 5, HDMI 2.1, Khe SDXC, Jack 3.5mm, MagSafe 3" },
    ],
  },
  {
    title: "Dell XPS 16 9640 (Core Ultra 9 185H / 32GB / 1TB / RTX 4070 / 4K+ OLED)",
    slug: "dell-xps-16-9640-oled-rtx4070",
    sku: "AJ-LAP-DELL-XPS16",
    categorySlug: "laptop-may-tinh",
    brandName: "Dell",
    regularPrice: 79990000,
    salePrice: 74990000,
    description: "Kiệt tác thiết kế tương lai với hàng phím chức năng cảm ứng LED, bàn di chuột kính vô hình và màn hình 4K+ OLED vô cực.",
    content: "Dell XPS 16 9640 thể hiện sự đỉnh cao của cơ khí chính xác với vỏ nhôm CNC nguyên khối và chiếu nghỉ tay kính Gorilla Glass 3. Card đồ họa NVIDIA RTX 4070 8GB VRAM tăng tốc mọi tác vụ đồ họa và dựng video chuyên nghiệp.",
    stock: 18,
    warrantyMonths: 24,
    originCountry: "Chính Hãng",
    images: [
      { url: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1000&q=85", altText: "Dell XPS 16 9640", isPrimary: true },
    ],
    specifications: [
      { groupName: "Màn Hình", specKey: "Độ Phân Giải", specValue: "16.3 inch 4K+ (3840 x 2400) OLED Touch 120Hz 100% DCI-P3" },
      { groupName: "Đồ Họa", specKey: "GPU Rời", specValue: "NVIDIA GeForce RTX 4070 8GB GDDR6" },
      { groupName: "Hiệu Năng", specKey: "CPU", specValue: "Intel Core Ultra 9 185H (16 nhân, 22 luồng, up to 5.1GHz, NPU AI)" },
    ],
  },
  {
    title: "ThinkPad X1 Carbon Gen 12 (Core Ultra 7 155H / 32GB / 1TB / 2.8K OLED 120Hz)",
    slug: "thinkpad-x1-carbon-gen-12-oled",
    sku: "AJ-LAP-TP-X1C12",
    categorySlug: "laptop-may-tinh",
    brandName: "Lenovo",
    regularPrice: 58990000,
    salePrice: 54990000,
    description: "Biểu tượng laptop doanh nhân bền bỉ chuẩn quân đội Mỹ MIL-STD 810H, bàn phím gõ êm số 1 thế giới và trọng lượng chỉ 1.09kg.",
    content: "Hơn 30 năm kế thừa di sản huyền thoại, ThinkPad X1 Carbon Gen 12 lột xác với viền màn hình siêu mỏng, thanh Communications Bar tích hợp 2 camera hồng ngoại và nút TrackPoint đỏ kinh điển.",
    stock: 22,
    warrantyMonths: 36,
    originCountry: "Chính Hãng",
    images: [
      { url: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=1000&q=85", altText: "ThinkPad X1 Carbon Gen 12", isPrimary: true },
    ],
    specifications: [
      { groupName: "Trọng Lượng & Vỏ", specKey: "Vật Liệu", specValue: "Sợi carbon đa lớp tái chế + Hợp kim Magie (Chỉ 1.09kg)" },
      { groupName: "Màn Hình", specKey: "Màn Hình", specValue: "14 inch 2.8K (2880 x 1800) OLED 120Hz chống lóa Eyesafe" },
    ],
  },
  {
    title: "ASUS ROG Zephyrus G16 (Core Ultra 9 / RTX 4080 / 32GB / 2TB / OLED 240Hz)",
    slug: "asus-rog-zephyrus-g16-rtx4080-oled",
    sku: "AJ-LAP-ROG-ZG16",
    categorySlug: "laptop-may-tinh",
    brandName: "ASUS",
    regularPrice: 78990000,
    salePrice: 73990000,
    description: "Laptop gaming mỏng nhẹ đẹp nhất thế giới với dải LED Slash Lighting mặt A, màn hình ROG Nebula OLED 240Hz 0.2ms.",
    content: "ASUS định nghĩa lại laptop gaming với thân máy nhôm CNC siêu mỏng chỉ 1.49cm. Tản nhiệt buồng hơi Vapor Chamber và 3 quạt Arc Flow Fans giúp giữ nhiệt độ cực kỳ mát mẻ khi chơi game nặng.",
    stock: 15,
    warrantyMonths: 24,
    originCountry: "Chính Hãng VNA",
    images: [
      { url: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=1000&q=85", altText: "ASUS ROG Zephyrus G16", isPrimary: true },
    ],
    specifications: [
      { groupName: "Màn Hình", specKey: "Màn Hình Gaming", specValue: "16 inch 2.5K ROG Nebula OLED 240Hz 0.2ms G-Sync" },
      { groupName: "Đồ Họa", specKey: "Card Rời", specValue: "NVIDIA GeForce RTX 4080 12GB GDDR6 TGP 115W" },
    ],
  },
  {
    title: "Razer Blade 16 OLED Dual-Mode (i9-14900HX / RTX 4090 / 32GB / 2TB SSD)",
    slug: "razer-blade-16-oled-dual-mode-rtx4090",
    sku: "AJ-LAP-RZ-BLD16",
    categorySlug: "laptop-may-tinh",
    brandName: "ASUS",
    regularPrice: 119990000,
    salePrice: 109990000,
    description: "Cỗ máy chiến game tối thượng vỏ nhôm Anodized đen mờ, card đồ họa RTX 4090 TGP 175W cực đại và màn hình kép 4K/FHD.",
    content: "Được gia công tinh xảo từ nhôm T6 nguyên khối. Màn hình đầu tiên trên thế giới cho phép chuyển đổi giữa chế độ 4K 120Hz làm đồ họa và Full HD 240Hz thi đấu Esports tức thì.",
    stock: 10,
    warrantyMonths: 12,
    originCountry: "Chính Hãng",
    images: [
      { url: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1000&q=85", altText: "Razer Blade 16", isPrimary: true },
    ],
    specifications: [
      { groupName: "Hiệu Năng", specKey: "CPU & GPU", specValue: "Intel Core i9-14900HX 24 nhân + RTX 4090 16GB (175W)" },
      { groupName: "Màn Hình", specKey: "Dual Mode", specValue: "16 inch Dual-Mode Mini-LED: 4K 120Hz / FHD+ 240Hz" },
    ],
  },
  {
    title: "HP Spectre x360 16 2-in-1 (Core Ultra 7 / 32GB / 1TB / 2.8K OLED Touch)",
    slug: "hp-spectre-x360-16-oled-touch",
    sku: "AJ-LAP-HP-SPEC16",
    categorySlug: "laptop-may-tinh",
    brandName: "Dell",
    regularPrice: 48990000,
    salePrice: 44990000,
    description: "Laptop xoay gập 360 độ cao cấp nhất của HP, bút cảm biến nghiêng MPP 2.0 và camera 9MP AI theo dõi chuyển động.",
    content: "HP Spectre x360 16 là sự giao thoa hoàn mỹ giữa nghệ thuật chế tác đá quý và công nghệ tân tiến. Góc vát kim cương tinh xảo giấu cổng kết nối tiện lợi, loa vòm quad-speakers được cân chỉnh bởi Poly Studio.",
    stock: 20,
    warrantyMonths: 24,
    originCountry: "Chính Hãng VNA",
    images: [
      { url: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=1000&q=85", altText: "HP Spectre x360", isPrimary: true },
    ],
    specifications: [
      { groupName: "Màn Hình", specKey: "Màn Cảm Ứng", specValue: "16 inch 2.8K OLED Touch 48-120Hz kính Gorilla Glass NBT" },
      { groupName: "Tính Năng", specKey: "Bút & Camera", specValue: "Kèm bút HP Rechargeable MPP2.0 Tilt Pen, Camera 9MP IR AI" },
    ],
  },
  {
    title: "Lenovo Yoga Slim 7x Snapdragon X Elite (32GB / 1TB / 3K OLED 90Hz / 1.28kg)",
    slug: "lenovo-yoga-slim-7x-snapdragon-oled",
    sku: "AJ-LAP-LNV-YOG7X",
    categorySlug: "laptop-may-tinh",
    brandName: "Lenovo",
    regularPrice: 35990000,
    salePrice: 32990000,
    description: "Kỷ nguyên Copilot+ PC chip ARM tiết kiệm pin vượt trội tới 23 giờ, xử lý AI 45 TOPS cục bộ và mỏng chỉ 12.9mm.",
    content: "Được chế tác từ hợp kim nhôm cao cấp màu Xanh Cosmic. Bàn phím Yoga cảm giác gõ êm ái sâu 1.5mm, 4 loa ngoài Dolby Atmos và màn hình PureSight OLED 3K 1000 nits siêu nét.",
    stock: 30,
    warrantyMonths: 24,
    originCountry: "Chính Hãng VNA",
    images: [
      { url: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=1000&q=85", altText: "Lenovo Yoga Slim 7x", isPrimary: true },
    ],
    specifications: [
      { groupName: "Vi Xử Lý", specKey: "Nền Tảng ARM", specValue: "Snapdragon X Elite X1E-78-100 (12 nhân, NPU 45 TOPS)" },
      { groupName: "Pin", specKey: "Thời Lượng Pin", specValue: "70Wh hoạt động liên tục 23.5 giờ video playback" },
    ],
  },
  {
    title: "Microsoft Surface Laptop 7 Copilot+ PC (Snapdragon X Elite / 16GB / 512GB)",
    slug: "microsoft-surface-laptop-7-copilot",
    sku: "AJ-LAP-MS-SRF7",
    categorySlug: "laptop-may-tinh",
    brandName: "Dell",
    regularPrice: 38990000,
    salePrice: 35990000,
    description: "Thiết kế tối giản biểu tượng của Microsoft, màn hình cảm ứng PixelSense Flow 120Hz tỷ lệ vàng 3:2 làm việc tối ưu.",
    content: "Surface Laptop 7 sở hữu bàn di chuột haptic phản hồi xúc giác rung mượt mà nhất thế giới Windows. Tích hợp sâu phím Copilot AI khởi động trợ lý ảo thông minh chỉ bằng một chạm nhẹ.",
    stock: 25,
    warrantyMonths: 12,
    originCountry: "Chính Hãng",
    images: [
      { url: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1000&q=85", altText: "Surface Laptop 7", isPrimary: true },
    ],
    specifications: [
      { groupName: "Màn Hình", specKey: "PixelSense", specValue: "13.8 inch PixelSense Flow (2304 x 1536) 120Hz cảm ứng 10 điểm" },
      { groupName: "Bàn Di Chuột", specKey: "Touchpad", specValue: "Haptic Touchpad phản hồi rung tuyến tính đa điểm" },
    ],
  },
  {
    title: "MSI Titan 18 HX Dragon Edition (i9-14900HX / RTX 4090 / 64GB / 4TB / 4K Mini-LED)",
    slug: "msi-titan-18-hx-rtx4090-4tb",
    sku: "AJ-LAP-MSI-TT18",
    categorySlug: "laptop-may-tinh",
    brandName: "ASUS",
    regularPrice: 149990000,
    salePrice: 139990000,
    description: "Vua của các dòng laptop gaming với bàn phím cơ Cherry MX cơ học, buồng tản nhiệt Vapor Chamber 3D và công suất tổng 270W.",
    content: "Cỗ máy thay thế hoàn toàn máy trạm để bàn. Màn hình Mini-LED 18 inch 4K 120Hz chuẩn VESA DisplayHDR 1000 cho độ tương phản đen sâu thăm thẳm và độ sáng cực đại choáng ngợp.",
    stock: 8,
    warrantyMonths: 24,
    originCountry: "Chính Hãng",
    images: [
      { url: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=1000&q=85", altText: "MSI Titan 18 HX", isPrimary: true },
    ],
    specifications: [
      { groupName: "Cấu Hình", specKey: "CPU & GPU", specValue: "i9-14900HX + RTX 4090 16GB VRAM công suất tối đa 270W OverBoost" },
      { groupName: "Bàn Phím", specKey: "Loại Phím", specValue: "Bàn phím cơ Cherry MX Ultra Low Profile RGB per-key SteelSeries" },
    ],
  },
  {
    title: "Alienware m16 R2 Gaming Laptop (Core Ultra 7 / RTX 4070 / 32GB / 1TB / QHD+ 240Hz)",
    slug: "alienware-m16-r2-rtx4070-240hz",
    sku: "AJ-LAP-AW-M16R2",
    categorySlug: "laptop-may-tinh",
    brandName: "Dell",
    regularPrice: 59990000,
    salePrice: 54990000,
    description: "Thiết kế phi thuyền vũ trụ tái thiết kế gọn gàng hơn 15%, chế độ Stealth Mode yên tĩnh tức thì cho môi trường giảng đường văn phòng.",
    content: "Alienware m16 R2 mang đến sự cân bằng lý tưởng giữa khả năng di động và sức mạnh thuần túy của dòng máy ngoài hành tinh. Đèn nền AlienFX 16.8 triệu màu tùy biến theo từng trận chiến kịch tính.",
    stock: 20,
    warrantyMonths: 24,
    originCountry: "Chính Hãng",
    images: [
      { url: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=1000&q=85", altText: "Alienware m16 R2", isPrimary: true },
    ],
    specifications: [
      { groupName: "Màn Hình", specKey: "Tần Số Quét", specValue: "16 inch QHD+ (2560 x 1600) 240Hz 3ms G-Sync ComfortView Plus" },
      { groupName: "Hiệu Năng", specKey: "Cấu Hình", specValue: "Intel Core Ultra 7 155H + NVIDIA RTX 4070 8GB GDDR6" },
    ],
  },
  {
    title: "Acer Predator Helios 18 (i9-14900HX / RTX 4080 / 32GB / 2TB / WQXGA 250Hz)",
    slug: "acer-predator-helios-18-rtx4080",
    sku: "AJ-LAP-AC-HEL18",
    categorySlug: "laptop-may-tinh",
    brandName: "ASUS",
    regularPrice: 72990000,
    salePrice: 67990000,
    description: "Quạt kim loại AeroBlade 3D thế hệ 5 độc quyền, keo tản nhiệt kim loại lỏng Liquid Metal và màn hình Mini-LED 250Hz siêu tốc.",
    content: "Cỗ máy săn mồi Predator Helios 18 với hệ thống đèn RGB phát sáng từng phím cơ mini-switch MagClick có thể hoán đổi nút bấm WASD chuyên nghiệp cho game thủ FPS.",
    stock: 16,
    warrantyMonths: 24,
    originCountry: "Chính Hãng",
    images: [
      { url: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1000&q=85", altText: "Acer Predator Helios 18", isPrimary: true },
    ],
    specifications: [
      { groupName: "Tản Nhiệt", specKey: "Công Nghệ", specValue: "Dual 5th Gen AeroBlade 3D Metal Fans + Keo kim loại lỏng" },
      { groupName: "Màn Hình", specKey: "Tấm Nền", specValue: "18 inch WQXGA (2560x1600) Mini-LED 250Hz 1000 nits HDR" },
    ],
  },
  {
    title: "ASUS Zenbook S 16 OLED (AMD Ryzen AI 9 HX 370 / 32GB / 1TB / Ceraluminum)",
    slug: "asus-zenbook-s-16-oled-ryzen-ai9",
    sku: "AJ-LAP-ASUS-ZS16",
    categorySlug: "laptop-may-tinh",
    brandName: "ASUS",
    regularPrice: 42990000,
    salePrice: 39990000,
    description: "Vật liệu gốm nhôm Ceraluminum độc quyền chống bám vân tay, độ mỏng khó tin chỉ 1.1cm và chip AI Ryzen 50 TOPS.",
    content: "Sự kết hợp chưa từng có giữa độ cứng của gốm và độ nhẹ của nhôm. Màn hình Lumina OLED 3K 120Hz tỷ lệ 16:10 rực rỡ và hệ thống âm thanh 6 loa mang lại trải nghiệm xem phim đỉnh cao.",
    stock: 28,
    warrantyMonths: 24,
    originCountry: "Chính Hãng VNA",
    images: [
      { url: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=1000&q=85", altText: "ASUS Zenbook S 16 OLED", isPrimary: true },
    ],
    specifications: [
      { groupName: "Vật Liệu", specKey: "Vỏ Máy", specValue: "Ceraluminum (Hợp chất gốm nhôm công nghệ cao siêu bền mỏng 1.1cm)" },
      { groupName: "Hiệu Năng", specKey: "Vi Xử Lý", specValue: "AMD Ryzen AI 9 HX 370 (12 nhân, 24 luồng, NPU AI 50 TOPS)" },
    ],
  },
  {
    title: "MacBook Air 15 inch M3 (16GB RAM / 512GB SSD) - Xanh Bóng Đêm Midnight",
    slug: "macbook-air-15-inch-m3-16gb-512gb",
    sku: "AJ-LAP-MBA15-M3",
    categorySlug: "laptop-may-tinh",
    brandName: "Apple",
    regularPrice: 37990000,
    salePrice: 34990000,
    description: "Màn hình lớn 15.3 inch trong thân máy không quạt hoàn toàn yên tĩnh, pin 18 giờ và lớp mạ chống bám vân tay mới.",
    content: "MacBook Air 15 inch M3 mang đến không gian làm việc rộng rãi cho những người thường xuyên di chuyển. Hỗ trợ xuất đồng thời 2 màn hình ngoài khi gập máy và chip M3 hỗ trợ đồ họa đổ bóng lưới Dynamic Caching.",
    stock: 45,
    warrantyMonths: 12,
    originCountry: "Chính Hãng VNA",
    images: [
      { url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=85", altText: "MacBook Air 15 M3", isPrimary: true },
    ],
    specifications: [
      { groupName: "Hiệu Năng", specKey: "Chipset", specValue: "Apple M3 (8-core CPU, 10-core GPU, Ray Tracing phần cứng)" },
      { groupName: "Màn Hình", specKey: "Liquid Retina", specValue: "15.3 inch 2880 x 1864 500 nits True Tone" },
    ],
  },
  {
    title: "Dell Alienware x14 R2 Siêu Gọn Nhẹ (i7-13620H / RTX 4060 / 16GB / 1TB)",
    slug: "dell-alienware-x14-r2-rtx4060",
    sku: "AJ-LAP-AW-X14R2",
    categorySlug: "laptop-may-tinh",
    brandName: "Dell",
    regularPrice: 46990000,
    salePrice: 42990000,
    description: "Laptop gaming 14 inch mỏng nhất của Alienware chỉ 14.5mm, sạc nhanh Type-C 130W và bản lề rãnh đôi cấp bằng sáng chế.",
    content: "Được thiết kế để bạn mang theo sức mạnh gaming đến bất kỳ quán cà phê hay chuyến công tác nào. Màn hình QHD+ 165Hz màu chuẩn 100% DCI-P3 đáp ứng cả đồ họa lẫn game hành động nhịp độ cao.",
    stock: 20,
    warrantyMonths: 24,
    originCountry: "Chính Hãng",
    images: [
      { url: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1000&q=85", altText: "Alienware x14 R2", isPrimary: true },
    ],
    specifications: [
      { groupName: "Kích Thước", specKey: "Độ Mỏng & Trọng Lượng", specValue: "Chỉ dày 14.5mm, nặng 1.91kg" },
      { groupName: "Đồ Họa", specKey: "GPU Rời", specValue: "NVIDIA GeForce RTX 4060 8GB GDDR6" },
    ],
  },
  {
    title: "Framework Laptop 16 Nâng Cấp Mô-đun (Ryzen 7 7840HS / RX 7700S / 32GB / 1TB)",
    slug: "framework-laptop-16-modular",
    sku: "AJ-LAP-FRM-16",
    categorySlug: "laptop-may-tinh",
    brandName: "Lenovo",
    regularPrice: 52990000,
    salePrice: 49990000,
    description: "Cuộc cách mạng laptop mô-đun tháo lắp tự do: thay thế card màn hình, cổng kết nối, bàn phím và bàn phím số chỉ trong 30 giây.",
    content: "Chiếc laptop nói không với sự lỗi thời. Framework 16 cho phép người dùng tự do nâng cấp GPU qua cổng Expansion Bay, tự chọn 6 cổng kết nối USB-C/HDMI/DisplayPort theo ý muốn mà không cần adapter rời.",
    stock: 15,
    warrantyMonths: 24,
    originCountry: "Chính Hãng",
    images: [
      { url: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=1000&q=85", altText: "Framework Laptop 16", isPrimary: true },
    ],
    specifications: [
      { groupName: "Khả Năng Nâng Cấp", specKey: "Mô-đun", specValue: "Hỗ trợ thay thế Mainboard, GPU Bay, 6 Expansion Cards độc lập" },
      { groupName: "Màn Hình", specKey: "Tấm Nền", specValue: "16 inch 2560x1600 165Hz 100% DCI-P3 500 nits" },
    ],
  },
  {
    title: "LG Gram 17 2024 Siêu Nhẹ 1.35kg (Core Ultra 7 / 32GB / 1TB / WQXGA IPS)",
    slug: "lg-gram-17-2024-sieu-nhe-1tb",
    sku: "AJ-LAP-LG-GR17",
    categorySlug: "laptop-may-tinh",
    brandName: "LG",
    regularPrice: 42990000,
    salePrice: 38990000,
    description: "Kỷ lục laptop 17 inch nhẹ nhất thế giới chỉ 1.35kg, pin khủng 77Wh hoạt động 20 giờ và tính năng chia sẻ LG gram Link.",
    content: "Màn hình 17 inch khổng lồ nhưng mang vác nhẹ như một cuốn sổ tay. Vỏ hợp kim Magie chuẩn quân đội MIL-STD 810H giúp LG Gram 17 bền bỉ trước mọi va đập thường ngày.",
    stock: 25,
    warrantyMonths: 12,
    originCountry: "Chính Hãng VNA",
    images: [
      { url: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1000&q=85", altText: "LG Gram 17 2024", isPrimary: true },
    ],
    specifications: [
      { groupName: "Trọng Lượng", specKey: "Cân Nặng Thân Máy", specValue: "Chỉ 1.35kg cho kích thước màn hình 17 inch" },
      { groupName: "Màn Hình", specKey: "Độ Phân Giải", specValue: "17 inch WQXGA (2560 x 1600) IPS chống chói 99% DCI-P3" },
    ],
  },
  {
    title: "Lenovo Legion 9i Flagship Tản Nhiệt Nước Tích Hợp (i9-14900HX / RTX 4090 / 64GB)",
    slug: "lenovo-legion-9i-liquid-cooled-rtx4090",
    sku: "AJ-LAP-LNV-LEG9I",
    categorySlug: "laptop-may-tinh",
    brandName: "Lenovo",
    regularPrice: 129990000,
    salePrice: 119990000,
    description: "Hệ thống tản nhiệt nước Legion Coldfront Liquid Loop tự động kích hoạt ở 84°C, vỏ carbon rèn Forged Carbon hoa văn độc bản.",
    content: "Không có hai chiếc Legion 9i nào có mặt lưng giống hệt nhau nhờ quy trình ép carbon rèn ngẫu nhiên độc quyền. Màn hình Mini-LED 3.2K 165Hz chuẩn màu X-Rite Pantone mang lại trải nghiệm thị giác không tì vết.",
    stock: 8,
    warrantyMonths: 36,
    originCountry: "Chính Hãng VNA",
    images: [
      { url: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=1000&q=85", altText: "Lenovo Legion 9i", isPrimary: true },
    ],
    specifications: [
      { groupName: "Tản Nhiệt", specKey: "Liquid Cooling", specValue: "Hệ thống làm mát bằng chất lỏng tích hợp đầu tiên thế giới" },
      { groupName: "Đồ Họa", specKey: "GPU", specValue: "NVIDIA GeForce RTX 4090 16GB GDDR6 TGP 175W" },
    ],
  },
  {
    title: "HP Omen Transcend 14 OLED (Core Ultra 9 / RTX 4070 / 32GB / 1TB / Siêu Nhẹ 1.63kg)",
    slug: "hp-omen-transcend-14-oled-rtx4070",
    sku: "AJ-LAP-HP-OMEN14",
    categorySlug: "laptop-may-tinh",
    brandName: "Dell",
    regularPrice: 51990000,
    salePrice: 47990000,
    description: "Laptop gaming 14 inch nhẹ nhất của HP với màn hình 2.8K OLED IMAX Enhanced và bàn phím pudding không viền trong suốt rực rỡ.",
    content: "Sự kết hợp hoàn mỹ cho những ai vừa làm việc sáng tạo ban ngày, vừa chiến game đồ họa đỉnh cao ban đêm. Loa được tinh chỉnh bởi HyperX mang đến âm trường sống động trong từng bước chân game.",
    stock: 20,
    warrantyMonths: 24,
    originCountry: "Chính Hãng",
    images: [
      { url: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=1000&q=85", altText: "HP Omen Transcend 14", isPrimary: true },
    ],
    specifications: [
      { groupName: "Màn Hình", specKey: "IMAX Enhanced", specValue: "14 inch 2.8K (2880 x 1800) OLED 120Hz 0.2ms 500 nits" },
      { groupName: "Trọng Lượng", specKey: "Cân Nặng", specValue: "1.637kg vỏ nhôm nguyên khối" },
    ],
  },
  {
    title: "ASUS ProArt P16 Chuyên Đồ Họa 4K OLED (Ryzen AI 9 HX 370 / RTX 4070 / 64GB / 2TB)",
    slug: "asus-proart-p16-creator-4k-oled",
    sku: "AJ-LAP-ASUS-PA16",
    categorySlug: "laptop-may-tinh",
    brandName: "ASUS",
    regularPrice: 79990000,
    salePrice: 74990000,
    description: "Núm xoay vật lý ảo ASUS DialPad độc quyền tối ưu Adobe Premiere / Photoshop, màn hình cảm ứng 4K Lumina OLED sắc nét.",
    content: "Dành riêng cho các đạo diễn hình ảnh, họa sĩ VFX và nhiếp ảnh gia thương mại. Phần mềm ProArt Creator Hub tích hợp sẵn công cụ quản lý màu sắc Calman Verified và AI MuseTree phác thảo ý tưởng tốc độ cao.",
    stock: 14,
    warrantyMonths: 24,
    originCountry: "Chính Hãng VNA",
    images: [
      { url: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1000&q=85", altText: "ASUS ProArt P16", isPrimary: true },
    ],
    specifications: [
      { groupName: "Màn Hình", specKey: "Chuẩn Màu", specValue: "16 inch 4K (3840 x 2400) OLED Touch 100% DCI-P3 Delta E < 1" },
      { groupName: "Điều Khiển", specKey: "DialPad", specValue: "Núm xoay cảm ứng tích hợp trên Touchpad điều khiển dòng thời gian timeline" },
    ],
  },

  // =========================================================================
  // 3. ÂM THANH & HI-END (20 SẢN PHẨM - TAI NGHE & LOA)
  // =========================================================================
  {
    title: "Tai Nghe Chống Ồn Sennheiser Momentum 4 Wireless - Đen Nhám Đồng Copper",
    slug: "sennheiser-momentum-4-wireless-copper",
    sku: "AJ-AUD-SEN-M4W",
    categorySlug: "am-thanh-hi-end",
    brandName: "Sennheiser",
    regularPrice: 9490000,
    salePrice: 7990000,
    description: "Thời lượng pin vô địch phân khúc lên đến 60 giờ liên tục, driver 42mm audiophile và chất âm chuẩn Đức chi tiết mộc mạc.",
    content: "Momentum 4 Wireless đưa trải nghiệm nghe nhạc cá nhân lên tầm cao mới với công nghệ chống ồn thích ứng Adaptive ANC tự động điều chỉnh theo môi trường và tính năng Sound Personalization cá nhân hóa thính lực.",
    stock: 50,
    warrantyMonths: 24,
    originCountry: "Chính Hãng VNA",
    images: [
      { url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=85", altText: "Sennheiser Momentum 4", isPrimary: true },
    ],
    specifications: [
      { groupName: "Pin", specKey: "Thời Lượng Pin", specValue: "60 giờ bật ANC liên tục (Sạc nhanh 10 phút nghe 6 giờ)" },
      { groupName: "Driver", specKey: "Màng Loa", specValue: "42mm Transducer chuẩn tham chiếu Sennheiser" },
    ],
  },
  {
    title: "Tai Nghe Bose QuietComfort Ultra Headphones - Trắng Khói White Smoke",
    slug: "bose-quietcomfort-ultra-white-smoke",
    sku: "AJ-AUD-BOSE-QCU",
    categorySlug: "am-thanh-hi-end",
    brandName: "Bose",
    regularPrice: 10990000,
    salePrice: 9490000,
    description: "Đỉnh cao chống ồn thế giới với công nghệ âm thanh không gian Bose Immersive Audio và đệm tai da siêu êm ái.",
    content: "Công nghệ CustomTune tự động phân tích cấu trúc vòm tai của từng người dùng bằng sóng âm để tối ưu hóa khả năng khử ồn và chất âm ở mức độ chuẩn xác nhất.",
    stock: 45,
    warrantyMonths: 12,
    originCountry: "Chính Hãng VNA",
    images: [
      { url: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1000&q=85", altText: "Bose QC Ultra", isPrimary: true },
    ],
    specifications: [
      { groupName: "Âm Thanh Không Gian", specKey: "Công Nghệ", specValue: "Bose Immersive Audio theo dõi chuyển động đầu Motion Tracking" },
      { groupName: "Khử Ồn", specKey: "Hệ Thống", specValue: "Active Noise Cancelling thế hệ mới nhất với chế độ Aware Mode" },
    ],
  },
  {
    title: "Apple AirPods Max (Cổng Sạc USB-C 2024) - Xanh Đậm Midnight",
    slug: "apple-airpods-max-usb-c-midnight",
    sku: "AJ-AUD-APL-APM2",
    categorySlug: "am-thanh-hi-end",
    brandName: "Apple",
    regularPrice: 13990000,
    salePrice: 12790000,
    description: "Khung nhôm Anodized sang trọng, đệm đầu lưới thoáng khí Canopy và cổng sạc USB-C hiện đại đồng bộ hệ sinh thái Apple.",
    content: "AirPods Max kết hợp âm thanh trung thực cao cùng chip Apple H1 trên mỗi chụp tai để mang lại trải nghiệm nghe đột phá với Âm Thanh Không Gian Cá Nhân Hóa (Personalized Spatial Audio).",
    stock: 40,
    warrantyMonths: 12,
    originCountry: "Chính Hãng VNA",
    images: [
      { url: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1000&q=85", altText: "AirPods Max USB-C", isPrimary: true },
    ],
    specifications: [
      { groupName: "Vật Liệu", specKey: "Vỏ Chụp Tai", specValue: "Nhôm Anodized nguyên khối + Quai thép không gỉ" },
      { groupName: "Cổng Kết Nối", specKey: "Sạc & Dữ Liệu", specValue: "USB-C hỗ trợ sạc nhanh và truyền âm thanh lossless" },
    ],
  },
  {
    title: "Tai Nghe Hi-End Bowers & Wilkins Px8 - Da Nappa Nâu Castanea Sang Trọng",
    slug: "bowers-wilkins-px8-castanea-brown",
    sku: "AJ-AUD-BW-PX8",
    categorySlug: "am-thanh-hi-end",
    brandName: "Bose",
    regularPrice: 18990000,
    salePrice: 16990000,
    description: "Màng loa Carbon Cone góc nghiêng 40mm lấy cảm hứng từ dòng loa 700 Series đầu bảng, bọc da Nappa thủ công hoàn mỹ.",
    content: "Được giới audiophile thế giới tôn vinh là chuẩn mực tai nghe không dây xa xỉ. Cánh tay đệm bằng nhôm đúc sáng bóng cùng chất âm trong trẻo, sân khấu âm thanh mở rộng đầy mê hoặc.",
    stock: 20,
    warrantyMonths: 24,
    originCountry: "Chính Hãng",
    images: [
      { url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=85", altText: "Bowers & Wilkins Px8", isPrimary: true },
    ],
    specifications: [
      { groupName: "Driver", specKey: "Củ Loa", specValue: "40mm Carbon Cone toàn dải độ méo tiếng siêu thấp" },
      { groupName: "Vật Liệu", specKey: "Chất Liệu Da", specValue: "Da Nappa cao cấp bọc đệm tai và quai đeo đầu" },
    ],
  },
  {
    title: "Bang & Olufsen Beoplay H95 95th Anniversary - Vàng Bắc Âu Nordic Gold",
    slug: "bang-olufsen-beoplay-h95-nordic-gold",
    sku: "AJ-AUD-BO-H95",
    categorySlug: "am-thanh-hi-end",
    brandName: "Bose",
    regularPrice: 28990000,
    salePrice: 25990000,
    description: "Phiên bản kỷ niệm 95 năm B&O với núm xoay cơ học cảm ứng nhôm phay xước, củ loa Titanium 40mm và hộp nhôm vali bảo vệ.",
    content: "Tuyệt tác chế tác đỉnh cao từ Đan Mạch. Hệ thống khử ồn chủ động thích ứng xoay chuyển bằng vòng nhôm vật lý xoay quanh chụp tai mang lại cảm giác cơ học xúc giác tinh tế bậc nhất.",
    stock: 12,
    warrantyMonths: 36,
    originCountry: "Chính Hãng",
    images: [
      { url: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1000&q=85", altText: "B&O Beoplay H95", isPrimary: true },
    ],
    specifications: [
      { groupName: "Củ Loa", specKey: "Vật Liệu Màng", specValue: "Titanium Electro-dynamic 40mm nam châm Neodymium" },
      { groupName: "Thời Lượng Pin", specKey: "Thời Gian Chơi Nhạc", specValue: "38 giờ bật ANC / 50 giờ tắt ANC" },
    ],
  },
  {
    title: "Tai Nghe Sony WF-1000XM5 True Wireless - Đen Nhám Tinh Tế",
    slug: "sony-wf-1000xm5-true-wireless-black",
    sku: "AJ-AUD-SON-WF5",
    categorySlug: "am-thanh-hi-end",
    brandName: "Sony",
    regularPrice: 6990000,
    salePrice: 5690000,
    description: "Kích thước gọn nhẹ hơn 25%, bộ xử lý V2 & QN2e kép và màng loa Dynamic Driver X tái tạo âm trầm sâu thẳm.",
    content: "Tai nghe in-ear khử ồn tốt nhất hiện nay. Tích hợp cảm biến dẫn truyền qua xương thu âm giọng nói trong trẻo giữa đám đông ồn ào và hỗ trợ codec LDAC truyền tải nhạc Hi-Res không dây.",
    stock: 65,
    warrantyMonths: 12,
    originCountry: "Chính Hãng VNA",
    images: [
      { url: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1000&q=85", altText: "Sony WF-1000XM5", isPrimary: true },
    ],
    specifications: [
      { groupName: "Bộ Xử Lý", specKey: "Chip Kép", specValue: "Sony HD QN2e + Integrated Processor V2" },
      { groupName: "Đàm Thoại", specKey: "Microphone", specValue: "3 micro mỗi bên + Cảm biến dẫn truyền xương Bone Conduction" },
    ],
  },
  {
    title: "Loa Bluetooth Marshall Stanmore III - Nâu Cổ Điển Vintage Brown",
    slug: "marshall-stanmore-iii-vintage-brown",
    sku: "AJ-AUD-MAR-ST3",
    categorySlug: "am-thanh-hi-end",
    brandName: "Marshall",
    regularPrice: 9990000,
    salePrice: 8690000,
    description: "Thiết kế rock-n-roll biểu tượng với cụm núm xoay kim loại đồng thau, công nghệ âm trường rộng hơn Placement Compensation.",
    content: "Stanmore III là tâm điểm âm thanh trong mọi căn phòng khách hiện đại. Trang bị củ loa trầm 50W và hai loa tweeter 15W với ống dẫn sóng góc nghiêng mang lại âm trường sống động bao trùm không gian.",
    stock: 40,
    warrantyMonths: 12,
    originCountry: "Chính Hãng VNA",
    images: [
      { url: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1000&q=85", altText: "Marshall Stanmore III", isPrimary: true },
    ],
    specifications: [
      { groupName: "Công Suất", specKey: "Tổng Công Suất", specValue: "80W Class D (1x 50W Woofer + 2x 15W Tweeter)" },
      { groupName: "Kết Nối", specKey: "Cổng Vào", specValue: "Bluetooth 5.2 LE Audio, AUX 3.5mm, RCA hoa sen" },
    ],
  },
  {
    title: "Loa Marshall Woburn III Công Suất Lớn 150W - Đen Huyền Bí Black",
    slug: "marshall-woburn-iii-black-150w",
    sku: "AJ-AUD-MAR-WB3",
    categorySlug: "am-thanh-hi-end",
    brandName: "Marshall",
    regularPrice: 17990000,
    salePrice: 15490000,
    description: "Cỗ máy âm thanh uy lực nhất của Marshall với cổng HDMI ARC kết nối trực tiếp TV và âm trầm rung chuyển mặt sàn.",
    content: "Với hệ thống củ loa 3 đường tiếng hoàn toàn mới bao gồm củ loa woofer 90W uy lực và dải trung riêng biệt. Woburn III đem lại trải nghiệm xem phim bom tấn và nghe nhạc acoustic sống động như đang ở rạp.",
    stock: 25,
    warrantyMonths: 12,
    originCountry: "Chính Hãng VNA",
    images: [
      { url: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1000&q=85", altText: "Marshall Woburn III", isPrimary: true },
    ],
    specifications: [
      { groupName: "Công Suất", specKey: "Tổng Công Suất", specValue: "150W Class D cực đại" },
      { groupName: "Cổng Kết Nối", specKey: "HDMI ARC", specValue: "Cổng HDMI ARC kết nối TV, Bluetooth 5.2, Cổng RCA, Cổng 3.5mm" },
    ],
  },
  {
    title: "Loa Hi-End Devialet Phantom I 108dB Opéra de Paris - Vàng Lá 22K",
    slug: "devialet-phantom-i-108db-opera-paris",
    sku: "AJ-AUD-DEV-OPERA",
    categorySlug: "am-thanh-hi-end",
    brandName: "Bose",
    regularPrice: 119990000,
    salePrice: 109990000,
    description: "Tuyệt tác âm thanh nước Pháp với ốp vàng lá 22K mạ thủ công bởi các nghệ nhân Ateliers Gohard, công suất khủng 1100W RMS.",
    content: "Kỳ quan âm học thế giới với dải tần mở rộng kinh ngạc từ 14Hz đến 27kHz. Tái hiện từng rung động nhỏ nhất của tiếng đàn cello và dàn nhạc giao hưởng với độ méo tiếng gần như bằng 0 tuyệt đối.",
    stock: 5,
    warrantyMonths: 36,
    originCountry: "Chính Hãng",
    images: [
      { url: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1000&q=85", altText: "Devialet Phantom I", isPrimary: true },
    ],
    specifications: [
      { groupName: "Âm Lượng & Công Suất", specKey: "SPL & RMS", specValue: "108 dB SPL ở 1 mét, 1100 Watts RMS" },
      { groupName: "Dải Tần", specKey: "Tần Số", specValue: "14Hz - 27kHz (Âm trầm sâu hơn cả ngưỡng tai người nghe)" },
    ],
  },
  {
    title: "Loa Di Động JBL Boombox 3 Wi-Fi - Hỗ Trợ Âm Thanh Vòm Dolby Atmos",
    slug: "jbl-boombox-3-wi-fi-dolby-atmos",
    sku: "AJ-AUD-JBL-BB3WF",
    categorySlug: "am-thanh-hi-end",
    brandName: "JBL",
    regularPrice: 14990000,
    salePrice: 12990000,
    description: "Nâng cấp truyền phát qua Wi-Fi chất lượng cao HD 24bit/96kHz, hỗ trợ Dolby Atmos 3D và chuẩn kháng nước bụi IP67.",
    content: "Thoải mái nhận cuộc gọi trên điện thoại mà không hề ngắt quãng bản nhạc đang phát nhờ kết nối Wi-Fi độc lập. Tay cầm kim loại bọc silicon chống trượt chắc chắn cho những chuyến dã ngoại biển cuồng nhiệt.",
    stock: 35,
    warrantyMonths: 12,
    originCountry: "Chính Hãng VNA",
    images: [
      { url: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1000&q=85", altText: "JBL Boombox 3 Wi-Fi", isPrimary: true },
    ],
    specifications: [
      { groupName: "Kết Nối", specKey: "Wi-Fi & Bluetooth", specValue: "Wi-Fi 6, Apple AirPlay, Chromecast built-in, Spotify Connect" },
      { groupName: "Pin", specKey: "Thời Gian Hoạt Động", specValue: "24 giờ chơi nhạc + Cổng USB sạc ngược điện thoại" },
    ],
  },
  {
    title: "Loa Harman Kardon Aura Studio 4 - Ánh Sáng Pha Lê Kim Cương Huyền Ảo",
    slug: "harman-kardon-aura-studio-4",
    sku: "AJ-AUD-HK-AURA4",
    categorySlug: "am-thanh-hi-end",
    brandName: "JBL",
    regularPrice: 7490000,
    salePrice: 6290000,
    description: "Vòm kính pha lê trong suốt với 324 viên pha lê đa giác phản chiếu 5 chủ đề ánh sáng thiên nhiên độc đáo, subwoofer 130W.",
    content: "Aura Studio 4 biến không gian phòng ngủ và phòng khách thành một tác phẩm nghệ thuật ánh sáng thị giác. Âm thanh đa hướng 360 độ lấp đầy gian phòng với dải trầm sâu lắng đầy cảm xúc.",
    stock: 45,
    warrantyMonths: 12,
    originCountry: "Chính Hãng VNA",
    images: [
      { url: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1000&q=85", altText: "Harman Kardon Aura Studio 4", isPrimary: true },
    ],
    specifications: [
      { groupName: "Ánh Sáng", specKey: "Hiệu Ứng LED", specValue: "324 viên pha lê phản chiếu 5 chủ đề ánh sáng theo nhịp nhạc" },
      { groupName: "Củ Loa", specKey: "Hệ Thống Loa", specValue: "6 củ loa mid-high 40mm + 1 củ loa subwoofer 132mm" },
    ],
  },
  {
    title: "Loa Di Động Bose SoundLink Max Portable Speaker - Đen Sang Trọng",
    slug: "bose-soundlink-max-portable-black",
    sku: "AJ-AUD-BOSE-SLMAX",
    categorySlug: "am-thanh-hi-end",
    brandName: "Bose",
    regularPrice: 11990000,
    salePrice: 10490000,
    description: "Quai xách dây leo núi thời trang có thể tháo rời, âm trầm uy lực sâu lắng vượt xa kích thước và chuẩn kháng nước IP67 nổi trên mặt nước.",
    content: "Được thiết kế để tạo nên bữa tiệc âm nhạc bùng nổ ở bất kỳ nơi đâu. Thân loa bọc silicone chống va đập và trầy xước, tích hợp công nghệ Snapdragon Sound truyền tải âm thanh không độ trễ.",
    stock: 30,
    warrantyMonths: 12,
    originCountry: "Chính Hãng VNA",
    images: [
      { url: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1000&q=85", altText: "Bose SoundLink Max", isPrimary: true },
    ],
    specifications: [
      { groupName: "Pin & Sạc", specKey: "Thời Lượng Pin", specValue: "20 giờ liên tục, cổng USB-C sạc 2 chiều" },
      { groupName: "Độ Bền", specKey: "Kháng Nước", specValue: "IP67 chống bụi, chống nước và nổi được trên mặt nước" },
    ],
  },
  {
    title: "Loa Thông Minh Sonos Move 2 - Trắng Kháng Nước Pin 24 Giờ",
    slug: "sonos-move-2-smart-speaker-white",
    sku: "AJ-AUD-SON-MOV2",
    categorySlug: "am-thanh-hi-end",
    brandName: "Bose",
    regularPrice: 12990000,
    salePrice: 11490000,
    description: "Hệ thống âm thanh nổi stereo kép trong một loa di động duy nhất, tự động cân chỉnh âm học phòng Trueplay thông minh.",
    content: "Sonos Move 2 chuyển đổi mượt mà giữa Wi-Fi tại nhà và Bluetooth khi ra ngoài. Hỗ trợ điều khiển bằng giọng nói, kết nối đa phòng Multi-room và tích hợp đế sạc không dây tiếp điểm rời Wireless Charging Base.",
    stock: 25,
    warrantyMonths: 12,
    originCountry: "Chính Hãng",
    images: [
      { url: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1000&q=85", altText: "Sonos Move 2", isPrimary: true },
    ],
    specifications: [
      { groupName: "Cấu Trúc Âm Thanh", specKey: "Củ Loa", specValue: "2 loa tweeter góc nghiêng cho âm thanh stereo + 1 loa woofer trung trầm" },
      { groupName: "Công Nghệ", specKey: "Trueplay Tuning", specValue: "Tự động lắng nghe và tối ưu âm thanh theo diện tích phòng" },
    ],
  },
  {
    title: "Tai Nghe Apple AirPods Pro 2 (Hộp Sạc USB-C MagSafe) - Trắng",
    slug: "apple-airpods-pro-2-usb-c",
    sku: "AJ-AUD-APL-APP2C",
    categorySlug: "am-thanh-hi-end",
    brandName: "Apple",
    regularPrice: 6190000,
    salePrice: 5190000,
    description: "Chip Apple H2 khử ồn gấp 2 lần, tính năng Adaptive Audio thông minh và chế độ Kiểm Tra Thính Lực chuẩn y tế Hearing Health.",
    content: "Tai nghe in-ear hoàn hảo nhất cho người dùng iPhone và Mac. Hộp sạc tích hợp loa tìm kiếm Find My với chip định vị chính xác U1 và chuẩn kháng nước bụi IP54 trên cả tai nghe và hộp.",
    stock: 80,
    warrantyMonths: 12,
    originCountry: "Chính Hãng VNA",
    images: [
      { url: "https://images.unsplash.com/photo-1588423771073-b8903fbb85b5?auto=format&fit=crop&w=1000&q=85", altText: "AirPods Pro 2 USB-C", isPrimary: true },
    ],
    specifications: [
      { groupName: "Vi Xử Lý", specKey: "Chipset", specValue: "Apple H2 headphone chip + Apple U1 trong hộp sạc" },
      { groupName: "Chống Ồn", specKey: "Khử Ồn & Xuyên Âm", specValue: "Active Noise Cancellation gấp đôi + Âm thanh thích ứng Adaptive Audio" },
    ],
  },
  {
    title: "Tai Nghe Hi-Fi Không Dây Focal Bathys - Xanh Đen Deep Black",
    slug: "focal-bathys-hi-fi-wireless",
    sku: "AJ-AUD-FOC-BATH",
    categorySlug: "am-thanh-hi-end",
    brandName: "Sennheiser",
    regularPrice: 21990000,
    salePrice: 19490000,
    description: "Sản xuất thủ công tại Pháp với màng loa Nhôm-Magie chữ M độc quyền và bộ giải mã USB-DAC 24-bit/192kHz tích hợp sẵn.",
    content: "Focal Bathys đem chất âm của những bộ dàn âm thanh gia đình đắt đỏ vào trong một chiếc tai nghe không dây di động. Logo ngọn lửa Focal trên chụp tai có thể phát sáng dịu nhẹ đầy nghệ thuật.",
    stock: 18,
    warrantyMonths: 24,
    originCountry: "Chính Hãng",
    images: [
      { url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=85", altText: "Focal Bathys", isPrimary: true },
    ],
    specifications: [
      { groupName: "Màng Loa", specKey: "Driver Chế Tác", specValue: "40mm M-shaped Aluminium/Magnesium dome chế tác tại Pháp" },
      { groupName: "Chế Độ DAC", specKey: "USB-DAC", specValue: "Chế độ cắm dây USB-C giải mã nhạc số 24-bit / 192kHz" },
    ],
  },
  {
    title: "Tai Nghe Shure AONIC 50 Gen 2 - Đen Studio Master",
    slug: "shure-aonic-50-gen-2-black",
    sku: "AJ-AUD-SHU-A50G2",
    categorySlug: "am-thanh-hi-end",
    brandName: "Sennheiser",
    regularPrice: 10490000,
    salePrice: 8990000,
    description: "Thời lượng pin 45 giờ, công nghệ âm thanh không gian Shure Spatializer 3 chế độ (Cinema, Music, Podcast) và chip âm thanh Snapdragon Sound.",
    content: "Kế thừa gần 100 năm di sản âm thanh phòng thu Shure. Khả năng khử ồn Hybrid ANC có thể điều chỉnh 4 cấp độ và hỗ trợ các codec cao cấp nhất bao gồm LDAC, aptX HD và aptX Adaptive.",
    stock: 25,
    warrantyMonths: 24,
    originCountry: "Chính Hãng",
    images: [
      { url: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1000&q=85", altText: "Shure AONIC 50 Gen 2", isPrimary: true },
    ],
    specifications: [
      { groupName: "Pin", specKey: "Thời Lượng Pin", specValue: "45 giờ chơi nhạc liên tục (gấp đôi thế hệ Gen 1)" },
      { groupName: "Codec", specKey: "Âm Thanh Hỗ Trợ", specValue: "Qualcomm aptX Adaptive, aptX HD, Sony LDAC, AAC, SBC" },
    ],
  },
  {
    title: "Loa Di Động B&O Beosound A1 2nd Gen - Nhôm Vàng Mật Ong Honey Tone",
    slug: "bang-olufsen-beosound-a1-2nd-gen",
    sku: "AJ-AUD-BO-A1G2",
    categorySlug: "am-thanh-hi-end",
    brandName: "Bose",
    regularPrice: 8490000,
    salePrice: 7190000,
    description: "Loa đĩa bay nhôm Anodized chống nước hoàn toàn IP67, tích hợp trợ lý ảo Amazon Alexa và dây đeo da thật chống mòn.",
    content: "Được nhào nặn bởi nhà thiết kế trứ danh Cecilie Manz. Màng loa vòm nhôm 3.5 inch với công suất đỉnh 2x 140W mang lại âm trường 360 độ trong trẻo và âm bass đầm ấm bất ngờ.",
    stock: 35,
    warrantyMonths: 24,
    originCountry: "Chính Hãng",
    images: [
      { url: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1000&q=85", altText: "B&O Beosound A1", isPrimary: true },
    ],
    specifications: [
      { groupName: "Độ Bền", specKey: "Chống Nước Bụi", specValue: "IP67 chịu ngâm nước 1 mét trong 30 phút" },
      { groupName: "Đàm Thoại", specKey: "Hệ Thống Micro", specValue: "3 microphone thu âm đa hướng 360 độ phục vụ họp trực tuyến" },
    ],
  },
  {
    title: "Loa Bluetooth Marshall Emberton II - Đen Viền Đồng Đỏ Black & Brass",
    slug: "marshall-emberton-ii-black-brass",
    sku: "AJ-AUD-MAR-EMB2",
    categorySlug: "am-thanh-hi-end",
    brandName: "Marshall",
    regularPrice: 4990000,
    salePrice: 3990000,
    description: "Kích thước bỏ túi gọn gàng, thời lượng pin 30 giờ, chế độ Stack Mode ghép nối nhiều loa cùng lúc và chuẩn kháng nước IP67.",
    content: "Emberton II sử dụng công nghệ âm thanh đa hướng True Stereophonic độc quyền của Marshall, giúp trải nghiệm âm thanh 360 độ đồng đều tại mọi vị trí xung quanh loa.",
    stock: 60,
    warrantyMonths: 12,
    originCountry: "Chính Hãng VNA",
    images: [
      { url: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1000&q=85", altText: "Marshall Emberton II", isPrimary: true },
    ],
    specifications: [
      { groupName: "Pin & Sạc", specKey: "Thời Gian Sử Dụng", specValue: "30+ giờ chơi nhạc (Sạc 20 phút nghe 4 giờ)" },
      { groupName: "Âm Thanh", specKey: "Công Nghệ", specValue: "True Stereophonic đa hướng 360 độ độc quyền Marshall" },
    ],
  },
  {
    title: "Loa Tiệc Tùng JBL PartyBox Stage 320 - Công Suất 240W Kèm Đèn LED Vũ Trường",
    slug: "jbl-partybox-stage-320-240w",
    sku: "AJ-AUD-JBL-PB320",
    categorySlug: "am-thanh-hi-end",
    brandName: "JBL",
    regularPrice: 17990000,
    salePrice: 15490000,
    description: "Cỗ máy tiệc tùng di động với tay kéo vali tiện lợi, bánh xe lớn êm ái, pin rời có thể thay thế và cổng cắm micro/guitar kép.",
    content: "Khuấy động mọi không gian sự kiện ngoài trời với âm thanh JBL Pro Sound công suất thực 240W uy lực. Đèn LED ma trận ánh sao đồng bộ theo từng nhịp bass sôi động của bản nhạc.",
    stock: 20,
    warrantyMonths: 12,
    originCountry: "Chính Hãng VNA",
    images: [
      { url: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1000&q=85", altText: "JBL PartyBox Stage 320", isPrimary: true },
    ],
    specifications: [
      { groupName: "Công Suất", specKey: "Output Power", specValue: "240W RMS (2x củ loa trầm 6.5 inch + 2x củ loa cao 1 inch)" },
      { groupName: "Cổng Mở Rộng", specKey: "Micro & Nhạc Cụ", specValue: "Cổng cắm Mic và Guitar độc lập với nút chỉnh âm lượng riêng biệt" },
    ],
  },
  {
    title: "Tai Nghe Tham Chiếu Mở Sennheiser HD 660S2 (300 Ohm Audiophile)",
    slug: "sennheiser-hd-660s2-audiophile",
    sku: "AJ-AUD-SEN-HD660",
    categorySlug: "am-thanh-hi-end",
    brandName: "Sennheiser",
    regularPrice: 15990000,
    salePrice: 13990000,
    description: "Huyền thoại audiophile thiết kế mở Open-back, dải trầm mở rộng xuống 70Hz sâu sắc và cuộn dây âm thanh nhôm siêu nhẹ sản xuất tại Ireland.",
    content: "Được các kỹ sư âm thanh chuyên nghiệp trên toàn cầu tin dùng. Cung cấp độ chi tiết không gian rộng mở và độ chính xác đến từng hơi thở ca sĩ, đi kèm dây cáp cân bằng Balanced 4.4mm Pentaconn.",
    stock: 15,
    warrantyMonths: 24,
    originCountry: "Chính Hãng",
    images: [
      { url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=85", altText: "Sennheiser HD 660S2", isPrimary: true },
    ],
    specifications: [
      { groupName: "Trở Kháng", specKey: "Impedance", specValue: "300 Ohms (Khuyến nghị phối ghép cùng Headphone DAC/AMP chuyên dụng)" },
      { groupName: "Dải Tần", specKey: "Frequency Response", specValue: "8 Hz - 41.500 Hz chuẩn Hi-Res Audio chứng nhận" },
    ],
  },

  // =========================================================================
  // 4. ĐỒNG HỒ & SMARTWATCH (10 SẢN PHẨM)
  // =========================================================================
  {
    title: "Apple Watch Ultra 2 (Khung Titan Đen 49mm / Dây Quấn Milanese Titan)",
    slug: "apple-watch-ultra-2-black-titanium",
    sku: "AJ-WAT-APL-UW2BLK",
    categorySlug: "dong-ho-smartwatch",
    brandName: "Apple",
    regularPrice: 22990000,
    salePrice: 20990000,
    description: "Vỏ Titan đen phủ lớp carbon giống kim cương DLC, độ sáng màn hình 3000 nits cao nhất lịch sử và GPS tần số kép L1/L5 chuẩn xác.",
    content: "Cỗ máy thám hiểm sinh tồn tối thượng của Apple. Kháng nước ở độ sâu 100m chuẩn EN13319 cho thợ lặn chuyên nghiệp, còi báo động khẩn cấp Siren 86 decibel vang xa 180 mét.",
    stock: 35,
    warrantyMonths: 12,
    originCountry: "Chính Hãng VNA",
    images: [
      { url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=85", altText: "Apple Watch Ultra 2 Đen", isPrimary: true },
    ],
    specifications: [
      { groupName: "Vật Liệu & Kích Thước", specKey: "Khung Vỏ", specValue: "Titanium đen hàng không 49mm + Mặt kính Sapphire phẳng" },
      { groupName: "Màn Hình", specKey: "Độ Sáng Đỉnh", specValue: "OLED LTPO Always-On 3000 nits (tự giảm xuống 1 nit trong bóng tối)" },
    ],
  },
  {
    title: "Apple Watch Series 10 (Vỏ Nhôm 46mm Đen Bóng Jet Black - GPS)",
    slug: "apple-watch-series-10-46mm-jet-black",
    sku: "AJ-WAT-APL-S10-46",
    categorySlug: "dong-ho-smartwatch",
    brandName: "Apple",
    regularPrice: 11990000,
    salePrice: 10490000,
    description: "Độ mỏng kỷ lục dưới 10mm, màn hình OLED góc nhìn rộng sáng hơn 40% khi nhìn nghiêng và cảm biến phát hiện ngưng thở khi ngủ.",
    content: "Thiết kế tái định nghĩa sau 10 năm phát triển. Diện tích hiển thị lớn hơn cả Apple Watch Ultra với viền siêu mỏng, sạc nhanh 80% chỉ trong 30 phút và hỗ trợ phát nhạc trực tiếp qua loa ngoài.",
    stock: 50,
    warrantyMonths: 12,
    originCountry: "Chính Hãng VNA",
    images: [
      { url: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=1000&q=85", altText: "Apple Watch Series 10", isPrimary: true },
    ],
    specifications: [
      { groupName: "Màn Hình", specKey: "Wide-Angle OLED", specValue: "OLED góc rộng góc nhìn sáng hơn 40%, tần số quét 1Hz Always-On" },
      { groupName: "Sức Khỏe", specKey: "Tính Năng Mới", specValue: "Cảnh báo ngưng thở khi ngủ Sleep Apnea, Đo độ sâu nước & nhiệt độ" },
    ],
  },
  {
    title: "Samsung Galaxy Watch Ultra LTE (Khung Titan Cấp 4 / Nút Quick Button)",
    slug: "samsung-galaxy-watch-ultra-lte-titan",
    sku: "AJ-WAT-SAM-WULTRA",
    categorySlug: "dong-ho-smartwatch",
    brandName: "Samsung",
    regularPrice: 16990000,
    salePrice: 14490000,
    description: "Khung đệm Cushion Design Titan siêu bền, theo dõi chỉ số AGEs chống lão hóa, GPS băng tần kép và chuẩn kháng nước 10ATM.",
    content: "Đồng hồ thể thao thông minh đỉnh cao nhất hệ sinh thái Android. Bộ vi xử lý 3nm đầu tiên trên smartwatch giúp tiết kiệm pin vượt bậc tới 100 giờ ở chế độ Tiết Kiệm Pin Tập Luyện.",
    stock: 40,
    warrantyMonths: 12,
    originCountry: "Chính Hãng VNA",
    images: [
      { url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=85", altText: "Galaxy Watch Ultra", isPrimary: true },
    ],
    specifications: [
      { groupName: "Hiệu Năng", specKey: "Vi Xử Lý", specValue: "Exynos W1000 tiến trình 3nm 5 lõi siêu mượt" },
      { groupName: "Độ Bền", specKey: "Kháng Nước & Bụi", specValue: "10ATM + IP68 + Chuẩn quân sự MIL-STD-810H" },
    ],
  },
  {
    title: "Garmin Fenix 8 Solar 51mm (Kính Sapphire / Sạc Năng Lượng Mặt Trời)",
    slug: "garmin-fenix-8-solar-51mm-sapphire",
    sku: "AJ-WAT-GRM-FN8S",
    categorySlug: "dong-ho-smartwatch",
    brandName: "Garmin",
    regularPrice: 29990000,
    salePrice: 27490000,
    description: "Thời lượng pin không giới hạn tới 48 ngày nhờ vòng sạc mặt trời cải tiến, tích hợp loa ngoài và micro đàm thoại chống rò rỉ nước.",
    content: "Vũ khí thám hiểm rừng sâu và núi tuyết số 1 hành tinh. Đèn pin LED tích hợp chùm sáng đỏ/trắng soi đường ban đêm, bản đồ địa hình TopoActive màu sắc cài sẵn và các tính năng luyện tập sức bền nâng cao.",
    stock: 25,
    warrantyMonths: 24,
    originCountry: "Chính Hãng VNA",
    images: [
      { url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=85", altText: "Garmin Fenix 8 Solar", isPrimary: true },
    ],
    specifications: [
      { groupName: "Thời Lượng Pin", specKey: "Solar Battery", specValue: "Lên đến 48 ngày ở chế độ đồng hồ thông minh với sạc mặt trời" },
      { groupName: "Lặn Biển", specKey: "Độ Sâu", specValue: "Hỗ trợ lặn có bình khí SCUBA và lặn tự do đến 40 mét" },
    ],
  },
  {
    title: "Garmin Epix Pro Gen 2 Sapphire 47mm (Màn Hình AMOLED / Đèn Pin LED)",
    slug: "garmin-epix-pro-gen-2-sapphire-47mm",
    sku: "AJ-WAT-GRM-EPX2P",
    categorySlug: "dong-ho-smartwatch",
    brandName: "Garmin",
    regularPrice: 24990000,
    salePrice: 21990000,
    description: "Màn hình AMOLED rực rỡ sắc nét, cảm biến nhịp tim Gen 5 Elevate đo điện tim ECG và viền bezel Titanium cao cấp.",
    content: "Sự kết hợp hoàn hảo giữa độ bền bỉ thể thao chuyên nghiệp và vẻ ngoài sang trọng của một chiếc đồng hồ thời trang cao cấp. Pin hoạt động 16 ngày liên tục kể cả với màn hình AMOLED.",
    stock: 30,
    warrantyMonths: 24,
    originCountry: "Chính Hãng VNA",
    images: [
      { url: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=1000&q=85", altText: "Garmin Epix Pro Gen 2", isPrimary: true },
    ],
    specifications: [
      { groupName: "Màn Hình", specKey: "AMOLED", specValue: "1.3 inch AMOLED Always-On kính Sapphire chống trầy xước" },
      { groupName: "Cảm Biến", specKey: "Đo Nhịp Tim", specValue: "Garmin Elevate Gen 5 với 6 cảm biến quang học và vòng điện cực ECG" },
    ],
  },
  {
    title: "Huawei Watch Ultimate Design (Vàng Thật 18K Đính Thủ Công - Bản Xa Xỉ)",
    slug: "huawei-watch-ultimate-design-gold-18k",
    sku: "AJ-WAT-HUA-WULT-GLD",
    categorySlug: "dong-ho-smartwatch",
    brandName: "Huawei",
    regularPrice: 79990000,
    salePrice: 72990000,
    description: "Sáu lá vàng thật 18K khảm tay thủ công quanh vành bezel gốm Nanotech, dây đeo kim loại mạ vàng titan 3 nấc điều chỉnh.",
    content: "Đỉnh cao trang sức công nghệ xa xỉ. Thân đồng hồ đúc từ hợp kim kim loại lỏng gốc Zirconium siêu bền gấp 4.5 lần thép không gỉ, hỗ trợ lặn biển sâu 100m với máy tính lặn chuyên dụng.",
    stock: 6,
    warrantyMonths: 24,
    originCountry: "Chính Hãng",
    images: [
      { url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=85", altText: "Huawei Watch Ultimate Design", isPrimary: true },
    ],
    specifications: [
      { groupName: "Chế Tác Vàng", specKey: "Vàng Thật", specValue: "Khảm 6 thanh vàng 18K nguyên chất quanh niềng gốm sứ" },
      { groupName: "Lặn Biển", specKey: "Chuẩn Lặn", specValue: "100m ISO 22810 & EN13319 thợ lặn kỹ thuật số chuyên sâu" },
    ],
  },
  {
    title: "Suunto Race Titanium Smartwatch - Bản Đồ Ngoại Tuyến Miễn Phí Toàn Cầu",
    slug: "suunto-race-titanium-smartwatch",
    sku: "AJ-WAT-SUN-RCETIT",
    categorySlug: "dong-ho-smartwatch",
    brandName: "Garmin",
    regularPrice: 15490000,
    salePrice: 13490000,
    description: "Thiết kế Bắc Âu Phần Lan tinh xảo với núm xoay Digital Crown mượt mà, màn hình AMOLED 1.43 inch và đo biến thiên nhịp tim HRV.",
    content: "Đồng hồ đua sức bền hàng đầu cho các vận động viên chạy marathon và leo núi cự ly siêu dài. Tải bản đồ vệ tinh ngoại tuyến chi tiết hoàn toàn miễn phí mà không cần kết nối điện thoại.",
    stock: 25,
    warrantyMonths: 24,
    originCountry: "Chính Hãng",
    images: [
      { url: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=1000&q=85", altText: "Suunto Race Titanium", isPrimary: true },
    ],
    specifications: [
      { groupName: "Bản Đồ", specKey: "Offline Maps", specValue: "Bản đồ đường đồng mức ngoại tuyến toàn cầu miễn phí 32GB bộ nhớ" },
      { groupName: "Pin GPS", specKey: "Thời Lượng GPS", specValue: "40 giờ ở chế độ định vị vệ tinh GPS đa băng tần chính xác nhất" },
    ],
  },
  {
    title: "Coros Vertix 2S GPS Adventure Watch - Bản Đồ Trực Quan Vệ Tinh Kép",
    slug: "coros-vertix-2s-adventure-watch",
    sku: "AJ-WAT-COR-VTX2S",
    categorySlug: "dong-ho-smartwatch",
    brandName: "Garmin",
    regularPrice: 18990000,
    salePrice: 16990000,
    description: "Cảm biến nhịp tim quang học thế hệ mới 5 LED, thời lượng pin GPS liên tục 118 giờ và khả năng hoạt động ở nhiệt độ âm -30°C.",
    content: "Được sinh ra để chinh phục đỉnh Everest và những cung đường thám hiểm khắc nghiệt nhất. Đi kèm cả hai loại dây đeo: dây dù nylon thoáng khí và dây silicone thể thao siêu bền.",
    stock: 20,
    warrantyMonths: 24,
    originCountry: "Chính Hãng",
    images: [
      { url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=85", altText: "Coros Vertix 2S", isPrimary: true },
    ],
    specifications: [
      { groupName: "Thời Lượng Pin", specKey: "Pin GPS", specValue: "118 giờ GPS liên tục / 43 ngày ở chế độ hàng ngày" },
      { groupName: "Cảm Biến", specKey: "Cảm Biến Tim", specValue: "Hệ thống 5 LED và 4 Photodetector đo điện tâm đồ ECG trên cổ tay" },
    ],
  },
  {
    title: "Polar Vantage V3 Đồng Hồ Chạy Bộ Chuyên Sâu (Cảm Biến Elixir ECG)",
    slug: "polar-vantage-v3-elixir-ecg",
    sku: "AJ-WAT-POL-VANV3",
    categorySlug: "dong-ho-smartwatch",
    brandName: "Garmin",
    regularPrice: 16490000,
    salePrice: 14490000,
    description: "Bộ cảm biến sinh học Polar Elixir đo ECG tại cổ tay, nhiệt độ bề mặt da ban đêm và đo nồng độ oxy SpO2 chính xác theo chuẩn y tế.",
    content: "Thương hiệu khởi nguồn cho ngành đo nhịp tim thể thao thế giới. Polar Vantage V3 cung cấp các bài kiểm tra phục hồi thể lực cơ bắp Leg Recovery Test và dự báo tải luyện tập Training Load Pro số 1 thế giới.",
    stock: 22,
    warrantyMonths: 24,
    originCountry: "Chính Hãng",
    images: [
      { url: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=1000&q=85", altText: "Polar Vantage V3", isPrimary: true },
    ],
    specifications: [
      { groupName: "Sinh Học", specKey: "Polar Elixir", specValue: "Đo ECG, SpO2, Đo nhiệt độ da, Quang phổ nhịp tim Gen 4 OHR" },
      { groupName: "Màn Hình", specKey: "Tấm Nền", specValue: "1.39 inch AMOLED 462 ppi độ sáng 1050 nits" },
    ],
  },
  {
    title: "Withings ScanWatch Horizon Đồng Hồ Cơ Lai Thông Minh - Xanh Thủy Quân Lục Chiến",
    slug: "withings-scanwatch-horizon-navy-blue",
    sku: "AJ-WAT-WIT-SCNHOR",
    categorySlug: "dong-ho-smartwatch",
    brandName: "Garmin",
    regularPrice: 14990000,
    salePrice: 12990000,
    description: "Kim cơ học vật lý truyền thống kết hợp màn hình OLED phụ ẩn, đo điện tâm đồ ECG y tế và thời lượng pin 30 ngày chỉ 1 lần sạc.",
    content: "Mang trọn vẹn vẻ đẹp của một chiếc đồng hồ lặn biển Thụy Sĩ sang trọng với vòng bezel xoay bằng thép không gỉ 316L và kim phủ dạ quang Luminova, nhưng ẩn chứa bên trong là công nghệ theo dõi tim mạch chuẩn bệnh viện Pháp.",
    stock: 25,
    warrantyMonths: 24,
    originCountry: "Chính Hãng",
    images: [
      { url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=85", altText: "Withings ScanWatch Horizon", isPrimary: true },
    ],
    specifications: [
      { groupName: "Phong Cách", specKey: "Đồng Hồ Cơ Lai", specValue: "Kim cơ thật mạ chrome + Màn hình OLED phụ ẩn sắc nét" },
      { groupName: "Pin", specKey: "Thời Gian Dùng", specValue: "30 ngày dùng liên tục + 20 ngày chế độ tiết kiệm năng lượng" },
    ],
  },

  // =========================================================================
  // 5. PHỤ KIỆN CÔNG NGHỆ (20 SẢN PHẨM)
  // =========================================================================
  {
    title: "Củ Sạc Nhanh Anker Prime 250W GaN (6 Cổng / Màn Hình Kỹ Thuật Số Hiển Thị Công Suất)",
    slug: "cu-sac-nhanh-anker-prime-250w-gan-6-cong",
    sku: "AJ-ACC-ANK-PR250W",
    categorySlug: "phu-kien-cong-nghe",
    brandName: "Anker",
    regularPrice: 4290000,
    salePrice: 3590000,
    description: "Công suất cực đại 250W hỗ trợ sạc cùng lúc 2 chiếc MacBook Pro 16 inch và 4 thiết bị điện thoại ở tốc độ tối đa.",
    content: "Trang bị núm xoay điều chỉnh thông minh và màn hình LCD 2.26 inch trực quan hiển thị dòng điện, điện áp và công suất thực theo thời gian thực trên từng cổng kết nối.",
    stock: 55,
    warrantyMonths: 18,
    originCountry: "Chính Hãng VNA",
    images: [
      { url: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=1000&q=85", altText: "Anker Prime 250W", isPrimary: true },
    ],
    specifications: [
      { groupName: "Công Suất", specKey: "Tổng Output", specValue: "250W Max (Cổng đơn USB-C1 xuất tối đa 140W chuẩn PD 3.1)" },
      { groupName: "Màn Hình", specKey: "Màn Hiển Thị", specValue: "Màn hình LCD màu 2.26 inch kèm đồng hồ thời gian thực" },
    ],
  },
  {
    title: "Trạm Sạc Không Dây Anker MagGo 3-in-1 Qi2 (Sạc Hít Nam Châm 15W Gập Gọn)",
    slug: "tram-sac-anker-maggo-3-in-1-qi2-foldable",
    sku: "AJ-ACC-ANK-MAG3IN1",
    categorySlug: "phu-kien-cong-nghe",
    brandName: "Anker",
    regularPrice: 2890000,
    salePrice: 2390000,
    description: "Chuẩn sạc Qi2 không dây 15W sạc nhanh iPhone gấp đôi, đế sạc gập gọn hình cây nấm bỏ túi du lịch tiện lợi.",
    content: "Đồng thời sạc nhanh 15W cho iPhone, sạc nhanh cho Apple Watch Series 10/Ultra và sạc AirPods cùng lúc. Công nghệ kiểm soát nhiệt độ ActiveShield 2.0 đo nhiệt độ 3 triệu lần mỗi ngày.",
    stock: 60,
    warrantyMonths: 18,
    originCountry: "Chính Hãng VNA",
    images: [
      { url: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=1000&q=85", altText: "Anker MagGo 3-in-1", isPrimary: true },
    ],
    specifications: [
      { groupName: "Công Nghệ", specKey: "Chuẩn Sạc", specValue: "Chứng nhận chính thức Qi2 15W Wireless Fast Charging" },
      { groupName: "Thiết Kế", specKey: "Gấp Gọn", specValue: "Gập 3 nấc siêu gọn chỉ bằng một bao diêm du lịch" },
    ],
  },
  {
    title: "Chuột Công Thái Học Logitech MX Master 3S Pale Grey (8000 DPI / Yên Tĩnh 90%)",
    slug: "chuot-logitech-mx-master-3s-pale-grey",
    sku: "AJ-ACC-LOG-MXM3S-GRY",
    categorySlug: "phu-kien-cong-nghe",
    brandName: "Logitech",
    regularPrice: 2690000,
    salePrice: 2190000,
    description: "Cảm biến Darkfield 8000 DPI di chuyển được trên cả mặt kính trong suốt, cuộn kim loại từ tính MagSpeed 1000 dòng/giây.",
    content: "Chuột văn phòng tốt nhất thế giới được các chuyên gia thiết kế và lập trình viên tin dùng. Cú nhấp chuột Quiet Clicks giảm 90% tiếng ồn khó chịu, chuyển đổi mượt mà giữa 3 máy tính cùng lúc bằng tính năng Logitech Flow.",
    stock: 75,
    warrantyMonths: 12,
    originCountry: "Chính Hãng",
    images: [
      { url: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=1000&q=85", altText: "Logitech MX Master 3S", isPrimary: true },
    ],
    specifications: [
      { groupName: "Cảm Biến", specKey: "Độ Nhạy", specValue: "200 đến 8000 DPI di chuyển chính xác trên mọi bề mặt kính" },
      { groupName: "Con Cuộn", specKey: "MagSpeed", specValue: "Cuộn điện từ MagSpeed dừng chính xác từng pixel hoặc cuộn 1000 dòng/giây" },
    ],
  },
  {
    title: "Bàn Phím Cơ Không Dây Logitech MX Mechanical Mini (Switch Tactile Quiet)",
    slug: "ban-phim-logitech-mx-mechanical-mini-tactile",
    sku: "AJ-ACC-LOG-MXM-MINI",
    categorySlug: "phu-kien-cong-nghe",
    brandName: "Logitech",
    regularPrice: 3490000,
    salePrice: 2890000,
    description: "Switch phím cơ low-profile hành trình ngắn gõ cực êm ái, đèn nền thông minh tự phát sáng khi bàn tay lại gần.",
    content: "Khung mặt trên bằng nhôm tái chế bền chắc, bố cục phím 75% siêu gọn gàng tiết kiệm diện tích bàn làm việc. Thời lượng pin 15 ngày có đèn hoặc lên đến 10 tháng khi tắt đèn nền.",
    stock: 50,
    warrantyMonths: 12,
    originCountry: "Chính Hãng",
    images: [
      { url: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1000&q=85", altText: "Logitech MX Mechanical Mini", isPrimary: true },
    ],
    specifications: [
      { groupName: "Switch", specKey: "Loại Switch", specValue: "Tactile Quiet Low-profile cơ học phản hồi xúc giác êm ái" },
      { groupName: "Kết Nối", specKey: "Phương Thức", specValue: "Bluetooth Low Energy & Đầu thu bảo mật Logi Bolt USB" },
    ],
  },
  {
    title: "Bút Cảm Ứng Apple Pencil Pro (Cảm Ứng Lực Bóp Squeeze / Rung Phản Hồi)",
    slug: "but-apple-pencil-pro-ipad",
    sku: "AJ-ACC-APL-PENCILPRO",
    categorySlug: "phu-kien-cong-nghe",
    brandName: "Apple",
    regularPrice: 3490000,
    salePrice: 3190000,
    description: "Cảm biến con quay hồi chuyển Barrel Roll xoay ngòi bút vẽ nét thanh nét đậm, tính năng bóp nhẹ đổi cọ và tìm kiếm Find My.",
    content: "Được sinh ra dành riêng cho iPad Pro M4 và iPad Air M2. Động cơ rung Haptic phản hồi tinh tế từng thao tác nhấn, độ trễ gần như bằng 0 tái hiện hoàn hảo cảm giác vẽ bút chì trên giấy thật.",
    stock: 70,
    warrantyMonths: 12,
    originCountry: "Chính Hãng VNA",
    images: [
      { url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1000&q=85", altText: "Apple Pencil Pro", isPrimary: true },
    ],
    specifications: [
      { groupName: "Tính Năng", specKey: "Cảm Biến Bóp Lực", specValue: "Squeeze Sensor mở bảng màu tức thì, Barrel Roll xoay ngòi cọ" },
      { groupName: "Tương Thích", specKey: "Thiết Bị", specValue: "iPad Pro M4 (11 inch & 13 inch), iPad Air M2 (11 inch & 13 inch)" },
    ],
  },
  {
    title: "Bàn Phím Magic Keyboard iPad Pro 13 inch M4 - Vỏ Nhôm Space Black",
    slug: "magic-keyboard-ipad-pro-13-inch-m4-black",
    sku: "AJ-ACC-APL-MKB-M413",
    categorySlug: "phu-kien-cong-nghe",
    brandName: "Apple",
    regularPrice: 9790000,
    salePrice: 8990000,
    description: "Vỏ nhôm kê tay sang trọng, bàn di chuột lớn bằng kính tích hợp phản hồi rung haptic và hàng 14 phím chức năng tiện dụng.",
    content: "Biến chiếc iPad Pro M4 thành chiếc laptop thực thụ chỉ bằng một cú hít nam châm thông minh. Bản lề công thái học lơ lửng điều chỉnh góc nhìn mượt mà cùng cổng sạc USB-C truyền điện nối tiếp độc lập.",
    stock: 40,
    warrantyMonths: 12,
    originCountry: "Chính Hãng VNA",
    images: [
      { url: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=1000&q=85", altText: "Magic Keyboard iPad Pro 13 M4", isPrimary: true },
    ],
    specifications: [
      { groupName: "Thiết Kế", specKey: "Chất Liệu Kê Tay", specValue: "Nhôm nguyên khối phay xước cao cấp Space Black" },
      { groupName: "Bàn Di Chuột", specKey: "Touchpad", specValue: "Mặt kính lớn phản hồi rung xúc giác haptic feedback" },
    ],
  },
  {
    title: "Sạc Dự Phòng Shargeek Storm 2 100W Transparent (25.600mAh / Màn Hình IPS)",
    slug: "sac-du-phong-shargeek-storm-2-100w",
    sku: "AJ-ACC-SHG-STM2",
    categorySlug: "phu-kien-cong-nghe",
    brandName: "Anker",
    regularPrice: 4990000,
    salePrice: 4290000,
    description: "Thiết kế vỏ trong suốt khoe trọn bảng mạch mạ vàng, màn hình màu IPS hiển thị biểu đồ nhiệt độ pin và công suất sạc.",
    content: "Chiếc sạc dự phòng cyberpunk được giới công nghệ săn đón nhất. Dung lượng pin 25.600mAh đạt chuẩn tối đa được phép mang lên máy bay, hỗ trợ cổng sạc DC điều chỉnh điện áp từ 3.3V đến 25.2V.",
    stock: 35,
    warrantyMonths: 12,
    originCountry: "Chính Hãng",
    images: [
      { url: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=1000&q=85", altText: "Shargeek Storm 2", isPrimary: true },
    ],
    specifications: [
      { groupName: "Dung Lượng", specKey: "Pin & Chuẩn", specValue: "25.600 mAh / 93.5Wh (Chuẩn TSA hàng không an toàn)" },
      { groupName: "Công Suất", specKey: "Output Tối Đa", specValue: "100W PD sạc đầy MacBook Pro và laptop công suất cao" },
    ],
  },
  {
    title: "Cáp Thunderbolt 4 Pro Apple Dài 3m Dệt Dù Đen (40Gbps / Sạc 100W)",
    slug: "cap-apple-thunderbolt-4-pro-3m",
    sku: "AJ-ACC-APL-TB4-3M",
    categorySlug: "phu-kien-cong-nghe",
    brandName: "Apple",
    regularPrice: 4290000,
    salePrice: 3890000,
    description: "Dây cáp bện dù chống rối bền bỉ dài 3 mét, tốc độ truyền dữ liệu 40Gbps và xuất màn hình độ phân giải 8K sắc nét.",
    content: "Chiếc cáp Thunderbolt cao cấp nhất của Apple với mạch khuếch đại tín hiệu chủ động tích hợp bên trong đầu cáp, đảm bảo băng thông 40Gbps trọn vẹn suốt chiều dài 3 mét mà không hề suy hao tín hiệu.",
    stock: 45,
    warrantyMonths: 12,
    originCountry: "Chính Hãng VNA",
    images: [
      { url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1000&q=85", altText: "Cáp Thunderbolt 4 Pro 3m", isPrimary: true },
    ],
    specifications: [
      { groupName: "Tốc Độ", specKey: "Băng Thông", specValue: "40Gbps (Gấp 8 lần chuẩn USB 3.0 thông thường)" },
      { groupName: "Chiều Dài & Sạc", specKey: "Thông Số", specValue: "Dài 3.0 mét bện sợi dù, sạc nguồn công suất 100W" },
    ],
  },
  {
    title: "Ổ Cứng Di Động SSD Samsung T9 4TB (Tốc Độ 2000MB/s / Vỏ Chống Sốc Silicon)",
    slug: "o-cung-ssd-samsung-t9-4tb-2000mbs",
    sku: "AJ-ACC-SAM-T9-4TB",
    categorySlug: "phu-kien-cong-nghe",
    brandName: "Samsung",
    regularPrice: 9490000,
    salePrice: 8490000,
    description: "Giao thức USB 3.2 Gen 2x2 tốc độ đọc ghi 2000MB/s, vỏ cao su có gân chống va đập từ độ cao 3 mét và tản nhiệt Dynamic Thermal Guard.",
    content: "Lựa chọn hàng đầu cho các nhà làm phim quay video ProRes 4K trực tiếp từ iPhone 16 Pro Max. Dung lượng khổng lồ 4TB chứa được hàng trăm giờ cảnh quay chất lượng cao nguyên bản.",
    stock: 30,
    warrantyMonths: 36,
    originCountry: "Chính Hãng VNA",
    images: [
      { url: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=1000&q=85", altText: "SSD Samsung T9 4TB", isPrimary: true },
    ],
    specifications: [
      { groupName: "Tốc Độ", specKey: "Đọc & Ghi", specValue: "Lên đến 2000 MB/s (Chuyển video 4GB chỉ trong 2 giây)" },
      { groupName: "Bảo Mật", specKey: "Mã Hóa", specValue: "Mã hóa phần cứng AES 256-bit bảo vệ dữ liệu tuyệt đối" },
    ],
  },
  {
    title: "Thẻ Nhớ SanDisk Extreme PRO CFexpress Type B 512GB (1700MB/s Quay 8K RAW)",
    slug: "the-nho-sandisk-extreme-pro-cfexpress-b-512gb",
    sku: "AJ-ACC-SND-CFX-512",
    categorySlug: "phu-kien-cong-nghe",
    brandName: "Sony",
    regularPrice: 7990000,
    salePrice: 6990000,
    description: "Tốc độ đọc 1700MB/s và ghi 1400MB/s chuyên dụng cho máy ảnh Canon EOS R5, Sony FX6 và Nikon Z9 quay video điện ảnh 8K RAW.",
    content: "Chuẩn thẻ nhớ công nghiệp cao cấp nhất dành cho các nhiếp ảnh gia thương mại. Khả năng ghi tuần tự ổn định không bao giờ drop frame, chống sốc và chống tia X khi qua cổng an ninh sân bay.",
    stock: 25,
    warrantyMonths: 36,
    originCountry: "Chính Hãng",
    images: [
      { url: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=1000&q=85", altText: "SanDisk CFexpress 512GB", isPrimary: true },
    ],
    specifications: [
      { groupName: "Tốc Độ", specKey: "Read / Write", specValue: "Đọc 1700 MB/s, Ghi 1400 MB/s (PCIe 3.0 x2)" },
      { groupName: "Chuẩn Thẻ", specKey: "Form Factor", specValue: "CFexpress Type B tương thích ngược khe cắm XQD" },
    ],
  },
  {
    title: "Giá Đỡ Laptop Nhôm Công Thái Học Rain Design mStand (Bạc Silver Chuẩn Apple)",
    slug: "gia-do-laptop-rain-design-mstand-silver",
    sku: "AJ-ACC-RD-MSTAND",
    categorySlug: "phu-kien-cong-nghe",
    brandName: "Apple",
    regularPrice: 1490000,
    salePrice: 1190000,
    description: "Nhôm nguyên khối anode hóa tiệp màu hoàn hảo với MacBook, nâng màn hình lên ngang tầm mắt bảo vệ cột sống cổ.",
    content: "Chiếc giá đỡ laptop huyền thoại được bán chính thức tại các chuỗi Apple Store toàn cầu. Thiết kế tản nhiệt thụ động thông minh giúp luồng khí lưu thông làm mát đáy laptop hiệu quả.",
    stock: 80,
    warrantyMonths: 12,
    originCountry: "Chính Hãng",
    images: [
      { url: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1000&q=85", altText: "Rain Design mStand", isPrimary: true },
    ],
    specifications: [
      { groupName: "Chất Liệu", specKey: "Vật Liệu", specValue: "Nhôm nguyên khối đúc dày dặn gia công cát mịn" },
      { groupName: "Độ Nâng", specKey: "Chiều Cao", specValue: "Nâng màn hình lên 15cm chuẩn góc nhìn công thái học" },
    ],
  },
  {
    title: "Hub Chuyển Đổi CalDigit TS4 Thunderbolt 4 (18 Cổng Kết Nối / Cấp Nguồn 98W)",
    slug: "hub-caldigit-ts4-thunderbolt-4-18-ports",
    sku: "AJ-ACC-CD-TS4-TB4",
    categorySlug: "phu-kien-cong-nghe",
    brandName: "Dell",
    regularPrice: 11990000,
    salePrice: 10490000,
    description: "Trạm kết nối dock station mạnh nhất thế giới với 18 cổng, mạng LAN 2.5Gbps siêu tốc, khe cắm SD 4.0 và xuất 2 màn hình 6K.",
    content: "Giải pháp dọn sạch góc bàn làm việc tối thượng cho máy tính xách tay. Chỉ cần duy nhất một sợi cáp Thunderbolt 4 cắm vào laptop để vừa truyền dữ liệu 18 thiết bị, vừa sạc nhanh công suất 98W.",
    stock: 20,
    warrantyMonths: 24,
    originCountry: "Chính Hãng",
    images: [
      { url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1000&q=85", altText: "CalDigit TS4", isPrimary: true },
    ],
    specifications: [
      { groupName: "Cổng Kết Nối", specKey: "Số Lượng Cổng", specValue: "18 cổng (3x Thunderbolt 4, 5x USB-A, 3x USB-C, DisplayPort 1.4, LAN 2.5G)" },
      { groupName: "Cấp Nguồn", specKey: "Power Delivery", specValue: "Cấp điện sạc laptop liên tục 98 Watts" },
    ],
  },
  {
    title: "Kính Thực Tế Ảo VR Meta Quest 3 512GB (Ống Kính Pancake / Passthrough Màu Sắc)",
    slug: "kinh-thuc-te-ao-meta-quest-3-512gb",
    sku: "AJ-ACC-MTA-Q3-512",
    categorySlug: "phu-kien-cong-nghe",
    brandName: "Google",
    regularPrice: 18990000,
    salePrice: 16990000,
    description: "Đột phá thực tế hỗn hợp Mixed Reality với 2 camera RGB màu thực, chip Snapdragon XR2 Gen 2 đồ họa gấp đôi và tay cầm Touch Plus.",
    content: "Đưa bạn bước vào không gian vũ trụ ảo sống động chưa từng thấy. Xem phim màn ảnh IMAX 3D khổng lồ ngay trong phòng ngủ và chơi các tựa game không gian thực tế ảo đỉnh cao mà không cần dây cáp vướng víu.",
    stock: 25,
    warrantyMonths: 12,
    originCountry: "Chính Hãng",
    images: [
      { url: "https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?auto=format&fit=crop&w=1000&q=85", altText: "Meta Quest 3", isPrimary: true },
    ],
    specifications: [
      { groupName: "Ống Kính & Màn", specKey: "Độ Phân Giải", specValue: "Màn hình 4K+ Infinite Display (2064 x 2208 mỗi mắt) thấu kính Pancake" },
      { groupName: "Hiệu Năng", specKey: "Vi Xử Lý", specValue: "Qualcomm Snapdragon XR2 Gen 2 đồ họa mạnh gấp đôi Quest 2" },
    ],
  },
  {
    title: "Bàn Di Chuột Nhôm Razer Sphex V3 (Siêu Mỏng 0.4mm / Bề Mặt Cực Mịn)",
    slug: "ban-di-chuot-razer-sphex-v3-large",
    sku: "AJ-ACC-RZR-SPHEX3",
    categorySlug: "phu-kien-cong-nghe",
    brandName: "ASUS",
    regularPrice: 590000,
    salePrice: 450000,
    description: "Độ mỏng gần như dán liền mặt bàn chỉ 0.4mm, chất liệu polycarbonate cường lực cho tốc độ lướt chuột trơn tru không độ cản.",
    content: "Được thiết kế cho game thủ yêu thích lối chơi flick chuột tốc độ cao. Mặt đế keo dính cố định bám chặt vào mặt bàn gỗ hay kính, không bao giờ bị xê dịch ngay cả trong những pha giao tranh căng thẳng.",
    stock: 120,
    warrantyMonths: 12,
    originCountry: "Chính Hãng",
    images: [
      { url: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=1000&q=85", altText: "Razer Sphex V3", isPrimary: true },
    ],
    specifications: [
      { groupName: "Kích Thước", specKey: "Size Lớn", specValue: "450 mm x 400 mm độ mỏng kỷ lục 0.4 mm" },
      { groupName: "Chất Liệu", specKey: "Bề Mặt", specValue: "Polycarbonate nhám siêu mịn tối ưu cho cảm biến quang học" },
    ],
  },
  {
    title: "Tay Cầm Chơi Game Sony DualSense Edge Wireless (Cần Analog Thay Thế / Nút Lưng)",
    slug: "tay-cam-sony-dualsense-edge-wireless",
    sku: "AJ-ACC-SNY-DSEDGE",
    categorySlug: "phu-kien-cong-nghe",
    brandName: "Sony",
    regularPrice: 5490000,
    salePrice: 4790000,
    description: "Tay cầm pro cao cấp nhất cho PS5 và PC, mô-đun cần xoay có thể tháo lắp thay thế, nút cò Trigger gạt 3 nấc độ sâu hành trình.",
    content: "Mang lại lợi thế cạnh tranh áp đảo trong các tựa game bắn súng Call of Duty hay bóng đá FC 25. Cụm nút lưng kim loại gán lệnh macro linh hoạt và bao đựng cao cấp kèm cáp bện dù khóa chốt an toàn.",
    stock: 40,
    warrantyMonths: 12,
    originCountry: "Chính Hãng VNA",
    images: [
      { url: "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?auto=format&fit=crop&w=1000&q=85", altText: "Sony DualSense Edge", isPrimary: true },
    ],
    specifications: [
      { groupName: "Mô-đun", specKey: "Stick Module", specValue: "Mô-đun cần xoay tháo rời thay thế được chống trôi stick vĩnh viễn" },
      { groupName: "Nút Bấm", specKey: "Tùy Biến", specValue: "2 nút lưng kim loại gán macro, khóa cò cò súng 3 cự ly" },
    ],
  },
  {
    title: "Bộ Phát Wi-Fi 7 ASUS ROG Rapture GT-BE98 (Tốc Độ 25.000Mbps / 4 Băng Tần / 2 Cổng 10G)",
    slug: "router-wifi-7-asus-rog-rapture-gt-be98",
    sku: "AJ-ACC-ASUS-GTBE98",
    categorySlug: "phu-kien-cong-nghe",
    brandName: "ASUS",
    regularPrice: 21990000,
    salePrice: 19490000,
    description: "Router gaming Wi-Fi 7 mạnh nhất hành tinh với 8 râu ăng-ten ngoài, kênh truyền 320MHz và hai cổng mạng 10Gbps siêu tốc.",
    content: "Chuẩn Wi-Fi 7 thế hệ mới mở ra kỷ nguyên chơi game không dây độ trễ 0ms. Công nghệ Multi-Link Operation (MLO) truyền tải đồng thời trên 4 dải băng tần giúp đường truyền ổn định tuyệt đối trước hàng trăm thiết bị cùng lúc.",
    stock: 15,
    warrantyMonths: 36,
    originCountry: "Chính Hãng VNA",
    images: [
      { url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1000&q=85", altText: "ASUS ROG Rapture GT-BE98", isPrimary: true },
    ],
    specifications: [
      { groupName: "Tốc Độ", specKey: "Băng Thông Wi-Fi 7", specValue: "Lên đến 25.000 Mbps trên 4 băng tần (Quad-Band 6GHz/5GHz/2.4GHz)" },
      { groupName: "Cổng Mạng", specKey: "Ethernet Ports", specValue: "2x Cổng 10Gbps + 4x Cổng 2.5Gbps + 1x Cổng 1Gbps" },
    ],
  },
  {
    title: "Pin Sạc Dự Phòng Mophie Snap+ Powerstation 10K (Hít Nam Châm Kèm Chân Chống)",
    slug: "pin-du-phong-mophie-snap-plus-10k",
    sku: "AJ-ACC-MPH-SNAP10K",
    categorySlug: "phu-kien-cong-nghe",
    brandName: "Anker",
    regularPrice: 1790000,
    salePrice: 1450000,
    description: "Thương hiệu phụ kiện số 1 tại Apple Store, hít chặt lưng iPhone với vòng nam châm Snap chuẩn xác và chân chống đứng xem video.",
    content: "Dung lượng 10.000mAh cung cấp thêm tới 40 giờ sử dụng cho điện thoại. Bề mặt bọc vải nỉ sang trọng chống trầy xước lưng kính điện thoại và cổng USB-C sạc nhanh 20W hai chiều.",
    stock: 80,
    warrantyMonths: 24,
    originCountry: "Chính Hãng",
    images: [
      { url: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=1000&q=85", altText: "Mophie Snap+ 10K", isPrimary: true },
    ],
    specifications: [
      { groupName: "Dung Lượng", specKey: "Battery", specValue: "10.000 mAh tích hợp chân chống kim loại gập mở" },
      { groupName: "Sạc", specKey: "Công Suất", specValue: "Không dây MagSafe 7.5W - 15W, Có dây USB-C PD 20W" },
    ],
  },
  {
    title: "Tai Nghe Gaming SteelSeries Arctis Nova Pro Wireless (Hệ Thống 2 Pin Đổi Nóng)",
    slug: "tai-nghe-steelseries-arctis-nova-pro-wireless",
    sku: "AJ-ACC-STS-NOVAPRO",
    categorySlug: "phu-kien-cong-nghe",
    brandName: "Logitech",
    regularPrice: 9990000,
    salePrice: 8490000,
    description: "Trạm sạc DAC OLED rời điều khiển âm thanh, hệ thống 2 pin Infinity Power System thay pin không cần tắt tai nghe.",
    content: "Tai nghe gaming không dây cao cấp nhất dành cho game thủ PC và console. Công nghệ âm thanh vòm 360° Spatial Audio và phần mềm Sonar Audio Software Suite điều chỉnh tần số âm thanh bước chân địch thủ sắc bén.",
    stock: 30,
    warrantyMonths: 24,
    originCountry: "Chính Hãng",
    images: [
      { url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=85", altText: "SteelSeries Arctis Nova Pro", isPrimary: true },
    ],
    specifications: [
      { groupName: "Pin Đổi Nóng", specKey: "Hot-Swap", specValue: "2 pin dự phòng hoán đổi liên tục trong dock sạc, thời lượng vô tận" },
      { groupName: "Bộ Điều Khiển", specKey: "Base Station", specValue: "Màn hình OLED hiển thị EQ, âm lượng và chuyển kênh 2 thiết bị tức thì" },
    ],
  },
  {
    title: "Webcam Chuyên Nghiệp Elgato Facecam Pro 4K60 (Cảm Biến Sony STARVIS 4K60fps)",
    slug: "webcam-elgato-facecam-pro-4k60",
    sku: "AJ-ACC-ELG-FCP4K",
    categorySlug: "phu-kien-cong-nghe",
    brandName: "Logitech",
    regularPrice: 8990000,
    salePrice: 7790000,
    description: "Webcam đầu tiên trên thế giới quay video độ phân giải 4K ở tốc độ 60 khung hình/giây không nén, ống kính tiêu cự 21mm F2.0 sắc nét.",
    content: "Chuẩn mực ghi hình mới cho các streamer, podcaster và nhà sáng tạo chuyên nghiệp. Bộ xử lý hình ảnh Elgato Prime Lens lấy nét tự động siêu nhanh và lưu thiết lập trực tiếp vào bộ nhớ phần cứng của webcam.",
    stock: 25,
    warrantyMonths: 24,
    originCountry: "Chính Hãng",
    images: [
      { url: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1000&q=85", altText: "Elgato Facecam Pro", isPrimary: true },
    ],
    specifications: [
      { groupName: "Hình Ảnh", specKey: "Cảm Biến", specValue: "1/1.8 inch Sony STARVIS CMOS cảm biến lớn quay 4K 60fps" },
      { groupName: "Ống Kính", specKey: "Khẩu Độ", specValue: "F/2.0 góc rộng 90 độ kính thủy tinh quang học chống lóa" },
    ],
  },
  {
    title: "Micro Thu Âm Shure MV7+ Podcast USB & XLR (Đèn LED Cảm Ứng / Lọc Ồn DSP Kép)",
    slug: "micro-shure-mv7-plus-podcast-usb-xlr",
    sku: "AJ-ACC-SHU-MV7P",
    categorySlug: "phu-kien-cong-nghe",
    brandName: "Sennheiser",
    regularPrice: 8490000,
    salePrice: 7490000,
    description: "Micro định hướng thu giọng nói chuẩn phát thanh truyền hình, dải đèn LED cảm ứng đa sắc màu và công cụ khử âm vang phòng DSP.",
    content: "Được phát triển dựa trên chiếc micro SM7B huyền thoại của Michael Jackson. Hỗ trợ cổng cắm kép USB-C cho máy tính và XLR cho soundcard thu âm chuyên nghiệp, tính năng Auto Level Mode tự động cân chỉnh độ lớn giọng nói hoàn hảo.",
    stock: 35,
    warrantyMonths: 24,
    originCountry: "Chính Hãng",
    images: [
      { url: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1000&q=85", altText: "Shure MV7+", isPrimary: true },
    ],
    specifications: [
      { groupName: "Cổng Kết Nối", specKey: "Dual Output", specValue: "Cổng kỹ thuật số USB-C & Cổng analog XLR chuyên nghiệp" },
      { groupName: "Xử Lý Âm", specKey: "DSP Hardware", specValue: "Digital Popper Stopper loại bỏ tiếng phụt hơi thở + Bộ lọc ồn Denoiser" },
    ],
  },

  // =========================================================================
  // 6. GIA DỤNG THÔNG MINH (10 SẢN PHẨM)
  // =========================================================================
  {
    title: "Robot Hút Bụi Lau Nhà Dreame X40 Ultra (Lực Hút 12.000Pa / Giặt Giẻ Nước Nóng 70°C)",
    slug: "robot-hut-bui-dreame-x40-ultra-12000pa",
    sku: "AJ-SMR-DRM-X40U",
    categorySlug: "gia-dung-smart-living",
    brandName: "Roborock",
    regularPrice: 28990000,
    salePrice: 24990000,
    description: "Cánh tay robot cơ học tự vươn giẻ lau sát mép tường 1mm, chổi quét ven tự nâng hạ chống rối tóc và trạm sạc tự đổ rác 75 ngày.",
    content: "Flagship robot hút bụi lau nhà thông minh số 1 thị trường. Tự động nâng hạ cả chổi chính, chổi phụ và giẻ lau khi phát hiện thảm lông, hệ thống camera AI nhận diện hơn 120 loại chướng ngại vật trong bóng tối.",
    stock: 25,
    warrantyMonths: 24,
    originCountry: "Chính Hãng VNA",
    images: [
      { url: "https://images.unsplash.com/photo-1588854337221-4cf9fa96059c?auto=format&fit=crop&w=1000&q=85", altText: "Dreame X40 Ultra", isPrimary: true },
    ],
    specifications: [
      { groupName: "Lực Hút", specKey: "Công Suất Hút", specValue: "12.000 Pa công nghệ quạt Turbo Force" },
      { groupName: "Trạm Sạc Đa Năng", specKey: "Tính Năng Trạm", specValue: "Giặt giẻ nước nóng 70°C, sấy khí nóng, tự pha nước lau sàn, tự đổ rác" },
    ],
  },
  {
    title: "Máy Lọc Không Khí & Sưởi Dyson Purifier Hot+Cool Gen1 (Bộ Lọc HEPA H13 Khử Virus)",
    slug: "may-loc-khong-khi-dyson-purifier-hot-cool-gen1",
    sku: "AJ-SMR-DYS-HP10",
    categorySlug: "gia-dung-smart-living",
    brandName: "Dyson",
    regularPrice: 16990000,
    salePrice: 14490000,
    description: "Bộ lọc HEPA kín chuẩn 360 độ giữ lại 99.95% hạt bụi mịn 0.1 micron, quạt mát mùa hè và sưởi ấm mùa đông thông minh.",
    content: "Công nghệ Air Multiplier khuếch đại luồng gió thanh lọc không khí khắp toàn bộ căn phòng. Màn hình LCD tích hợp hiển thị chất lượng không khí PM2.5 theo thời gian thực và vận hành êm ái chứng nhận Quiet Mark.",
    stock: 30,
    warrantyMonths: 24,
    originCountry: "Chính Hãng VNA",
    images: [
      { url: "https://images.unsplash.com/photo-1588854337221-4cf9fa96059c?auto=format&fit=crop&w=1000&q=85", altText: "Dyson Hot+Cool Gen1", isPrimary: true },
    ],
    specifications: [
      { groupName: "Bộ Lọc", specKey: "Chuẩn Lọc", specValue: "HEPA H13 tiêu chuẩn y tế + Than hoạt tính khử mùi độc hại" },
      { groupName: "Chức Năng Kép", specKey: "Hot & Cool", specValue: "Làm mát luồng gió tự nhiên + Sưởi ấm gốm PTC điều khiển nhiệt độ" },
    ],
  },
  {
    title: "Nồi Chiên Không Dầu Kết Hợp Hấp Philips Airfryer Combi XXL (Dung Tích 8.3L / App NutriU)",
    slug: "noi-chien-khong-dau-philips-airfryer-combi-xxl",
    sku: "AJ-SMR-PHL-COMBI",
    categorySlug: "gia-dung-smart-living",
    brandName: "Philips Hue",
    regularPrice: 9990000,
    salePrice: 8490000,
    description: "Công nghệ Rapid CombiAir nấu chín bằng hơi nước kết hợp khí nóng đối lưu, nhiệt kế cắm thực phẩm Food Thermometer thông minh.",
    content: "Dung tích khổng lồ 8.3L chứa vừa nguyên con gà 2kg. Nồi chiên tự động điều chỉnh tốc độ gió và độ ẩm để món ăn ngoài giòn tan nhưng bên trong mềm mọng nước, giảm tới 99% lượng chất béo có hại.",
    stock: 35,
    warrantyMonths: 24,
    originCountry: "Chính Hãng VNA",
    images: [
      { url: "https://images.unsplash.com/photo-1588854337221-4cf9fa96059c?auto=format&fit=crop&w=1000&q=85", altText: "Philips Combi XXL", isPrimary: true },
    ],
    specifications: [
      { groupName: "Dung Tích & Công Suất", specKey: "Thông Số", specValue: "8.3 Lít (2kg thức ăn), Công suất 2200W" },
      { groupName: "Kết Nối", specKey: "Smart App", specValue: "Kết nối Wi-Fi hướng dẫn nấu ăn từng bước qua ứng dụng HomeID" },
    ],
  },
  {
    title: "Máy Sấy Tóc Siêu Âm Dyson Supersonic Nural (Cảm Biến Bảo Vệ Da Đầu Thông Minh)",
    slug: "may-say-toc-dyson-supersonic-nural",
    sku: "AJ-SMR-DYS-NURAL",
    categorySlug: "gia-dung-smart-living",
    brandName: "Dyson",
    regularPrice: 14990000,
    salePrice: 13490000,
    description: "Cảm biến mạng nơ-ron tự động giảm nhiệt độ xuống 55°C khi đưa máy lại gần da đầu, đầu sấy nhận diện phụ kiện bằng RFID.",
    content: "Đột phá bảo vệ sức khỏe tóc và da đầu cao cấp nhất từ Dyson. Đèn khoang viên nhộng đổi màu từ đỏ sang vàng và xanh dương phản ánh nhiệt độ máy sấy tức thì, giúp mái tóc bóng mượt bồng bềnh tự nhiên.",
    stock: 40,
    warrantyMonths: 24,
    originCountry: "Chính Hãng VNA",
    images: [
      { url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1000&q=85", altText: "Dyson Supersonic Nural", isPrimary: true },
    ],
    specifications: [
      { groupName: "Công Nghệ", specKey: "Cảm Biến Nural", specValue: "Cảm biến đo khoảng cách Time-of-Flight tự điều chỉnh nhiệt độ bảo vệ da đầu" },
      { groupName: "Động Cơ", specKey: "V9 Motor", specValue: "Động cơ kỹ thuật số Dyson V9 quay 110.000 vòng/phút tạo luồng khí Air Multiplier" },
    ],
  },
  {
    title: "Khóa Cửa Thông Minh Nhận Diện Khuôn Mặt 3D Aqara U200 (Chuẩn Matter & Apple HomeKey)",
    slug: "khoa-cua-thong-minh-aqara-u200-face-id",
    sku: "AJ-SMR-AQA-U200",
    categorySlug: "gia-dung-smart-living",
    brandName: "Aqara",
    regularPrice: 6990000,
    salePrice: 5890000,
    description: "Chạm mở cửa một chạm bằng iPhone và Apple Watch qua Apple HomeKey, kết nối Matter over Thread ổn định không cần Hub.",
    content: "Lắp đặt trực tiếp lên khóa cửa hiện tại mà không cần khoan đục phức tạp. Mở khóa đa năng bằng vân tay sinh trắc học, thẻ từ NFC, mã số ảo chống nhìn trộm và chìa cơ dự phòng.",
    stock: 50,
    warrantyMonths: 24,
    originCountry: "Chính Hãng VNA",
    images: [
      { url: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1000&q=85", altText: "Aqara Smart Lock U200", isPrimary: true },
    ],
    specifications: [
      { groupName: "Phương Thức Mở", specKey: "Mở Khóa", specValue: "Apple HomeKey (NFC), Vân tay AI, Mã PIN, Thẻ NFC, Ứng dụng điện thoại" },
      { groupName: "Giao Thức", specKey: "Nhà Thông Minh", specValue: "Matter over Thread, Bluetooth 5.1, Apple Home, Google Home" },
    ],
  },
  {
    title: "Đèn Đứng Thông Minh Philips Hue Gradient Signe Floor Lamp (Pha Màu 16 Triệu Sắc Thái)",
    slug: "den-dung-philips-hue-gradient-signe-floor",
    sku: "AJ-SMR-PHL-SIGNE",
    categorySlug: "gia-dung-smart-living",
    brandName: "Philips Hue",
    regularPrice: 8990000,
    salePrice: 7690000,
    description: "Thanh đèn nhôm đứng siêu mỏng chiếu hắt tường với công nghệ dải màu Gradient hòa trộn nhiều màu sắc cùng lúc đầy mê hoặc.",
    content: "Biến căn phòng của bạn thành rạp chiếu phim đỉnh cao bằng khả năng đồng bộ ánh sáng theo hình ảnh trên TV (Hue Sync) hoặc theo giai điệu bài hát trên Spotify. Độ sáng 2550 lumens rực rỡ và tuổi thọ LED 25.000 giờ.",
    stock: 25,
    warrantyMonths: 24,
    originCountry: "Chính Hãng",
    images: [
      { url: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=85", altText: "Philips Hue Gradient Signe", isPrimary: true },
    ],
    specifications: [
      { groupName: "Ánh Sáng", specKey: "Màu Sắc & Độ Sáng", specValue: "16 triệu màu Gradient đa vùng, độ sáng 2550 lumens ở 4000K" },
      { groupName: "Kích Thước", specKey: "Chiều Cao", specValue: "Cao 145.8 cm, chân đế kim loại vững chắc chống đổ" },
    ],
  },
  {
    title: "Camera An Ninh Ngoài Trời EufyCam 3 Solar 4K (Pin Năng Lượng Mặt Trời / BionicMind AI)",
    slug: "camera-an-ninh-eufycam-3-solar-4k",
    sku: "AJ-SMR-EUF-CAM3S",
    categorySlug: "gia-dung-smart-living",
    brandName: "Ezviz",
    regularPrice: 7990000,
    salePrice: 6690000,
    description: "Tích hợp sẵn tấm pin năng lượng mặt trời hoạt động vĩnh viễn không cần tháo sạc, độ phân giải 4K Ultra HD và đèn pha chiếu sáng ban đêm.",
    content: "Trí tuệ nhân tạo BionicMind AI tự động học và nhận diện gương mặt người thân quen, phân biệt người lạ, xe cộ và thú cưng với độ chính xác 99.9%. Lưu trữ video bảo mật cục bộ miễn phí trọn đời không tốn tiền thuê bao đám mây.",
    stock: 45,
    warrantyMonths: 12,
    originCountry: "Chính Hãng VNA",
    images: [
      { url: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=1000&q=85", altText: "EufyCam 3 Solar 4K", isPrimary: true },
    ],
    specifications: [
      { groupName: "Hình Ảnh", specKey: "Độ Phân Giải", specValue: "4K (3840x2160) góc rộng 135 độ, Quay đêm có màu Color Night Vision" },
      { groupName: "Năng Lượng", specKey: "Tấm Năng Lượng Mặt Trời", specValue: "SolarPlus tích hợp chỉ cần 2 giờ nắng mỗi ngày để duy trì pin vĩnh viễn" },
    ],
  },
  {
    title: "Quạt Không Cánh Kèm Bù Ẩm Dyson Purifier Humidify+Cool PH04 (Khử Khuẩn Tia UV-C 99.9%)",
    slug: "quat-bu-am-dyson-purifier-humidify-cool-ph04",
    sku: "AJ-SMR-DYS-PH04",
    categorySlug: "gia-dung-smart-living",
    brandName: "Dyson",
    regularPrice: 24990000,
    salePrice: 21990000,
    description: "Bộ ba tính năng trong một: Lọc sạch bụi mịn, tạo độ ẩm vệ sinh bằng tia cực tím UV-C và làm mát luồng gió tự nhiên dịu êm.",
    content: "Giải pháp bảo vệ hệ hô hấp số 1 cho trẻ nhỏ và người lớn tuổi trong phòng máy lạnh. Công nghệ làm sạch sâu Deep Clean tự động tẩy cặn vôi trong bồn nước chỉ bằng một nút bấm mà không cần cọ rửa thủ công.",
    stock: 20,
    warrantyMonths: 24,
    originCountry: "Chính Hãng VNA",
    images: [
      { url: "https://images.unsplash.com/photo-1588854337221-4cf9fa96059c?auto=format&fit=crop&w=1000&q=85", altText: "Dyson Purifier PH04", isPrimary: true },
    ],
    specifications: [
      { groupName: "Khử Khuẩn Nước", specKey: "Tia Cực Tím", specValue: "Dyson Ultraviolet Cleanse tiêu diệt 99.9% vi khuẩn trong nước trước khi tạo ẩm" },
      { groupName: "Dung Tích Bình", specKey: "Thời Gian Tạo Ẩm", specValue: "Bình chứa nước 5 Lít duy trì độ ẩm lý tưởng 36 giờ liên tục" },
    ],
  },
  {
    title: "Máy Pha Cà Phê Thông Minh De'Longhi Primadonna Soul (Màn Hình Cảm Ứng 4.3 inch Bean Adapt)",
    slug: "may-pha-ca-phe-delonghi-primadonna-soul",
    sku: "AJ-SMR-DEL-PRMDN",
    categorySlug: "gia-dung-smart-living",
    brandName: "Philips Hue",
    regularPrice: 42990000,
    salePrice: 38990000,
    description: "Công nghệ Bean Adapt tự động điều chỉnh độ mịn hạt cà phê và nhiệt độ chiết xuất tối ưu cho từng loại hạt Robusta / Arabica.",
    content: "Tận hưởng ly Cappuccino chuẩn barista Ý với bọt sữa dày mịn nhờ hệ thống đánh sữa tự động LatteCrema System. Tùy biến công thức pha chế độc quyền qua ứng dụng Coffee Link trên điện thoại.",
    stock: 12,
    warrantyMonths: 24,
    originCountry: "Chính Hãng",
    images: [
      { url: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=1000&q=85", altText: "DeLonghi Primadonna Soul", isPrimary: true },
    ],
    specifications: [
      { groupName: "Áp Suất Bơm", specKey: "Áp Suất", specValue: "19 Bar chiết xuất trọn vẹn lớp crema béo ngậy" },
      { groupName: "Đồ Uống Cài Sẵn", specKey: "Thực Đơn", specValue: "21 công thức đồ uống (Espresso, Americano, Cappuccino, Flat White, Cold Brew)" },
    ],
  },
  {
    title: "Máy Hút Bụi Cầm Tay Dyson V15s Detect Submarine (Đầu Lăn Ướt Lau Sàn & Laser Soi Bụi)",
    slug: "may-hut-bui-dyson-v15s-detect-submarine",
    sku: "AJ-SMR-DYS-V15S",
    categorySlug: "gia-dung-smart-living",
    brandName: "Dyson",
    regularPrice: 27990000,
    salePrice: 24490000,
    description: "Đầu lăn ướt Dyson Submarine chuyên dụng rửa sàn cứng sạch bóng, tia laser xanh soi rõ từng hạt bụi tàng hình trên sàn nhà.",
    content: "Chiếc máy hút bụi lau sàn cầm tay toàn năng nhất thế giới. Cảm biến âm học Piezo Sensor đếm và đo kích thước hạt bụi 15.000 lần mỗi giây, tự động tăng lực hút khi đi qua khu vực bám nhiều bụi bẩn.",
    stock: 30,
    warrantyMonths: 24,
    originCountry: "Chính Hãng VNA",
    images: [
      { url: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=1000&q=85", altText: "Dyson V15s Submarine", isPrimary: true },
    ],
    specifications: [
      { groupName: "Lực Hút & Động Cơ", specKey: "Công Suất", specValue: "Động cơ Dyson Hyperdymium 240 Air Watts cực đại" },
      { groupName: "Đầu Lăn Ướt", specKey: "Submarine Roller", specValue: "8 tia phun nước siêu nhỏ làm ẩm đều trục lăn và gạt nước bẩn vào ngăn chứa riêng" },
    ],
  },
];

async function main() {
  console.log("================================================================================");
  console.log("             TIẾN TRÌNH IMPORT 100 SẢN PHẨM CÔNG NGHỆ VÀO TIDB CLOUD            ");
  console.log("================================================================================");

  const conn = await mysql.createConnection(connectionConfig);

  // 1. Lấy mapping categorySlug -> categoryId
  const [categories]: any = await conn.query("SELECT id, slug FROM categories");
  const catMap = new Map<string, string>();
  for (const c of categories) catMap.set(c.slug, c.id);

  // 2. Lấy mapping brandName -> brandId
  const [brands]: any = await conn.query("SELECT id, name FROM brands");
  const brandMap = new Map<string, string>();
  for (const b of brands) brandMap.set(b.name.toLowerCase(), b.id);

  // Tổng hợp đủ 100 sản phẩm
  const all100Products = [...PRODUCTS_100, ...REMAINING_80_PRODUCTS];
  console.log(`✓ Đã chuẩn bị sẵn ${all100Products.length} sản phẩm công nghệ cao cấp.`);

  let insertedCount = 0;
  let updatedCount = 0;
  let skippedCount = 0;

  for (const p of all100Products) {
    const categoryId = catMap.get(p.categorySlug);
    if (!categoryId) {
      console.warn(`! Bỏ qua sản phẩm "${p.title}" do không tìm thấy categorySlug "${p.categorySlug}"`);
      skippedCount++;
      continue;
    }

    const brandId = brandMap.get(p.brandName.toLowerCase()) || null;

    // Check if product already exists by slug or SKU
    const [existing]: any = await conn.query(
      "SELECT id FROM products WHERE slug = ? OR sku = ?",
      [p.slug, p.sku]
    );

    let productId = existing[0]?.id;

    if (productId) {
      // Update existing
      await conn.query(
        `UPDATE products SET 
          title = ?, description = ?, content = ?, regularPrice = ?, salePrice = ?,
          stock = ?, categoryId = ?, brandId = ?, warrantyMonths = ?, originCountry = ?,
          status = 'ACTIVE', updatedAt = NOW()
        WHERE id = ?`,
        [
          p.title,
          p.description,
          p.content,
          p.regularPrice,
          p.salePrice,
          p.stock,
          categoryId,
          brandId,
          p.warrantyMonths,
          p.originCountry,
          productId,
        ]
      );
      updatedCount++;
    } else {
      // Insert new product
      productId = randomUUID();
      await conn.query(
        `INSERT INTO products (
          id, title, slug, sku, description, content, regularPrice, salePrice,
          stock, categoryId, brandId, ratingsAvg, ratingsCount, status,
          warrantyMonths, originCountry, isFeatured, isNewArrival, isBestSeller,
          createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 4.9, 18, 'ACTIVE', ?, ?, 1, 1, 0, NOW(), NOW())`,
        [
          productId,
          p.title,
          p.slug,
          p.sku,
          p.description,
          p.content,
          p.regularPrice,
          p.salePrice,
          p.stock,
          categoryId,
          brandId,
          p.warrantyMonths,
          p.originCountry,
        ]
      );
      insertedCount++;
    }

    // Refresh images
    await conn.query("DELETE FROM product_images WHERE productId = ?", [productId]);
    if (p.images && p.images.length > 0) {
      for (let i = 0; i < p.images.length; i++) {
        const img = p.images[i];
        await conn.query(
          `INSERT INTO product_images (id, productId, url, altText, isPrimary, sortOrder, createdAt)
           VALUES (?, ?, ?, ?, ?, ?, NOW())`,
          [randomUUID(), productId, img.url, img.altText, img.isPrimary ? 1 : 0, i + 1]
        );
      }
    }

    // Refresh specifications
    await conn.query("DELETE FROM product_specifications WHERE productId = ?", [productId]);
    if (p.specifications && p.specifications.length > 0) {
      for (let i = 0; i < p.specifications.length; i++) {
        const s = p.specifications[i];
        await conn.query(
          `INSERT INTO product_specifications (id, productId, groupName, specKey, specValue, sortOrder, createdAt)
           VALUES (?, ?, ?, ?, ?, ?, NOW())`,
          [randomUUID(), productId, s.groupName, s.specKey, s.specValue, i + 1]
        );
      }
    }

    // Refresh variants if any
    await conn.query("DELETE FROM product_variants WHERE productId = ?", [productId]);
    if (p.variants && p.variants.length > 0) {
      for (let i = 0; i < p.variants.length; i++) {
        const v = p.variants[i];
        await conn.query(
          `INSERT INTO product_variants (id, productId, name, sku, price, stock, attributesJson, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
          [randomUUID(), productId, v.name, v.sku, v.price, v.stock, v.attributesJson]
        );
      }
    }

    // Ensure inventory record exists
    const [existingInv]: any = await conn.query("SELECT id FROM inventories WHERE productId = ?", [productId]);
    if (existingInv.length > 0) {
      await conn.query("UPDATE inventories SET quantity = ?, updatedAt = NOW() WHERE productId = ?", [p.stock, productId]);
    } else {
      await conn.query(
        `INSERT INTO inventories (id, productId, warehouseCode, quantity, safetyStock, lastCountAt, updatedAt)
         VALUES (?, ?, 'WH-HCM-01', ?, 5, NOW(), NOW())`,
        [randomUUID(), productId, p.stock]
      );
    }
  }

  const [totalRow]: any = await conn.query("SELECT COUNT(*) as count FROM products");
  console.log("\n================================================================================");
  console.log(`✓ KẾT QUẢ IMPORT SẢN PHẨM:`);
  console.log(`  - Thêm mới thành công:  ${insertedCount} sản phẩm`);
  console.log(`  - Cập nhật idempotent:  ${updatedCount} sản phẩm`);
  console.log(`  - Bỏ qua do lỗi:        ${skippedCount} sản phẩm`);
  console.log(`✓ TỔNG SỐ LƯỢNG SẢN PHẨM TRÊN TIDB CLOUD HIỆN TẠI: ${totalRow[0].count} SẢN PHẨM`);
  console.log("================================================================================");

  await conn.end();
}

main().catch(console.error);
