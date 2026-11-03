#!/usr/bin/env bash
set -e

echo "================================================================================"
echo "          TIẾN TRÌNH TỰ ĐỘNG TRIỂN KHAI AJ COMMERCE LÊN AWS EC2                 "
echo "================================================================================"

# 1. Cấu hình Swap 2GB (Bảo vệ tràn RAM khi build trên EC2 t2.micro / t3.micro)
if [ ! -f /swapfile ]; then
  echo "--> Đang tạo 2GB Swap Memory để hỗ trợ RAM..."
  sudo fallocate -l 2G /swapfile || sudo dd if=/dev/zero of=/swapfile bs=1M count=2048
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
  echo "✓ Đã kích hoạt 2GB Swap thành công!"
else
  echo "✓ Swap đã tồn tại, đảm bảo swap đang bật..."
  sudo swapon /swapfile 2>/dev/null || true
fi

# 2. Cài đặt các gói phụ trợ: Node.js 20 LTS, Nginx, Git, PM2
echo "--> Kiểm tra và cài đặt Node.js 20 LTS & PM2..."
if ! command -v node &> /dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs nginx git
fi

if ! command -v pm2 &> /dev/null; then
  sudo npm install -g pm2
fi

echo "✓ Node.js version: $(node -v)"
echo "✓ NPM version: $(npm -v)"
echo "✓ PM2 version: $(pm2 -v)"

# 3. Tạo file cấu hình môi trường .env (kết nối trực tiếp TiDB Cloud AWS Singapore)
echo "--> Cấu hình file .env với TiDB Cloud..."
cat << 'EOF' > .env
DATABASE_URL="mysql://iY15LFk8kgKVgVn.root:m22dorl92xShU1H8@gateway01.ap-southeast-1.prod.aws.tidbcloud.com:4000/test?sslaccept=strict"
JWT_SECRET="aj_ecommerce_production_secure_jwt_secret_2026_aws_cloud_xyz"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="production"
PORT=3000
EOF

# 4. Cài đặt dependencies và chuyển Prisma sang TiDB MySQL
echo "--> Đang cài đặt thư viện npm (npm install)..."
npm install --production=false

echo "--> Đang đồng bộ Prisma Client với schema TiDB Cloud..."
npm run use:tidb

echo "--> Đang thực hiện build tối ưu hóa sản phẩm (npm run build)..."
export NODE_OPTIONS="--max-old-space-size=2560"
npm run build

# 5. Khởi chạy ứng dụng qua PM2 (tự khởi động khi reboot máy chủ)
echo "--> Khởi động ứng dụng bằng PM2..."
pm2 stop aj-commerce 2>/dev/null || true
pm2 delete aj-commerce 2>/dev/null || true
pm2 start npm --name "aj-commerce" -- start
pm2 save
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME 2>/dev/null || true

# 6. Cấu hình Nginx làm Reverse Proxy (chuyển tiếp cổng 80 -> 3000)
echo "--> Cấu hình Nginx Reverse Proxy (Port 80 -> Port 3000)..."
sudo tee /etc/nginx/sites-available/default > /dev/null << 'NGINX_CONF'
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    server_name _;

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINX_CONF

sudo nginx -t && sudo systemctl restart nginx

echo "================================================================================"
echo "          CHÚC MỪNG! WEBSITE ĐÃ ĐƯỢC TRIỂN KHAI THÀNH CÔNG TRÊN AWS EC2!      "
echo "================================================================================"
echo "Bây giờ bạn có thể mở trình duyệt và truy cập trực tiếp bằng địa chỉ Public IP:"
echo "👉 http://$(curl -s http://checkip.amazonaws.com || curl -s ifconfig.me)"
echo "================================================================================"
