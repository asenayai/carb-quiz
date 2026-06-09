import { afterEach, describe, expect, it } from "vitest";
import { checkAdminPassword, escapeHtml } from "@/lib/utils";

describe("escapeHtml", () => {
  it("escapes HTML special characters", () => {
    expect(escapeHtml(`<script>"x"&</script>`)).toBe(
      "&lt;script&gt;&quot;x&quot;&amp;&lt;/script&gt;"
    );
  });

  it("leaves safe text unchanged", () => {
    expect(escapeHtml("มะม่วง")).toBe("มะม่วง");
  });
});

describe("checkAdminPassword", () => {
  const original = process.env.ADMIN_PASSWORD;

  afterEach(() => {
    if (original === undefined) {
      delete process.env.ADMIN_PASSWORD;
    } else {
      process.env.ADMIN_PASSWORD = original;
    }
  });

  it("returns false when env is unset", () => {
    delete process.env.ADMIN_PASSWORD;
    expect(checkAdminPassword("secret")).toBe(false);
  });

  it("returns false for missing header", () => {
    process.env.ADMIN_PASSWORD = "teacher123";
    expect(checkAdminPassword(null)).toBe(false);
  });

  it("returns true for matching password", () => {
    process.env.ADMIN_PASSWORD = "teacher123";
    expect(checkAdminPassword("teacher123")).toBe(true);
  });

  it("returns false for wrong password", () => {
    process.env.ADMIN_PASSWORD = "teacher123";
    expect(checkAdminPassword("wrong")).toBe(false);
  });
});
