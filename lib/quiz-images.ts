import { QUESTIONS, QUIZ_ID } from "./quiz-data";
import type { SupabaseClient } from "@supabase/supabase-js";

const BUCKET = "quiz-images";

export function defaultQuestionImages(): Record<string, string> {
  return Object.fromEntries(
    QUESTIONS.filter((q) => q.image).map((q) => [String(q.id), q.image!])
  );
}

export function publicImageUrl(
  supabase: SupabaseClient,
  path: string,
  version?: string | null
) {
  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);
  const v = version || Date.now();
  return `${publicUrl}?v=${encodeURIComponent(String(v))}`;
}

export async function ensureQuizImagesBucket(supabase: SupabaseClient) {
  const { data: buckets, error: listError } =
    await supabase.storage.listBuckets();
  if (listError) throw listError;

  if (buckets?.some((b) => b.id === BUCKET)) return;

  const { error } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: 5242880,
    allowedMimeTypes: ["image/png", "image/jpeg", "image/webp"],
  });
  if (error) throw error;
}

export async function getQuestionImageMap(
  supabase: SupabaseClient
): Promise<Record<string, string>> {
  const result = { ...defaultQuestionImages() };

  const { data: files, error } = await supabase.storage
    .from(BUCKET)
    .list(QUIZ_ID);

  if (!error && files?.length) {
    for (const file of files) {
      const match = file.name.match(/^q(\d)\.(png|jpe?g|webp)$/i);
      if (!match) continue;
      const path = `${QUIZ_ID}/${file.name}`;
      const version = file.updated_at || file.created_at || file.id;
      result[match[1]] = publicImageUrl(supabase, path, version);
    }
  }

  return result;
}

export function imagePathForQuestion(question: number, mime: string) {
  const ext =
    mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg";
  return `${QUIZ_ID}/q${question}.${ext}`;
}
