import { notFound } from "next/navigation";
import { Leaderboard } from "@/components/Leaderboard";
import { ReviewPanel } from "@/components/ReviewPanel";
import { getSupabase } from "@/lib/supabase/server";
import type { AnswerRecord, QuizAttempt } from "@/lib/types";

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = await params;

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("quiz_attempts")
      .select("*")
      .eq("id", attemptId)
      .single();

    if (error || !data) notFound();

    const attempt: QuizAttempt = {
      ...data,
      answers: (data.answers as AnswerRecord[]) || [],
    };

    return (
      <main className="px-4 py-8">
        <header className="mx-auto mb-6 max-w-5xl text-center">
          <h1 className="text-xl font-bold text-slate-800">ทบทวนคำตอบ</h1>
          <p className="mt-1 text-sm text-slate-500">
            ข้อที่ผิดและไม่ได้ตอบ พร้อมเฉลย
          </p>
        </header>
        <ReviewPanel attempt={attempt} />
        <div className="mx-auto mt-4 w-full max-w-5xl px-2 sm:px-4">
          <Leaderboard />
        </div>
      </main>
    );
  } catch {
    notFound();
  }
}
