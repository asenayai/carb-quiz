import { expect, test } from "@playwright/test";
import { QUESTIONS } from "../lib/quiz-data";

test.describe("API routes", () => {
  test("GET /api/health returns JSON with ok field", async ({ request }) => {
    const res = await request.get("/api/health");
    expect([200, 503]).toContain(res.status());
    const body = await res.json();
    expect(body).toHaveProperty("ok");
    expect(typeof body.ok).toBe("boolean");
  });

  test("POST /api/submit rejects empty body", async ({ request }) => {
    const res = await request.post("/api/submit", {
      data: {},
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body).toHaveProperty("error");
  });

  test("POST /api/submit rejects invalid picks length", async ({ request }) => {
    const res = await request.post("/api/submit", {
      data: {
        nickname: "test",
        picks: [{ question: 1, picked: 0, timeLeft: 10 }],
      },
    });
    expect(res.status()).toBe(400);
  });

  test("POST /api/submit rejects empty nickname", async ({ request }) => {
    const picks = QUESTIONS.map((q) => ({
      question: q.id,
      picked: q.correct,
      timeLeft: q.timeSec,
    }));
    const res = await request.post("/api/submit", {
      data: { nickname: "   ", picks },
    });
    expect(res.status()).toBe(400);
  });

  test("GET /api/leaderboard returns JSON", async ({ request }) => {
    const res = await request.get("/api/leaderboard");
    expect([200, 500]).toContain(res.status());
    const body = await res.json();
    if (res.status() === 200) {
      expect(body).toHaveProperty("leaderboard");
      expect(Array.isArray(body.leaderboard)).toBe(true);
    } else {
      expect(body).toHaveProperty("error");
    }
  });

  test("GET /api/results requires admin password", async ({ request }) => {
    const res = await request.get("/api/results");
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.error).toBe("Unauthorized");
  });
});
