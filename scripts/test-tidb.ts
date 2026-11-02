import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('--- KIỂM TRA TIDB CLOUD ---');
  const userCount = await prisma.user.count();
  const productCount = await prisma.product.count();
  const categoryCount = await prisma.category.count();
  const brandCount = await prisma.brand.count();

  console.log(`- Categories: ${categoryCount}`);
  console.log(`- Brands: ${brandCount}`);
  console.log(`- Products: ${productCount}`);
  console.log(`- Users: ${userCount}`);

  if (userCount === 0) {
    console.log('--> Đang khởi tạo tài khoản Admin và Khách Hàng mẫu...');
    const adminPassword = await bcrypt.hash('Admin@123456', 10);
    const userPassword = await bcrypt.hash('User@123456', 10);

    await prisma.user.create({
      data: {
        email: 'admin@ecommerce.vn',
        name: 'Quản Trị Viên Cấp Cao',
        passwordHash: adminPassword,
        role: 'ROLE_ADMIN',
        phone: '0901234567',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      },
    });

    await prisma.user.create({
      data: {
        email: 'khachhang@ecommerce.vn',
        name: 'Nguyễn Văn Hùng',
        passwordHash: userPassword,
        role: 'ROLE_USER',
        phone: '0987654321',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
        addresses: {
          create: [
            {
              recipientName: 'Nguyễn Văn Hùng',
              phone: '0987654321',
              street: 'Tòa nhà Bitexco, 2 Hải Triều',
              ward: 'Phường Bến Nghé',
              district: 'Quận 1',
              city: 'Hồ Chí Minh',
              isDefault: true,
            },
          ],
        },
      },
    });
    console.log('✓ Đã tạo Admin (admin@ecommerce.vn / Admin@123456) & Khách Hàng thành công!');
  }

  const bannerCount = await prisma.banner.count();
  if (bannerCount === 0) {
    console.log('--> Đang tạo banner mẫu...');
    await prisma.banner.createMany({
      data: [
        {
          title: 'Apple iPhone 16 Pro Max',
          subtitle: 'Titan Sa Mạc Đỉnh Cao - Đột Phá Apple Intelligence',
          imageUrl: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=1600&q=80',
          linkUrl: '/products/iphone-16-pro-max-256gb',
          badgeText: 'Khám Phá Ngay',
          sortOrder: 1,
          isActive: true,
        },
        {
          title: 'Sony WH-1000XM5 Hi-Res',
          subtitle: 'Đỉnh Cao Chống Ồn Thế Hệ Mới - Âm Thanh Chuẩn Phòng Thu',
          imageUrl: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1600&q=80',
          linkUrl: '/products/sony-wh-1000xm5-wireless-noise-cancelling',
          badgeText: 'Trải Nghiệm',
          sortOrder: 2,
          isActive: true,
        },
      ],
    });
    console.log('✓ Đã tạo banner trang chủ thành công!');
  }

  console.log('🎉 Hoàn tất toàn bộ khởi tạo trên TiDB Cloud!');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
