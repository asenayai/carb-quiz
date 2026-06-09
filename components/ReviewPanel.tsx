import Image from "next/image";
import Link from "next/link";
import { QUESTIONS } from "@/lib/quiz-data";
import type { AnswerRecord, QuizAttempt } from "@/lib/types";
import { Button, Card } from "./ui";

function statusFor(answer: AnswerRecord) {
  if (answer.picked === null) return "missed" as const;
  if (answer.is_correct) return "correct" as const;
  return "wrong" as const;
}

const cardByStatus = {
  correct: "border-emerald-200 bg-emerald-50/50",
  wrong: "border-red-200 bg-red-50/50",
  missed: "border-amber-200 bg-amber-50/50",
};

const badgeByStatus = {
  correct: "bg-emerald-500 text-white",
  wrong: "bg-red-500 text-white",
  missed: "bg-amber-500 text-white",
};

const labelByStatus = {
  correct: "✓ ถูก",
  wrong: "✗ ผิด",
  missed: "⏱ ไม่ได้ตอบ",
};

export function ReviewPanel({ attempt }: { attempt: QuizAttempt }) {
  const pct = Math.round((attempt.score / attempt.max_score) * 100);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Card className="border-sky-200 bg-gradient-to-br from-sky-50 to-white text-center">
        <p className="text-sm font-semibold text-sky-600">{attempt.student_name}</p>
        <p className="font-heading mt-2 text-4xl font-bold tabular-nums text-slate-800">
          {attempt.score}
          <span className="text-lg font-semibold text-slate-400">
            {" "}
            / {attempt.max_score}
          </span>
        </p>
        <p className="mt-1 text-sm font-medium text-emerald-600">
          {pct}% · ถูก {attempt.correct_count}/{attempt.total_questions} ข้อ
        </p>
      </Card>

      <div className="space-y-3">
        {attempt.answers.map((answer) => {
          const q = QUESTIONS.find((item) => item.id === answer.question);
          if (!q) return null;
          const status = statusFor(answer);
          const correctText = q.choices[q.correct];

          return (
            <Card key={answer.question} className={cardByStatus[status]}>
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-500">
                  ข้อ {answer.question}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${badgeByStatus[status]}`}
                >
                  {labelByStatus[status]}
                </span>
              </div>

              <p className="text-sm font-medium leading-relaxed text-slate-700">
                {q.text}
              </p>

              {q.image && (
                <div className="relative mt-3 overflow-hidden rounded-xl border border-slate-100 bg-white">
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
                <div className="mt-3 space-y-2 text-sm">
                  {status === "wrong" && answer.choice_text && (
                    <p className="text-slate-600">
                      คุณเลือก:{" "}
                      <span className="mono-science font-medium line-through text-red-500">
                        {answer.choice_text}
                      </span>
                    </p>
                  )}
                  {status === "missed" && (
                    <p className="font-medium text-amber-600">
                      ไม่ได้ตอบภายในเวลา
                    </p>
                  )}
                  <p className="text-slate-700">
                    เฉลย:{" "}
                    <span className="mono-science font-semibold text-emerald-600">
                      {correctText}
                    </span>
                  </p>
                  <p className="mono-science rounded-xl border border-teal-100 bg-teal-50 px-3 py-2 text-xs text-teal-800">
                    {q.explain}
                  </p>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <div className="flex justify-center pb-8">
        <Link href="/">
          <Button variant="secondary">ลองอีกครั้ง</Button>
        </Link>
      </div>
    </div>
  );
}
