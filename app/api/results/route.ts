import { NextResponse } from "next/server";
import { QUIZ_ID } from "@/lib/quiz-data";
import { getSupabase } from "@/lib/supabase/server";
import { checkAdminPassword } from "@/lib/utils";

export async function GET(request: Request) {
  if (!checkAdminPassword(request.headers.get("x-admin-password"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("quiz_attempts")
      .select("*, quiz_answer_details(*)")
      .eq("quiz_id", QUIZ_ID)
      .order("created_at", { ascending: false })
      .limit(500);

    if (error) throw error;

    const rows = data || [];
    const summary = {
      quiz_id: QUIZ_ID,
      total_attempts: rows.length,
      unique_students: new Set(rows.map((r) => r.student_name)).size,
      avg_score: rows.length
        ? Math.round(rows.reduce((s, r) => s + r.score, 0) / rows.length)
        : 0,
      avg_pct: rows.length
        ? Math.round(
            rows.reduce((s, r) => s + (r.score / r.max_score) * 100, 0) /
              rows.length
          )
        : 0,
    };

    const { data: questionStats } = await supabase
      .from("quiz_question_stats")
      .select("*")
      .eq("quiz_id", QUIZ_ID)
      .order("question_num", { ascending: true });

    return NextResponse.json({
      summary,
      question_stats: questionStats || [],
      attempts: rows,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}
