import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database with premium e-commerce data...");

  // 1. Clean existing records
  await prisma.couponUsage.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderStatusHistory.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.review.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.category.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.shippingAddress.deleteMany();
  await prisma.user.deleteMany();
  await prisma.storeSetting.deleteMany();

  // 2. Users
  const adminPassword = await bcrypt.hash("Admin@123456", 10);
  const userPassword = await bcrypt.hash("User@123456", 10);

  const admin = await prisma.user.create({
    data: {
      email: "admin@ecommerce.vn",
      name: "Quản Trị Viên Cấp Cao",
      passwordHash: adminPassword,
      role: "ROLE_ADMIN",
      phone: "0901234567",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
    },
  });

  const customer = await prisma.user.create({
    data: {
      email: "khachhang@ecommerce.vn",
      name: "Nguyễn Văn Hùng",
      passwordHash: userPassword,
      role: "ROLE_USER",
      phone: "0987654321",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
      addresses: {
        create: [
          {
            recipientName: "Nguyễn Văn Hùng",
            phone: "0987654321",
            street: "Tòa nhà Bitexco, 2 Hải Triều",
            ward: "Phường Bến Nghé",
            district: "Quận 1",
            city: "TP. Hồ Chí Minh",
            isDefault: true,
          },
        ],
      },
    },
  });

  // 3. Store Settings
  const settings = [
    { key: "STORE_NAME", value: "AJ COMMERCE PREMIUM", description: "Tên thương hiệu cửa hàng" },
    { key: "STORE_HOTLINE", value: "1900 6868", description: "Hotline chăm sóc khách hàng 24/7" },
    { key: "STORE_EMAIL", value: "contact@aj-commerce.vn", description: "Email hỗ trợ chính thức" },
    { key: "FREE_SHIPPING_MIN", value: "500000", description: "Mức đơn tối thiểu miễn phí vận chuyển (VND)" },
    { key: "STANDARD_SHIPPING_FEE", value: "30000", description: "Phí vận chuyển tiêu chuẩn toàn quốc (VND)" },
    { key: "VNPay_MERCHANT_NAME", value: "AJ COMMERCE DEMO", description: "Cổng thanh toán VNPay Sandbox" },
    { key: "MOMO_MERCHANT_NAME", value: "AJ COMMERCE MOMO", description: "Cổng thanh toán MoMo Sandbox" },
  ];
  for (const s of settings) {
    await prisma.storeSetting.create({ data: s });
  }

  // 4. Categories
  const catTech = await prisma.category.create({
    data: {
      name: "Điện Thoại & Công Nghệ",
      slug: "dien-thoai-cong-nghe",
      description: "Smartphone, tablet, laptop và thiết bị số cao cấp",
      imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80",
      sortOrder: 1,
    },
  });

  const catAudio = await prisma.category.create({
    data: {
      name: "Âm Thanh & Hi-End",
      slug: "am-thanh-hi-end",
      description: "Tai nghe chống ồn, loa bluetooth phòng thu và âm thanh cao cấp",
      imageUrl: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80",
      sortOrder: 2,
    },
  });

  const catWatch = await prisma.category.create({
    data: {
      name: "Đồng Hồ & Smartwatch",
      slug: "dong-ho-smartwatch",
      description: "Đồng hồ thông minh thể thao và phụ kiện đeo tay cao cấp",
      imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80",
      sortOrder: 3,
    },
  });

  const catHome = await prisma.category.create({
    data: {
      name: "Gia Dụng & Smart Living",
      slug: "gia-dung-smart-living",
      description: "Thiết bị lọc khí, máy pha cà phê và công nghệ đời sống",
      imageUrl: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80",
      sortOrder: 4,
    },
  });

  // 5. Brands
  const apple = await prisma.brand.create({
    data: {
      name: "Apple",
      slug: "apple",
      logoUrl: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=200&q=80",
      description: "Công nghệ tiên phong từ Cupertino, California.",
    },
  });

  const sony = await prisma.brand.create({
    data: {
      name: "Sony",
      slug: "sony",
      logoUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=200&q=80",
      description: "Đẳng cấp âm thanh và hình ảnh Nhật Bản.",
    },
  });

  const marshall = await prisma.brand.create({
    data: {
      name: "Marshall",
      slug: "marshall",
      logoUrl: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=200&q=80",
      description: "Huyền thoại âm thanh Rock'n'Roll biểu tượng nước Anh.",
    },
  });

  const garmin = await prisma.brand.create({
    data: {
      name: "Garmin",
      slug: "garmin",
      logoUrl: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=200&q=80",
      description: "Thiết bị GPS và đồng hồ thể thao chuyên nghiệp.",
    },
  });

  // 6. Products
  const now = new Date();
  const flashSaleEndTime = new Date(now.getTime() + 48 * 3600 * 1000); // 48h from now

  // Product 1: iPhone 16 Pro Max
  const p1 = await prisma.product.create({
    data: {
      title: "iPhone 16 Pro Max 256GB - Khung Titan Tự Nhiên",
      slug: "iphone-16-pro-max-256gb",
      description: "Thiết kế Titan chuẩn hàng không vũ trụ siêu bền, chip Apple A18 Pro mạnh mẽ vượt trội với camera Fusion 48MP và nút Camera Control chuyên nghiệp.",
      content: "iPhone 16 Pro Max là tuyệt tác công nghệ mới nhất từ Apple. Máy sở hữu màn hình Super Retina XDR 6.9 inch lớn nhất từng có, viền mỏng nhất lịch sử iPhone, hệ điều hành iOS 18 tích hợp Apple Intelligence. Thời lượng pin kỷ lục lên đến 33 giờ xem video liên tục.",
      regularPrice: 34990000,
      salePrice: 31490000,
      sku: "IP16PM-256-NAT",
      stock: 45,
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: true,
      isFlashSale: true,
      flashSaleStart: now,
      flashSaleEnd: flashSaleEndTime,
      categoryId: catTech.id,
      brandId: apple.id,
      ratingsAvg: 4.9,
      ratingsCount: 128,
      status: "ACTIVE",
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1000&q=85",
            altText: "iPhone 16 Pro Max Titan Tự Nhiên",
            isPrimary: true,
            sortOrder: 1,
          },
          {
            url: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=1000&q=85",
            altText: "iPhone 16 Pro Max Góc Cạnh",
            isPrimary: false,
            sortOrder: 2,
          },
        ],
      },
      variants: {
        create: [
          {
            name: "Titan Tự Nhiên - 256GB",
            sku: "IP16PM-256-NAT",
            price: 31490000,
            stock: 20,
            attributesJson: JSON.stringify({ color: "Titan Tự Nhiên", storage: "256GB" }),
          },
          {
            name: "Titan Sa Mạc - 256GB",
            sku: "IP16PM-256-DES",
            price: 31990000,
            stock: 15,
            attributesJson: JSON.stringify({ color: "Titan Sa Mạc", storage: "256GB" }),
          },
          {
            name: "Titan Đen - 512GB",
            sku: "IP16PM-512-BLK",
            price: 37990000,
            stock: 10,
            attributesJson: JSON.stringify({ color: "Titan Đen", storage: "512GB" }),
          },
        ],
      },
    },
  });

  // Product 2: Sony WH-1000XM5
  const p2 = await prisma.product.create({
    data: {
      title: "Tai Nghe Chống Ồn Cao Cấp Sony WH-1000XM5 Hi-Res",
      slug: "sony-wh-1000xm5-hi-res",
      description: "Đỉnh cao chống ồn chủ động Industry-Leading Noise Cancellation với 8 microphone, bộ vi xử lý V1 + QN1, âm thanh Hi-Res Audio không dây LDAC chuẩn phòng thu.",
      content: "Sony WH-1000XM5 viết lại quy chuẩn về tai nghe chống ồn không dây. Trọng lượng siêu nhẹ với mút bọc da êm ái, đàm thoại trong trẻo với công nghệ AI tách giọng nói. Pin liên tục 30 giờ và sạc nhanh 3 phút dùng 3 giờ.",
      regularPrice: 8990000,
      salePrice: 6990000,
      sku: "SNY-WH1000XM5-SLV",
      stock: 32,
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: false,
      isFlashSale: true,
      flashSaleStart: now,
      flashSaleEnd: flashSaleEndTime,
      categoryId: catAudio.id,
      brandId: sony.id,
      ratingsAvg: 4.8,
      ratingsCount: 86,
      status: "ACTIVE",
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1000&q=85",
            altText: "Sony WH-1000XM5 Màu Bạc Tinh Tế",
            isPrimary: true,
            sortOrder: 1,
          },
          {
            url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=85",
            altText: "Sony WH-1000XM5 Góc Chi Tiết",
            isPrimary: false,
            sortOrder: 2,
          },
        ],
      },
      variants: {
        create: [
          {
            name: "Bạc Bạch Kim (Silver)",
            sku: "SNY-WH1000XM5-SLV",
            price: 6990000,
            stock: 18,
            attributesJson: JSON.stringify({ color: "Bạc Bạch Kim" }),
          },
          {
            name: "Đen Huyền Bí (Black)",
            sku: "SNY-WH1000XM5-BLK",
            price: 6990000,
            stock: 14,
            attributesJson: JSON.stringify({ color: "Đen Huyền Bí" }),
          },
        ],
      },
    },
  });

  // Product 3: Marshall Stanmore III
  const p3 = await prisma.product.create({
    data: {
      title: "Loa Bluetooth Marshall Stanmore III Chính Hãng ASH",
      slug: "marshall-stanmore-iii-bluetooth",
      description: "Âm thanh tràn ngập không gian phòng với công nghệ âm trường rộng hơn, củ loa hướng ra ngoài và ống dẫn sóng được thiết kế lại.",
      content: "Stanmore III là mẫu loa tầm trung kinh điển trong dòng sản phẩm gia đình của Marshall. Thiết kế cổ điển mang tính biểu tượng với dải viền đồng thau sang trọng, chất âm analog ấm áp chân thực và kết nối Bluetooth 5.2 thế hệ mới.",
      regularPrice: 10490000,
      salePrice: 8990000,
      sku: "MSH-STAN3-BRN",
      stock: 25,
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: true,
      isFlashSale: false,
      categoryId: catAudio.id,
      brandId: marshall.id,
      ratingsAvg: 4.95,
      ratingsCount: 64,
      status: "ACTIVE",
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1000&q=85",
            altText: "Marshall Stanmore III Vintage",
            isPrimary: true,
            sortOrder: 1,
          },
        ],
      },
      variants: {
        create: [
          {
            name: "Nâu Vintage (Brown)",
            sku: "MSH-STAN3-BRN",
            price: 8990000,
            stock: 15,
            attributesJson: JSON.stringify({ color: "Nâu Cổ Điển" }),
          },
          {
            name: "Đen Cổ Điển (Black)",
            sku: "MSH-STAN3-BLK",
            price: 8990000,
            stock: 10,
            attributesJson: JSON.stringify({ color: "Đen Tuyền" }),
          },
        ],
      },
    },
  });

  // Product 4: Garmin Fenix 8 Solar
  const p4 = await prisma.product.create({
    data: {
      title: "Đồng Hồ Thông Minh Garmin Fenix 8 Solar Sapphire 47mm",
      slug: "garmin-fenix-8-solar-sapphire",
      description: "Đồng hồ GPS thể thao cao cấp tích hợp loa và micro ngoài, chuẩn lặn 40m, sạc năng lượng mặt trời cho thời lượng pin đến 28 ngày.",
      content: "Garmin Fenix 8 Sapphire là người bạn đồng hành tối thượng của các vận động viên và nhà thám hiểm. Kính Sapphire chống trầy xước, viền Titanium siêu nhẹ, bản đồ đa lục địa TopoActive cài sẵn và đèn pin LED siêu sáng tích hợp.",
      regularPrice: 28990000,
      salePrice: 26490000,
      sku: "GRM-FNX8-SLR-47",
      stock: 18,
      isFeatured: true,
      isBestSeller: false,
      isNewArrival: true,
      isFlashSale: true,
      flashSaleStart: now,
      flashSaleEnd: flashSaleEndTime,
      categoryId: catWatch.id,
      brandId: garmin.id,
      ratingsAvg: 5.0,
      ratingsCount: 42,
      status: "ACTIVE",
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=85",
            altText: "Garmin Fenix 8 Solar Sapphire",
            isPrimary: true,
            sortOrder: 1,
          },
        ],
      },
      variants: {
        create: [
          {
            name: "Titanium Dây Silicon Cam",
            sku: "GRM-FNX8-SLR-47-ORG",
            price: 26490000,
            stock: 10,
            attributesJson: JSON.stringify({ color: "Dây Cam Thể Thao", size: "47mm" }),
          },
          {
            name: "Titanium Dây Da Nâu Khói",
            sku: "GRM-FNX8-SLR-47-LTH",
            price: 28490000,
            stock: 8,
            attributesJson: JSON.stringify({ color: "Dây Da Doanh Nhân", size: "47mm" }),
          },
        ],
      },
    },
  });

  // Product 5: MacBook Pro 16 M3 Max
  const p5 = await prisma.product.create({
    data: {
      title: "MacBook Pro 16 inch M3 Max (36GB / 1TB SSD) Space Black",
      slug: "macbook-pro-16-m3-max-space-black",
      description: "Cỗ máy làm việc chuyên nghiệp mạnh mẽ nhất thế giới với chip M3 Max 14-core CPU, 30-core GPU, màn hình Liquid Retina XDR 120Hz ProMotion.",
      content: "MacBook Pro 16 inch M3 Max là đỉnh cao cho nhà sáng tạo nội dung, lập trình viên AI và dựng phim 8K. Màu Space Black sang trọng với lớp phủ anode hóa chống bám vân tay, âm thanh 6 loa phòng thu không gian 3D Spatial Audio.",
      regularPrice: 89990000,
      salePrice: 84990000,
      sku: "MBP16-M3MAX-36GB-BLK",
      stock: 12,
      isFeatured: true,
      isBestSeller: true,
      isNewArrival: false,
      isFlashSale: false,
      categoryId: catTech.id,
      brandId: apple.id,
      ratingsAvg: 4.95,
      ratingsCount: 53,
      status: "ACTIVE",
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=85",
            altText: "MacBook Pro 16 M3 Max Space Black",
            isPrimary: true,
            sortOrder: 1,
          },
        ],
      },
      variants: {
        create: [
          {
            name: "Space Black - 36GB / 1TB SSD",
            sku: "MBP16-M3MAX-36GB-BLK",
            price: 84990000,
            stock: 8,
            attributesJson: JSON.stringify({ color: "Space Black", ram: "36GB", storage: "1TB" }),
          },
          {
            name: "Silver - 48GB / 1TB SSD",
            sku: "MBP16-M3MAX-48GB-SLV",
            price: 94990000,
            stock: 4,
            attributesJson: JSON.stringify({ color: "Silver", ram: "48GB", storage: "1TB" }),
          },
        ],
      },
    },
  });

  // Product 6: Máy Pha Cà Phê De'Longhi Dedica
  const p6 = await prisma.product.create({
    data: {
      title: "Máy Pha Cà Phê Espresso Tự Động De'Longhi Dedica EC685.M",
      slug: "may-pha-ca-phe-delonghi-dedica-ec685m",
      description: "Thân máy inox sáng bóng sang trọng bề ngang chỉ 15cm, áp suất bơm 15 bar tiêu chuẩn Ý, hệ thống Thermoblock gia nhiệt nhanh trong 40 giây.",
      content: "De'Longhi Dedica EC685 là lựa chọn hoàn hảo cho barista tại gia. Vòi đánh sữa chuyên nghiệp tạo bọt sữa mịn màng cho Cappuccino và Latte Macchiato nghệ thuật.",
      regularPrice: 7490000,
      salePrice: 5890000,
      sku: "DLG-EC685M-SLV",
      stock: 30,
      isFeatured: false,
      isBestSeller: false,
      isNewArrival: true,
      isFlashSale: true,
      flashSaleStart: now,
      flashSaleEnd: flashSaleEndTime,
      categoryId: catHome.id,
      ratingsAvg: 4.7,
      ratingsCount: 39,
      status: "ACTIVE",
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?auto=format&fit=crop&w=1000&q=85",
            altText: "Máy Pha Cà Phê DeLonghi",
            isPrimary: true,
            sortOrder: 1,
          },
        ],
      },
    },
  });

  // 7. Reviews
  await prisma.review.createMany({
    data: [
      {
        productId: p1.id,
        userId: customer.id,
        rating: 5,
        title: "Chất lượng hoàn thiện đẳng cấp vượt bậc!",
        comment: "Khung titan tự nhiên cầm rất nhẹ và mát tay, màn hình 120Hz mượt mà tuyệt đối. Giao hàng hỏa tốc trong 2 giờ tại TP.HCM, đóng gói nguyên seal chính hãng rất an tâm.",
        isVerifiedPurchase: true,
      },
      {
        productId: p2.id,
        userId: customer.id,
        rating: 5,
        title: "Chống ồn quá đỉnh, đeo cả ngày không đau tai",
        comment: "Đi máy bay hay ngồi quán cafe bật chống ồn lên là như bước vào thế giới riêng. Âm bass trầm sâu, mid rõ nét. Rất xứng đáng từng đồng.",
        isVerifiedPurchase: true,
      },
    ],
  });

  // 8. Coupons
  await prisma.coupon.createMany({
    data: [
      {
        code: "WELCOME10",
        description: "Giảm 10% cho khách hàng mới đặt đơn đầu tiên",
        discountType: "PERCENTAGE",
        discountValue: 10,
        minOrderValue: 500000,
        maxDiscount: 200000,
        usageLimit: 500,
        usageCount: 12,
        isActive: true,
      },
      {
        code: "FLASHSALE100K",
        description: "Voucher Flash Sale giảm trực tiếp 100.000đ",
        discountType: "FIXED",
        discountValue: 100000,
        minOrderValue: 1000000,
        maxDiscount: 100000,
        usageLimit: 200,
        usageCount: 45,
        isActive: true,
      },
      {
        code: "VIP500K",
        description: "Ưu đãi khách hàng VIP giảm 500.000đ cho đơn từ 10 triệu",
        discountType: "FIXED",
        discountValue: 500000,
        minOrderValue: 10000000,
        maxDiscount: 500000,
        usageLimit: 50,
        usageCount: 8,
        isActive: true,
      },
    ],
  });

  // 9. Banners
  await prisma.banner.createMany({
    data: [
      {
        title: "TUYỆT TÁC CÔNG NGHỆ 2026 - MỞ BÁN TOÀN CẦU",
        subtitle: "Trải nghiệm iPhone 16 Pro Max khung Titan & Hệ sinh thái Apple chính hãng",
        imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1600&q=85",
        linkUrl: "/products/iphone-16-pro-max-256gb",
        badgeText: "CHÍNH HÃNG VNA",
        position: "HERO",
        sortOrder: 1,
        isActive: true,
      },
      {
        title: "ĐẠI TIỆC ÂM THANH HI-RES KHÔNG GIỚI HẠN",
        subtitle: "Giảm đến 30% bộ sưu tập tai nghe & loa Sony, Marshall số lượng có hạn",
        imageUrl: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1600&q=85",
        linkUrl: "/products?category=am-thanh-hi-end",
        badgeText: "ƯU ĐÃI ĐỘC QUYỀN",
        position: "HERO",
        sortOrder: 2,
        isActive: true,
      },
    ],
  });

  // 10. Initial Orders for realistic Analytics in Admin Dashboard
  const sampleOrder1 = await prisma.order.create({
    data: {
      orderNumber: "ORD-2026-9812",
      userId: customer.id,
      customerName: "Nguyễn Văn Hùng",
      customerEmail: "khachhang@ecommerce.vn",
      customerPhone: "0987654321",
      shippingAddress: "Tòa nhà Bitexco, 2 Hải Triều",
      shippingCity: "TP. Hồ Chí Minh",
      shippingDistrict: "Quận 1",
      shippingWard: "Phường Bến Nghé",
      note: "Giao trong giờ hành chính giúp tôi",
      subtotal: 31490000,
      discount: 200000,
      shippingFee: 0,
      total: 31290000,
      status: "DELIVERED",
      paymentMethod: "COD",
      paymentStatus: "PAID",
      couponCode: "WELCOME10",
      createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000),
      items: {
        create: [
          {
            productId: p1.id,
            productTitle: p1.title,
            sku: "IP16PM-256-NAT",
            price: 31490000,
            quantity: 1,
            total: 31490000,
          },
        ],
      },
      statusHistory: {
        create: [
          { status: "PENDING", note: "Đơn hàng đã được đặt thành công" },
          { status: "CONFIRMED", note: "Đã xác nhận đơn hàng qua điện thoại" },
          { status: "SHIPPED", note: "Đang giao hàng qua bưu tá" },
          { status: "DELIVERED", note: "Khách hàng đã nhận và thanh toán tiền mặt (COD)" },
        ],
      },
    },
  });

  const sampleOrder2 = await prisma.order.create({
    data: {
      orderNumber: "ORD-2026-9815",
      customerName: "Trần Minh Quân",
      customerEmail: "minhquan@gmail.com",
      customerPhone: "0912348899",
      shippingAddress: "88 Láng Hạ, Đống Đa",
      shippingCity: "Hà Nội",
      shippingDistrict: "Đống Đa",
      shippingWard: "Láng Hạ",
      note: "Gọi trước khi đến 15 phút",
      subtotal: 6990000,
      discount: 100000,
      shippingFee: 0,
      total: 6890000,
      status: "PROCESSING",
      paymentMethod: "VNPAY",
      paymentStatus: "PAID",
      couponCode: "FLASHSALE100K",
      createdAt: new Date(Date.now() - 6 * 3600 * 1000),
      items: {
        create: [
          {
            productId: p2.id,
            productTitle: p2.title,
            sku: "SNY-WH1000XM5-SLV",
            price: 6990000,
            quantity: 1,
            total: 6990000,
          },
        ],
      },
      statusHistory: {
        create: [
          { status: "PENDING", note: "Đơn hàng đã được tạo qua VNPay" },
          { status: "PROCESSING", note: "Thanh toán VNPay thành công. Kho đang chuẩn bị hàng đóng gói" },
        ],
      },
    },
  });

  console.log("Database seeded successfully!");
  console.log("Admin Account: admin@ecommerce.vn / Admin@123456");
  console.log("Customer Account: khachhang@ecommerce.vn / User@123456");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
