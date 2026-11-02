import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedCatalog() {
  console.log("--> Bắt đầu cập nhật danh mục và sản phẩm chuẩn thương mại điện tử...");

  // 1. Tạo hoặc cập nhật Categories
  const categoriesData = [
    {
      name: "Điện Thoại & Công Nghệ",
      slug: "dien-thoai-cong-nghe",
      description: "Smartphone flagship, điện thoại gập và thiết bị di động tiên phong từ Apple, Samsung, Xiaomi, OPPO, Vivo, Google Pixel.",
      imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
      sortOrder: 1,
    },
    {
      name: "Âm Thanh & Hi-End",
      slug: "am-thanh-hi-end",
      description: "Tai nghe chống ồn chủ động, loa phòng thu không dây và dàn âm thanh biểu tượng từ Sony, Marshall, JBL, Bose, Sennheiser, AirPods.",
      imageUrl: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80",
      sortOrder: 2,
    },
    {
      name: "Đồng Hồ & Smartwatch",
      slug: "dong-ho-smartwatch",
      description: "Smartwatch thể thao thám hiểm, theo dõi sức khỏe chuyên sâu từ Apple Watch, Garmin, Samsung Galaxy Watch, Huawei Watch.",
      imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80",
      sortOrder: 3,
    },
    {
      name: "Laptop & Máy Tính",
      slug: "laptop-may-tinh",
      description: "Máy trạm đồ họa, ultrabook mỏng nhẹ và laptop gaming đỉnh cao từ MacBook, ThinkPad, Dell XPS, ASUS ROG.",
      imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
      sortOrder: 4,
    },
    {
      name: "Gia Dụng Thông Minh",
      slug: "gia-dung-smart-living",
      description: "Robot hút bụi lau nhà thông minh, máy lọc không khí cao cấp, camera AI an ninh từ Roborock, Ecovacs, Xiaomi, Dyson, Ezviz, Philips Hue.",
      imageUrl: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80",
      sortOrder: 5,
    },
    {
      name: "Phụ Kiện Công Nghệ",
      slug: "phu-kien-cong-nghe",
      description: "Củ sạc GaN, trạm sạc đa năng, pin dự phòng dung lượng lớn, bàn phím cơ và chuột công thái học từ Anker, Belkin, Logitech, Keychron.",
      imageUrl: "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80",
      sortOrder: 6,
    },
  ];

  const categoryMap = new Map<string, string>();
  for (const cat of categoriesData) {
    const existing = await prisma.category.findUnique({ where: { slug: cat.slug } });
    if (existing) {
      await prisma.category.update({ where: { id: existing.id }, data: cat });
      categoryMap.set(cat.slug, existing.id);
    } else {
      const created = await prisma.category.create({ data: cat });
      categoryMap.set(cat.slug, created.id);
    }
  }

  // 2. Tạo hoặc cập nhật Brands
  const brandsData = [
    { name: "Apple", slug: "apple", description: "Công nghệ tiên phong từ Cupertino, California." },
    { name: "Samsung", slug: "samsung", description: "Dẫn đầu công nghệ bán dẫn, màn hình OLED và smartphone gập." },
    { name: "Xiaomi", slug: "xiaomi", description: "Hệ sinh thái công nghệ thông minh và camera Leica cao cấp." },
    { name: "OPPO", slug: "oppo", description: "Nhiếp ảnh chân dung đỉnh cao và sạc nhanh SuperVOOC." },
    { name: "Vivo", slug: "vivo", description: "Hợp tác quang học Zeiss và công nghệ xử lý hình ảnh chuyên nghiệp." },
    { name: "Google", slug: "google", description: "Trí tuệ nhân tạo Gemini tích hợp trên dòng Pixel nguyên bản." },
    { name: "Sony", slug: "sony", description: "Âm thanh Hi-Res, cảm biến hình ảnh và chống ồn đầu bảng thế giới." },
    { name: "Marshall", slug: "marshall", description: "Huyền thoại âm thanh Rock'n'Roll biểu tượng từ nước Anh." },
    { name: "JBL", slug: "jbl", description: "Âm thanh tiệc tùng JBL Pro Sound mạnh mẽ và loa di động kháng nước." },
    { name: "Bose", slug: "bose", description: "Đỉnh cao âm thanh không gian Immersive Audio và chống ồn độc quyền." },
    { name: "Sennheiser", slug: "sennheiser", description: "Tiêu chuẩn âm thanh audiophile phòng thu từ nước Đức." },
    { name: "Garmin", slug: "garmin", description: "Hệ thống định vị GPS quân đội và đồng hồ thể thao chuyên nghiệp." },
    { name: "Huawei", slug: "huawei", description: "Vật liệu kim loại lỏng siêu bền và pin smartwatch hàng đầu." },
    { name: "Lenovo", slug: "lenovo", description: "Dòng ThinkPad huyền thoại cho doanh nghiệp và Legion gaming." },
    { name: "Dell", slug: "dell", description: "Màn hình UltraSharp chuẩn đồ họa và laptop Dell XPS cao cấp." },
    { name: "ASUS", slug: "asus", description: "Laptop gaming ROG Zephyrus và dòng Zenbook OLED mỏng nhẹ." },
    { name: "Roborock", slug: "roborock", description: "Dẫn đầu thế giới về robot hút bụi lau nhà tự động hóa giặt sấy." },
    { name: "Ecovacs", slug: "ecovacs", description: "Robot dọn dẹp AI AIVI 3D và trạm sạc thông minh OMNI." },
    { name: "Dyson", slug: "dyson", description: "Công nghệ khí động học và màng lọc HEPA khử Formaldehyde." },
    { name: "Ezviz", slug: "ezviz", description: "Camera an ninh gia đình có màu ban đêm và cảm biến AI." },
    { name: "Aqara", slug: "aqara", description: "Nhà thông minh Apple HomeKit và trung tâm điều khiển Zigbee 3.0." },
    { name: "Philips Hue", slug: "philips-hue", description: "Hệ thống chiếu sáng thông minh 16 triệu màu cao cấp." },
    { name: "Anker", slug: "anker", description: "Tiên phong công nghệ sạc bán dẫn GaNPrime và pin dung lượng chuẩn." },
    { name: "Belkin", slug: "belkin", description: "Phụ kiện chuẩn Apple MFi và chuẩn sạc không dây Qi2." },
    { name: "Baseus", slug: "baseus", description: "Thiết kế phụ kiện công nghệ sáng tạo, tiện dụng và bền bỉ." },
    { name: "Spigen", slug: "spigen", description: "Ốp lưng chống sốc chuẩn quân đội Mỹ Air Cushion Technology." },
    { name: "UAG", slug: "uag", description: "Bảo vệ rơi vỡ siêu cấp 5 lớp vật liệu sợi Kevlar chuẩn quân sự." },
    { name: "Keychron", slug: "keychron", description: "Bàn phím cơ tuỳ biến kết nối đa nền tảng Mac & Windows." },
    { name: "Logitech", slug: "logitech", description: "Chuột công thái học văn phòng MX Master và switch cơ học yên tĩnh." },
    { name: "LG", slug: "lg", description: "Màn hình UltraFine tấm nền Nano IPS 5K cho nhà sáng tạo nội dung." },
  ];

  const brandMap = new Map<string, string>();
  for (const b of brandsData) {
    const existing = await prisma.brand.findUnique({ where: { slug: b.slug } });
    if (existing) {
      await prisma.brand.update({ where: { id: existing.id }, data: b });
      brandMap.set(b.slug, existing.id);
    } else {
      const created = await prisma.brand.create({ data: b });
      brandMap.set(b.slug, created.id);
    }
  }

  // 3. Danh mục sản phẩm chi tiết theo yêu cầu
  const now = new Date();
  const flashSaleEnd = new Date(now.getTime() + 72 * 3600 * 1000);

  const productsList = [
    // --- ĐIỆN THOẠI ---
    {
      title: "iPhone 16 Pro Max 256GB - Khung Titan Tự Nhiên",
      slug: "iphone-16-pro-max-256gb",
      sku: "IP16PM-256-NAT",
      categorySlug: "dien-thoai-cong-nghe",
      brandSlug: "apple",
      regularPrice: 34990000,
      salePrice: 31490000,
      stock: 65,
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: true,
      isFlashSale: true,
      ratingsAvg: 4.9,
      ratingsCount: 168,
      description: "Thiết kế Titan hàng không vũ trụ siêu nhẹ, chip Apple A18 Pro 3nm mạnh mẽ vượt bậc với nút Điều Khiển Camera chuyên nghiệp.",
      content: "iPhone 16 Pro Max trang bị màn hình 6.9 inch Super Retina XDR viền mỏng kỷ lục, cảm biến Fusion 48MP thế hệ 2 và khả năng quay video 4K 120fps Dolby Vision.",
      imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1000&q=85",
      specs: [
        { groupName: "Màn Hình", specKey: "Công Nghệ Màn Hình", specValue: "Super Retina XDR OLED 6.9 inch, ProMotion 120Hz" },
        { groupName: "Hiệu Năng", specKey: "Vi Xử Lý", specValue: "Apple A18 Pro (6 lõi CPU, 6 lõi GPU, 16 lõi NPU)" },
        { groupName: "Camera", specKey: "Camera Chính", specValue: "48MP Fusion + 48MP Ultra Wide + 12MP Telephoto 5x" },
        { groupName: "Pin & Sạc", specKey: "Thời Lượng Pin", specValue: "Lên đến 33 giờ xem video liên tục" },
      ],
      variants: [
        { name: "Titan Tự Nhiên - 256GB", sku: "IP16PM-256-NAT-VAR", price: 31490000, stock: 35, attributesJson: '{"color":"Titan Tự Nhiên","storage":"256GB"}' },
        { name: "Titan Sa Mạc - 512GB", sku: "IP16PM-512-DES-VAR", price: 37990000, stock: 30, attributesJson: '{"color":"Titan Sa Mạc","storage":"512GB"}' },
      ],
    },
    {
      title: "Samsung Galaxy S24 Ultra 5G 12GB/512GB - Xám Titan",
      slug: "samsung-galaxy-s24-ultra-512gb",
      sku: "SS-S24U-512-GRY",
      categorySlug: "dien-thoai-cong-nghe",
      brandSlug: "samsung",
      regularPrice: 33990000,
      salePrice: 28990000,
      stock: 48,
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: false,
      isFlashSale: true,
      ratingsAvg: 4.8,
      ratingsCount: 142,
      description: "Quyền năng Galaxy AI đỉnh cao, màn hình phẳng Dynamic AMOLED 2X 2600 nits chống phản chiếu và camera 200MP zoom quang 5x quang học.",
      content: "Galaxy S24 Ultra mở ra kỷ nguyên trí tuệ nhân tạo di động với tính năng Khoanh vùng tìm kiếm đa năng Google Circle to Search, Phiên dịch trực tiếp cuộc gọi và khung viền Titan siêu cấp.",
      imageUrl: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=1000&q=85",
      specs: [
        { groupName: "Màn Hình", specKey: "Màn Hình", specValue: "6.8 inch Dynamic AMOLED 2X, QHD+, 1-120Hz" },
        { groupName: "Hiệu Năng", specKey: "Chip Xử Lý", specValue: "Snapdragon 8 Gen 3 for Galaxy (4nm)" },
        { groupName: "Bút Cảm Ứng", specKey: "S-Pen", specValue: "Tích hợp sẵn trong thân máy, độ trễ 2.8ms" },
        { groupName: "Camera", specKey: "Cảm Biến Chính", specValue: "200MP F/1.7 OIS + 50MP 5x + 12MP Ultra + 10MP 3x" },
      ],
      variants: [
        { name: "Xám Titan - 512GB", sku: "SS-S24U-512-GRY-V", price: 28990000, stock: 28, attributesJson: '{"color":"Xám Titan","storage":"512GB"}' },
        { name: "Đen Titan - 256GB", sku: "SS-S24U-256-BLK-V", price: 25990000, stock: 20, attributesJson: '{"color":"Đen Titan","storage":"256GB"}' },
      ],
    },
    {
      title: "Xiaomi 14 Ultra 5G 16GB/512GB - Ống Kính Leica Summilux",
      slug: "xiaomi-14-ultra-512gb",
      sku: "MI-14U-512-WHT",
      categorySlug: "dien-thoai-cong-nghe",
      brandSlug: "xiaomi",
      regularPrice: 29990000,
      salePrice: 26490000,
      stock: 30,
      isFeatured: true,
      isBestSeller: false,
      isNewArrival: true,
      isFlashSale: false,
      ratingsAvg: 4.8,
      ratingsCount: 56,
      description: "Cụm 4 camera Leica 50MP cảm biến 1 inch LYT-900 khẩu độ vô cấp F/1.63 - F/4.0 cùng màn hình cong viền siêu tràn All Around Liquid.",
      content: "Xiaomi 14 Ultra là biểu tượng nhiếp ảnh quang học thế hệ mới với thân máy giả da nano sinh học thế hệ 3 kháng mài mòn gấp 6 lần.",
      imageUrl: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1000&q=85",
      specs: [
        { groupName: "Camera", specKey: "Cảm Biến Chính", specValue: "1 inch Sony LYT-900 50MP OIS khẩu độ cơ học F/1.63-F/4.0" },
        { groupName: "Màn Hình", specKey: "Độ Sáng Tối Đa", specValue: "3000 nits LTPO AMOLED 6.73 inch WQHD+" },
        { groupName: "Sạc", specKey: "Tốc Độ Sạc", specValue: "90W có dây (33 phút đầy) + 80W không dây" },
      ],
      variants: [
        { name: "Trắng Gốm - 512GB", sku: "MI-14U-512-WHT-V", price: 26490000, stock: 30, attributesJson: '{"color":"Trắng","storage":"512GB"}' },
      ],
    },
    {
      title: "OPPO Find X7 Ultra 5G - Hệ Thống Camera Tiềm Vọng Kép",
      slug: "oppo-find-x7-ultra-512gb",
      sku: "OPPO-FX7U-512",
      categorySlug: "dien-thoai-cong-nghe",
      brandSlug: "oppo",
      regularPrice: 26990000,
      salePrice: 24290000,
      stock: 25,
      isFeatured: false,
      isBestSeller: false,
      isNewArrival: true,
      isFlashSale: false,
      ratingsAvg: 4.7,
      ratingsCount: 38,
      description: "Smartphone đầu tiên sở hữu camera tiềm vọng kép độc quyền Hasselblad, 4 cảm biến 50MP lớn nhất phân khúc.",
      content: "OPPO Find X7 Ultra khẳng định vị thế máy ảnh di động chân thực với tông màu tự nhiên Hasselblad và chip Snapdragon 8 Gen 3.",
      imageUrl: "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=1000&q=85",
      specs: [
        { groupName: "Camera", specKey: "Ống Kính Tiềm Vọng", specValue: "Dual Periscope: 65mm (3x) + 135mm (6x) 50MP" },
        { groupName: "Pin", specKey: "Dung Lượng Pin", specValue: "5000 mAh, sạc 100W SuperVOOC" },
      ],
      variants: [],
    },
    {
      title: "Google Pixel 9 Pro XL 128GB - Trí Tuệ Nhân Tạo Google Tensor G4",
      slug: "google-pixel-9-pro-xl-128gb",
      sku: "PIXEL-9PXL-128-OBS",
      categorySlug: "dien-thoai-cong-nghe",
      brandSlug: "google",
      regularPrice: 27990000,
      salePrice: 25490000,
      stock: 20,
      isFeatured: true,
      isBestSeller: false,
      isNewArrival: true,
      isFlashSale: false,
      ratingsAvg: 4.9,
      ratingsCount: 45,
      description: "Thiết kế thanh camera thanh lịch tái định hình, chip Tensor G4 cùng Gemini Nano chạy trên thiết bị bảo mật tuyệt đối.",
      content: "Trải nghiệm Android thuần khiết mượt mà nhất với cam kết cập nhật phần mềm 7 năm từ Google và tính năng chụp đêm Night Sight huyền thoại.",
      imageUrl: "https://images.unsplash.com/photo-1529653762956-b0a27278529c?auto=format&fit=crop&w=1000&q=85",
      specs: [
        { groupName: "AI", specKey: "Trí Tuệ Nhân Tạo", specValue: "Gemini Advanced tích hợp sâu cấp hệ điều hành" },
        { groupName: "Màn Hình", specKey: "Super Actua Display", specValue: "6.8 inch OLED 3000 nits, Gorilla Glass Victus 2" },
      ],
      variants: [],
    },

    // --- ÂM THANH HI-END ---
    {
      title: "Tai Nghe Chống Ồn Cao Cấp Sony WH-1000XM5",
      slug: "tai-nghe-sony-wh-1000xm5",
      sku: "SONY-WH1000XM5-BLK",
      categorySlug: "am-thanh-hi-end",
      brandSlug: "sony",
      regularPrice: 8490000,
      salePrice: 6990000,
      stock: 50,
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: false,
      isFlashSale: true,
      ratingsAvg: 4.9,
      ratingsCount: 230,
      description: "Bộ vi xử lý V1 và QN1 tích hợp cùng 8 micro thu âm đem lại khả năng chống ồn chủ động tốt nhất thế giới.",
      content: "Sony WH-1000XM5 tái định nghĩa chuẩn mực âm thanh Hi-Res Audio Wireless với codec LDAC, màng loa sợi carbon 30mm và pin 30 giờ.",
      imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=85",
      specs: [
        { groupName: "Âm Thanh", specKey: "Chống Ồn", specValue: "Auto NC Optimizer với 8 microphone chống ồn" },
        { groupName: "Pin", specKey: "Thời Lượng", specValue: "30 giờ (Bật NC) / 40 giờ (Tắt NC), sạc 3 phút dùng 3 giờ" },
      ],
      variants: [
        { name: "Đen Nhám", sku: "SONY-WH1000XM5-BLK-V", price: 6990000, stock: 30, attributesJson: '{"color":"Đen"}' },
        { name: "Bạc Ánh Kim", sku: "SONY-WH1000XM5-SLV-V", price: 6990000, stock: 20, attributesJson: '{"color":"Bạc"}' },
      ],
    },
    {
      title: "Loa Bluetooth Marshall Stanmore III - Công Suất 80W RMS",
      slug: "loa-marshall-stanmore-iii",
      sku: "MS-STANMORE3-BLK",
      categorySlug: "am-thanh-hi-end",
      brandSlug: "marshall",
      regularPrice: 9990000,
      salePrice: 8890000,
      stock: 35,
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: false,
      isFlashSale: false,
      ratingsAvg: 4.9,
      ratingsCount: 195,
      description: "Biểu tượng âm thanh cổ điển với dải tần âm trường rộng mở, kết nối Bluetooth 5.2 LE Audio và cổng RCA mạ vàng.",
      content: "Marshall Stanmore III mang chất âm giàu năng lượng, dải trầm sâu lắng và các nút vặn analog tinh tế đậm chất vintage phòng khách.",
      imageUrl: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1000&q=85",
      specs: [
        { groupName: "Công Suất", specKey: "Tổng Công Suất", specValue: "80W RMS (1x 50W Woofer + 2x 15W Tweeter)" },
        { groupName: "Kết Nối", specKey: "Cổng Vào", specValue: "Bluetooth 5.2, AUX 3.5mm, RCA Phono" },
      ],
      variants: [
        { name: "Đen Cổ Điển", sku: "MS-STAN3-BLK-V", price: 8890000, stock: 20, attributesJson: '{"color":"Black"}' },
        { name: "Kem Vintage", sku: "MS-STAN3-CRM-V", price: 8990000, stock: 15, attributesJson: '{"color":"Cream"}' },
      ],
    },
    {
      title: "Tai Nghe Chụp Tai Apple AirPods Max (USB-C 2024)",
      slug: "apple-airpods-max-usbc-2024",
      sku: "AP-APMAX-USBC-SLV",
      categorySlug: "am-thanh-hi-end",
      brandSlug: "apple",
      regularPrice: 13990000,
      salePrice: 12490000,
      stock: 22,
      isFeatured: true,
      isBestSeller: false,
      isNewArrival: true,
      isFlashSale: false,
      ratingsAvg: 4.8,
      ratingsCount: 88,
      description: "Phiên bản nâng cấp cổng sạc USB-C và màu sắc mới, chống ồn chủ động chuyên nghiệp cùng âm thanh không gian Spatial Audio.",
      content: "Vòm đệm đầu dạng lưới thoáng khí bằng thép không gỉ, đệm tai mút hoạt tính tùy biến mang lại độ cách âm thụ động và tiện nghi tuyệt đối.",
      imageUrl: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1000&q=85",
      specs: [
        { groupName: "Âm Thanh", specKey: "Vi Xử Lý", specValue: "Chip Apple H1 trên mỗi bên tai nghe" },
        { groupName: "Cổng Sạc", specKey: "Giao Thức", specValue: "USB-C hỗ trợ sạc nhanh và nghe nhạc lossless có dây" },
      ],
      variants: [],
    },
    {
      title: "Tai Nghe Chống Ồn Bose QuietComfort Ultra Headphones",
      slug: "tai-nghe-bose-quietcomfort-ultra",
      sku: "BOSE-QC-ULTRA-BLK",
      categorySlug: "am-thanh-hi-end",
      brandSlug: "bose",
      regularPrice: 10990000,
      salePrice: 9490000,
      stock: 28,
      isFeatured: false,
      isBestSeller: false,
      isNewArrival: true,
      isFlashSale: true,
      ratingsAvg: 4.8,
      ratingsCount: 64,
      description: "Chế độ âm thanh Bose Immersive Audio sống động như rạp hát cùng công nghệ CustomTune cá nhân hóa âm học từng tai người.",
      content: "Thiết kế sang trọng với chất liệu da protein cao cấp, khớp nối nhôm chắc chắn và khả năng chống ồn vượt trội trong cabin máy bay.",
      imageUrl: "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1000&q=85",
      specs: [
        { groupName: "Âm Thanh", specKey: "Âm Thanh Không Gian", specValue: "Bose Immersive Audio tái tạo sân khấu âm thanh ảo" },
        { groupName: "Pin", specKey: "Thời Lượng Pin", specValue: "24 giờ nghe liên tục (18 giờ ở chế độ Immersive)" },
      ],
      variants: [],
    },

    // --- ĐỒNG HỒ SMARTWATCH ---
    {
      title: "Garmin Fenix 8 Sapphire 47mm - Kính Sapphire AMOLED",
      slug: "garmin-fenix-8-sapphire-47mm",
      sku: "GARMIN-F8-SAPH-47",
      categorySlug: "dong-ho-smartwatch",
      brandSlug: "garmin",
      regularPrice: 26990000,
      salePrice: 24290000,
      stock: 25,
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: true,
      isFlashSale: false,
      ratingsAvg: 5.0,
      ratingsCount: 84,
      description: "Đồng hồ GPS thám hiểm siêu bền chuẩn quân sự Hoa Kỳ MIL-STD-810H, hỗ trợ lặn độ sâu 40m và loa mic đàm thoại độc lập.",
      content: "Garmin Fenix 8 trang bị màn hình AMOLED rực rỡ, cảm biến Elevate Gen 5 đo nhịp tim điện tâm đồ ECG và bản đồ địa hình Topo đa lục địa tải sẵn.",
      imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=85",
      specs: [
        { groupName: "Độ Bền", specKey: "Kháng Nước", specValue: "10 ATM (Chuẩn lặn chuyên nghiệp 40 mét)" },
        { groupName: "Pin", specKey: "Thời Lượng Pin", specValue: "Lên đến 16 ngày ở chế độ Smartwatch" },
        { groupName: "Mặt Kính", specKey: "Chất Liệu", specValue: "Kính Sapphire chống trầy + Vành Bezel Titanium DLC" },
      ],
      variants: [],
    },
    {
      title: "Apple Watch Ultra 2 49mm - Khung Titan Dây Alpine Loop",
      slug: "apple-watch-ultra-2-49mm",
      sku: "AW-ULTRA2-49-ALP",
      categorySlug: "dong-ho-smartwatch",
      brandSlug: "apple",
      regularPrice: 21990000,
      salePrice: 19490000,
      stock: 35,
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: false,
      isFlashSale: true,
      ratingsAvg: 4.9,
      ratingsCount: 160,
      description: "Màn hình 3000 nits sáng nhất từng có, chip S9 SiP thao tác Chạm Hai Lần Double Tap không chạm và GPS băng tần kép L1 & L5.",
      content: "Dành riêng cho vận động viên sức bền và các nhà thám hiểm đỉnh cao với còi báo động khẩn cấp 86-decibel và chống nước 100m.",
      imageUrl: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=1000&q=85",
      specs: [
        { groupName: "Màn Hình", specKey: "Độ Sáng", specValue: "3000 nits Always-On Retina Display" },
        { groupName: "Kháng Nước", specKey: "Chuẩn Lặn", specValue: "100 mét WR100, đo độ sâu EN13319 đến 40 mét" },
      ],
      variants: [],
    },
    {
      title: "Samsung Galaxy Watch Ultra 47mm LTE - Titanium Trắng",
      slug: "samsung-galaxy-watch-ultra-47mm",
      sku: "SS-GW-ULTRA-WHT",
      categorySlug: "dong-ho-smartwatch",
      brandSlug: "samsung",
      regularPrice: 16990000,
      salePrice: 14490000,
      stock: 30,
      isFeatured: false,
      isBestSeller: false,
      isNewArrival: true,
      isFlashSale: false,
      ratingsAvg: 4.7,
      ratingsCount: 52,
      description: "Khung đệm Titanium bảo vệ góc cạnh, chip 3nm thế hệ mới và tính năng chấm điểm năng lượng Energy Score thông minh Galaxy AI.",
      content: "Chống chịu nhiệt độ khắc nghiệt từ -20°C đến 55°C, độ cao 9000 mét và pin kéo dài tới 100 giờ ở chế độ tiết kiệm năng lượng.",
      imageUrl: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=1000&q=85",
      specs: [
        { groupName: "Kháng Nước", specKey: "Chuẩn Chống Nước", specValue: "10 ATM + IP68 + MIL-STD-810H" },
        { groupName: "Cảm Biến", specKey: "BioActive Sensor", specValue: "Đo ECG, Huyết Áp, Thành Phần Cơ Thể BIA, Chỉ Số AGEs" },
      ],
      variants: [],
    },

    // --- LAPTOP & MÁY TÍNH ---
    {
      title: "Apple MacBook Pro 16 inch M3 Max (36GB RAM / 1TB SSD)",
      slug: "apple-macbook-pro-16-m3-max",
      sku: "MBP16-M3MAX-BLK",
      categorySlug: "laptop-may-tinh",
      brandSlug: "apple",
      regularPrice: 89990000,
      salePrice: 82490000,
      stock: 15,
      isFeatured: true,
      isBestSeller: false,
      isNewArrival: true,
      isFlashSale: false,
      ratingsAvg: 5.0,
      ratingsCount: 42,
      description: "Cỗ máy đồ họa quái vật với chip M3 Max 14 lõi CPU và 30 lõi GPU, màn hình Liquid Retina XDR độ sáng duy trì 1000 nits toàn khung.",
      content: "MacBook Pro 16 inch mang lại thời lượng pin kỷ lục 22 giờ, cổng kết nối đa dạng HDMI 2.1, khe cắm thẻ SDXC và sạc MagSafe 3 tiện lợi.",
      imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=85",
      specs: [
        { groupName: "Hiệu Năng", specKey: "Vi Xử Lý", specValue: "Apple M3 Max (14 CPU, 30 GPU, Băng thông bộ nhớ 300GB/s)" },
        { groupName: "Bộ Nhớ", specKey: "RAM & Ổ Cứng", specValue: "36GB Unified Memory / 1TB SSD NVMe" },
        { groupName: "Màn Hình", specKey: "Tấm Nền", specValue: "16.2 inch Mini-LED Liquid Retina XDR (3456 x 2234), 120Hz" },
      ],
      variants: [],
    },
    {
      title: "Lenovo ThinkPad X1 Carbon Gen 12 (Core Ultra 7 / 32GB / 1TB)",
      slug: "lenovo-thinkpad-x1-carbon-gen-12",
      sku: "TP-X1C-GEN12-BLK",
      categorySlug: "laptop-may-tinh",
      brandSlug: "lenovo",
      regularPrice: 52990000,
      salePrice: 47990000,
      stock: 18,
      isFeatured: false,
      isBestSeller: true,
      isNewArrival: true,
      isFlashSale: false,
      ratingsAvg: 4.8,
      ratingsCount: 36,
      description: "Chuẩn mực laptop doanh nhân cao cấp bằng sợi carbon siêu nhẹ 1.09kg, bàn phím gõ êm số 1 thế giới và màn hình 2.8K OLED 120Hz.",
      content: "ThinkPad X1 Carbon Gen 12 tích hợp NPU Intel AI Boost tăng tốc xử lý tác vụ thông minh, camera 8MP khử nhiễu tự động và bảo mật vân tay kết hợp nhận diện khuôn mặt IR.",
      imageUrl: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1000&q=85",
      specs: [
        { groupName: "Trọng Lượng", specKey: "Khối Lượng Thân Máy", specValue: "1.09 kg (Sợi carbon kết hợp hợp kim Magie)" },
        { groupName: "Màn Hình", specKey: "Độ Phân Giải", specValue: "14 inch 2.8K OLED (2880 x 1800), 100% DCI-P3, HDR500" },
      ],
      variants: [],
    },

    // --- GIA DỤNG THÔNG MINH ---
    {
      title: "Robot Hút Bụi Lau Nhà Roborock S8 MaxV Ultra - Giặt Sấy Tự Động",
      slug: "robot-hut-bui-roborock-s8-maxv-ultra",
      sku: "ROBOROCK-S8MU-BLK",
      categorySlug: "gia-dung-smart-living",
      brandSlug: "roborock",
      regularPrice: 32990000,
      salePrice: 28490000,
      stock: 25,
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: true,
      isFlashSale: true,
      ratingsAvg: 4.9,
      ratingsCount: 110,
      description: "Lực hút siêu cấp 10.000 Pa, chổi cạnh FlexiArm quét sát chân tường và trạm sạc giặt giẻ nước nóng 60°C sấy khô khí ấm.",
      content: "Roborock S8 MaxV Ultra tích hợp trợ lý giọng nói 'Hello Rocky' ngay cả khi mất mạng, camera AI tránh chướng ngại vật Reactive AI 2.0 nhận diện hơn 73 loại vật thể.",
      imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=85",
      specs: [
        { groupName: "Lực Hút", specKey: "Công Suất Hút", specValue: "10.000 Pa HyperForce" },
        { groupName: "Dock Sạc", specKey: "Trạm Điều Khiển 8 Trong 1", specValue: "Tự động giặt nước nóng 60°C, tự động cấp xả nước, sấy khô 45°C" },
      ],
      variants: [],
    },
    {
      title: "Máy Lọc Không Khí Xiaomi Smart Air Purifier 4 Pro",
      slug: "may-loc-khong-khi-xiaomi-4-pro",
      sku: "MI-AIR-4PRO-WHT",
      categorySlug: "gia-dung-smart-living",
      brandSlug: "xiaomi",
      regularPrice: 5990000,
      salePrice: 4790000,
      stock: 45,
      isFeatured: false,
      isBestSeller: true,
      isNewArrival: false,
      isFlashSale: false,
      ratingsAvg: 4.8,
      ratingsCount: 175,
      description: "Lọc hạt bụi mịn PM2.5, phấn hoa và mùi hôi trong phòng diện tích tới 60m², cảm biến laser kép hiển thị chất lượng không khí OLED.",
      content: "Hệ thống màng lọc 3 trong 1 hiệu suất lọc 99.97% hạt 0.3 micron, tạo ion âm mang lại cảm giác trong lành như giữa rừng nguyên sinh.",
      imageUrl: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=1000&q=85",
      specs: [
        { groupName: "Công Suất", specKey: "CADR Hạt", specValue: "500 m³/h (Phù hợp phòng 35 - 60 m²)" },
        { groupName: "Màng Lọc", specKey: "Khử Mùi", specValue: "650.000mg than hoạt tính cao cấp hấp phụ Formaldehyde" },
      ],
      variants: [],
    },

    // --- PHỤ KIỆN CÔNG NGHỆ ---
    {
      title: "Củ Sạc Nhanh Anker Prime 100W GaN 3 Cổng (2C1A)",
      slug: "cu-sac-nhanh-anker-prime-100w-gan",
      sku: "ANKER-PRIME-100W",
      categorySlug: "phu-kien-cong-nghe",
      brandSlug: "anker",
      regularPrice: 1890000,
      salePrice: 1490000,
      stock: 80,
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: true,
      isFlashSale: true,
      ratingsAvg: 4.9,
      ratingsCount: 310,
      description: "Công nghệ bán dẫn GaNPrime siêu nhỏ gọn, phân bổ công suất thông minh PowerIQ 4.0 và kiểm soát nhiệt độ ActiveShield 2.0.",
      content: "Sạc đầy cùng lúc MacBook Pro, iPhone 16 Pro Max và tai nghe không dây với 1 củ sạc duy nhất nhỏ hơn 43% so với củ sạc 96W thông thường.",
      imageUrl: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=1000&q=85",
      specs: [
        { groupName: "Công Suất", specKey: "Tổng Đầu Ra", specValue: "100W Max (Cổng C1/C2 đơn lên đến 100W)" },
        { groupName: "Kích Thước", specKey: "Trọng Lượng", specValue: "183 gram, phích cắm gập tiện dụng du lịch" },
      ],
      variants: [],
    },
    {
      title: "Bàn Phím Cơ Không Dây Keychron Q1 Pro QMK/VIA (Gateron Jupiter Red)",
      slug: "ban-phim-co-keychron-q1-pro",
      sku: "KEYCHRON-Q1PRO-RED",
      categorySlug: "phu-kien-cong-nghe",
      brandSlug: "keychron",
      regularPrice: 4890000,
      salePrice: 4290000,
      stock: 35,
      isFeatured: false,
      isBestSeller: false,
      isNewArrival: true,
      isFlashSale: false,
      ratingsAvg: 4.9,
      ratingsCount: 92,
      description: "Khung nhôm nguyên khối cắt CNC anodized cao cấp, cấu trúc Double-Gasket giảm chấn êm ái và hỗ trợ map phím tự do QMK/VIA.",
      content: "Kết nối không dây Bluetooth 5.1 cùng lúc 3 thiết bị Mac/Windows và núm xoay đa năng kim loại điều khiển âm lượng mượt mà.",
      imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1000&q=85",
      specs: [
        { groupName: "Cấu Trúc", specKey: "Thân Vỏ", specValue: "Nhôm 6063 CNC nguyên khối, tổng trọng lượng 1.73 kg" },
        { groupName: "Switch", specKey: "Loại Phím", specValue: "Gateron Jupiter Red Switch đã lube sẵn từ nhà máy" },
      ],
      variants: [],
    },
    {
      title: "Chuột Không Dây Công Thái Học Logitech MX Master 3S",
      slug: "chuot-logitech-mx-master-3s",
      sku: "LOGI-MX3S-GRY",
      categorySlug: "phu-kien-cong-nghe",
      brandSlug: "logitech",
      regularPrice: 2890000,
      salePrice: 2290000,
      stock: 65,
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: false,
      isFlashSale: false,
      ratingsAvg: 4.9,
      ratingsCount: 280,
      description: "Con lăn kim loại MagSpeed cuộn 1.000 dòng/giây, nút click giảm 90% tiếng ồn và cảm biến quang học 8.000 DPI di chuyển trên mọi bề mặt kính.",
      content: "Thiết kế nâng đỡ bàn tay tự nhiên giảm mỏi cơ, hỗ trợ tính năng Logitech Flow copy paste dữ liệu giữa 3 máy tính khác hệ điều hành.",
      imageUrl: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=1000&q=85",
      specs: [
        { groupName: "Cảm Biến", specKey: "Độ Nhạy DPI", specValue: "Darkfield 200 - 8000 DPI (Bước chỉnh 50 DPI)" },
        { groupName: "Pin", specKey: "Thời Gian Sử Dụng", specValue: "Lên đến 70 ngày sau một lần sạc đầy USB-C" },
      ],
      variants: [],
    },
    {
      title: "Màn Hình Đồ Họa Dell UltraSharp U2724DE 27 inch 2K Thunderbolt 4",
      slug: "man-hinh-dell-ultrasharp-u2724de-27-inch",
      sku: "DELL-U2724DE-2K",
      categorySlug: "phu-kien-cong-nghe",
      brandSlug: "dell",
      regularPrice: 13990000,
      salePrice: 12490000,
      stock: 20,
      isFeatured: true,
      isBestSeller: false,
      isNewArrival: true,
      isFlashSale: false,
      ratingsAvg: 4.9,
      ratingsCount: 65,
      description: "Tấm nền IPS Black độ tương phản 2000:1 đầu ngành, tần số quét 120Hz mượt mà và trạm kết nối Thunderbolt 4 cấp nguồn 90W.",
      content: "Độ phủ màu 98% DCI-P3 và 100% sRGB với độ sai lệch màu Delta E < 2 hiệu chuẩn sẵn từ nhà máy, tích hợp cảm biến ánh sáng tự động điều chỉnh nhiệt độ màu.",
      imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1000&q=85",
      specs: [
        { groupName: "Màn Hình", specKey: "Tấm Nền", specValue: "27 inch IPS Black QHD (2560 x 1440), 120Hz, ComfortView Plus" },
        { groupName: "Cổng Kết Nối", specKey: "Hub Kết Nối", specValue: "Thunderbolt 4 (90W PD), RJ45 2.5Gbps, DisplayPort 1.4, HDMI" },
      ],
      variants: [],
    },
  ];

  console.log(`--> Tiến hành tạo/cập nhật ${productsList.length} sản phẩm thực tế...`);

  for (const item of productsList) {
    const categoryId = categoryMap.get(item.categorySlug);
    const brandId = brandMap.get(item.brandSlug);

    if (!categoryId) {
      console.warn(`Category slug not found: ${item.categorySlug}`);
      continue;
    }

    const productPayload = {
      title: item.title,
      slug: item.slug,
      sku: item.sku,
      description: item.description,
      content: item.content,
      regularPrice: item.regularPrice,
      salePrice: item.salePrice,
      stock: item.stock,
      isFeatured: item.isFeatured,
      isBestSeller: item.isBestSeller,
      isNewArrival: item.isNewArrival,
      isFlashSale: item.isFlashSale,
      flashSaleStart: item.isFlashSale ? now : null,
      flashSaleEnd: item.isFlashSale ? flashSaleEnd : null,
      ratingsAvg: item.ratingsAvg,
      ratingsCount: item.ratingsCount,
      categoryId,
      brandId: brandId || null,
      status: "ACTIVE",
    };

    const existingProduct = await prisma.product.findUnique({ where: { slug: item.slug } });
    let product;

    if (existingProduct) {
      product = await prisma.product.update({
        where: { id: existingProduct.id },
        data: productPayload,
      });
      // Xoá specs và variants cũ để cập nhật mới
      await prisma.productSpecification.deleteMany({ where: { productId: product.id } });
      await prisma.productImage.deleteMany({ where: { productId: product.id } });
    } else {
      product = await prisma.product.create({
        data: productPayload,
      });
    }

    // Thêm ảnh sản phẩm
    await prisma.productImage.create({
      data: {
        productId: product.id,
        url: item.imageUrl,
        altText: item.title,
        isPrimary: true,
        sortOrder: 1,
      },
    });

    // Thêm thông số kỹ thuật
    if (item.specs && item.specs.length > 0) {
      for (let i = 0; i < item.specs.length; i++) {
        const sp = item.specs[i];
        await prisma.productSpecification.create({
          data: {
            productId: product.id,
            groupName: sp.groupName,
            specKey: sp.specKey,
            specValue: sp.specValue,
            sortOrder: i + 1,
          },
        });
      }
    }

    // Thêm biến thể nếu có
    if (item.variants && item.variants.length > 0) {
      for (const v of item.variants) {
        const existVar = await prisma.productVariant.findUnique({ where: { sku: v.sku } });
        if (!existVar) {
          await prisma.productVariant.create({
            data: {
              productId: product.id,
              name: v.name,
              sku: v.sku,
              price: v.price,
              stock: v.stock,
              attributesJson: v.attributesJson,
            },
          });
        }
      }
    }

    // Thêm bản ghi tồn kho ban đầu
    const existingInv = await prisma.inventory.findFirst({ where: { productId: product.id } });
    if (!existingInv) {
      await prisma.inventory.create({
        data: {
          productId: product.id,
          warehouseCode: "WH-HCM-01",
          quantity: item.stock,
          reservedQty: 0,
          safetyStock: 10,
        },
      });
    }

    // Thêm lịch sử giá ban đầu
    const existingPriceHist = await prisma.productPriceHistory.findFirst({ where: { productId: product.id } });
    if (!existingPriceHist) {
      await prisma.productPriceHistory.create({
        data: {
          productId: product.id,
          oldPrice: item.regularPrice,
          newPrice: item.salePrice || item.regularPrice,
          changeReason: "Niêm yết giá chính thức mở bán",
        },
      });
    }
  }

  // 4. Thiết lập quan hệ tương thích phụ kiện (ProductCompatibility)
  console.log("--> Thiết lập quan hệ tương thích phụ kiện...");
  const pIphone = await prisma.product.findUnique({ where: { slug: "iphone-16-pro-max-256gb" } });
  const pMacbook = await prisma.product.findUnique({ where: { slug: "apple-macbook-pro-16-m3-max" } });
  const pAnker100w = await prisma.product.findUnique({ where: { slug: "cu-sac-nhanh-anker-prime-100w-gan" } });
  const pSonyXM5 = await prisma.product.findUnique({ where: { slug: "tai-nghe-sony-wh-1000xm5" } });
  const pDellMonitor = await prisma.product.findUnique({ where: { slug: "man-hinh-dell-ultrasharp-u2724de-27-inch" } });

  if (pAnker100w && pIphone) {
    await prisma.productCompatibility.upsert({
      where: { productId_compatibleProductId: { productId: pIphone.id, compatibleProductId: pAnker100w.id } },
      update: {},
      create: {
        productId: pIphone.id,
        compatibleProductId: pAnker100w.id,
        compatibilityType: "ACCESSORY",
        notes: "Tương thích chuẩn sạc nhanh Power Delivery 3.0 sạc 50% trong 30 phút",
      },
    });
  }

  if (pDellMonitor && pMacbook) {
    await prisma.productCompatibility.upsert({
      where: { productId_compatibleProductId: { productId: pMacbook.id, compatibleProductId: pDellMonitor.id } },
      update: {},
      create: {
        productId: pMacbook.id,
        compatibleProductId: pDellMonitor.id,
        compatibilityType: "ACCESSORY",
        notes: "Cáp đơn Thunderbolt 4 truyền hình ảnh 2K 120Hz và sạc ngược 90W PD",
      },
    });
  }

  console.log("✓ Hoàn tất cập nhật danh mục và sản phẩm chuẩn thương mại điện tử!");
}

if (require.main === module) {
  seedCatalog()
    .catch((err) => {
      console.error("Lỗi khi seed catalog:", err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

