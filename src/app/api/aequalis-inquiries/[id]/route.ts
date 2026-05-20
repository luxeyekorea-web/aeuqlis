import { NextResponse } from "next/server";
import {
  inquiryStatuses,
  updateAequalisInquiry,
  type InquiryStatus,
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const tokenError = validateAdminToken(request);

    if (tokenError) {
      return tokenError;
    }

    const { id } = await params;
    const body = (await request.json()) as {
      status?: unknown;
      adminNote?: unknown;
    };
    const status =
      typeof body.status === "string" &&
      inquiryStatuses.includes(body.status as InquiryStatus)
        ? (body.status as InquiryStatus)
        : undefined;
    const adminNote =
      typeof body.adminNote === "string" ? body.adminNote.slice(0, 2000) : undefined;

    if (!status && typeof adminNote !== "string") {
      return NextResponse.json({ error: "No valid update fields." }, { status: 400 });
    }

    const inquiry = await updateAequalisInquiry(id, { status, adminNote });

    return NextResponse.json({ inquiry });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update inquiry.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
