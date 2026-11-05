import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import fs from "fs";
import path from "path";

const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/ogg", "video/quicktime"];
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/svg+xml",
  "image/gif",
];
const MAX_VIDEO_SIZE = 80 * 1024 * 1024; // 80MB
const MAX_IMAGE_SIZE = 15 * 1024 * 1024; // 15MB

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user || user.role !== "ROLE_ADMIN") {
      return NextResponse.json({ error: "Không có quyền quản trị" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Vui lòng chọn file để tải lên" }, { status: 400 });
    }

    const mimeType = file.type;
    const isVideo = ALLOWED_VIDEO_TYPES.includes(mimeType);
    const isImage = ALLOWED_IMAGE_TYPES.includes(mimeType);

    if (!isVideo && !isImage) {
      return NextResponse.json(
        {
          error:
            "Định dạng không được hỗ trợ. Chỉ chấp nhận MP4, WebM (video) hoặc JPG, PNG, WebP (hình ảnh).",
        },
        { status: 400 }
      );
    }

    const maxSize = isVideo ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
    if (file.size > maxSize) {
      const maxMb = Math.round(maxSize / (1024 * 1024));
      return NextResponse.json(
        { error: `Dung lượng file vượt quá giới hạn cho phép (${maxMb}MB)` },
        { status: 400 }
      );
    }

    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), "public", "uploads", "banners");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Generate safe filename
    const ext = path.extname(file.name) || (isVideo ? ".mp4" : ".jpg");
    const sanitizedName = file.name
      .replace(ext, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 30);
    const fileName = `${Date.now()}-${sanitizedName}${ext}`;
    const filePath = path.join(uploadDir, fileName);

    // Write file to disk
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    fs.writeFileSync(filePath, buffer);

    const publicUrl = `/uploads/banners/${fileName}`;

    return NextResponse.json({
      message: "Tải file lên thành công",
      url: publicUrl,
      mediaType: isVideo ? "VIDEO" : "IMAGE",
      fileName,
      size: file.size,
      mimeType,
    });
  } catch (error: any) {
    console.error("Admin upload error:", error);
    return NextResponse.json(
      { error: "Lỗi tải lên máy chủ", details: error.message },
      { status: 500 }
    );
  }
}

