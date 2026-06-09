import { describe, expect, it } from "vitest";
import { QUESTIONS } from "@/lib/quiz-data";
import { computeAttempt } from "@/lib/scoring";
import type { PickPayload } from "@/lib/types";

function allCorrectPicks(): PickPayload[] {
  return QUESTIONS.map((q) => ({
    question: q.id,
    picked: q.correct,
    timeLeft: q.timeSec,
  }));
}

describe("computeAttempt", () => {
  it("scores all correct answers at full time as 1000 each", () => {
    const result = computeAttempt(allCorrectPicks());
    expect(result.correctCount).toBe(5);
    expect(result.totalQuestions).toBe(5);
    expect(result.maxScore).toBe(5000);
    expect(result.score).toBe(5000);
    result.answers.forEach((a) => {
      expect(a.is_correct).toBe(true);
      expect(a.points).toBe(1000);
    });
  });

  it("awards partial points based on time remaining", () => {
    const picks = QUESTIONS.map((q) => ({
      question: q.id,
      picked: q.correct,
      timeLeft: Math.floor(q.timeSec / 2),
    }));
    const result = computeAttempt(picks);
    expect(result.correctCount).toBe(5);
    result.answers.forEach((a, i) => {
      const expected = Math.max(
        100,
        Math.round(1000 * (picks[i].timeLeft / QUESTIONS[i].timeSec))
      );
      expect(a.points).toBe(expected);
    });
  });

  it("gives zero points for wrong answers", () => {
    const picks = QUESTIONS.map((q) => ({
      question: q.id,
      picked: (q.correct + 1) % q.choices.length,
      timeLeft: q.timeSec,
    }));
    const result = computeAttempt(picks);
    expect(result.correctCount).toBe(0);
    expect(result.score).toBe(0);
    result.answers.forEach((a) => {
      expect(a.is_correct).toBe(false);
      expect(a.points).toBe(0);
    });
  });

  it("treats timeout (null pick) as incorrect", () => {
    const picks = QUESTIONS.map((q) => ({
      question: q.id,
      picked: null,
      timeLeft: 0,
    }));
    const result = computeAttempt(picks);
    expect(result.correctCount).toBe(0);
    expect(result.score).toBe(0);
    result.answers.forEach((a) => {
      expect(a.is_correct).toBe(false);
      expect(a.choice_text).toBeNull();
    });
  });

  it("records choice text for answered picks", () => {
    const q = QUESTIONS[0];
    const result = computeAttempt([
      {
        question: q.id,
        picked: q.correct,
        timeLeft: q.timeSec,
      },
      ...QUESTIONS.slice(1).map((qn) => ({
        question: qn.id,
        picked: qn.correct,
        timeLeft: qn.timeSec,
      })),
    ]);
    expect(result.answers[0].choice_text).toBe(q.choices[q.correct]);
  });

  it("rejects wrong number of picks", () => {
    expect(() =>
      computeAttempt(allCorrectPicks().slice(0, 3))
    ).toThrow("Expected 5 picks");
  });

  it("rejects invalid question id", () => {
    const picks = allCorrectPicks();
    picks[0] = { ...picks[0], question: 99 };
    expect(() => computeAttempt(picks)).toThrow("Invalid question number");
  });

  it("rejects out-of-range pick index", () => {
    const picks = allCorrectPicks();
    picks[2] = { ...picks[2], picked: 9 };
    expect(() => computeAttempt(picks)).toThrow("Invalid pick index");
  });

  it("matches known answer key for all five questions", () => {
    const key = [0, 1, 3, 3, 0];
    const picks = QUESTIONS.map((q, i) => ({
      question: q.id,
      picked: key[i],
      timeLeft: q.timeSec,
    }));
    const result = computeAttempt(picks);
    expect(result.correctCount).toBe(5);
    result.answers.forEach((a, i) => {
      expect(a.correct).toBe(key[i]);
      expect(a.is_correct).toBe(true);
    });
  });
});
