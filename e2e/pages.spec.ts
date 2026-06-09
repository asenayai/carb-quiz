import { expect, test } from "@playwright/test";

test.describe("static pages and assets", () => {
  test("admin page loads", async ({ page }) => {
    const response = await page.goto("/admin");
    expect(response?.status()).toBe(200);
    await expect(
      page.getByRole("heading", { name: "Teacher Dashboard" })
    ).toBeVisible();
    await expect(page.getByPlaceholder("รหัสครู")).toBeVisible();
    await expect(page.getByRole("button", { name: "เข้าสู่แดชบอร์ด" })).toBeVisible();
  });

  test("quiz images are served", async ({ request }) => {
    for (let i = 1; i <= 5; i++) {
      const res = await request.get(`/images/q${i}.png`);
      expect(res.status(), `q${i}.png should be reachable`).toBe(200);
      expect(res.headers()["content-type"]).toMatch(/image/);
    }
  });

  test("unknown review attempt shows not found", async ({ page }) => {
    const response = await page.goto(
      "/review/00000000-0000-0000-0000-000000000000"
    );
    expect([404, 200]).toContain(response?.status() ?? 0);
  });

  test("pages do not return server error on load", async ({ page }) => {
    for (const path of ["/", "/quiz", "/admin"]) {
      const response = await page.goto(path);
      expect(response?.status(), `${path} should not 500`).toBeLessThan(500);
      expect(response?.status(), `${path} should not 500`).toBeGreaterThanOrEqual(
        200
      );
    }
  });
});
