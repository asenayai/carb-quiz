import { getSupabase } from "@/lib/supabase/server";
import { Card } from "./ui";
import { QUIZ_ID } from "@/lib/quiz-data";

const MEDAL = ["🥇", "🥈", "🥉"];

export async function Leaderboard() {
  let rows: {
    student_name: string;
    score: number;
    max_score: number;
    correct_count: number;
    total_questions: number;
  }[] = [];

  try {
    const supabase = getSupabase();
    const { data } = await supabase
      .from("quiz_attempts")
      .select("student_name, score, max_score, correct_count, total_questions")
      .eq("quiz_id", QUIZ_ID)
      .order("score", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(10);
    rows = data || [];
  } catch {
    rows = [];
  }

  return (
    <Card className="border-amber-100">
      <h2 className="font-heading mb-3 text-sm font-bold text-amber-700">🏆 อันดับล่าสุด</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-slate-400">ยังไม่มีข้อมูล — เป็นคนแรกเลย!</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((row, i) => {
            const pct = Math.round((row.score / row.max_score) * 100);
            return (
              <li
                key={`${row.student_name}-${i}`}
                className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm"
              >
                <span className="font-medium text-slate-700">
                  {MEDAL[i] || `${i + 1}.`} {row.student_name}
                  <span className="ml-2 text-xs text-slate-400">
                    {row.correct_count}/{row.total_questions}
                  </span>
                </span>
                <span className="mono-science font-bold tabular-nums text-emerald-600">
                  {row.score} ({pct}%)
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
