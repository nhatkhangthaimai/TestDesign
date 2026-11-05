import mysql from "mysql2/promise";

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

const BANNERS = [
  {
    id: "banner-1080p-iphone16-titan",
    title: "TUYỆT TÁC CÔNG NGHỆ & ÂM THANH ĐỈNH CAO",
    subtitle: "iPhone 16 Pro Max Titan Sa Mạc • Khung Viền Hàng Không • Chip A18 Pro 3nm",
    description: "Khám phá siêu phẩm công nghệ với camera Fusion 48MP, nút Camera Control cảm ứng lực độc quyền và trải nghiệm mua sắm bảo mật 100% nguyên seal.",
    imageUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1920&q=85",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    videoMobileUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    posterUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1920&q=85",
    mediaType: "VIDEO",
    linkUrl: "/products/iphone-16-pro-max-256gb",
    badgeText: "MỞ BÁN ĐẶC QUYỀN 2026",
    ctaText: "Khám Phá Ngay",
    textColor: "#ffffff",
    overlayColor: "#000000",
    overlayOpacity: 0.45,
    contentPosition: "LEFT",
    targetDevice: "ALL",
    position: "HERO",
    isActive: 1,
    sortOrder: 1,
    durationSeconds: 10,
  },
  {
    id: "banner-1080p-sony-wh1000xm5",
    title: "ĐỈNH CAO CHỐNG ỒN CHUẨN PHÒNG THU HI-RES",
    subtitle: "Sony WH-1000XM5 Hi-Res • Bộ Xử Lý Kép V1 & QN1 Tối Thượng",
    description: "Đắm chìm vào không gian âm thanh trung thực không độ trễ, công nghệ tự động tối ưu hóa chống ồn Auto NC Optimizer và đệm tai da êm ái suốt 30 giờ.",
    imageUrl: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1920&q=85",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4",
    videoMobileUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4",
    posterUrl: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1920&q=85",
    mediaType: "VIDEO",
    linkUrl: "/products/sony-wh-1000xm5-wireless-noise-cancelling",
    badgeText: "ÂM THANH PHÒNG THU",
    ctaText: "Trải Nghiệm Ngay",
    textColor: "#ffffff",
    overlayColor: "#000000",
    overlayOpacity: 0.45,
    contentPosition: "LEFT",
    targetDevice: "ALL",
    position: "HERO",
    isActive: 1,
    sortOrder: 2,
    durationSeconds: 10,
  },
  {
    id: "banner-1080p-macbook-pro-m4",
    title: "MACBOOK PRO M4 MAX • HIỆU NĂNG ĐỒ HỌA TỐI THƯỢNG",
    subtitle: "Cỗ Máy Sáng Tạo Không Giới Hạn • Màn Hình Liquid Retina XDR 1600 nits",
    description: "Xử lý các mô hình AI và render 3D phức tạp mượt mà với 128GB Unified Memory, băng thông 546GB/s và thời lượng pin đột phá lên đến 24 giờ liên tục.",
    imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1920&q=85",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
    videoMobileUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
    posterUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1920&q=85",
    mediaType: "VIDEO",
    linkUrl: "/products",
    badgeText: "FLAGSHIP CHUYÊN NGHIỆP",
    ctaText: "Khám Phá Cấu Hình",
    textColor: "#ffffff",
    overlayColor: "#000000",
    overlayOpacity: 0.45,
    contentPosition: "LEFT",
    targetDevice: "ALL",
    position: "HERO",
    isActive: 1,
    sortOrder: 3,
    durationSeconds: 10,
  },
];

async function main() {
  console.log("--> Đang kết nối TiDB Cloud để nạp Video Banner 1080p...");
  const conn = await mysql.createConnection(connectionConfig);

  for (const b of BANNERS) {
    await conn.query(
      `
      INSERT INTO banners (
        id, title, subtitle, description, imageUrl, videoUrl, videoMobileUrl, posterUrl,
        mediaType, linkUrl, badgeText, ctaText, textColor, overlayColor, overlayOpacity,
        contentPosition, targetDevice, position, isActive, sortOrder, durationSeconds, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      ON DUPLICATE KEY UPDATE
        title = VALUES(title),
        subtitle = VALUES(subtitle),
        description = VALUES(description),
        imageUrl = VALUES(imageUrl),
        videoUrl = VALUES(videoUrl),
        videoMobileUrl = VALUES(videoMobileUrl),
        posterUrl = VALUES(posterUrl),
        mediaType = VALUES(mediaType),
        linkUrl = VALUES(linkUrl),
        badgeText = VALUES(badgeText),
        ctaText = VALUES(ctaText),
        textColor = VALUES(textColor),
        overlayColor = VALUES(overlayColor),
        overlayOpacity = VALUES(overlayOpacity),
        contentPosition = VALUES(contentPosition),
        targetDevice = VALUES(targetDevice),
        position = VALUES(position),
        isActive = VALUES(isActive),
        sortOrder = VALUES(sortOrder),
        durationSeconds = VALUES(durationSeconds),
        updatedAt = NOW();
    `,
      [
        b.id,
        b.title,
        b.subtitle,
        b.description,
        b.imageUrl,
        b.videoUrl,
        b.videoMobileUrl,
        b.posterUrl,
        b.mediaType,
        b.linkUrl,
        b.badgeText,
        b.ctaText,
        b.textColor,
        b.overlayColor,
        b.overlayOpacity,
        b.contentPosition,
        b.targetDevice,
        b.position,
        b.isActive,
        b.sortOrder,
        b.durationSeconds,
      ]
    );
    console.log(`✓ Đã nạp thành công Video Banner: "${b.title}"`);
  }

  const [rows]: any = await conn.query("SELECT id, title, mediaType, videoUrl FROM banners");
  console.log(`\n✓ Tổng số banner hiện có trong TiDB Cloud: ${rows.length} banner`);
  console.table(rows);

  await conn.end();
}

main().catch(console.error);

