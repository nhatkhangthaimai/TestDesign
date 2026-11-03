import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
import crypto from "crypto";
import { getCurrentUser } from "@/lib/auth";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized: Please sign in to upload files" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file uploaded. Key 'file' is required." }, { status: 400 });
    }

    const blob = file as File;

    if (!ALLOWED_MIME_TYPES.has(blob.type)) {
      return NextResponse.json(
        { error: `Định dạng tệp không được hỗ trợ (${blob.type}). Chỉ chấp nhận JPEG, PNG, WebP, GIF, SVG.` },
        { status: 400 }
      );
    }

    if (blob.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Kích thước tệp vượt quá giới hạn cho phép (Tối đa 5MB)." },
        { status: 400 }
      );
    }

    const bytes = await blob.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Determine extension
    const ext = path.extname(blob.name) || (blob.type === "image/png" ? ".png" : blob.type === "image/webp" ? ".webp" : ".jpg");
    const uniqueName = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext.toLowerCase()}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    const filePath = path.join(uploadDir, uniqueName);

    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${uniqueName}`;

    return NextResponse.json({
      message: "Tải lên tệp thành công",
      url: publicUrl,
      filename: uniqueName,
      originalName: blob.name,
      size: blob.size,
      mimeType: blob.type,
    }, { status: 201 });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Lỗi xử lý tệp tải lên", details: error.message }, { status: 500 });
  }
}
