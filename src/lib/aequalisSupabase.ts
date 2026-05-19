import {
  createSupabaseAdminClient,
  createSupabaseReadClient,
} from "@/lib/supabase/server";
import {
  getDefaultContent,
  normalizeAequalisContent,
  type AequalisContent,
} from "./aequalisContent";

const TABLE_NAME = "aequalis_landing_content";
const CONTENT_ID = "aequalis";

type StoredLandingContent = {
  id: string;
  content: unknown;
  updated_at: string;
};

export async function getAequalisContentFromSupabase() {
  const supabase = createSupabaseReadClient();

  if (!supabase) {
    return getDefaultContent();
  }

  const { data, error } = await supabase
    .from(TABLE_NAME)
    .select("id, content, updated_at")
    .eq("id", CONTENT_ID)
    .maybeSingle<StoredLandingContent>();

  if (error || !data) {
    return getDefaultContent();
  }

  return normalizeAequalisContent(data.content);
}

export async function saveAequalisContentToSupabase(content: AequalisContent) {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured.");
  }

  const { error } = await supabase.from(TABLE_NAME).upsert({
    id: CONTENT_ID,
    content: normalizeAequalisContent(content),
    updated_at: new Date().toISOString(),
  });

  if (error) {
    throw error;
  }
}
