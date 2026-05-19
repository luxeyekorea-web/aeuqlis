import { NextResponse } from "next/server";
import { normalizeAequalisContent } from "@/lib/aequalisContent";
import {
  getAequalisContentFromSupabase,
  saveAequalisContentToSupabase,
} from "@/lib/aequalisSupabase";

export async function GET() {
  const content = await getAequalisContentFromSupabase();

  return NextResponse.json({ content });
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

    const body = (await request.json()) as { content?: unknown };
    const content = normalizeAequalisContent(body.content);

    await saveAequalisContentToSupabase(content);

    return NextResponse.json({ content });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to save content.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
