import { readFile, readdir } from "node:fs/promises";
import { createReadStream } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const envPath = path.join(projectRoot, ".env.local");
const bucketName = "aequalis_images";
const tableName = "aequalis_landing_content";
const contentId = "aequalis";
const imageDirectory = path.join(projectRoot, "public", "images", "aequalis");

function parseEnv(raw) {
  return Object.fromEntries(
    raw
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const separatorIndex = line.indexOf("=");
        return [
          line.slice(0, separatorIndex),
          line.slice(separatorIndex + 1).replace(/^"|"$/g, ""),
        ];
      }),
  );
}

function assertEnv(env, key) {
  if (!env[key]) {
    throw new Error(`${key} is missing in .env.local`);
  }

  return env[key];
}

function getPublicUrl(supabase, fileName) {
  const { data } = supabase.storage.from(bucketName).getPublicUrl(fileName);

  return data.publicUrl;
}

function rewriteImageUrls(content, supabase, imageFiles) {
  const byLocalPath = Object.fromEntries(
    imageFiles.map((fileName) => [
      `/images/aequalis/${fileName}`,
      getPublicUrl(supabase, fileName),
    ]),
  );

  return {
    products: Array.isArray(content.products)
      ? content.products.map((product) => ({
          ...product,
          imageUrl: byLocalPath[product.imageUrl] ?? product.imageUrl,
        }))
      : [],
    journals: Array.isArray(content.journals)
      ? content.journals.map((post) => ({
          ...post,
          imageUrl: byLocalPath[post.imageUrl] ?? post.imageUrl,
        }))
      : [],
  };
}

const env = parseEnv(await readFile(envPath, "utf8"));
const supabaseUrl = assertEnv(env, "NEXT_PUBLIC_SUPABASE_URL");
const serviceRoleKey = assertEnv(env, "SUPABASE_SERVICE_ROLE_KEY");
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false },
});
const imageFiles = (await readdir(imageDirectory)).filter((fileName) =>
  fileName.toLowerCase().endsWith(".png"),
);

for (const fileName of imageFiles) {
  const filePath = path.join(imageDirectory, fileName);
  const { error } = await supabase.storage.from(bucketName).upload(
    fileName,
    createReadStream(filePath),
    {
      cacheControl: "31536000",
      contentType: "image/png",
      duplex: "half",
      upsert: true,
    },
  );

  if (error) {
    throw new Error(`Failed to upload ${fileName}: ${error.message}`);
  }

  console.log(`Uploaded ${fileName}`);
}

const { data, error: readError } = await supabase
  .from(tableName)
  .select("content")
  .eq("id", contentId)
  .single();

if (readError) {
  throw new Error(`Failed to read landing content: ${readError.message}`);
}

const content = rewriteImageUrls(data.content, supabase, imageFiles);

const { error: writeError } = await supabase
  .from(tableName)
  .update({
    content,
    updated_at: new Date().toISOString(),
  })
  .eq("id", contentId);

if (writeError) {
  throw new Error(`Failed to update landing content: ${writeError.message}`);
}

console.log("Updated Supabase image URLs");
