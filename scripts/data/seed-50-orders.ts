import mysql from "mysql2/promise";
import { randomUUID } from "crypto";

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

const CUSTOMERS = [
  { name: "Nguyễn Văn An", email: "an.nguyen@gmail.com", phone: "0903123456", city: "TP. Hồ Chí Minh", district: "Quận 1", ward: "Phường Bến Nghé", street: "120 Hai Bà Trưng" },
  { name: "Trần Thị Bích", email: "bich.tran@gmail.com", phone: "0912345678", city: "Hà Nội", district: "Quận Hoàn Kiếm", ward: "Phường Tràng Tiền", street: "45 Hàng Bài" },
  { name: "Lê Hoàng Nam", email: "nam.le@gmail.com", phone: "0987654321", city: "Đà Nẵng", district: "Quận Hải Châu", ward: "Phường Nam Dương", street: "88 Nguyễn Văn Linh" },
  { name: "Phạm Minh Khoa", email: "khoa.pham@gmail.com", phone: "0934567890", city: "Cần Thơ", district: "Quận Ninh Kiều", ward: "Phường Tân An", street: "15 Lê Lợi" },
  { name: "Đặng Thu Thảo", email: "thao.dang@gmail.com", phone: "0945678901", city: "Hải Phòng", district: "Quận Hồng Bàng", ward: "Phường Hoàng Văn Thụ", street: "24 Trần Hưng Đạo" },
  { name: "Vũ Hải Đăng", email: "dang.vu@gmail.com", phone: "0956789012", city: "TP. Hồ Chí Minh", district: "Quận 3", ward: "Phường Võ Thị Sáu", street: "250 Nam Kỳ Khởi Nghĩa" },
  { name: "Bùi Phương Linh", email: "linh.bui@gmail.com", phone: "0967890123", city: "Hà Nội", district: "Quận Cầu Giấy", ward: "Phường Dịch Vọng", street: "102 Trần Thái Tông" },
  { name: "Hoàng Quốc Bảo", email: "bao.hoang@gmail.com", phone: "0978901234", city: "TP. Hồ Chí Minh", district: "Quận Bình Thạnh", ward: "Phường 25", street: "68 Điện Biên Phủ" },
  { name: "Đỗ Diệu Hương", email: "huong.do@gmail.com", phone: "0989012345", city: "Hà Nội", district: "Quận Đống Đa", ward: "Phường Láng Hạ", street: "85 Huỳnh Thúc Kháng" },
  { name: "Ngô Thành Long", email: "long.ngo@gmail.com", phone: "0990123456", city: "TP. Hồ Chí Minh", district: "Quận 7", ward: "Phường Tân Phong", street: "105 Nguyễn Đức Cảnh" },
];

