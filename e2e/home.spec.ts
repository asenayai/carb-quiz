import { expect, test } from "@playwright/test";

test.describe("home page", () => {
  test("loads with title and nickname form", async ({ page }) => {
    const response = await page.goto("/");
    expect(response?.status()).toBe(200);

    await expect(page).toHaveTitle(/Carb Quiz/);
    await expect(page.getByRole("heading", { name: "คาร์โบไฮเดรต" })).toBeVisible();
    await expect(page.getByLabel("ชื่อเล่น")).toBeVisible();
    await expect(page.getByRole("button", { name: "เริ่มเลย" })).toBeVisible();
    await expect(page.getByText("MWIT Biology Class")).toBeVisible();
  });

  test("shows validation error for empty nickname", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "เริ่มเลย" }).click();
    await expect(page.getByText("ใส่ชื่อเล่นก่อนนะ")).toBeVisible();
    await expect(page).toHaveURL("/");
  });

  test("navigates to quiz with valid nickname", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("ชื่อเล่น").fill("E2E Tester");
    await page.getByRole("button", { name: "เริ่มเลย" }).click();
    await expect(page).toHaveURL("/quiz");
    await expect(page.getByText("ข้อ 1/5")).toBeVisible();
  });

  test("nickname persists via Enter key", async ({ page }) => {
    await page.goto("/");
    await page.getByLabel("ชื่อเล่น").fill("EnterKey");
    await page.getByLabel("ชื่อเล่น").press("Enter");
    await expect(page).toHaveURL("/quiz");
  });
});
