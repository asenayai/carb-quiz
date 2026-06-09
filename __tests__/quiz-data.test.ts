import { existsSync } from "fs";
import path from "path";
import { describe, expect, it } from "vitest";
import {
  MAX_SCORE,
  QUESTIONS,
  QUIZ_ID,
  getQuestion,
} from "@/lib/quiz-data";

describe("quiz data integrity", () => {
  it("has stable quiz id", () => {
    expect(QUIZ_ID).toBe("carb-ap");
  });

  it("has exactly 5 questions with sequential ids", () => {
    expect(QUESTIONS).toHaveLength(5);
    QUESTIONS.forEach((q, i) => {
      expect(q.id).toBe(i + 1);
    });
  });

  it("has valid choices and correct indices for every question", () => {
    QUESTIONS.forEach((q) => {
      expect(q.choices.length).toBeGreaterThanOrEqual(2);
      expect(q.correct).toBeGreaterThanOrEqual(0);
      expect(q.correct).toBeLessThan(q.choices.length);
      expect(q.text.trim().length).toBeGreaterThan(10);
      expect(q.explain.trim().length).toBeGreaterThan(5);
      expect(q.timeSec).toBeGreaterThanOrEqual(10);
    });
  });

  it("has unique correct answers per question content", () => {
    const correctTexts = QUESTIONS.map((q) => q.choices[q.correct]);
    expect(new Set(correctTexts).size).toBe(correctTexts.length);
  });

  it("references existing public images", () => {
    const publicDir = path.join(process.cwd(), "public");
    QUESTIONS.forEach((q) => {
      expect(q.image).toBeDefined();
      const filePath = path.join(publicDir, q.image!.replace(/^\//, ""));
      expect(existsSync(filePath), `missing ${q.image}`).toBe(true);
    });
  });

  it("computes max score as questions × 1000", () => {
    expect(MAX_SCORE).toBe(QUESTIONS.length * 1000);
  });

  it("getQuestion returns by id", () => {
    expect(getQuestion(1)?.id).toBe(1);
    expect(getQuestion(99)).toBeUndefined();
  });
});
