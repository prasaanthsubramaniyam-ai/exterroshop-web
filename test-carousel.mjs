/**
 * Test: Recently Added Products Carousel in hero banner
 */
import { chromium } from "playwright";

const WEB   = "https://exterro-shop.vercel.app";
const EMAIL = "prasaanth95naveen@gmail.com";
const PASS  = "12345678";

let pass = 0, fail = 0;
const log = [];
function check(name, cond, detail = "") {
  if (cond) { pass++; log.push(`✅ ${name}${detail ? " — " + detail : ""}`); }
  else       { fail++; log.push(`❌ ${name}${detail ? " — " + detail : ""}`); }
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: [
      "--disable-background-timer-throttling",
      "--disable-backgrounding-occluded-windows",
      "--disable-renderer-backgrounding",
    ],
  });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page    = await context.newPage();

  // Login
  await page.goto(`${WEB}/login`, { waitUntil: "networkidle" });
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASS);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/dashboard/, { timeout: 15_000 }).catch(() => {});
  check("Login successful", page.url().includes("/dashboard"));

  // Scope everything to the carousel container
  const C = () => page.locator('[data-testid="recent-carousel"]');

  // Wait for carousel to appear
  await C().waitFor({ state: "visible", timeout: 15_000 }).catch(() => {});
  const carouselVisible = await C().isVisible().catch(() => false);
  check("Carousel container visible in hero banner", carouselVisible);

  // ── 1. "Just Added" label ────────────────────────────────────────────────
  const label = await C().locator(':text("Just Added")').first().isVisible().catch(() => false);
  check('"Just Added" label visible', label);

  // ── 2. Product image ──────────────────────────────────────────────────────
  const img = await C().locator("img").first().isVisible().catch(() => false);
  check("Product image rendered", img);

  // ── 3. Price shown (₹) ───────────────────────────────────────────────────
  const price = await C().locator("p.text-primary, .text-primary").first().textContent().catch(() => "");
  check("Product price shown (₹)", price?.includes("₹") ?? false, price?.trim());

  // ── 4. Dot indicators ────────────────────────────────────────────────────
  const dots = await C().locator("button[aria-label^='Go to product']").count();
  check("Dot indicators present (≥ 1)", dots >= 1, `${dots} dots`);

  // ── 5. Counter shows X/N ─────────────────────────────────────────────────
  // Counter is rendered as "{current+1}<span>/</span>{total}" — read the parent
  const counterEl = C().locator(".tabular-nums").first();
  const counter   = await counterEl.textContent().catch(() => "");
  check("Slide counter X/N present", /\d+.{0,3}\d+/.test(counter ?? ""), `"${counter?.trim()}"`);

  // ── 6. Carousel card links to /dashboard/products/:id ────────────────────
  const cardHref = await C().locator("a").first().getAttribute("href").catch(() => "");
  check("Card links to /dashboard/products/:id", /\/dashboard\/products\/\d+/.test(cardHref ?? ""), cardHref ?? "");

  // ── 7. Next button advances slide ────────────────────────────────────────
  const titleBefore = await C().locator("a p.font-semibold").first().textContent().catch(() => "");
  await C().locator("button[aria-label='Next product']").click();
  await page.waitForTimeout(400);
  const titleAfter = await C().locator("a p.font-semibold").first().textContent().catch(() => "");
  check("Next button shows a different product", titleBefore !== titleAfter,
    `"${titleBefore?.trim()}" → "${titleAfter?.trim()}"`);

  // ── 8. Prev button goes back ──────────────────────────────────────────────
  await C().locator("button[aria-label='Previous product']").click();
  await page.waitForTimeout(400);
  const titleBack = await C().locator("a p.font-semibold").first().textContent().catch(() => "");
  check("Prev button returns to previous product", titleBack?.trim() === titleBefore?.trim(),
    `expected: "${titleBefore?.trim()}" got: "${titleBack?.trim()}"`);

  // ── 9. Counter updates correctly across slides ───────────────────────────
  const getCounter = () => C().locator(".tabular-nums").first().textContent().catch(() => "");
  await C().locator("button[aria-label='Next product']").click(); await page.waitForTimeout(300);
  const c3 = await getCounter();
  await C().locator("button[aria-label='Next product']").click(); await page.waitForTimeout(300);
  const c4 = await getCounter();
  await C().locator("button[aria-label='Next product']").click(); await page.waitForTimeout(300);
  const c5 = await getCounter();
  check("Counter increments correctly across slides",
    c3 !== c4 && c4 !== c5,
    `"${c3?.trim()}" → "${c4?.trim()}" → "${c5?.trim()}"`);

  // ── 10. Hero text still visible ──────────────────────────────────────────
  const heroH1 = await page.locator("h1").first().isVisible().catch(() => false);
  check("Hero heading still visible alongside carousel", heroH1);
  const browseBtn = await page.locator('a:has-text("Browse listings")').first().isVisible().catch(() => false);
  check('"Browse listings" CTA still visible', browseBtn);

  await browser.close();

  console.log("\n=== Hero Carousel Test ===");
  log.forEach(l => console.log(l));
  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail > 0) process.exit(1);
})();
