import { NextResponse } from "next/server";
import { QUIZ_ID } from "@/lib/quiz-data";
import { getQuizConfig } from "@/lib/quiz-settings";
import { getSupabase } from "@/lib/supabase/server";
import { checkAdminPassword } from "@/lib/utils";
import type { QuestionStat } from "@/lib/types";

function statsFromAttempts(
  rows: { answers: { question: number; is_correct: boolean }[] }[]
): QuestionStat[] {
  const map = new Map<number, { total: number; correct: number }>();
  for (const row of rows) {
    for (const a of row.answers || []) {
      const cur = map.get(a.question) ?? { total: 0, correct: 0 };
      cur.total += 1;
      if (a.is_correct) cur.correct += 1;
      map.set(a.question, cur);
    }
  }
  return [...map.entries()]
    .sort(([a], [b]) => a - b)
    .map(([question_num, s]) => ({
      quiz_id: QUIZ_ID,
      question_num,
      total_attempts: s.total,
      correct_count: s.correct,
      pct_correct:
        s.total > 0 ? Math.round((1000 * s.correct) / s.total) / 10 : 0,
    }));
}

export async function GET(request: Request) {
  if (!checkAdminPassword(request.headers.get("x-admin-password"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const classFilter = searchParams.get("class")?.trim() || null;

    const supabase = getSupabase();
    let query = supabase
      .from("quiz_attempts")
      .select("*, quiz_answer_details(*)")
      .eq("quiz_id", QUIZ_ID)
      .order("created_at", { ascending: false })
      .limit(500);

    if (classFilter) {
      query = query.eq("class_label", classFilter);
    }

    const { data, error } = await query;
    if (error) throw error;

    const rows = data || [];
    const summary = {
      quiz_id: QUIZ_ID,
      class_filter: classFilter,
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

    const { data: allClasses } = await supabase
      .from("quiz_attempts")
      .select("class_label")
      .eq("quiz_id", QUIZ_ID);

    const { currentClass, questionImages } = await getQuizConfig(supabase);
    const classLabels = [
      ...new Set([
        currentClass,
        ...(allClasses || []).map((r) => r.class_label as string),
      ]),
    ].filter(Boolean);

    let questionStats: QuestionStat[] = [];
    if (classFilter) {
      questionStats = statsFromAttempts(
        rows.map((r) => ({
          answers: (r.answers as { question: number; is_correct: boolean }[]) || [],
        }))
      );
    } else {
      const { data: qs } = await supabase
        .from("quiz_question_stats")
        .select("*")
        .eq("quiz_id", QUIZ_ID)
        .order("question_num", { ascending: true });
      questionStats = qs || [];
    }

    return NextResponse.json(
      {
        summary,
        question_stats: questionStats,
        attempts: rows,
        class_labels: classLabels,
        current_class: currentClass,
        question_images: questionImages,
        refreshed_at: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
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
