import { NextResponse } from "next/server";
import { QUIZ_ID } from "@/lib/quiz-data";
import { getSupabase } from "@/lib/supabase/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get("limit")) || 20, 50);

    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("quiz_attempts")
      .select(
        "student_name, score, max_score, correct_count, total_questions, created_at"
      )
      .eq("quiz_id", QUIZ_ID)
      .order("score", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    return NextResponse.json(
      { leaderboard: data || [] },
      {
        headers: {
          "Cache-Control": "s-maxage=10, stale-while-revalidate=30",
        },
      }
    );
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}
