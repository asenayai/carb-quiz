import Image from "next/image";
import Link from "next/link";
import { QUESTIONS } from "@/lib/quiz-data";
import type { AnswerRecord, QuizAttempt } from "@/lib/types";
import { Card } from "./ui";

function statusFor(answer: AnswerRecord) {
  if (answer.picked === null) return "missed" as const;
  if (answer.is_correct) return "correct" as const;
  return "wrong" as const;
}

const borderByStatus = {
  correct: "border-emerald-500/30",
  wrong: "border-red-500/30",
  missed: "border-amber-500/30",
};

const labelByStatus = {
  correct: "ถูก",
  wrong: "ผิด",
  missed: "ไม่ได้ตอบ",
};

export function ReviewPanel({
  attempt,
}: {
  attempt: QuizAttempt;
}) {
  const pct = Math.round((attempt.score / attempt.max_score) * 100);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Card>
        <p className="text-sm text-zinc-500">{attempt.student_name}</p>
        <p className="mt-1 text-2xl font-medium tracking-tight tabular-nums">
          {attempt.score}{" "}
          <span className="text-base text-zinc-500">
            / {attempt.max_score} ({pct}%)
          </span>
        </p>
        <p className="mt-1 text-sm text-zinc-400">
          ถูก {attempt.correct_count}/{attempt.total_questions} ข้อ
        </p>
      </Card>

      <div className="space-y-3">
        {attempt.answers.map((answer) => {
          const q = QUESTIONS.find((item) => item.id === answer.question);
          if (!q) return null;
          const status = statusFor(answer);
          const correctText = q.choices[q.correct];

          return (
            <Card
              key={answer.question}
              className={borderByStatus[status]}
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-xs text-zinc-500">ข้อ {answer.question}</span>
                <span
                  className={`text-xs font-medium ${
                    status === "correct"
                      ? "text-emerald-400"
                      : status === "wrong"
                        ? "text-red-400"
                        : "text-amber-400"
                  }`}
                >
                  {labelByStatus[status]}
                </span>
              </div>

              <p className="text-sm leading-relaxed">{q.text}</p>

              {q.image && (
                <div className="relative mt-3 overflow-hidden rounded-md border border-zinc-800 bg-white">
                  <Image
                    src={q.image}
                    alt={`Question ${q.id}`}
                    width={800}
                    height={400}
                    className="h-auto max-h-48 w-full object-contain"
                  />
                </div>
              )}

              {status !== "correct" && (
                <div className="mt-3 space-y-1 text-sm">
                  {status === "wrong" && answer.choice_text && (
                    <p className="text-zinc-500">
                      คุณเลือก:{" "}
                      <span className="mono-science line-through text-red-400/80">
                        {answer.choice_text}
                      </span>
                    </p>
                  )}
                  {status === "missed" && (
                    <p className="text-amber-400/90">ไม่ได้ตอบภายในเวลา</p>
                  )}
                  <p>
                    เฉลย:{" "}
                    <span className="mono-science text-emerald-400/90">
                      {correctText}
                    </span>
                  </p>
                  <p className="mono-science mt-2 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-400">
                    {q.explain}
                  </p>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <div className="flex justify-center pb-8">
        <Link
          href="/"
          className="rounded-md border border-zinc-700 px-4 py-2.5 text-sm text-zinc-300 transition hover:border-zinc-500 hover:text-zinc-100"
        >
          ลองอีกครั้ง
        </Link>
      </div>
    </div>
  );
}
