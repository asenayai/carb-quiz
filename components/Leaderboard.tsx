import { getSupabase } from "@/lib/supabase/server";
import { Card } from "./ui";
import { QUIZ_ID } from "@/lib/quiz-data";

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
    <Card>
      <h2 className="mb-3 text-sm font-medium text-zinc-400">อันดับล่าสุด</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-zinc-600">ยังไม่มีข้อมูล</p>
      ) : (
        <ul className="space-y-2">
          {rows.map((row, i) => {
            const pct = Math.round((row.score / row.max_score) * 100);
            return (
              <li
                key={`${row.student_name}-${i}`}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-zinc-300">
                  {i + 1}. {row.student_name}
                  <span className="ml-2 text-xs text-zinc-600">
                    {row.correct_count}/{row.total_questions}
                  </span>
                </span>
                <span className="mono-science tabular-nums text-zinc-400">
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
