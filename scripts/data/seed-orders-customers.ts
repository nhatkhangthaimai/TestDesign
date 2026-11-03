import { PrismaClient } from "@prisma/client";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";

const tidbConfig = {
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

// 1. DANH SÁCH KHÁCH HÀNG MẪU (MẬT KHẨU MẶC ĐỊNH: 123456)
const CUSTOMERS_DATA = [
  {
    name: "Hoàng Minh Nam",
    email: "hoang.nam@gmail.com",
    phone: "0912345678",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80",
    address: {
      recipientName: "Hoàng Minh Nam",
      phone: "0912345678",
      street: "72 Lê Thánh Tôn, Bến Nghé",
      ward: "Phường Bến Nghé",
      district: "Quận 1",
      city: "Thành phố Hồ Chí Minh",
    },
  },
  {
    name: "Nguyễn Thị Lan Anh",
    email: "lan.anh@outlook.com",
    phone: "0988776655",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
    address: {
      recipientName: "Nguyễn Thị Lan Anh",
      phone: "0988776655",
      street: "18 Liễu Giai, Cống Vị",
      ward: "Phường Cống Vị",
      district: "Quận Ba Đình",
      city: "Hà Nội",
    },
  },
  {
    name: "Trần Minh Trí",
    email: "minh.tri@fpt.com.vn",
    phone: "0903112233",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=300&q=80",
    address: {
      recipientName: "Trần Minh Trí",
      phone: "0903112233",
      street: "45 Bạch Đằng, Thạch Thang",
      ward: "Phường Thạch Thang",
      district: "Quận Hải Châu",
      city: "Đà Nẵng",
    },
  },
  {
    name: "Lê Thu Thảo",
    email: "thu.thao@techcorp.vn",
    phone: "0934567890",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
    address: {
      recipientName: "Lê Thu Thảo",
      phone: "0934567890",
      street: "88 Hòa Bình, An Cư",
      ward: "Phường An Cư",
      district: "Quận Ninh Kiều",
      city: "Cần Thơ",
    },
  },
  {
    name: "Phạm Đức Hải",
    email: "duc.hai@viettel.vn",
    phone: "0977889900",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
    address: {
      recipientName: "Phạm Đức Hải",
      phone: "0977889900",
      street: "12 Điện Biên Phủ, Minh Khai",
      ward: "Phường Minh Khai",
      district: "Quận Hồng Bàng",
      city: "Hải Phòng",
    },
  },
  {
    name: "Đặng Quốc Bảo",
    email: "quoc.bao@gmail.com",
    phone: "0945123789",
    avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&q=80",
    address: {
      recipientName: "Đặng Quốc Bảo",
      phone: "0945123789",
      street: "102 Trần Thái Tông, Dịch Vọng Hậu",
      ward: "Phường Dịch Vọng Hậu",
      district: "Quận Cầu Giấy",
      city: "Hà Nội",
    },
  },
];

// 2. DANH SÁCH MÃ GIẢM GIÁ (COUPONS)
const COUPONS_DATA = [
  {
    code: "WELCOME10",
    description: "Giảm 10% tối đa 500.000đ cho khách hàng mới",
    discountType: "PERCENTAGE",
    discountValue: 10,
    minOrderValue: 1000000,
    maxDiscount: 500000,
    usageLimit: 500,
    usageCount: 42,
    expiresAt: new Date(Date.now() + 60 * 24 * 3600 * 1000),
    isActive: true,
  },
  {
    code: "VIPTECH500",
    description: "Giảm ngay 500.000đ cho đơn hàng công nghệ từ 10.000.000đ",
    discountType: "FIXED",
    discountValue: 500000,
    minOrderValue: 10000000,
    maxDiscount: 500000,
    usageLimit: 200,
    usageCount: 28,
    expiresAt: new Date(Date.now() + 90 * 24 * 3600 * 1000),
    isActive: true,
  },
  {
    code: "FLASH20",
    description: "Giảm 20% tối đa 2.000.000đ dịp Flash Sale cuối tuần",
    discountType: "PERCENTAGE",
    discountValue: 20,
    minOrderValue: 5000000,
    maxDiscount: 2000000,
    usageLimit: 100,
    usageCount: 15,
    expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000),
    isActive: true,
  },
  {
    code: "FREESHIP",
    description: "Miễn phí vận chuyển toàn quốc cho đơn từ 500.000đ",
    discountType: "FIXED",
    discountValue: 50000,
    minOrderValue: 500000,
    maxDiscount: 50000,
    usageLimit: 1000,
    usageCount: 88,
    expiresAt: new Date(Date.now() + 180 * 24 * 3600 * 1000),
    isActive: true,
  },
  {
    code: "APPLEVIP",
    description: "Đặc quyền Apple Fan: Giảm 1.000.000đ cho đơn hàng từ 20.000.000đ",
    discountType: "FIXED",
    discountValue: 1000000,
    minOrderValue: 20000000,
    maxDiscount: 1000000,
    usageLimit: 150,
    usageCount: 34,
    expiresAt: new Date(Date.now() + 45 * 24 * 3600 * 1000),
    isActive: true,
  },
  {
    code: "AUDIO15",
    description: "Giảm 15% cho tai nghe và loa Hi-End Sony, Marshall, JBL",
    discountType: "PERCENTAGE",
    discountValue: 15,
    minOrderValue: 3000000,
    maxDiscount: 800000,
    usageLimit: 300,
    usageCount: 19,
    expiresAt: new Date(Date.now() + 30 * 24 * 3600 * 1000),
    isActive: true,
  },
];