async function main() {
  console.log("================================================================================");
  console.log("            TIẾN TRÌNH TẠO 50 ĐƠN HÀNG THỬ NGHIỆM TRÊN TIDB CLOUD              ");
  console.log("================================================================================");

  const conn = await mysql.createConnection(connectionConfig);

  // 1. Lấy danh sách sản phẩm thực tế có sẵn
  const [products]: any = await conn.query(
    "SELECT id, title, sku, regularPrice, salePrice FROM products WHERE status = 'ACTIVE' LIMIT 50"
  );

  if (products.length === 0) {
    console.error("! Không có sản phẩm nào trong database để tạo đơn hàng.");
    await conn.end();
    return;
  }

  // 2. Lấy danh sách users (nếu có để gán userId)
  const [users]: any = await conn.query("SELECT id, email FROM users LIMIT 10");
  const userMap = new Map<string, string>();
  for (const u of users) userMap.set(u.email, u.id);

  // 3. Phân bổ chính xác 50 đơn hàng theo đề bài
  // 10 Chờ xác nhận (PENDING)
  // 10 Đã xác nhận (CONFIRMED)
  // 10 Đang giao hàng (SHIPPED)
  // 15 Giao thành công (DELIVERED)
  // 5  Đã hủy (CANCELLED)
  const statusPlan: Array<"PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED"> = [];
  for (let i = 0; i < 10; i++) statusPlan.push("PENDING");
  for (let i = 0; i < 10; i++) statusPlan.push("CONFIRMED");
  for (let i = 0; i < 10; i++) statusPlan.push("SHIPPED");
  for (let i = 0; i < 15; i++) statusPlan.push("DELIVERED");
  for (let i = 0; i < 5; i++) statusPlan.push("CANCELLED");

  // Xóa các đơn demo cũ nếu cần để đảm bảo chuẩn 50 đơn demo
  await conn.query("DELETE FROM orders WHERE isSimulated = 1 AND orderNumber LIKE 'DEMO-ORD-2026-%'");

  console.log(`✓ Bắt đầu khởi tạo 50 đơn hàng demo chuẩn cấu trúc...`);

  const paymentMethods = ["COD", "VNPAY", "MOMO", "BANK_TRANSFER"];
  let count = 0;

  for (let i = 0; i < statusPlan.length; i++) {
    const status = statusPlan[i];
    const orderIndex = i + 1;
    const orderNumber = `DEMO-ORD-2026-${String(orderIndex).padStart(4, "0")}`;
    const orderId = randomUUID();

    const customer = CUSTOMERS[i % CUSTOMERS.length];
    const userId = userMap.get(customer.email) || null;
    const paymentMethod = paymentMethods[i % paymentMethods.length];

    // Determine payment status
    let paymentStatus = "PENDING";
    if (status === "DELIVERED" || status === "SHIPPED") {
      paymentStatus = "PAID";
    } else if (status === "CONFIRMED") {
      paymentStatus = paymentMethod === "COD" ? "PENDING" : "PAID";
    } else if (status === "CANCELLED") {
      paymentStatus = "FAILED";
    }

    // Select 1-3 distinct products
    const itemCount = 1 + (i % 3);
    const selectedProds: any[] = [];
    for (let j = 0; j < itemCount; j++) {
      const prod = products[(i * 3 + j) % products.length];
      if (!selectedProds.find((p) => p.id === prod.id)) {
        selectedProds.push(prod);
      }
    }

    let subtotal = 0;
    const orderItemsData = selectedProds.map((p, pIdx) => {
      const qty = 1 + (pIdx % 2);
      const price = Number(p.salePrice || p.regularPrice);
      const total = price * qty;
      subtotal += total;
      return {
        id: randomUUID(),
        orderId,
        productId: p.id,
        productTitle: p.title,
        sku: p.sku,
        price,
        quantity: qty,
        total,
      };
    });

    const discount = i % 4 === 0 ? 200000 : 0;
    const shippingFee = subtotal >= 500000 ? 0 : 30000;
    const total = Math.max(0, subtotal - discount + shippingFee);

    // Realistic creation date (over past 30 days)
    const daysAgo = 30 - Math.floor(i / 2);
    const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000 - (i * 3600 * 1000));
    const updatedAt = new Date(createdAt.getTime() + 1000 * 60 * 60 * 2);

    // 1. Insert Order
    await conn.query(
      `INSERT INTO orders (
        id, orderNumber, userId, customerName, customerEmail, customerPhone,
        shippingAddress, shippingCity, shippingDistrict, shippingWard, note,
        subtotal, discount, shippingFee, total, status, paymentMethod, paymentStatus,
        isSimulated, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
      [
        orderId,
        orderNumber,
        userId,
        customer.name,
        customer.email,
        customer.phone,
        customer.street,
        customer.city,
        customer.district,
        customer.ward,
        i % 3 === 0 ? "Giao giờ hành chính, gọi trước khi đến" : null,
        subtotal,
        discount,
        shippingFee,
        total,
        status,
        paymentMethod,
        paymentStatus,
        createdAt,
        updatedAt,
      ]
    );

    // 2. Insert Order Items
    for (const item of orderItemsData) {
      await conn.query(
        `INSERT INTO order_items (id, orderId, productId, productTitle, sku, price, quantity, total)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          item.id,
          item.orderId,
          item.productId,
          item.productTitle,
          item.sku,
          item.price,
          item.quantity,
          item.total,
        ]
      );
    }

    // 3. Insert Payment
    await conn.query(
      `INSERT INTO payments (
        id, orderId, amount, provider, status, transactionRef, paidAt, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        randomUUID(),
        orderId,
        total,
        paymentMethod,
        paymentStatus,
        paymentStatus === "PAID" ? `VNP-${Date.now().toString().slice(-8)}-${orderIndex}` : null,
        paymentStatus === "PAID" ? new Date(createdAt.getTime() + 1000 * 60 * 5) : null,
        createdAt,
        updatedAt,
      ]
    );

    // 4. Insert Order Status History
    const historyEvents: Array<{ status: string; note: string; minutes: number }> = [
      { status: "PENDING", note: "Đơn hàng đã được tạo thành công trên hệ thống", minutes: 0 },
    ];

    if (status === "CONFIRMED" || status === "SHIPPED" || status === "DELIVERED") {
      historyEvents.push({
        status: "CONFIRMED",
        note: "Bộ phận chăm sóc khách hàng đã xác nhận đơn và gửi lệnh đóng gói",
        minutes: 30,
      });
    }

    if (status === "SHIPPED" || status === "DELIVERED") {
      historyEvents.push({
        status: "SHIPPED",
        note: "Đơn hàng đã xuất kho và bàn giao cho Viettel Post Express (Mã vận đơn: VTP883921)",
        minutes: 180,
      });
    }

    if (status === "DELIVERED") {
      historyEvents.push({
        status: "DELIVERED",
        note: "Giao hàng thành công đến tay người nhận. Khách hàng đã kiểm tra và ký nhận",
        minutes: 1440,
      });
    }

    if (status === "CANCELLED") {
      historyEvents.push({
        status: "CANCELLED",
        note: "Khách hàng yêu cầu hủy đơn do thay đổi địa chỉ nhận hàng",
        minutes: 45,
      });
    }

    for (const h of historyEvents) {
      const eventTime = new Date(createdAt.getTime() + h.minutes * 60 * 1000);
      await conn.query(
        `INSERT INTO order_status_history (id, orderId, status, note, changedBy, createdAt)
         VALUES (?, ?, ?, ?, 'Hệ thống tự động', ?)`,
        [randomUUID(), orderId, h.status, h.note, eventTime]
      );
    }

    count++;
  }

  // Thống kê kết quả
  const [stats]: any = await conn.query(`
    SELECT status, COUNT(*) as count 
    FROM orders 
    WHERE isSimulated = 1 AND orderNumber LIKE 'DEMO-ORD-2026-%'
    GROUP BY status
  `);

  console.log("\n================================================================================");
  console.log(`✓ KẾT QUẢ TẠO 50 ĐƠN HÀNG THỬ NGHIỆM:`);
  console.log(`✓ Đã tạo thành công ${count} đơn hàng với đầy đủ OrderItems, Payments & Status History!`);
  console.log("--------------------------------------------------------------------------------");
  console.table(stats);
  console.log("================================================================================");

  await conn.end();
}

main().catch(console.error);

