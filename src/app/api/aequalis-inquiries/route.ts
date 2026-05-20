import { NextResponse } from "next/server";
import {
  createAequalisInquiry,
  listAequalisInquiries,
  normalizeInquiryInput,
  validateInquiryInput,
} from "@/lib/aequalisInquiries";

function validateAdminToken(request: Request) {
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

  return null;
}

export async function GET(request: Request) {
  try {
    const tokenError = validateAdminToken(request);

    if (tokenError) {
      return tokenError;
    }

    const inquiries = await listAequalisInquiries();

    return NextResponse.json({ inquiries });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load inquiries.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { inquiry?: unknown; website?: unknown };

    if (typeof body.website === "string" && body.website.trim()) {
      return NextResponse.json({ ok: true });
    }

    const inquiry = normalizeInquiryInput(body.inquiry ?? body);
    const validationError = validateInquiryInput(inquiry);

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const createdInquiry = await createAequalisInquiry({
      ...inquiry,
      userAgent: request.headers.get("user-agent") ?? undefined,
    });

    return NextResponse.json({ inquiry: createdInquiry }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to submit inquiry.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