async function seedSQLite() {
  console.log("\n================================================================================");
  console.log("  1. NẠP KHÁCH HÀNG, ĐƠN HÀNG & MÃ GIẢM GIÁ VÀO DATABASE LOCAL (SQLITE)...      ");
  console.log("================================================================================");

  const prisma = new PrismaClient();
  const passwordHash = await bcrypt.hash("123456", 10);

  try {
    // 1. Tạo Coupons
    const couponMap = new Map<string, any>();
    for (const c of COUPONS_DATA) {
      const existing = await prisma.coupon.findUnique({ where: { code: c.code } });
      if (existing) {
        await prisma.coupon.update({ where: { id: existing.id }, data: c });
        couponMap.set(c.code, existing);
      } else {
        const created = await prisma.coupon.create({ data: c });
        couponMap.set(c.code, created);
      }
    }
    console.log(`✓ Đã tạo/cập nhật ${COUPONS_DATA.length} mã giảm giá trên SQLite.`);

    // 2. Tạo Customers & Addresses
    const customerList: any[] = [];
    for (const cust of CUSTOMERS_DATA) {
      let user = await prisma.user.findUnique({ where: { email: cust.email } });
      if (!user) {
        user = await prisma.user.create({
          data: {
            email: cust.email,
            name: cust.name,
            phone: cust.phone,
            passwordHash,
            role: "ROLE_USER",
            avatar: cust.avatar,
          },
        });
      }

      const existingAddr = await prisma.shippingAddress.findFirst({ where: { userId: user.id } });
      if (!existingAddr) {
        await prisma.shippingAddress.create({
          data: {
            userId: user.id,
            recipientName: cust.address.recipientName,
            phone: cust.address.phone,
            street: cust.address.street,
            ward: cust.address.ward,
            district: cust.address.district,
            city: cust.address.city,
            isDefault: true,
          },
        });
      }
      customerList.push({ user, address: cust.address });
    }
    console.log(`✓ Đã tạo/cập nhật ${CUSTOMERS_DATA.length} khách hàng trên SQLite.`);

    // 3. Lấy sản phẩm để tạo đơn hàng thực tế
    const products = await prisma.product.findMany({ take: 30 });
    if (products.length < 5) {
      console.warn("Chưa có đủ sản phẩm trong DB.");
      return;
    }

    // 4. Danh sách kịch bản đơn hàng
    const orderScenarios = [
      {
        orderNumber: "ORD-2026-00101",
        customerIdx: 0,
        productIndices: [0, 5],
        status: "DELIVERED",
        paymentMethod: "VNPAY",
        paymentStatus: "PAID",
        couponCode: "WELCOME10",
        note: "Giao trong giờ hành chính, gọi trước 15 phút.",
        daysAgo: 4,
      },
      {
        orderNumber: "ORD-2026-00102",
        customerIdx: 1,
        productIndices: [2, 7, 12],
        status: "DELIVERED",
        paymentMethod: "MOMO",
        paymentStatus: "PAID",
        couponCode: "VIPTECH500",
        note: "Gửi lễ tân tòa nhà Capital Tower giúp tôi.",
        daysAgo: 3,
      },
      {
        orderNumber: "ORD-2026-00103",
        customerIdx: 2,
        productIndices: [1, 9],
        status: "SHIPPED",
        paymentMethod: "COD",
        paymentStatus: "PENDING",
        couponCode: "FREESHIP",
        note: "Giao vào chiều thứ 7, kiểm tra hàng trước khi nhận.",
        daysAgo: 2,
      },
      {
        orderNumber: "ORD-2026-00104",
        customerIdx: 3,
        productIndices: [3],
        status: "PROCESSING",
        paymentMethod: "BANK_TRANSFER",
        paymentStatus: "PAID",
        couponCode: "AUDIO15",
        note: "Đóng gói bọc xốp cẩn thận làm quà tặng sinh nhật.",
        daysAgo: 1,
      },
      {
        orderNumber: "ORD-2026-00105",
        customerIdx: 4,
        productIndices: [4, 8],
        status: "CONFIRMED",
        paymentMethod: "VNPAY",
        paymentStatus: "PAID",
        couponCode: "FLASH20",
        note: "Xuất hóa đơn VAT công ty Viettel.",
        daysAgo: 0,
      },
      {
        orderNumber: "ORD-2026-00106",
        customerIdx: 5,
        productIndices: [6],
        status: "PENDING",
        paymentMethod: "COD",
        paymentStatus: "PENDING",
        couponCode: null,
        note: "Giao nhà riêng vào buổi tối sau 18h.",
        daysAgo: 0,
      },
      {
        orderNumber: "ORD-2026-00107",
        customerIdx: 0,
        productIndices: [10, 14],
        status: "DELIVERED",
        paymentMethod: "VNPAY",
        paymentStatus: "PAID",
        couponCode: "APPLEVIP",
        note: "Giao nhanh hỏa tốc 2 giờ.",
        daysAgo: 7,
      },
    ];

    let createdOrders = 0;
    for (const sc of orderScenarios) {
      const existingOrder = await prisma.order.findUnique({ where: { orderNumber: sc.orderNumber } });
      if (existingOrder) continue;

      const customer = customerList[sc.customerIdx];
      const selectedProducts = sc.productIndices.map((i) => products[i % products.length]);

      let subtotal = 0;
      const itemsData = selectedProducts.map((p) => {
        const price = p.salePrice || p.regularPrice;
        const qty = 1;
        const total = price * qty;
        subtotal += total;
        return {
          productId: p.id,
          productTitle: p.title,
          sku: p.sku,
          price,
          quantity: qty,
          total,
        };
      });

      let discount = 0;
      const coupon = sc.couponCode ? couponMap.get(sc.couponCode) : null;
      if (coupon) {
        if (coupon.discountType === "PERCENTAGE") {
          discount = Math.min((subtotal * coupon.discountValue) / 100, coupon.maxDiscount || Infinity);
        } else {
          discount = coupon.discountValue;
        }
      }

      const shippingFee = subtotal > 2000000 || sc.couponCode === "FREESHIP" ? 0 : 35000;
      const total = Math.max(0, subtotal - discount + shippingFee);

      const orderDate = new Date(Date.now() - sc.daysAgo * 24 * 3600 * 1000);

      const newOrder = await prisma.order.create({
        data: {
          orderNumber: sc.orderNumber,
          userId: customer.user.id,
          customerName: customer.user.name,
          customerEmail: customer.user.email,
          customerPhone: customer.user.phone || customer.address.phone,
          shippingAddress: customer.address.street,
          shippingCity: customer.address.city,
          shippingDistrict: customer.address.district,
          shippingWard: customer.address.ward,
          note: sc.note,
          subtotal,
          discount,
          shippingFee,
          total,
          status: sc.status,
          paymentMethod: sc.paymentMethod,
          paymentStatus: sc.paymentStatus,
          couponCode: sc.couponCode,
          createdAt: orderDate,
          updatedAt: orderDate,
          items: {
            create: itemsData,
          },
          statusHistory: {
            create: [
              {
                status: "PENDING",
                note: "Khách hàng đặt hàng thành công qua Website",
                changedBy: "Hệ thống",
                createdAt: orderDate,
              },
              ...(sc.status !== "PENDING"
                ? [
                    {
                      status: sc.status,
                      note: `Đơn hàng chuyển sang trạng thái ${sc.status}`,
                      changedBy: "Quản trị viên kho",
                      createdAt: new Date(orderDate.getTime() + 3600 * 1000),
                    },
                  ]
                : []),
            ],
          },
          payment: {
            create: {
              amount: total,
              provider: sc.paymentMethod,
              status: sc.paymentStatus,
              transactionRef: sc.paymentStatus === "PAID" ? `TXN-${randomUUID().slice(0, 8).toUpperCase()}` : null,
              paidAt: sc.paymentStatus === "PAID" ? orderDate : null,
              createdAt: orderDate,
              updatedAt: orderDate,
            },
          },
        },
      });

      if (coupon) {
        await prisma.couponUsage.create({
          data: {
            couponId: coupon.id,
            userId: customer.user.id,
            orderId: newOrder.id,
            discountApplied: discount,
            usedAt: orderDate,
          },
        });
      }
      createdOrders++;
    }

    const totalOrders = await prisma.order.count();
    console.log(`✓ SQLite: Đã thêm mới ${createdOrders} đơn hàng mẫu phong phú.`);
    console.log(`✓ SQLite: TỔNG SỐ ĐƠN HÀNG HIỆN TẠI: ${totalOrders} ĐƠN HÀNG.`);
  } finally {
    await prisma.$disconnect();
  }
}

