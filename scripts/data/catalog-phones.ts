export interface ItemSeed {
  title: string;
  slug: string;
  sku: string;
  categorySlug: string;
  brandSlug: string;
  regularPrice: number;
  salePrice?: number;
  stock: number;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  isFlashSale?: boolean;
  ratingsAvg: number;
  ratingsCount: number;
  description: string;
  content: string;
  imageUrl: string;
  specs: { groupName: string; specKey: string; specValue: string }[];
}

export const PHONES_CATALOG: ItemSeed[] = [
  // --- APPLE ---
  {
    title: "iPhone 16 Pro Max 256GB - Titan Sa Mạc",
    slug: "iphone-16-pro-max-256gb",
    sku: "IP16PM-256-DESERT",
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
    description: "Khung Titan hàng không vũ trụ siêu nhẹ, chip Apple A18 Pro 3nm mạnh mẽ và phím Điều Khiển Camera thế hệ mới.",
    content: "Màn hình 6.9 inch Super Retina XDR OLED ProMotion 120Hz viền mỏng kỷ lục, cảm biến 48MP Fusion và zoom quang học 5x.",
    imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1000&q=85",
    specs: [
      { groupName: "Màn Hình", specKey: "Màn Hình", specValue: "6.9 inch Super Retina XDR 120Hz" },
      { groupName: "Vi Xử Lý", specKey: "Chipset", specValue: "Apple A18 Pro (3nm)" },
      { groupName: "Bộ Nhớ", specKey: "Bộ Nhớ Trong", specValue: "256GB NVMe" },
      { groupName: "Camera", specKey: "Camera Sau", specValue: "48MP Fusion + 48MP Ultra Wide + 12MP Tele 5x" }
    ],
  },
  {
    title: "iPhone 16 Pro Max 512GB - Titan Tự Nhiên",
    slug: "iphone-16-pro-max-512gb",
    sku: "IP16PM-512-NAT",
    categorySlug: "dien-thoai-cong-nghe",
    brandSlug: "apple",
    regularPrice: 40990000,
    salePrice: 37990000,
    stock: 40,
    isFeatured: true,
    ratingsAvg: 4.9,
    ratingsCount: 88,
    description: "Dung lượng nửa Terabyte thoải mái lưu trữ video ProRes 4K 120fps chuẩn Hollywood, chip A18 Pro mạnh nhất thế giới.",
    content: "Hỗ trợ chuẩn quay phim Log ACES chuyên nghiệp và công nghệ âm thanh phòng thu 4 micro Studio-quality.",
    imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1000&q=85",
    specs: [
      { groupName: "Bộ Nhớ", specKey: "Dung Lượng Lưu Trữ", specValue: "512GB NVMe siêu tốc" },
      { groupName: "Vi Xử Lý", specKey: "Chipset", specValue: "Apple A18 Pro (3nm)" },
      { groupName: "Camera", specKey: "Quay Phim", specValue: "4K 120 fps Dolby Vision HDR" }
    ],
  },
  {
    title: "iPhone 16 Pro 128GB - Titan Trắng",
    slug: "iphone-16-pro-128gb",
    sku: "IP16P-128-WHT",
    categorySlug: "dien-thoai-cong-nghe",
    brandSlug: "apple",
    regularPrice: 28990000,
    salePrice: 26990000,
    stock: 50,
    isFeatured: true,
    ratingsAvg: 4.8,
    ratingsCount: 95,
    description: "Thiết kế nhỏ gọn 6.3 inch với sức mạnh A18 Pro nguyên bản, hỗ trợ camera zoom quang 5x chuyên nghiệp.",
    content: "Nâng cấp màn hình lớn hơn với viền siêu mỏng, thời lượng pin tăng cường và phím Camera Control cảm ứng lực.",
    imageUrl: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=1000&q=85",
    specs: [
      { groupName: "Màn Hình", specKey: "Kích Thước", specValue: "6.3 inch Super Retina XDR 120Hz" },
      { groupName: "Vi Xử Lý", specKey: "Chipset", specValue: "Apple A18 Pro" },
      { groupName: "Camera", specKey: "Zoom Quang", specValue: "Tele 5x Tetraprism" }
    ],
  },
  {
    title: "iPhone 16 Plus 128GB - Hồng Phớt",
    slug: "iphone-16-plus-128gb",
    sku: "IP16PL-128-PNK",
    categorySlug: "dien-thoai-cong-nghe",
    brandSlug: "apple",
    regularPrice: 25990000,
    salePrice: 23490000,
    stock: 45,
    ratingsAvg: 4.8,
    ratingsCount: 52,
    description: "Màn hình lớn 6.7 inch rực rỡ, pin trâu nhất lịch sử iPhone và chip Apple A18 sẵn sàng cho Apple Intelligence.",
    content: "Camera kép xếp dọc hỗ trợ quay Spatial Video, phím Action Button đa năng và Camera Control tiện lợi.",
    imageUrl: "https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&w=1000&q=85",
    specs: [
      { groupName: "Pin", specKey: "Thời Lượng", specValue: "Lên đến 27 giờ phát video liên tục" },
      { groupName: "Màn Hình", specKey: "Kích Thước", specValue: "6.7 inch Super Retina XDR" }
    ],
  },
  {
    title: "iPhone 16 128GB - Xanh Mòng Két (Teal)",
    slug: "iphone-16-128gb",
    sku: "IP16-128-TEA",
    categorySlug: "dien-thoai-cong-nghe",
    brandSlug: "apple",
    regularPrice: 22990000,
    salePrice: 20990000,
    stock: 80,
    isNewArrival: true,
    ratingsAvg: 4.7,
    ratingsCount: 64,
    description: "Mặt lưng kính pha màu rực rỡ, chip Apple A18 hỗ trợ đầy đủ tính năng thông minh Apple Intelligence.",
    content: "Camera dọc hỗ trợ quay Spatial Video cho kính Apple Vision Pro, trang bị Action Button và Camera Control.",
    imageUrl: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=1000&q=85",
    specs: [
      { groupName: "Màn Hình", specKey: "Màn Hình", specValue: "OLED Super Retina XDR 6.1 inch 2000 nits" },
      { groupName: "Vi Xử Lý", specKey: "Chipset", specValue: "Apple A18 thế hệ mới" }
    ],
  },
  {
    title: "iPhone 16 256GB - Xanh Lưu Ly (Ultramarine)",
    slug: "iphone-16-256gb",
    sku: "IP16-256-BLU",
    categorySlug: "dien-thoai-cong-nghe",
    brandSlug: "apple",
    regularPrice: 25990000,
    salePrice: 23990000,
    stock: 60,
    isBestSeller: true,
    ratingsAvg: 4.8,
    ratingsCount: 79,
    description: "Sắc xanh Ultramarine nổi bật nhất bộ sưu tập iPhone 16, dung lượng 256GB thoải mái cài đặt game đồ họa cao.",
    content: "Chip Apple A18 tối ưu hóa các tác vụ AI tạo sinh, camera góc rộng 48MP hỗ trợ chụp macro cận cảnh.",
    imageUrl: "https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&w=1000&q=85",
    specs: [
      { groupName: "Camera", specKey: "Tính Năng Chụp", specValue: "Macro cận cảnh 2cm + 48MP Fusion" }
    ],
  },
  {
    title: "iPhone 15 Pro Max 256GB - Titan Tự Nhiên",
    slug: "iphone-15-pro-max-256gb",
    sku: "IP15PM-256-NAT",
    categorySlug: "dien-thoai-cong-nghe",
    brandSlug: "apple",
    regularPrice: 29990000,
    salePrice: 27490000,
    stock: 40,
    isBestSeller: true,
    ratingsAvg: 4.8,
    ratingsCount: 310,
    description: "Flagship bán chạy nhất năm với khung Titan bền bỉ, cổng USB-C 3 tốc độ 10Gbps và chip A17 Pro chơi game ray tracing.",
    content: "Màn hình Dynamic Island 6.7 inch, hệ thống 3 camera chất lượng đỉnh cao và khả năng quay video ProRes Log.",
    imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1000&q=85",
    specs: [
      { groupName: "Vi Xử Lý", specKey: "Chipset", specValue: "Apple A17 Pro 3nm" }
    ],
  },
  {
    title: "iPhone 15 128GB - Xanh Lá Nhạt",
    slug: "iphone-15-128gb",
    sku: "IP15-128-GRN",
    categorySlug: "dien-thoai-cong-nghe",
    brandSlug: "apple",
    regularPrice: 19990000,
    salePrice: 17990000,
    stock: 75,
    ratingsAvg: 4.7,
    ratingsCount: 142,
    description: "Trang bị Dynamic Island linh hoạt, cổng sạc Type-C chuẩn quốc tế và camera 48MP chụp sắc nét chi tiết.",
    content: "Kính lưng pha màu mờ chống bám vân tay, chip Apple A16 Bionic vận hành trơn tru mượt mà mọi ứng dụng.",
    imageUrl: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=1000&q=85",
    specs: [
      { groupName: "Cổng Kết Nối", specKey: "Giao Tiếp", specValue: "USB Type-C tiện dụng" }
    ],
  },
  {
    title: "iPhone 14 128GB - Đen Midnight",
    slug: "iphone-14-128gb",
    sku: "IP14-128-MID",
    categorySlug: "dien-thoai-cong-nghe",
    brandSlug: "apple",
    regularPrice: 16990000,
    salePrice: 15490000,
    stock: 90,
    ratingsAvg: 4.6,
    ratingsCount: 215,
    description: "Lựa chọn kinh tế và ổn định cao cho hệ sinh thái Apple, hỗ trợ tính năng Phát hiện va chạm và pin bền bỉ cả ngày.",
    content: "Thiết kế tai thỏ kinh điển, màn hình Super Retina XDR sắc nét và camera xử lý thiếu sáng Photonic Engine.",
    imageUrl: "https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&w=1000&q=85",
    specs: [
      { groupName: "An Toàn", specKey: "Cảm Biến Khẩn Cấp", specValue: "Phát hiện va chạm xe hơi (Crash Detection)" }
    ],
  },
  {
    title: "iPhone 13 128GB - Trắng Ánh Sao (Starlight)",
    slug: "iphone-13-128gb",
    sku: "IP13-128-STA",
    categorySlug: "dien-thoai-cong-nghe",
    brandSlug: "apple",
    regularPrice: 13990000,
    salePrice: 12490000,
    stock: 110,
    ratingsAvg: 4.7,
    ratingsCount: 380,
    description: "Mẫu iPhone quốc dân sở hữu thiết kế vuông vắn hiện đại, camera chéo đặc trưng và chip A15 Bionic vẫn cực kỳ mạnh mẽ.",
    content: "Chế độ Điện Ảnh Cinematic Mode xóa phông chuyển nét tự động chuyên nghiệp chuẩn đạo diễn.",
    imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1000&q=85",
    specs: [
      { groupName: "Camera", specKey: "Chống Rung", specValue: "Sensor-Shift OIS trên cảm biến chính" }
    ],
  },
  {
    title: "iPad Pro M4 13 inch 256GB Wi-Fi - Đen Không Gian (Ultra Retina XDR)",
    slug: "ipad-pro-m4-13-inch-256gb",
    sku: "IPAD-M4-13-256-BLK",
    categorySlug: "dien-thoai-cong-nghe",
    brandSlug: "apple",
    regularPrice: 37990000,
    salePrice: 34990000,
    stock: 35,
    isFeatured: true,
    isNewArrival: true,
    ratingsAvg: 5.0,
    ratingsCount: 64,
    description: "Độ mỏng kỷ lục 5.1mm mỏng nhất lịch sử Apple, màn hình OLED 2 lớp Tandem OLED sáng 1600 nits và chip Apple M4 đỉnh cao.",
    content: "Sức mạnh đồ họa tương đương máy trạm với chip M4 10 nhân CPU và 10 nhân GPU hỗ trợ phần cứng dò tia Mesh Shading.",
    imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=1000&q=85",
    specs: [
      { groupName: "Màn Hình", specKey: "Tấm Nền", specValue: "Tandem OLED Ultra Retina XDR 120Hz 1600 nits" },
      { groupName: "Vi Xử Lý", specKey: "Chipset", specValue: "Apple M4 10-core 3nm thế hệ thứ 2" }
    ],
  },
  {
    title: "iPad Air M2 11 inch 128GB Wi-Fi - Xanh Dương Nhạt",
    slug: "ipad-air-m2-11-inch-128gb",
    sku: "IPAD-AIR-M2-11-BLU",
    categorySlug: "dien-thoai-cong-nghe",
    brandSlug: "apple",
    regularPrice: 16990000,
    salePrice: 15490000,
    stock: 55,
    ratingsAvg: 4.8,
    ratingsCount: 92,
    description: "Trang bị chip Apple M2 tốc độ cao, hỗ trợ bút Apple Pencil Pro mới và bàn phím Magic Keyboard tiện lợi cho học tập & đồ họa.",
    content: "Thiết kế nhôm tái chế nguyên khối bền đẹp, Touch ID tích hợp nút nguồn mở khóa một chạm siêu nhạy.",
    imageUrl: "https://images.unsplash.com/photo-1561154464-82e9adf32764?auto=format&fit=crop&w=1000&q=85",
    specs: [
      { groupName: "Vi Xử Lý", specKey: "Chipset", specValue: "Apple M2 8-core CPU / 10-core GPU" }
    ],
  },

  // --- SAMSUNG ---
  {
    title: "Samsung Galaxy S24 Ultra 5G 12GB/512GB - Xám Titan",
    slug: "samsung-galaxy-s24-ultra-512gb",
    sku: "SS-S24U-512-GRY",
    categorySlug: "dien-thoai-cong-nghe",
    brandSlug: "samsung",
    regularPrice: 33990000,
    salePrice: 28990000,
    stock: 55,
    isFeatured: true,
    isBestSeller: true,
    ratingsAvg: 4.9,
    ratingsCount: 180,
    description: "Khung Titan cứng cáp, kính chống lóa Corning Gorilla Armor đỉnh nhất thế giới và trọn bộ quyền năng Galaxy AI.",
    content: "Bút S-Pen tích hợp trong thân máy, màn hình Dynamic AMOLED 2X phẳng 2600 nits và camera zoom 50MP 5x quang học.",
    imageUrl: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=1000&q=85",
    specs: [
      { groupName: "Màn Hình", specKey: "Độ Sáng", specValue: "Dynamic AMOLED 2X 2600 nits chống phản chiếu" },
      { groupName: "Vi Xử Lý", specKey: "Chipset", specValue: "Snapdragon 8 Gen 3 for Galaxy" }
    ],
  },
  {
    title: "Samsung Galaxy S24 Ultra 5G 12GB/256GB - Đen Titan",
    slug: "samsung-galaxy-s24-ultra-256gb",
    sku: "SS-S24U-256-BLK",
    categorySlug: "dien-thoai-cong-nghe",
    brandSlug: "samsung",
    regularPrice: 29990000,
    salePrice: 25490000,
    stock: 70,
    isBestSeller: true,
    ratingsAvg: 4.8,
    ratingsCount: 145,
    description: "Sức mạnh vi xử lý Snapdragon 8 Gen 3 for Galaxy bứt phá hiệu năng, khoanh tròn để tìm kiếm Circle to Search thông minh.",
    content: "Camera chính 200MP bắt trọn chi tiết sắc nét ban đêm Nightography, chống rung OIS góc rộng hơn.",
    imageUrl: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=1000&q=85",
    specs: [
      { groupName: "Camera", specKey: "Độ Phân Giải", specValue: "200MP Wide + 50MP Periscope + 12MP Ultra + 10MP Tele" }
    ],
  },
  {
    title: "Samsung Galaxy S24 Plus 5G 12GB/256GB - Tím Cobalt",
    slug: "samsung-galaxy-s24-plus-256gb",
    sku: "SS-S24P-256-PUR",
    categorySlug: "dien-thoai-cong-nghe",
    brandSlug: "samsung",
    regularPrice: 24990000,
    salePrice: 21490000,
    stock: 45,
    ratingsAvg: 4.7,
    ratingsCount: 65,
    description: "Màn hình nâng cấp độ phân giải 2K+ QHD sắc nét tương đương dòng Ultra, pin lớn 4900mAh và sạc nhanh 45W.",
    content: "Khung Armor Aluminum gia cường bền bỉ, tích hợp dịch cuộc gọi trực tiếp hai chiều Live Translate.",
    imageUrl: "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=1000&q=85",
    specs: [
      { groupName: "Pin", specKey: "Dung Lượng & Sạc", specValue: "4900 mAh, sạc nhanh Super Fast Charging 45W" }
    ],
  },
  {
    title: "Samsung Galaxy S24 5G 8GB/256GB - Vàng Amber",
    slug: "samsung-galaxy-s24-256gb",
    sku: "SS-S24-256-GLD",
    categorySlug: "dien-thoai-cong-nghe",
    brandSlug: "samsung",
    regularPrice: 20990000,
    salePrice: 17990000,
    stock: 60,
    ratingsAvg: 4.7,
    ratingsCount: 80,
    description: "Flagship nhỏ gọn vừa vặn trong lòng bàn tay, màn hình 6.2 inch viền siêu mỏng đều 4 cạnh cực kỳ quyến rũ.",
    content: "Trọng lượng siêu nhẹ chỉ 167g cùng cấu hình Snapdragon 8 Gen 3 for Galaxy xử lý trơn tru mọi tác vụ.",
    imageUrl: "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=1000&q=85",
    specs: [
      { groupName: "Trọng Lượng", specKey: "Khối Lượng", specValue: "167 gram, chống nước chuẩn IP68" }
    ],
  },
  {
    title: "Samsung Galaxy Z Fold6 5G 12GB/256GB - Xám Bạc",
    slug: "samsung-galaxy-z-fold6-256gb",
    sku: "SS-ZFOLD6-256-SLV",
    categorySlug: "dien-thoai-cong-nghe",
    brandSlug: "samsung",
    regularPrice: 41990000,
    salePrice: 38990000,
    stock: 30,
    isFeatured: true,
    isNewArrival: true,
    ratingsAvg: 4.9,
    ratingsCount: 72,
    description: "Kiệt tác gập mở thế hệ thứ 6 nhẹ hơn và mỏng hơn đáng kể, màn hình phụ tỷ lệ chuẩn rộng rãi dễ gõ phím.",
    content: "Mở ra không gian làm việc 7.6 inch như tablet, chạy đa nhiệm 3 ứng dụng song song với Galaxy AI hỗ trợ ghi chú thông minh.",
    imageUrl: "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=1000&q=85",
    specs: [
      { groupName: "Bản Lề", specKey: "Cấu Trúc", specValue: "Bản lề rãnh kép Flex Hinge chịu lực giọt nước" }
    ],
  },
  {
    title: "Samsung Galaxy Z Flip6 5G 12GB/256GB - Xanh Mint",
    slug: "samsung-galaxy-z-flip6-256gb",
    sku: "SS-ZFLIP6-256-MNT",
    categorySlug: "dien-thoai-cong-nghe",
    brandSlug: "samsung",
    regularPrice: 26990000,
    salePrice: 23990000,
    stock: 40,
    isFeatured: true,
    ratingsAvg: 4.8,
    ratingsCount: 95,
    description: "Thời trang gập vỏ sò cao cấp với màn hình ngoài Flex Window 3.4 inch độc đáo và buồng hơi tản nhiệt lần đầu xuất hiện trên dòng Flip.",
    content: "Camera 50MP chụp ảnh sắc nét, pin tăng lên 4000mAh bền bỉ cả ngày và tính năng tự động căn khung Auto Zoom thông minh.",
    imageUrl: "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=1000&q=85",
    specs: [
      { groupName: "Tản Nhiệt", specKey: "Hệ Thống", specValue: "Vapor Chamber buồng hơi làm mát đầu tiên trên Flip" }
    ],
  },
  {
    title: "Samsung Galaxy S23 Ultra 5G 8GB/256GB - Xanh Botanic",
    slug: "samsung-galaxy-s23-ultra-256gb",
    sku: "SS-S23U-256-GRN",
    categorySlug: "dien-thoai-cong-nghe",
    brandSlug: "samsung",
    regularPrice: 23990000,
    salePrice: 19990000,
    stock: 50,
    ratingsAvg: 4.8,
    ratingsCount: 220,
    description: "Huyền thoại zoom 100x với camera Space Zoom chuyên nghiệp, chip Snapdragon 8 Gen 2 for Galaxy mát mẻ và ổn định.",
    content: "Viên pin 5000mAh trâu bò, màn hình cong nhẹ hai cạnh sang trọng và hỗ trợ đầy đủ các tính năng Galaxy AI qua cập nhật One UI.",
    imageUrl: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=1000&q=85",
    specs: [
      { groupName: "Camera", specKey: "Khả Năng Zoom", specValue: "Space Zoom 100x kỹ thuật số, zoom quang 10x" }
    ],
  },
  {
    title: "Samsung Galaxy A55 5G 8GB/128GB - Xanh Navy",
    slug: "samsung-galaxy-a55-5g-128gb",
    sku: "SS-A55-128-NAV",
    categorySlug: "dien-thoai-cong-nghe",
    brandSlug: "samsung",
    regularPrice: 9990000,
    salePrice: 8490000,
    stock: 120,
    isBestSeller: true,
    ratingsAvg: 4.7,
    ratingsCount: 290,
    description: "Thiết kế viền kim loại cao cấp đầu tiên trên dòng Galaxy A, mặt kính cường lực Gorilla Glass Victus+ và chống nước IP67.",
    content: "Chip Exynos 1480 có GPU đồ họa AMD RDNA hợp tác, màn hình Super AMOLED 120Hz rực rỡ và loa kép âm thanh vòm.",
    imageUrl: "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=1000&q=85",
    specs: [
      { groupName: "Chất Liệu", specKey: "Khung Viền", specValue: "Kim loại nhôm nguyên khối sang trọng, kháng nước IP67" }
    ],
  },
  {
    title: "Samsung Galaxy Tab S9 Ultra 12GB/256GB Wi-Fi - Xám Khói",
    slug: "samsung-galaxy-tab-s9-ultra-256gb",
    sku: "SS-TABS9U-256-GRY",
    categorySlug: "dien-thoai-cong-nghe",
    brandSlug: "samsung",
    regularPrice: 30990000,
    salePrice: 26990000,
    stock: 25,
    isFeatured: true,
    ratingsAvg: 4.9,
    ratingsCount: 48,
    description: "Màn hình khổng lồ 14.6 inch Dynamic AMOLED 2X 120Hz, tặng kèm bút S-Pen kháng nước IP68 chuyên nghiệp cho kiến trúc & đồ họa.",
    content: "Chế độ Samsung DeX kết nối màn hình ngoài biến tablet thành PC thực thụ, hệ thống 4 loa AKG âm trầm uy lực.",
    imageUrl: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=1000&q=85",
    specs: [
      { groupName: "Màn Hình", specKey: "Kích Thước", specValue: "14.6 inch Dynamic AMOLED 2X 120Hz chống nước IP68" }
    ],
  },

  // --- XIAOMI ---
  {
    title: "Xiaomi 14 Ultra 5G 16GB/512GB - Ống Kính Leica Huyền Thoại",
    slug: "xiaomi-14-ultra-512gb",
    sku: "MI-14U-512-BLK",
    categorySlug: "dien-thoai-cong-nghe",
    brandSlug: "xiaomi",
    regularPrice: 32990000,
    salePrice: 27990000,
    stock: 28,
    isFeatured: true,
    ratingsAvg: 4.9,
    ratingsCount: 62,
    description: "Cảm biến hình ảnh 1 inch Sony LYT-900 đỉnh cao, khẩu độ biến thiên vô cấp từ f/1.63 đến f/4.0 kết hợp cùng quang học Leica trứ danh.",
    content: "Màn hình cong nhẹ 4 cạnh All Around Liquid Display, pin 5000mAh hỗ trợ sạc có dây 90W và sạc không dây siêu tốc 80W.",
    imageUrl: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1000&q=85",
    specs: [
      { groupName: "Quang Học", specKey: "Thấu Kính", specValue: "Leica Summilux thế hệ mới, cảm biến Sony LYT-900 1-inch" }
    ],
  },
  {
    title: "Xiaomi 14 5G 12GB/256GB - Xanh Ngọc Bích",
    slug: "xiaomi-14-256gb",
    sku: "MI-14-256-JAD",
    categorySlug: "dien-thoai-cong-nghe",
    brandSlug: "xiaomi",
    regularPrice: 20990000,
    salePrice: 17490000,
    stock: 45,
    isBestSeller: true,
    ratingsAvg: 4.8,
    ratingsCount: 110,
    description: "Flagship nhỏ gọn cấu hình khủng với chip Snapdragon 8 Gen 3, ống kính Leica Floating Telephoto tiêu cự 75mm chụp chân dung tuyệt sắc.",
    content: "Màn hình 6.36 inch viền siêu mỏng 1.61mm sáng 3000 nits, công nghệ sạc nhanh HyperCharge 90W đầy pin chỉ trong 31 phút.",
    imageUrl: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1000&q=85",
    specs: [
      { groupName: "Màn Hình", specKey: "Độ Sáng Tối Đa", specValue: "AMOLED 1.5K 120Hz LTPO 3000 nits peak" }
    ],
  },
  {
    title: "Xiaomi 13T Pro 5G 12GB/512GB - Xanh Tuyết Sơn",
    slug: "xiaomi-13t-pro-512gb",
    sku: "MI-13TP-512-BLU",
    categorySlug: "dien-thoai-cong-nghe",
    brandSlug: "xiaomi",
    regularPrice: 15990000,
    salePrice: 13490000,
    stock: 55,
    ratingsAvg: 4.8,
    ratingsCount: 135,
    description: "Bộ 3 camera Leica chuyên nghiệp phân khúc cận cao cấp, chip MediaTek Dimensity 9200+ 4nm cực mát mẻ và sạc 120W siêu tốc.",
    content: "Màn hình 144Hz siêu mượt bảo vệ mắt, kháng bụi kháng nước chuẩn IP68 và mặt lưng da thuần chay sang trọng.",
    imageUrl: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1000&q=85",
    specs: [
      { groupName: "Sạc Nhanh", specKey: "Công Nghệ Sạc", specValue: "120W HyperCharge, đầy 100% pin trong 19 phút" }
    ],
  },
  {
    title: "Redmi Note 13 Pro+ 5G 12GB/256GB - Tím Cực Quang",
    slug: "redmi-note-13-pro-plus-256gb",
    sku: "MI-RN13PP-256-PUR",
    categorySlug: "dien-thoai-cong-nghe",
    brandSlug: "xiaomi",
    regularPrice: 10990000,
    salePrice: 9290000,
    stock: 95,
    isBestSeller: true,
    ratingsAvg: 4.7,
    ratingsCount: 240,
    description: "Camera 200MP chống rung OIS hàng đầu phân khúc, màn hình cong CrystalRes 1.5K AMOLED và khả năng kháng nước chuẩn IP68.",
    content: "Sạc siêu tốc 120W, chip Dimensity 7200-Ultra mạnh mẽ cân trọn các tựa game mobile phổ biến hiện nay.",
    imageUrl: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1000&q=85",
    specs: [
      { groupName: "Camera", specKey: "Cảm Biến Chính", specValue: "200MP Samsung ISOCELL HP3 OIS" }
    ],
  },

  // --- OPPO ---
  {
    title: "OPPO Find N3 5G 16GB/512GB - Vàng Hoàng Kim",
    slug: "oppo-find-n3-512gb",
    sku: "OPPO-FN3-512-GLD",
    categorySlug: "dien-thoai-cong-nghe",
    brandSlug: "oppo",
    regularPrice: 44990000,
    salePrice: 39990000,
    stock: 20,
    isFeatured: true,
    ratingsAvg: 4.9,
    ratingsCount: 45,
    description: "Vua gập flagship với camera tiềm vọng tele Hasselblad cảm biến lớn nhất trên điện thoại gập, nếp gấp màn hình gần như vô hình.",
    content: "Giao diện đa nhiệm Boundless View mở cùng lúc 3 app toàn màn hình, loa stereo 3 kênh hỗ trợ Spatial Audio sống động.",
    imageUrl: "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=1000&q=85",
    specs: [
      { groupName: "Hợp Tác", specKey: "Nhiếp Ảnh", specValue: "Hasselblad Camera for Mobile, chống rung OIS kép" }
    ],
  },
  {
    title: "OPPO Reno12 Pro 5G 12GB/512GB - Bạc Tinh Vân",
    slug: "oppo-reno12-pro-512gb",
    sku: "OPPO-R12P-512-SLV",
    categorySlug: "dien-thoai-cong-nghe",
    brandSlug: "oppo",
    regularPrice: 18990000,
    salePrice: 16490000,
    stock: 50,
    ratingsAvg: 4.8,
    ratingsCount: 78,
    description: "Chuyên gia chân dung AI thế hệ mới với bộ công cụ AI Eraser 2.0 xóa người thông minh và AI Best Face chỉnh mắt nhắm trong ảnh nhóm.",
    content: "Màn hình vô cực bốn cạnh cong nhẹ tự nhiên, khung hợp kim siêu chịu lực chống cong vênh và sạc nhanh SUPERVOOC 80W.",
    imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1000&q=85",
    specs: [
      { groupName: "Trí Tuệ Nhân Tạo", specKey: "Tính Năng AI", specValue: "AI Eraser 2.0, AI Best Face, AI Studio tạo chân dung" }
    ],
  },

  // --- VIVO ---
  {
    title: "Vivo X100 Pro 5G 16GB/512GB - Đen Sao Băng",
    slug: "vivo-x100-pro-512gb",
    sku: "VIVO-X100P-512-BLK",
    categorySlug: "dien-thoai-cong-nghe",
    brandSlug: "vivo",
    regularPrice: 28990000,
    salePrice: 24990000,
    stock: 35,
    isFeatured: true,
    ratingsAvg: 4.9,
    ratingsCount: 82,
    description: "Đỉnh cao thấu kính quang học ZEISS APO đầu tiên trên điện thoại, chip xử lý hình ảnh độc quyền Vivo V3 cho chất lượng quay phim cinematic.",
    content: "Vi xử lý MediaTek Dimensity 9300 kiến trúc toàn nhân lớn siêu mạnh, pin công nghệ cực dương BlueOcean 5400mAh và sạc FlashCharge 100W.",
    imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1000&q=85",
    specs: [
      { groupName: "Quang Học", specKey: "Thấu Kính", specValue: "ZEISS APO Telephoto Camera đạt chứng nhận tiêu chuẩn quang học Đức" }
    ],
  },
  {
    title: "Vivo V30 Pro 5G 12GB/512GB - Xanh Sóng Biển",
    slug: "vivo-v30-pro-512gb",
    sku: "VIVO-V30P-512-SEA",
    categorySlug: "dien-thoai-cong-nghe",
    brandSlug: "vivo",
    regularPrice: 14990000,
    salePrice: 12990000,
    stock: 60,
    ratingsAvg: 4.7,
    ratingsCount: 95,
    description: "Đèn Aura Light thế hệ mới tự động đổi nhiệt độ màu theo môi trường xung quanh, trang bị hệ thống camera chuyên nghiệp 3 ống kính đồng hợp tác ZEISS.",
    content: "Thân máy siêu mỏng chỉ 7.45mm nhưng mang theo viên pin khủng 5000mAh bảo hành 4 năm không chai pin.",
    imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1000&q=85",
    specs: [
      { groupName: "Ánh Sáng", specKey: "Đèn Chiếu Sáng", specValue: "Vòng sáng Aura Light thông minh điều chỉnh nhiệt độ màu" }
    ],
  },

  // --- GOOGLE PIXEL ---
  {
    title: "Google Pixel 9 Pro XL 16GB/256GB - Obsidian Đen",
    slug: "google-pixel-9-pro-xl-256gb",
    sku: "PIXEL-9PXL-256-BLK",
    categorySlug: "dien-thoai-cong-nghe",
    brandSlug: "google",
    regularPrice: 32990000,
    salePrice: 29990000,
    stock: 25,
    isFeatured: true,
    isNewArrival: true,
    ratingsAvg: 4.9,
    ratingsCount: 54,
    description: "Chiếc điện thoại AI hoàn thiện nhất từ Google với chip Tensor G4, camera chụp đêm Night Sight dẫn đầu thế giới và tích hợp Gemini Pro trực tiếp.",
    content: "Màn hình Super Actua Display 6.8 inch sáng 3000 nits, cảm biến nhiệt độ mặt lưng và cam kết cập nhật phần mềm Android dài hạn 7 năm.",
    imageUrl: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1000&q=85",
    specs: [
      { groupName: "Trí Tuệ Nhân Tạo", specKey: "Mô Hình AI", specValue: "Gemini Nano on-device, chip Google Tensor G4" }
    ],
  },
  {
    title: "Google Pixel 9 12GB/128GB - Hồng Mẫu Đơn (Peony)",
    slug: "google-pixel-9-128gb",
    sku: "PIXEL-9-128-PNK",
    categorySlug: "dien-thoai-cong-nghe",
    brandSlug: "google",
    regularPrice: 22990000,
    salePrice: 19990000,
    stock: 40,
    ratingsAvg: 4.8,
    ratingsCount: 42,
    description: "Thiết kế thanh camera ngang đặc trưng tái thiết kế hiện đại, camera góc siêu rộng nâng cấp lên 48MP và thuật toán màu da Real Tone xuất sắc.",
    content: "Hỗ trợ tính năng chụp hình nhóm thông minh 'Add Me' kết hợp hai bức ảnh làm một để không ai bị bỏ lại sau ống kính.",
    imageUrl: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1000&q=85",
    specs: [
      { groupName: "Tính Năng Ảnh", specKey: "Công Nghệ Mới", specValue: "Add Me ghép ảnh nhóm bằng AI, Magic Editor" }
    ],
  },
  {
    title: "Google Pixel 8a 8GB/128GB - Xanh Bay",
    slug: "google-pixel-8a-128gb",
    sku: "PIXEL-8A-128-BAY",
    categorySlug: "dien-thoai-cong-nghe",
    brandSlug: "google",
    regularPrice: 14990000,
    salePrice: 12990000,
    stock: 65,
    ratingsAvg: 4.7,
    ratingsCount: 88,
    description: "Trải nghiệm Android thuần khiết mượt mà với chip Google Tensor G3, màn hình 120Hz Actua rực rỡ và các tính năng Best Take chọn biểu cảm gương mặt.",
    content: "Hỗ trợ cập nhật phần mềm và bảo mật Android liên tục tới 7 năm từ Google.",
    imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1000&q=85",
    specs: [
      { groupName: "Cập Nhật", specKey: "Hỗ Trợ OS", specValue: "7 năm cập nhật Android & Security Patch" }
    ],
  },
];

