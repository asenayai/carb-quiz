import { QUIZ_ID } from "./quiz-data";
import {
  defaultQuestionImages,
  getQuestionImageMap,
} from "./quiz-images";
import type { SupabaseClient } from "@supabase/supabase-js";

export { defaultQuestionImages, getQuestionImageMap };

export const DEFAULT_CLASS = "ทั่วไป";

export async function getSetting<T>(
  supabase: SupabaseClient,
  key: string
): Promise<T | null> {
  const { data, error } = await supabase
    .from("quiz_settings")
    .select("value")
    .eq("quiz_id", QUIZ_ID)
    .eq("key", key)
    .maybeSingle();

  if (error) return null;
  return (data?.value as T) ?? null;
}

export async function setSetting(
  supabase: SupabaseClient,
  key: string,
  value: unknown
) {
  const { error } = await supabase.from("quiz_settings").upsert(
    {
      quiz_id: QUIZ_ID,
      key,
      value,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "quiz_id,key" }
  );
  if (error) throw error;
}

export async function getCurrentClass(supabase: SupabaseClient): Promise<string> {
  const raw = await getSetting<string>(supabase, "current_class");
  if (typeof raw === "string" && raw.trim()) return raw.trim();
  return DEFAULT_CLASS;
}

export async function getQuizConfig(supabase: SupabaseClient) {
  const [currentClass, questionImages] = await Promise.all([
    getCurrentClass(supabase),
    getQuestionImageMap(supabase),
  ]);
  return { currentClass, questionImages };
}
