import { expect, test } from "@playwright/test";
import { QUESTIONS } from "../lib/quiz-data";

test.describe("quiz flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      sessionStorage.setItem("carb-quiz-nickname", "E2E Player");
      sessionStorage.setItem("carb-quiz-class", "M.4/1");
    });
  });

  test("redirects to home without nickname", async ({ page }) => {
    await page.evaluate(() => {
      sessionStorage.removeItem("carb-quiz-nickname");
      sessionStorage.removeItem("carb-quiz-class");
    });
    await page.goto("/quiz");
    await expect(page).toHaveURL("/");
  });

  test("renders first question with image and choices", async ({ page }) => {
    await page.goto("/quiz");
    await expect(page.getByText("ข้อ 1/5")).toBeVisible();
    await expect(page.getByText(QUESTIONS[0].text.slice(0, 20))).toBeVisible();
    await expect(page.locator("img[alt='Question 1']")).toBeVisible();
    expect(await page.locator("button:has(span.mono-science)").count()).toBe(4);
  });

  test("shows explanation after answering", async ({ page }) => {
    await page.goto("/quiz");
    await page.locator("button:has(span.mono-science)").first().click();
    await expect(page.getByText(`💡 ${QUESTIONS[0].explain}`)).toBeVisible();
    await expect(
      page.getByRole("button", { name: "ข้อถัดไป →" })
    ).toBeVisible();
  });

  test("completes all questions and navigates to review on submit", async ({
    page,
  }) => {
    await page.route("**/api/submit", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ok: true,
          attemptId: "e2e-mock-attempt-id",
          createdAt: new Date().toISOString(),
          detailsSaved: true,
        }),
      });
    });

    await page.goto("/quiz");

    for (let i = 0; i < QUESTIONS.length; i++) {
      await expect(page.getByText(`ข้อ ${i + 1}/5`)).toBeVisible();
      await page.locator("button:has(span.mono-science)").first().click();

      const isLast = i === QUESTIONS.length - 1;
      await page
        .getByRole("button", {
          name: isLast ? "ดูผลและทบทวน" : "ข้อถัดไป →",
        })
        .click();
    }

    await expect(page).toHaveURL(/\/review\/e2e-mock-attempt-id/);
  });
});
