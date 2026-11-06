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

// 1. DANH SÁCH 40 KHÁCH HÀNG THỰC TẾ
const REVIEWER_PROFILES = [
  { name: "Hoàng Minh Nam", email: "hoang.nam@gmail.com", avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80" },
  { name: "Nguyễn Thị Lan Anh", email: "lan.anh@outlook.com", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80" },
  { name: "Trần Minh Trí", email: "minh.tri@fpt.com.vn", avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80" },
  { name: "Lê Thu Thảo", email: "thu.thao@techcorp.vn", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80" },
  { name: "Phạm Đức Hải", email: "duc.hai@viettel.vn", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80" },
  { name: "Đặng Quốc Bảo", email: "quoc.bao@gmail.com", avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80" },
  { name: "Vũ Phương Linh", email: "phuonglinh.vu@gmail.com", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80" },
  { name: "Bùi Tuấn Anh", email: "tuananh.bui@vingroup.net", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80" },
  { name: "Ngô Mai Phương", email: "maiphuong.ngo@vcb.com.vn", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80" },
  { name: "Dương Hoàng Long", email: "hoanglong.duong@gmail.com", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80" },
  { name: "Hồ Thanh Trúc", email: "thanhtruc.ho@shopee.vn", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80" },
  { name: "Tạ Quang Huy", email: "quanghuy.ta@tiki.vn", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80" },
  { name: "Đinh Thúy Hằng", email: "thuyhang.dinh@gmail.com", avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80" },
  { name: "Võ Thành Đạt", email: "thanhdat.vo@momo.vn", avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80" },
  { name: "Lý Gia Hân", email: "giahan.ly@gmail.com", avatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=200&q=80" },
  { name: "Trịnh Khắc Cường", email: "khaccuong.trinh@vnpt.vn", avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80" },
  { name: "Chu Ngọc Diệp", email: "ngocdiep.chu@gmail.com", avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=200&q=80" },
  { name: "Lâm Đình Trọng", email: "dinhtrong.lam@gmail.com", avatar: "https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?auto=format&fit=crop&w=200&q=80" },
  { name: "Đoàn Khánh Vy", email: "khanhvy.doan@vtv.vn", avatar: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=200&q=80" },
  { name: "Nguyễn Nhật Minh", email: "nhatminh.nguyen@zalo.me", avatar: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=200&q=80" },
  { name: "Phan Ánh Tuyết", email: "anhtuyet.phan@gmail.com", avatar: "https://images.unsplash.com/photo-1520813792240-56fc4a3765a7?auto=format&fit=crop&w=200&q=80" },
  { name: "Cao Văn Hùng", email: "vanhung.cao@vietjetair.com", avatar: "https://images.unsplash.com/photo-1496345875659-11f7dd282d1d?auto=format&fit=crop&w=200&q=80" },
  { name: "Mai Thu Trang", email: "thutrang.mai@msn.com", avatar: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=200&q=80" },
  { name: "Lương Quang Khải", email: "quangkhai.luong@techcombank.com.vn", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80" },
  { name: "Trương Yến Nhi", email: "yennhi.truong@gmail.com", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80" },
  { name: "Tô Minh Quân", email: "minhquan.to@fpt.edu.vn", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80" },
  { name: "Nghiêm Kim Chi", email: "kimchi.nghiem@gmail.com", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80" },
  { name: "Bạch Hải Đăng", email: "haidang.bach@vinfast.vn", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80" },
  { name: "Phùng Mỹ Duyên", email: "myduyen.phung@gmail.com", avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80" },
  { name: "Đỗ Việt Cường", email: "vietcuong.do@vng.com.vn", avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80" },
  { name: "Quách Thị Quỳnh", email: "quynh.quach@gmail.com", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80" },
  { name: "Huỳnh Quốc Thắng", email: "quocthang.huynh@gmail.com", avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80" },
  { name: "Vương Bích Ngọc", email: "bichngoc.vuong@hust.edu.vn", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80" },
  { name: "Tạ Minh Châu", email: "minhchau.ta@gmail.com", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80" },
  { name: "Phạm Hồng Nhung", email: "hongnhung.pham@vietinbank.vn", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80" },
  { name: "Trịnh Đình Khang", email: "dinhkhang.trinh@gmail.com", avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80" },
  { name: "Lê Cẩm Tú", email: "camtu.le@gmail.com", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80" },
  { name: "Nguyễn Tuấn Kiệt", email: "tuankiet.nguyen@fpt.vn", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80" },
  { name: "Trần Bảo Trâm", email: "baotram.tran@gmail.com", avatar: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=200&q=80" },
  { name: "Võ Hữu Phước", email: "huuphuoc.vo@gmail.com", avatar: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=200&q=80" },
];

// 2. KHO MẪU ĐÁNH GIÁ CHUYÊN BIỆT THEO DANH MỤC
const REVIEW_TEMPLATES_BY_CATEGORY: Record<string, Array<{ title: string; comment: string; rating: number }>> = {
  // Âm thanh
  "am-thanh-hi-end": [
    { title: "Chất âm đỉnh cao, bass sâu và nội lực", comment: "Sản phẩm thực sự vượt xa kỳ vọng. Âm bass lực và sâu, dải mid trong trẻo nghe vocal cực kỳ ngọt ngào. Khả năng chống ồn chủ động ANC tuyệt vời.", rating: 5 },
    { title: "Thiết kế sang trọng, hoàn thiện xuất sắc", comment: "Hàng nguyên seal chính hãng, đóng gói 3 lớp xốp cẩn thận. Cầm trên tay cảm giác hoàn thiện kim loại và da rất cao cấp, pin dùng cả tuần.", rating: 5 },
    { title: "Rất đáng đồng tiền bát gạo", comment: "Sau khi burn-in khoảng 20 giờ thì chất âm mở rộng rõ rệt, âm trường thoáng đãng, tách bạch từng nhạc cụ. Rất ưng ý với BBK Commerce!", rating: 5 },
    { title: "Đeo lâu rất êm tai, kết nối ổn định", comment: "Mình đeo làm việc liên tục 6-8 tiếng không hề bị đau đầu hay nóng tai. Bluetooth bắt sóng xuyên tường cực tốt, độ trễ thấp.", rating: 5 },
    { title: "Giao hàng siêu nhanh, âm thanh đã tai", comment: "Đặt buổi sáng đầu giờ chiều đã nhận được hàng. App điều khiển dễ tùy biến EQ. Điểm trừ duy nhất là giá hơi cao nhưng chất lượng tương xứng.", rating: 4 },
    { title: "Trải nghiệm nghe nhạc acoustics tuyệt hảo", comment: "Nghe nhạc acoustics hay jazz cảm nhận rõ tiếng gảy đàn guitar và tiếng lấy hơi. Chất lượng âm thanh phòng thu đích thực.", rating: 5 },
    { title: "Chống ồn tốt, đàm thoại rõ ràng", comment: "Mic khử tiếng ồn gió khi đi xe và họp online rất trong. Đã check bảo hành điện tử chính hãng kích hoạt chuẩn ngày mua.", rating: 5 },
    { title: "Âm thanh hay, hộp đựng kèm sang trọng", comment: "Hộp đựng và phụ kiện cáp sạc đi kèm đầy đủ, hoàn thiện tinh tế. Bass chắc nịch không bị lấn dải treble.", rating: 4 },
  ],

  // Điện thoại & Công nghệ
  "dien-thoai-cong-nghe": [
    { title: "Máy nguyên seal, bảo hành chính hãng", comment: "Kiểm tra số IMEI và serial number trên hệ thống chính hãng chuẩn chỉ chưa kích hoạt. Màn hình 120Hz mượt mà, màu sắc sống động rực rỡ.", rating: 5 },
    { title: "Camera chụp đêm và zoom quang đỉnh cao", comment: "Camera quay video 4K sắc nét kinh ngạc, chống rung cực tốt. Chụp ảnh thiếu sáng khử nhiễu hoàn hảo mà vẫn giữ được chi tiết chân thực.", rating: 5 },
    { title: "Hiệu năng vô đối, pin cực kỳ trâu", comment: "Chiến mượt mọi tựa game nặng ở thiết lập đồ họa cao nhất mà máy vẫn mát. Pin dùng thoải mái cả ngày dài làm việc đến tối vẫn còn 30%.", rating: 5 },
    { title: "Thiết kế viền mỏng, cầm nắm đầm tay", comment: "Màu sắc bên ngoài sang hơn trong ảnh nhiều. Viền máy gia công tinh xảo, phím bấm nảy và đầm tay. Rất hài lòng!", rating: 5 },
    { title: "Nâng cấp cực kỳ xứng đáng", comment: "Lên đời từ máy cũ thấy trải nghiệm mượt mà hơn hẳn. Shop bọc bóng khí cẩn thận, shipper giao tận tay vui vẻ.", rating: 5 },
    { title: "Máy dùng mượt, sạc nhanh tiện lợi", comment: "Tốc độ sạc rất nhanh, khoảng 30 phút là đủ dùng cả buổi. Hệ điều hành ổn định, loa ngoài stereo to và rõ.", rating: 4 },
    { title: "Chất lượng dịch vụ 5 sao", comment: "Nhân viên tư vấn chi tiết các chính sách đổi trả và xuất hóa đơn VAT nhanh chóng. Máy xịn xò không có điểm gì chê.", rating: 5 },
  ],

  // Laptop & Máy tính
  "laptop-may-tinh": [
    { title: "Cỗ máy làm việc siêu mạnh mẽ", comment: "Render video 4K và biên dịch code cực kỳ nhanh chóng. Máy chạy êm ái, quạt tản nhiệt không bị hú to khi full load.", rating: 5 },
    { title: "Màn hình chuẩn màu đồ họa tuyệt đẹp", comment: "Độ sáng cao, độ phủ màu 100% sRGB/DCI-P3 cực chuẩn cho anh em làm thiết kế và dựng phim. Viền màn hình mỏng quyến rũ.", rating: 5 },
    { title: "Bàn phím gõ sướng, trackpad rộng rãi", comment: "Hành trình phím sâu, độ nảy tốt gõ văn bản hàng giờ không mỏi tay. Trackpad đa điểm nhạy và mượt như lụa.", rating: 5 },
    { title: "Thời lượng pin ấn tượng, tiện di chuyển", comment: "Cầm máy đi họp và làm việc quán cà phê cả ngày không cần đem theo củ sạc. Trọng lượng nhẹ nhàng so với cấu hình khủng.", rating: 5 },
    { title: "Hàng chính hãng đóng hộp chỉn chu", comment: "Tem niêm phong của hãng còn nguyên vẹn. Khởi động máy chỉ mất 5 giây, bảo mật vân tay mở khóa tức thì.", rating: 5 },
    { title: "Máy mượt mà, cấu hình vượt tầm giá", comment: "Chạy đa nhiệm hàng chục tab Chrome và phần mềm đồ họa cùng lúc mà RAM vẫn còn dư dả. Rất hài lòng!", rating: 4 },
    { title: "Build nhôm nguyên khối chắc chắn", comment: "Cảm giác cầm trên tay rất cứng cáp và sang trọng, không hề bị flex bàn phím hay ọp ẹp. Đánh giá 5 sao cho shop.", rating: 5 },
  ],

  // Đồng hồ & Smartwatch
  "dong-ho-smartwatch": [
    { title: "GPS chuẩn xác, pin trâu không tưởng", comment: "Bắt sóng GPS ngoài trời chỉ trong 3 giây, đo quãng đường chạy bộ chính xác từng mét. Pin dùng liên tục gần 2 tuần mới cần sạc.", rating: 5 },
    { title: "Kính sapphire chống trầy hoàn hảo", comment: "Va chạm nhẹ vài lần vào cạnh bàn nhưng mặt kính vẫn không hề có vết xước nào. Khung vỏ chắc chắn, kháng nước cực tốt khi đi bơi.", rating: 5 },
    { title: "Theo dõi sức khỏe và giấc ngủ rất chi tiết", comment: "Cảm biến đo nhịp tim, nồng độ oxy trong máu SpO2 và biểu đồ giấc ngủ chuyên sâu giúp mình cải thiện lối sống rất nhiều.", rating: 5 },
    { title: "Thiết kế nam tính, đeo rất êm tay", comment: "Mặt đồng hồ toát lên vẻ thể thao hiện đại, dây đeo silicon mềm mại thoáng khí, không gây bí bách khi đổ mồ hôi.", rating: 5 },
    { title: "Nhận thông báo Zalo cuộc gọi tức thì", comment: "Rung báo cuộc gọi và tin nhắn rất nhạy, không bao giờ bị nhỡ việc quan trọng khi đang lái xe ngoài đường.", rating: 4 },
    { title: "Màn hình AMOLED sáng rõ ngoài trời", comment: "Dưới trời nắng gắt vẫn nhìn rõ từng thông số chạy bộ mà không cần che tay. Shop giao hàng nhanh đóng gói cẩn thận.", rating: 5 },
  ],

  // Gia dụng thông minh
  "gia-dung-smart-living": [
    { title: "Lực hút cực mạnh, hút sạch bụi mịn", comment: "Nhà có nuôi mèo nên trước đây lông rụng khắp nơi, dùng em này hút sạch bóng cả lông lẫn bụi mịn li ti trên thảm và sofa.", rating: 5 },
    { title: "Đèn laser soi bụi quá đỉnh", comment: "Tia laser chiếu sàn nhìn thấy rõ từng hạt bụi li ti mắt thường không thấy được. Hút xong sàn nhà sạch bong kin kít.", rating: 5 },
    { title: "Vận hành êm ái, app thông minh tiện lợi", comment: "Độ ồn thấp hơn hẳn các dòng máy cũ, điều khiển hẹn giờ qua điện thoại cực kỳ tiện lợi khi đi làm vắng nhà.", rating: 5 },
    { title: "Tháo lắp và vệ sinh dễ dàng", comment: "Các chi tiết khớp nối chắc chắn, đổ bụi chỉ bằng một nút gạt không lo bẩn tay. Pin dung lượng cao đủ dọn sạch cả căn hộ 100m2.", rating: 5 },
    { title: "Thiết kế hiện đại, sang trọng không gian", comment: "Để ở góc phòng khách nhìn rất thẩm mỹ và công nghệ. Đóng gói cẩn thận, phụ kiện đi kèm đầy đủ các loại đầu hút.", rating: 5 },
    { title: "Rất đáng tiền, tiết kiệm thời gian", comment: "Giải phóng sức lao động đáng kể cho gia đình. Máy chạy bền bỉ và ổn định, rất hài lòng với sản phẩm!", rating: 4 },
  ],

  // Phụ kiện công nghệ (Bàn phím cơ, Chuột, Tai nghe nhỏ, Cáp sạc)
  "phu-kien-cong-nghe": [
    { title: "Switch gõ siêu êm, cảm giác nảy sướng tay", comment: "Bàn phím gõ có độ nảy tuyệt vời, hành trình phím mượt mà không bị rít. Switch êm ái gõ văn phòng không sợ làm phiền người xung quanh.", rating: 5 },
    { title: "Kết nối đa thiết bị tiện lợi tuyệt đối", comment: "Chuyển đổi tức thì giữa Macbook, iPad và máy bàn Windows chỉ bằng 1 tổ hợp phím. Độ trễ không dây gần như bằng 0.", rating: 5 },
    { title: "Build kim loại đầm tay, keycap cao cấp", comment: "Trọng lượng đầm chắc để trên bàn không bị xê dịch khi gõ nhanh. Keycap chất liệu cao cấp chống bám vân tay và dầu mỡ tốt.", rating: 5 },
    { title: "Thời lượng pin siêu dài, sạc nhanh Type-C", comment: "Dùng cả tháng bật đèn nền liên tục mà pin vẫn còn 40%. Cổng sạc Type-C tiện lợi dùng chung cáp với điện thoại.", rating: 5 },
    { title: "Chuột cầm công thái học không mỏi cổ tay", comment: "Form chuột ôm sát lòng bàn tay, con lăn kim loại cuộn siêu tốc mượt mà. Làm việc 8 tiếng liên tục không còn đau cổ tay.", rating: 5 },
    { title: "Đóng gói kỹ, hàng chính hãng 100%", comment: "Hộp còn nguyên seal nguyên tem của nhà phân phối. Shop gửi kèm cả hóa đơn bán lẻ và phiếu bảo hành chính thức.", rating: 5 },
    { title: "Thiết kế tối giản và tinh tế", comment: "Tông màu đồng bộ với góc setup bàn làm việc tối giản. Rất thích phong cách chăm sóc khách hàng của BBK Commerce.", rating: 4 },
  ],
};

// Mẫu đánh giá chung dự phòng
const GENERAL_REVIEWS = [
  { title: "Sản phẩm chính hãng chất lượng cao", comment: "Đã nhận hàng và kiểm tra kỹ lưỡng, sản phẩm nguyên seal mới 100%. Mọi chức năng hoạt động hoàn hảo đúng như mô tả.", rating: 5 },
  { title: "Giao hàng nhanh, đóng gói cẩn thận", comment: "Hàng được bọc túi khí chống sốc nhiều lớp rất kỹ. Nhận hàng hộp còn vuông vắn không bị móp méo góc nào. Cho shop 5 sao!", rating: 5 },
  { title: "Trải nghiệm sử dụng rất hài lòng", comment: "Sau hơn 2 tuần sử dụng thực tế thì mình thấy sản phẩm rất ổn định, hoàn thiện cao cấp, xứng đáng với số tiền bỏ ra.", rating: 5 },
  { title: "Sản phẩm tốt, hỗ trợ kỹ thuật nhiệt tình", comment: "Mình có nhắn tin hỏi cách kích hoạt bảo hành điện tử và được nhân viên phản hồi chỉ sau vài phút. Dịch vụ rất chuyên nghiệp.", rating: 5 },
  { title: "Chất lượng vượt ngoài mong đợi", comment: "Hàng thực tế đẹp hơn trên hình ảnh. Hoàn thiện sắc sảo, dùng rất mượt mà. Chắc chắn sẽ tiếp tục ủng hộ shop các lần sau.", rating: 5 },
  { title: "Sản phẩm tốt, giá cạnh tranh", comment: "So sánh nhiều nơi thì thấy BBK Commerce có giá tốt nhất kèm nhiều ưu đãi. Dùng rất ổn định và hài lòng.", rating: 4 },
  { title: "Rất đáng tiền, hoàn thiện tỉ mỉ", comment: "Thiết kế cao cấp, công năng đầy đủ. Đã giới thiệu cho bạn bè đồng nghiệp cùng mua.", rating: 5 },
];

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomDateInLastDays(days: number): Date {
  const now = Date.now();
  const past = now - getRandomInt(1, days) * 24 * 60 * 60 * 1000 - getRandomInt(0, 86400000);
  return new Date(past);
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

async function main() {
  console.log("================================================================================");
  console.log("     KHỞI TẠO ĐÁNH GIÁ SẢN PHẨM (REVIEWS SEEDING) TRÊN TIDB CLOUD AWS           ");
  console.log("================================================================================");

  let connection;
  try {
    connection = await mysql.createConnection(tidbConfig);
    console.log("✓ Kết nối TiDB Cloud thành công qua cổng 4000 (TLS/SSL)!\n");

    // 1. Đảm bảo nhóm 40 người dùng đánh giá tồn tại trong bảng users
    console.log("--> 1. Kiểm tra và bổ sung tài khoản người đánh giá trong bảng users...");
    const defaultPasswordHash = await bcrypt.hash("123456", 10);
    let createdUsersCount = 0;

    for (const u of REVIEWER_PROFILES) {
      const [existing]: any = await connection.query("SELECT id FROM users WHERE email = ? LIMIT 1", [u.email]);
      if (existing.length === 0) {
        const userId = randomUUID();
        await connection.query(
          `INSERT INTO users (id, email, passwordHash, name, role, avatar, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, 'ROLE_USER', ?, NOW(), NOW())`,
          [userId, u.email, defaultPasswordHash, u.name, u.avatar]
        );
        createdUsersCount++;
      }
    }
    console.log(`✓ Đã bổ sung ${createdUsersCount} tài khoản khách hàng mới.`);

    // Lấy toàn bộ danh sách users để làm reviewer pool
    const [allUsers]: any = await connection.query("SELECT id, name FROM users");
    console.log(`✓ Tổng số người dùng trong hệ thống có thể viết đánh giá: ${allUsers.length} users.\n`);

    // 2. Lấy toàn bộ sản phẩm active trong hệ thống kèm category slug
    console.log("--> 2. Lấy danh sách sản phẩm từ bảng products...");
    const [products]: any = await connection.query(`
      SELECT p.id, p.title, p.slug, c.slug as categorySlug
      FROM products p
      LEFT JOIN categories c ON p.categoryId = c.id
      WHERE p.status = 'ACTIVE'
    `);
    console.log(`✓ Tìm thấy ${products.length} sản phẩm ACTIVE cần tạo đánh giá.\n`);

    // Xóa các reviews cũ nếu có để tránh trùng lặp
    const [currentReviews]: any = await connection.query("SELECT COUNT(*) as c FROM reviews");
    console.log(`✓ Số lượng reviews hiện tại trong database: ${currentReviews[0]?.c || 0} reviews.`);
    if (currentReviews[0]?.c > 0) {
      console.log("--> Đang làm sạch bảng reviews để nạp bộ đánh giá mới...");
      await connection.query("DELETE FROM reviews");
      console.log("✓ Đã xóa reviews cũ.");
    }

    // 3. Tạo 5 - 10 đánh giá cho MỖI sản phẩm
    console.log("--> 3. Bắt đầu sinh 5 - 10 đánh giá thực tế cho từng sản phẩm...");
    const reviewsToInsert: any[] = [];

    for (const product of products) {
      // Số lượng đánh giá ngẫu nhiên từ 5 đến 10
      const reviewCount = getRandomInt(5, 10);

      // Chọn mẫu review phù hợp với danh mục
      const categorySlug = product.categorySlug || "";
      const templatePool = REVIEW_TEMPLATES_BY_CATEGORY[categorySlug] || GENERAL_REVIEWS;

      // Xáo trộn người dùng để mỗi đánh giá trong 1 sản phẩm là một người khác nhau
      const shuffledUsers = shuffleArray(allUsers).slice(0, reviewCount);
      const shuffledTemplates = shuffleArray([...templatePool, ...GENERAL_REVIEWS]);

      for (let i = 0; i < reviewCount; i++) {
        const reviewer = shuffledUsers[i % shuffledUsers.length];
        const template = shuffledTemplates[i % shuffledTemplates.length];
        const reviewDate = getRandomDateInLastDays(90);

        // Tạo id cho review
        const reviewId = randomUUID();

        // Biến tấu tiêu đề & nội dung theo tên sản phẩm để chân thực
        let commentText = template.comment;
        // Đôi khi đề cập trực tiếp đến tên thương hiệu hoặc sản phẩm
        if (Math.random() > 0.6) {
          const shortTitle = product.title.split("(")[0].trim();
          commentText = `Vừa nhận chiếc ${shortTitle}, ${commentText.charAt(0).toLowerCase() + commentText.slice(1)}`;
        }

        reviewsToInsert.push([
          reviewId,
          product.id,
          reviewer.id,
          template.rating,
          template.title,
          commentText,
          1, // isVerifiedPurchase = true
          0, // isSimulated = false
          reviewDate,
          reviewDate,
        ]);
      }
    }

    console.log(`✓ Đã chuẩn bị tổng cộng ${reviewsToInsert.length} đánh giá chất lượng cao.`);

    // 4. Chèn hàng loạt (Bulk Insert) vào bảng reviews theo chunk 200 bản ghi
    console.log("--> 4. Đang nạp đánh giá vào TiDB Cloud theo từng đợt (chunks of 200)...");
    const CHUNK_SIZE = 200;
    let insertedTotal = 0;

    for (let i = 0; i < reviewsToInsert.length; i += CHUNK_SIZE) {
      const chunk = reviewsToInsert.slice(i, i + CHUNK_SIZE);
      const valuesPlaceholders = chunk.map(() => "(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").join(", ");
      const flattenedValues = chunk.flat();

      await connection.query(
        `INSERT INTO reviews (id, productId, userId, rating, title, comment, isVerifiedPurchase, isSimulated, createdAt, updatedAt)
         VALUES ${valuesPlaceholders}`,
        flattenedValues
      );
      insertedTotal += chunk.length;
      process.stdout.write(`\r   -> Tiến độ nạp reviews: ${insertedTotal} / ${reviewsToInsert.length} (${Math.round((insertedTotal / reviewsToInsert.length) * 100)}%)`);
    }
    console.log("\n✓ Hoàn tất nạp toàn bộ đánh giá vào bảng reviews!\n");

    // 5. Cập nhật lại ratingsCount và ratingsAvg cho từng sản phẩm trong bảng products
    console.log("--> 5. Đồng bộ lại ratingsCount và ratingsAvg trên bảng products từ dữ liệu reviews mới...");
    await connection.query(`
      UPDATE products p
      JOIN (
        SELECT productId, COUNT(*) as cnt, ROUND(AVG(rating), 1) as avgRating
        FROM reviews
        GROUP BY productId
      ) r ON p.id = r.productId
      SET p.ratingsCount = r.cnt, p.ratingsAvg = r.avgRating;
    `);
    console.log("✓ Đồng bộ ratingsCount và ratingsAvg trên bảng products thành công!\n");

    // 6. Kiểm tra lại kết quả
    const [finalStats]: any = await connection.query(`
      SELECT 
        COUNT(DISTINCT r.productId) as reviewedProducts,
        COUNT(*) as totalReviews,
        ROUND(AVG(r.rating), 2) as averageStoreRating,
        MIN(sub.cnt) as minReviewsPerProduct,
        MAX(sub.cnt) as maxReviewsPerProduct
      FROM reviews r
      JOIN (
        SELECT productId, COUNT(*) as cnt FROM reviews GROUP BY productId
      ) sub ON r.productId = sub.productId;
    `);

    console.log("================================================================================");
    console.log("                       KẾT QUẢ TỔNG KẾT REVIEWS TRÊN TIDB                      ");
    console.log("================================================================================");
    console.log(`✓ Tổng số sản phẩm đã có đánh giá : ${finalStats[0]?.reviewedProducts} / ${products.length} sản phẩm`);
    console.log(`✓ Tổng số đánh giá đã thêm        : ${finalStats[0]?.totalReviews} reviews`);
    console.log(`✓ Số đánh giá mỗi sản phẩm        : Từ ${finalStats[0]?.minReviewsPerProduct} đến ${finalStats[0]?.maxReviewsPerProduct} đánh giá / sản phẩm`);
    console.log(`✓ Điểm đánh giá trung bình toàn sàn: ${finalStats[0]?.averageStoreRating} ⭐ / 5.0 ⭐`);
    console.log("================================================================================");

  } catch (error: any) {
    console.error("Lỗi khi thêm đánh giá sản phẩm:", error);
  } finally {
    if (connection) await connection.end();
  }
}

main();
