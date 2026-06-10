import { NextResponse } from "next/server";
import { z } from "zod";
import { CLASS_ROOMS } from "@/lib/class-rooms";
import { QUIZ_ID } from "@/lib/quiz-data";
import { getCurrentClass } from "@/lib/quiz-settings";
import { computeAttempt } from "@/lib/scoring";
import { getSupabase } from "@/lib/supabase/server";

const pickSchema = z.object({
  question: z.number().int().min(1).max(5),
  picked: z.number().int().min(0).max(3).nullable(),
  timeLeft: z.number().int().min(0),
});

const bodySchema = z.object({
  nickname: z.string().trim().min(1).max(24),
  classLabel: z.enum(CLASS_ROOMS).optional(),
  picks: z.array(pickSchema).length(5),
  durationSec: z.number().int().min(0).optional(),
});

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { nickname, classLabel: studentClass, picks, durationSec } =
      parsed.data;
    const computed = computeAttempt(picks);
    const supabase = getSupabase();
    const classLabel =
      studentClass?.trim() || (await getCurrentClass(supabase));

    const { data: attempt, error: attemptError } = await supabase
      .from("quiz_attempts")
      .insert({
        quiz_id: QUIZ_ID,
        class_label: classLabel,
        student_name: nickname,
        score: computed.score,
        max_score: computed.maxScore,
        correct_count: computed.correctCount,
        total_questions: computed.totalQuestions,
        duration_sec: durationSec ?? null,
        answers: computed.answers,
      })
      .select("id, created_at")
      .single();

    if (attemptError) throw attemptError;

    const detailRows = computed.answers.map((a) => ({
      attempt_id: attempt.id,
      question_num: a.question,
      picked_index: a.picked,
      correct_index: a.correct,
      is_correct: a.is_correct,
      points: a.points,
      time_left_sec: a.time_left,
      choice_text: a.choice_text,
    }));

    const { error: detailsError } = await supabase
      .from("quiz_answer_details")
      .insert(detailRows);

    if (detailsError) {
      console.error("answer details insert failed:", detailsError);
    }

    return NextResponse.json({
      ok: true,
      attemptId: attempt.id,
      createdAt: attempt.created_at,
      detailsSaved: !detailsError,
    });
  } catch (err) {
    console.error("submit error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}
