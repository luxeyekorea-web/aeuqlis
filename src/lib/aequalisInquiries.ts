import { createSupabaseAdminClient } from "@/lib/supabase/server";

const TABLE_NAME = "aequalis_inquiries";

export const inquiryStatuses = ["new", "reviewing", "replied", "archived"] as const;
export const inquiryTypes = [
  "brand-collaboration",
  "artisan-series",
  "retail-exclusive",
  "press-editorial",
  "partnership",
  "other",
] as const;

export type InquiryStatus = (typeof inquiryStatuses)[number];
export type InquiryType = (typeof inquiryTypes)[number];

export type AequalisInquiry = {
  id: string;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  collaborationType: string;
  message: string;
  referenceUrl: string | null;
  status: InquiryStatus;
  adminNote: string | null;
  sourcePath: string | null;
  userAgent: string | null;
  createdAt: string;
  updatedAt: string;
};

export type InquiryInput = {
  name: string;
  company?: string;
  email: string;
  phone?: string;
  collaborationType?: string;
  message: string;
  referenceUrl?: string;
  sourcePath?: string;
  userAgent?: string;
};

type StoredInquiry = {
  id: string;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  collaboration_type: string;
  message: string;
  reference_url: string | null;
  status: InquiryStatus;
  admin_note: string | null;
  source_path: string | null;
  user_agent: string | null;
  created_at: string;
  updated_at: string;
};

function normalizeText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function normalizeInquiryType(value: unknown) {
  const type = normalizeText(value, 80);

  return inquiryTypes.includes(type as InquiryType) ? type : "";
}

function toInquiry(row: StoredInquiry): AequalisInquiry {
  return {
    id: row.id,
    name: row.name,
    company: row.company,
    email: row.email,
    phone: row.phone,
    collaborationType: row.collaboration_type,
    message: row.message,
    referenceUrl: row.reference_url,
    status: row.status,
    adminNote: row.admin_note,
    sourcePath: row.source_path,
    userAgent: row.user_agent,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function normalizeInquiryInput(input: unknown): InquiryInput {
  const source = input && typeof input === "object" ? input : {};
  const values = source as Record<string, unknown>;

  return {
    name: normalizeText(values.name, 120),
    company: normalizeText(values.company, 160),
    email: normalizeText(values.email, 180).toLowerCase(),
    phone: normalizeText(values.phone, 80),
    collaborationType: normalizeInquiryType(values.collaborationType),
    message: normalizeText(values.message, 3000),
    referenceUrl: normalizeText(values.referenceUrl, 400),
    sourcePath: normalizeText(values.sourcePath, 400),
  };
}

export function validateInquiryInput(input: InquiryInput) {
  if (!input.name) {
    return "Name is required.";
  }

  if (!input.collaborationType) {
    return "Inquiry type is required.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) {
    return "A valid email is required.";
  }

  if (input.phone && !/^[0-9+\-\s().]{7,30}$/.test(input.phone)) {
    return "Phone number format is invalid.";
  }

  if (!input.message || input.message.length < 20) {
    return "Message must be at least 20 characters.";
  }

  return null;
}

export async function createAequalisInquiry(input: InquiryInput) {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured.");
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .insert({
      name: input.name,
      company: input.company || null,
      email: input.email,
      phone: input.phone || null,
      collaboration_type: input.collaborationType || "partnership",
      message: input.message,
      reference_url: input.referenceUrl || null,
      source_path: input.sourcePath || null,
      user_agent: input.userAgent || null,
    })
    .select(
      "id, name, company, email, phone, collaboration_type, message, reference_url, status, admin_note, source_path, user_agent, created_at, updated_at",
    )
    .single<StoredInquiry>();

  if (error) {
    throw error;
  }

  return toInquiry(data);
}

export async function listAequalisInquiries() {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured.");
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select(
      "id, name, company, email, phone, collaboration_type, message, reference_url, status, admin_note, source_path, user_agent, created_at, updated_at",
    )
    .order("created_at", { ascending: false })
    .limit(100)
    .returns<StoredInquiry[]>();

  if (error) {
    throw error;
  }

  return data.map(toInquiry);
}

export async function updateAequalisInquiry(
  id: string,
  fields: { status?: InquiryStatus; adminNote?: string },
) {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured.");
  }

  const updatePayload: Record<string, string | null> = {};

  if (fields.status) {
    updatePayload.status = fields.status;
  }

  if (typeof fields.adminNote === "string") {
    updatePayload.admin_note = fields.adminNote.trim() || null;
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .update(updatePayload)
    .eq("id", id)
    .select(
      "id, name, company, email, phone, collaboration_type, message, reference_url, status, admin_note, source_path, user_agent, created_at, updated_at",
    )
    .single<StoredInquiry>();

  if (error) {
    throw error;
  }

  return toInquiry(data);
}
