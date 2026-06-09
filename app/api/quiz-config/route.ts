import { NextResponse } from "next/server";
import { defaultQuestionImages, getQuestionImageMap } from "@/lib/quiz-images";
import { getCurrentClass } from "@/lib/quiz-settings";
import { getSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = getSupabase();
    const [currentClass, questionImages] = await Promise.all([
      getCurrentClass(supabase),
      getQuestionImageMap(supabase),
    ]);

    return NextResponse.json(
      { currentClass, questionImages },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch (err) {
    console.error("quiz-config:", err);
    return NextResponse.json({
      currentClass: "ทั่วไป",
      questionImages: defaultQuestionImages(),
    });
  }
}
