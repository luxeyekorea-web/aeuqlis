import AequalisLanding from "./AequalisLanding";
import { getAequalisContentFromSupabase } from "@/lib/aequalisSupabase";

export const dynamic = "force-dynamic";

export default async function AequalisPage() {
  const content = await getAequalisContentFromSupabase();

  return <AequalisLanding content={content} />;
}
