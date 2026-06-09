import { QUESTIONS } from "./quiz-data";
import type { AnswerRecord, PickPayload } from "./types";

function calcPoints(timeLeft: number, maxTime: number): number {
  return Math.max(100, Math.round(1000 * (timeLeft / maxTime)));
}

export function computeAttempt(picks: PickPayload[]) {
  if (picks.length !== QUESTIONS.length) {
    throw new Error(`Expected ${QUESTIONS.length} picks, got ${picks.length}`);
  }

  let score = 0;
  let correctCount = 0;
  const answers: AnswerRecord[] = [];

  for (const pick of picks) {
    const question = QUESTIONS.find((q) => q.id === pick.question);
    if (!question) {
      throw new Error(`Invalid question number: ${pick.question}`);
    }
    if (
      pick.picked !== null &&
      (pick.picked < 0 || pick.picked >= question.choices.length)
    ) {
      throw new Error(`Invalid pick index for question ${pick.question}`);
    }

    const isCorrect = pick.picked === question.correct;
    const points = isCorrect ? calcPoints(pick.timeLeft, question.timeSec) : 0;

    if (isCorrect) {
      score += points;
      correctCount += 1;
    }

    answers.push({
      question: question.id,
      picked: pick.picked,
      correct: question.correct,
      is_correct: isCorrect,
      points,
      time_left: pick.timeLeft,
      choice_text:
        pick.picked !== null ? question.choices[pick.picked] : null,
    });
  }

  return {
    score,
    correctCount,
    totalQuestions: QUESTIONS.length,
    maxScore: QUESTIONS.length * 1000,
    answers,
  };
}