async function seedTiDB() {
  console.log("\n================================================================================");
  console.log("  2. ĐỒNG BỘ KHÁCH HÀNG, ĐƠN HÀNG & MÃ GIẢM GIÁ LÊN TIDB CLOUD (AWS)...        ");
  console.log("================================================================================");

  let connection;
  const passwordHash = await bcrypt.hash("123456", 10);

  try {
    connection = await mysql.createConnection(tidbConfig);
    console.log("✓ Kết nối TiDB Cloud thành công qua cổng 4000!");

    // 1. Đồng bộ Coupons lên TiDB
    const couponMap = new Map<string, any>();
    for (const c of COUPONS_DATA) {
      const [existing]: any = await connection.query("SELECT id FROM coupons WHERE code = ?", [c.code]);
      const now = new Date();
      let cId = "";
      if (existing.length > 0) {
        cId = existing[0].id;
        await connection.query(
          `UPDATE coupons SET description = ?, discountType = ?, discountValue = ?, minOrderValue = ?,
           maxDiscount = ?, usageLimit = ?, usageCount = ?, expiresAt = ?, isActive = ?, updatedAt = ?
           WHERE id = ?`,
          [c.description, c.discountType, c.discountValue, c.minOrderValue, c.maxDiscount || null, c.usageLimit, c.usageCount, c.expiresAt, c.isActive ? 1 : 0, now, cId]
        );
      } else {
        cId = randomUUID();
        await connection.query(
          `INSERT INTO coupons (id, code, description, discountType, discountValue, minOrderValue, maxDiscount, usageLimit, usageCount, expiresAt, isActive, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [cId, c.code, c.description, c.discountType, c.discountValue, c.minOrderValue, c.maxDiscount || null, c.usageLimit, c.usageCount, c.expiresAt, c.isActive ? 1 : 0, now, now]
        );
      }
      couponMap.set(c.code, { id: cId, ...c });
    }
    console.log(`✓ TiDB Cloud: Đã đồng bộ ${COUPONS_DATA.length} mã giảm giá.`);

    // 2. Đồng bộ Customers lên TiDB
    const customerList: any[] = [];
    for (const cust of CUSTOMERS_DATA) {
      const [exUser]: any = await connection.query("SELECT id FROM users WHERE email = ?", [cust.email]);
      let uId = "";
      const now = new Date();
      if (exUser.length > 0) {
        uId = exUser[0].id;
        await connection.query("UPDATE users SET name = ?, phone = ?, avatar = ?, updatedAt = ? WHERE id = ?", [cust.name, cust.phone, cust.avatar, now, uId]);
      } else {
        uId = randomUUID();
        await connection.query(
          "INSERT INTO users (id, email, passwordHash, name, phone, role, avatar, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, 'ROLE_USER', ?, ?, ?)",
          [uId, cust.email, passwordHash, cust.name, cust.phone, cust.avatar, now, now]
        );
      }

      const [exAddr]: any = await connection.query("SELECT id FROM shipping_addresses WHERE userId = ?", [uId]);
      if (exAddr.length === 0) {
        await connection.query(
          "INSERT INTO shipping_addresses (id, userId, recipientName, phone, street, ward, district, city, isDefault, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)",
          [randomUUID(), uId, cust.address.recipientName, cust.address.phone, cust.address.street, cust.address.ward, cust.address.district, cust.address.city, now, now]
        );
      }
      customerList.push({ id: uId, name: cust.name, email: cust.email, phone: cust.phone, address: cust.address });
    }
    console.log(`✓ TiDB Cloud: Đã đồng bộ ${CUSTOMERS_DATA.length} khách hàng.`);

    // 3. Lấy sản phẩm từ TiDB để gắn vào đơn hàng
    const [products]: any = await connection.query("SELECT id, title, sku, regularPrice, salePrice FROM products LIMIT 30");
    if (products.length < 5) {
      console.warn("Chưa đủ sản phẩm trên TiDB.");
      return;
    }

    // 4. Kịch bản đơn hàng
    const orderScenarios = [
      {
        orderNumber: "ORD-2026-00101",
        customerIdx: 0,
        productIndices: [0, 5],
        status: "DELIVERED",
        paymentMethod: "VNPAY",
        paymentStatus: "PAID",
        couponCode: "WELCOME10",
        note: "Giao trong giờ hành chính, gọi trước 15 phút.",
        daysAgo: 4,
      },
      {
        orderNumber: "ORD-2026-00102",
        customerIdx: 1,
        productIndices: [2, 7, 12],
        status: "DELIVERED",
        paymentMethod: "MOMO",
        paymentStatus: "PAID",
        couponCode: "VIPTECH500",
        note: "Gửi lễ tân tòa nhà Capital Tower giúp tôi.",
        daysAgo: 3,
      },
      {
        orderNumber: "ORD-2026-00103",
        customerIdx: 2,
        productIndices: [1, 9],
        status: "SHIPPED",
        paymentMethod: "COD",
        paymentStatus: "PENDING",
        couponCode: "FREESHIP",
        note: "Giao vào chiều thứ 7, kiểm tra hàng trước khi nhận.",
        daysAgo: 2,
      },
      {
        orderNumber: "ORD-2026-00104",
        customerIdx: 3,
        productIndices: [3],
        status: "PROCESSING",
        paymentMethod: "BANK_TRANSFER",
        paymentStatus: "PAID",
        couponCode: "AUDIO15",
        note: "Đóng gói bọc xốp cẩn thận làm quà tặng sinh nhật.",
        daysAgo: 1,
      },
      {
        orderNumber: "ORD-2026-00105",
        customerIdx: 4,
        productIndices: [4, 8],
        status: "CONFIRMED",
        paymentMethod: "VNPAY",
        paymentStatus: "PAID",
        couponCode: "FLASH20",
        note: "Xuất hóa đơn VAT công ty Viettel.",
        daysAgo: 0,
      },
      {
        orderNumber: "ORD-2026-00106",
        customerIdx: 5,
        productIndices: [6],
        status: "PENDING",
        paymentMethod: "COD",
        paymentStatus: "PENDING",
        couponCode: null,
        note: "Giao nhà riêng vào buổi tối sau 18h.",
        daysAgo: 0,
      },
      {
        orderNumber: "ORD-2026-00107",
        customerIdx: 0,
        productIndices: [10, 14],
        status: "DELIVERED",
        paymentMethod: "VNPAY",
        paymentStatus: "PAID",
        couponCode: "APPLEVIP",
        note: "Giao nhanh hỏa tốc 2 giờ.",
        daysAgo: 7,
      },
    ];

    let createdOrders = 0;
    for (const sc of orderScenarios) {
      const [exOrder]: any = await connection.query("SELECT id FROM orders WHERE orderNumber = ?", [sc.orderNumber]);
      if (exOrder.length > 0) continue;

      const customer = customerList[sc.customerIdx];
      const selectedProducts = sc.productIndices.map((i) => products[i % products.length]);

      let subtotal = 0;
      const itemsData = selectedProducts.map((p: any) => {
        const price = Number(p.salePrice || p.regularPrice);
        const qty = 1;
        const total = price * qty;
        subtotal += total;
        return {
          productId: p.id,
          productTitle: p.title,
          sku: p.sku,
          price,
          quantity: qty,
          total,
        };
      });

      let discount = 0;
      const coupon = sc.couponCode ? couponMap.get(sc.couponCode) : null;
      if (coupon) {
        if (coupon.discountType === "PERCENTAGE") {
          discount = Math.min((subtotal * Number(coupon.discountValue)) / 100, Number(coupon.maxDiscount) || Infinity);
        } else {
          discount = Number(coupon.discountValue);
        }
      }

      const shippingFee = subtotal > 2000000 || sc.couponCode === "FREESHIP" ? 0 : 35000;
      const total = Math.max(0, subtotal - discount + shippingFee);
      const orderDate = new Date(Date.now() - sc.daysAgo * 24 * 3600 * 1000);
      const oId = randomUUID();

      await connection.query(
        `INSERT INTO orders (
          id, orderNumber, userId, customerName, customerEmail, customerPhone,
          shippingAddress, shippingCity, shippingDistrict, shippingWard, note,
          subtotal, discount, shippingFee, total, status, paymentMethod, paymentStatus,
          couponCode, isSimulated, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
        [
          oId,
          sc.orderNumber,
          customer.id,
          customer.name,
          customer.email,
          customer.phone,
          customer.address.street,
          customer.address.city,
          customer.address.district,
          customer.address.ward,
          sc.note,
          subtotal,
          discount,
          shippingFee,
          total,
          sc.status,
          sc.paymentMethod,
          sc.paymentStatus,
          sc.couponCode || null,
          orderDate,
          orderDate,
        ]
      );

      for (const it of itemsData) {
        await connection.query(
          "INSERT INTO order_items (id, orderId, productId, productTitle, sku, price, quantity, total) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          [randomUUID(), oId, it.productId, it.productTitle, it.sku, it.price, it.quantity, it.total]
        );
      }

      await connection.query(
        "INSERT INTO order_status_history (id, orderId, status, note, changedBy, createdAt) VALUES (?, ?, 'PENDING', 'Khách hàng đặt hàng thành công qua Website', 'Hệ thống', ?)",
        [randomUUID(), oId, orderDate]
      );
      if (sc.status !== "PENDING") {
        await connection.query(
          "INSERT INTO order_status_history (id, orderId, status, note, changedBy, createdAt) VALUES (?, ?, ?, ?, 'Quản trị viên kho', ?)",
          [randomUUID(), oId, sc.status, `Đơn hàng chuyển sang trạng thái ${sc.status}`, new Date(orderDate.getTime() + 3600 * 1000)]
        );
      }

      const payId = randomUUID();
      const txnRef = sc.paymentStatus === "PAID" ? `TXN-${randomUUID().slice(0, 8).toUpperCase()}` : null;
      await connection.query(
        "INSERT INTO payments (id, orderId, amount, provider, status, transactionRef, paidAt, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [payId, oId, total, sc.paymentMethod, sc.paymentStatus, txnRef, sc.paymentStatus === "PAID" ? orderDate : null, orderDate, orderDate]
      );

      if (coupon) {
        await connection.query(
          "INSERT INTO coupon_usages (id, couponId, userId, orderId, discountApplied, usedAt) VALUES (?, ?, ?, ?, ?, ?)",
          [randomUUID(), coupon.id, customer.id, oId, discount, orderDate]
        );
      }

      createdOrders++;
    }

    const [rows]: any = await connection.query("SELECT count(*) as count FROM orders");
    console.log(`✓ TiDB Cloud: Đã đồng bộ ${createdOrders} đơn hàng mẫu.`);
    console.log(`✓ TiDB Cloud: TỔNG SỐ ĐƠN HÀNG HIỆN TẠI: ${rows[0].count} ĐƠN HÀNG.`);
  } catch (err) {
    console.error("Lỗi khi kết nối hoặc đồng bộ TiDB:", err);
  } finally {
    if (connection) await connection.end();
  }
}

async function main() {
  console.log("================================================================================");
  console.log("   KHỞI ĐỘNG TIẾN TRÌNH NẠP KHÁCH HÀNG, ĐƠN HÀNG & MÃ GIẢM GIÁ MẪU              ");
  console.log("================================================================================");
  await seedSQLite();
  await seedTiDB();
  console.log("\n================================================================================");
  console.log("   HOÀN TẤT ĐỒNG BỘ DỮ LIỆU ĐƠN HÀNG & KHÁCH HÀNG (SQLITE & TIDB CLOUD)!        ");
  console.log("================================================================================\n");
}

main().catch(console.error);

