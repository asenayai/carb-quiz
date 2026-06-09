"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { getStoredNickname } from "./NicknameForm";
import { Button, Card, CHOICE_TILE_CLASS, ProgressBar } from "./ui";
import { QUESTIONS } from "@/lib/quiz-data";
import type { PickPayload } from "@/lib/types";

const SHAPES = ["▲", "◆", "●", "■"];

export function QuizRunner({
  initialImages = {},
}: {
  initialImages?: Record<string, string>;
}) {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTIONS[0].timeSec);
  const [answered, setAnswered] = useState(false);
  const picksRef = useRef<PickPayload[]>([]);
  const [picked, setPicked] = useState<number | null>(null);
  const [showExplain, setShowExplain] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [startedAt] = useState(Date.now());
  const [imageMap, setImageMap] =
    useState<Record<string, string>>(initialImages);

  const q = QUESTIONS[current];
  const imageSrc = imageMap[String(q.id)] || q.image;

  useEffect(() => {
    const nickname = getStoredNickname();
    if (!nickname) router.replace("/");
  }, [router]);

  useEffect(() => {
    fetch("/api/quiz-config", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (d.questionImages) setImageMap(d.questionImages);
      })
      .catch(() => {});
  }, []);

  const reveal = useCallback(
    (choice: number | null) => {
      if (answered) return;
      setAnswered(true);
      setPicked(choice);
      setShowExplain(true);
      const entry: PickPayload = {
        question: q.id,
        picked: choice,
        timeLeft,
      };
      picksRef.current = [...picksRef.current, entry];
    },
    [answered, q.id, timeLeft]
  );

  useEffect(() => {
    if (answered) return;
    if (timeLeft <= 0) {
      reveal(null);
      return;
    }
    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft, answered, reveal]);

  async function handleNext() {
    if (current < QUESTIONS.length - 1) {
      const next = current + 1;
      setCurrent(next);
      setTimeLeft(QUESTIONS[next].timeSec);
      setAnswered(false);
      setPicked(null);
      setShowExplain(false);
      return;
    }

    const nickname = getStoredNickname();
    if (!nickname) {
      router.replace("/");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname,
          picks: picksRef.current,
          durationSec: Math.round((Date.now() - startedAt) / 1000),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submit failed");
      router.push(`/review/${data.attemptId}`);
    } catch (err) {
      alert(err instanceof Error ? err.message : "บันทึกไม่สำเร็จ");
      setSubmitting(false);
    }
  }

  function choiceClass(i: number) {
    if (!answered) return CHOICE_TILE_CLASS[i];
    if (i === q.correct) return "choice-tile-correct";
    if (i === picked) return "choice-tile-wrong";
    return "choice-tile-faded";
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-2 sm:px-4">
      <div className="mb-4 flex items-center justify-between text-sm font-semibold text-slate-500">
        <span className="font-heading rounded-full bg-sky-100 px-4 py-1.5 font-semibold text-sky-700">
          ข้อ {current + 1}/{QUESTIONS.length}
        </span>
        <span
          className={`mono-science flex h-12 w-12 items-center justify-center rounded-full text-xl font-bold tabular-nums ${
            timeLeft <= 5 && !answered
              ? "bg-orange-100 text-orange-600 ring-2 ring-orange-300"
              : "bg-white text-slate-700 shadow-sm ring-1 ring-slate-200"
          }`}
        >
          {timeLeft}
        </span>
      </div>
      <ProgressBar value={current + (answered ? 1 : 0)} max={QUESTIONS.length} />

      <Card className="mt-5 p-6 sm:p-8">
        <p className="font-heading text-base font-medium leading-relaxed text-slate-700 sm:text-lg">
          {q.text}
        </p>

        {imageSrc && (
          <div className="relative mt-6 overflow-hidden rounded-xl border-2 border-slate-100 bg-white shadow-inner">
            <Image
              src={imageSrc}
              alt={`Question ${q.id}`}
              width={1200}
              height={600}
              className="h-auto max-h-96 w-full object-contain"
              priority
              unoptimized={imageSrc.includes("supabase.co")}
            />
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3">
          {q.choices.map((choice, i) => (
            <button
              key={i}
              disabled={answered}
              onClick={() => reveal(i)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-4 text-left text-sm font-semibold transition active:translate-y-0.5 sm:px-5 sm:py-5 sm:text-base ${choiceClass(i)}`}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-black/10 text-base">
                {SHAPES[i]}
              </span>
              <span className="mono-science leading-snug">{choice}</span>
            </button>
          ))}
        </div>

        {showExplain && (
          <div className="mono-science mt-6 rounded-xl border-2 border-teal-100 bg-teal-50 px-5 py-4 text-sm text-teal-800 sm:text-base">
            💡 {q.explain}
          </div>
        )}

        {answered && (
          <Button
            className="mt-6 w-full sm:max-w-md"
            onClick={handleNext}
            disabled={submitting}
          >
            {submitting
              ? "กำลังบันทึก..."
              : current < QUESTIONS.length - 1
                ? "ข้อถัดไป →"
                : "ดูผลและทบทวน"}
          </Button>
        )}
      </Card>
    </div>
  );
}
