"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { getStoredNickname } from "./NicknameForm";
import { Button, Card, ProgressBar } from "./ui";
import { QUESTIONS } from "@/lib/quiz-data";
import type { PickPayload } from "@/lib/types";

const SHAPES = ["▲", "◆", "●", "■"];

export function QuizRunner() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTIONS[0].timeSec);
  const [answered, setAnswered] = useState(false);
  const picksRef = useRef<PickPayload[]>([]);
  const [picked, setPicked] = useState<number | null>(null);
  const [showExplain, setShowExplain] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [startedAt] = useState(Date.now());

  const q = QUESTIONS[current];

  useEffect(() => {
    const nickname = getStoredNickname();
    if (!nickname) router.replace("/");
  }, [router]);

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

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center justify-between text-sm text-zinc-500">
        <span>
          ข้อ {current + 1}/{QUESTIONS.length}
        </span>
        <span
          className={`mono-science text-lg font-medium tabular-nums ${timeLeft <= 5 && !answered ? "text-red-400" : "text-zinc-300"}`}
        >
          {timeLeft}
        </span>
      </div>
      <ProgressBar value={current + (answered ? 1 : 0)} max={QUESTIONS.length} />

      <Card className="mt-4">
        <p className="text-[15px] leading-relaxed tracking-tight">{q.text}</p>

        {q.image && (
          <div className="relative mt-4 overflow-hidden rounded-md border border-zinc-800 bg-white">
            <Image
              src={q.image}
              alt={`Question ${q.id}`}
              width={800}
              height={400}
              className="h-auto max-h-72 w-full object-contain"
              priority
            />
          </div>
        )}

        <div className="mt-4 grid gap-2">
          {q.choices.map((choice, i) => {
            let cls = "border-zinc-800 bg-zinc-950 hover:border-zinc-600";
            if (answered) {
              if (i === q.correct) cls = "border-emerald-500/40 bg-emerald-500/10";
              else if (i === picked) cls = "border-red-500/40 bg-red-500/10";
              else cls = "border-zinc-800 opacity-50";
            }
            return (
              <button
                key={i}
                disabled={answered}
                onClick={() => reveal(i)}
                className={`flex items-start gap-3 rounded-md border px-3 py-3 text-left text-sm transition ${cls}`}
              >
                <span className="mono-science mt-0.5 text-xs text-zinc-500">
                  {SHAPES[i]}
                </span>
                <span className="mono-science">{choice}</span>
              </button>
            );
          })}
        </div>

        {showExplain && (
          <p className="mono-science mt-4 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-400">
            {q.explain}
          </p>
        )}

        {answered && (
          <Button
            className="mt-4 w-full"
            onClick={handleNext}
            disabled={submitting}
          >
            {submitting
              ? "กำลังบันทึก..."
              : current < QUESTIONS.length - 1
                ? "ข้อถัดไป"
                : "ดูผลและทบทวน"}
          </Button>
        )}
      </Card>
    </div>
  );
}
