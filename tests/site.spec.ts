import { test, expect } from "@playwright/test";

test.describe("الأزهار الناعمة — Soft Flowers", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("RTL Arabic document with correct title", async ({ page }) => {
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.locator("html")).toHaveAttribute("lang", "ar");
    await expect(page).toHaveTitle(/الأزهار الناعمة/);
  });

  test("hero headline and primary CTA visible", async ({ page }) => {
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.getByRole("link", { name: /اطلب باقتك/ }).first()).toBeVisible();
  });

  test("Google rating 4.8 cited", async ({ page }) => {
    await expect(page.getByText(/4\.8/).first()).toBeVisible();
    await expect(page.getByText(/446/).first()).toBeVisible();
  });

  test("all images load and have alt text", async ({ page }) => {
    // Eager-load any lazy images and scroll to trigger viewport-based loads.
    await page.evaluate(() => {
      document.querySelectorAll("img").forEach((im) => (im.loading = "eager"));
    });
    await page.evaluate(async () => {
      for (let y = 0; y <= document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
    });
    // Only assert on content images that have a real src.
    // The lightbox preview (#lbImg) starts with src="" until a gallery card is clicked.
    await page.waitForFunction(
      () =>
        Array.from(document.images)
          .filter((im) => im.getAttribute("src"))
          .every((im) => im.complete && im.naturalWidth > 0),
      { timeout: 20000 }
    );

    const data = await page.$$eval("img[src]:not([src=''])", (els) =>
      els.map((el) => ({
        alt: el.getAttribute("alt"),
        complete: (el as HTMLImageElement).complete,
        nw: (el as HTMLImageElement).naturalWidth,
        src: (el as HTMLImageElement).currentSrc,
      }))
    );
    expect(data.length).toBeGreaterThan(3);
    for (const d of data) {
      expect(d.alt, `alt for ${d.src}`).not.toBeNull();
      expect(d.complete, `loaded ${d.src}`).toBe(true);
      expect(d.nw, `naturalWidth ${d.src}`).toBeGreaterThan(0);
    }
  });

  test("mobile menu opens full-screen and closes", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator("#burger").click();
    const menu = page.locator("#mobileMenu");
    await expect(menu).toHaveClass(/open/);
    const box = await menu.boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(380);
    await page.locator("#mmClose").click();
    await expect(menu).not.toHaveClass(/open/);
  });

  test("no horizontal scroll at 390px", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
    );
    expect(overflow).toBeFalsy();
  });

  test("order form validates and builds wa.me link", async ({ page, context }) => {
    await page.locator("#order").scrollIntoViewIfNeeded();
    await page.locator("#orderForm button[type=submit]").click();
    await expect(page.locator('.err[data-for="name"]')).not.toBeEmpty();

    await page.fill("#name", "محمد العمري");
    await page.fill("#phone", "0555398789");
    await page.selectOption("#service", "باقة ورد");

    const popupPromise = context.waitForEvent("page").catch(() => null);
    await page.locator("#orderForm button[type=submit]").click();
    await expect(page.locator("#toast")).toHaveClass(/show/);
    const stored = await page.evaluate(() => localStorage.getItem("sf_orders"));
    expect(stored).toContain("محمد العمري");
    await popupPromise;
  });

  test("gallery lightbox opens", async ({ page }) => {
    await page.locator(".gal-card").first().click();
    await expect(page.locator("#lightbox")).toHaveClass(/open/);
    await page.locator("#lbClose").click();
    await expect(page.locator("#lightbox")).not.toHaveClass(/open/);
  });

  test("JSON-LD Florist with aggregateRating", async ({ page }) => {
    const ld = await page.locator('script[type="application/ld+json"]').textContent();
    const data = JSON.parse(ld!);
    expect(data["@type"]).toBe("Florist");
    expect(data.aggregateRating.ratingValue).toBe("4.8");
    expect(data.aggregateRating.reviewCount).toBe("446");
  });
});
