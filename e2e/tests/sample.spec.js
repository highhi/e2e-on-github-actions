const { test, expect } = require("@playwright/test");

test("basic test", async ({ page }) => {
  await page.goto("http://localhost:4001/");
  const title = await page
    .locator("[data-testid='title']")
    .textContent();
  await expect(title?.trim()).toBe("Nuxt");
});
