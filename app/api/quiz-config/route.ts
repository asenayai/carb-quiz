import { NextResponse } from "next/server";
import { getQuizConfig } from "@/lib/quiz-settings";
import { getSupabase } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = getSupabase();
    const config = await getQuizConfig(supabase);
    return NextResponse.json(config, {
      headers: { "Cache-Control": "s-maxage=30, stale-while-revalidate=60" },
    });
  } catch {
    const { defaultQuestionImages } = await import("@/lib/quiz-settings");
    return NextResponse.json({
      currentClass: "ทั่วไป",
      questionImages: defaultQuestionImages(),
    });
  }
}
