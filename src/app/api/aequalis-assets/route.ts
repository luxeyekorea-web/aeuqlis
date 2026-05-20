import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

const BUCKET_NAME = "aequalis_images";
const MAX_FILE_SIZE = 8 * 1024 * 1024;

function sanitizeFileName(fileName: string) {
  const extension = fileName.split(".").pop()?.toLowerCase() ?? "png";
  const baseName = fileName
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  return `${baseName || "image"}-${Date.now()}.${extension}`;
}

export async function POST(request: Request) {
  try {
    const adminToken = process.env.AEQUALIS_ADMIN_TOKEN;
    const requestToken = request.headers.get("x-aequalis-admin-token");

    if (!adminToken) {
      return NextResponse.json(
        { error: "AEQUALIS_ADMIN_TOKEN is not configured." },
        { status: 500 },
      );
    }

    if (!requestToken || requestToken !== adminToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createSupabaseAdminClient();

    if (!supabase) {
      return NextResponse.json(
        { error: "SUPABASE_SERVICE_ROLE_KEY is not configured." },
        { status: 500 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const folder = String(formData.get("folder") ?? "uploads")
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, "-");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No image file provided." }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files can be uploaded." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "Image must be 8MB or smaller." }, { status: 400 });
    }

    const filePath = `${folder}/${sanitizeFileName(file.name)}`;
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, new Uint8Array(await file.arrayBuffer()), {
        contentType: file.type,
        cacheControl: "31536000",
        upsert: false,
      });

    if (error) {
      throw error;
    }

    const { data } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);

    return NextResponse.json({ publicUrl: data.publicUrl });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to upload image.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
