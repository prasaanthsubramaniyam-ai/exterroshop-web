/**
 * Playwright test — Beauty Services sidebar style + Bulk Upload removal
 *
 * Verifies:
 *  1. Login and navigate to Beauty Services
 *  2. Sidebar has width w-72 (288px) matching main sidebar
 *  3. "Menu" section label is present
 *  4. "Bulk Upload" is NOT in the sidebar
 *  5. Active item uses bg-primary class (same active style as main sidebar)
 *  6. Icons are size-5 (20px)
 *  7. "Back to Marketplace" footer link is present
 *  8. All expected nav items are present
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
  const browser = await chromium.launch({ headless: true });
  const page    = await browser.newPage();

  // ── 1. Login ─────────────────────────────────────────────────────────────
  await page.goto(`${WEB}/login`, { waitUntil: "networkidle" });
  await page.fill('input[type="email"]',    EMAIL);
  await page.fill('input[type="password"]', PASS);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/dashboard/, { timeout: 15_000 }).catch(() => {});
  check("Login successful", page.url().includes("/dashboard"));

  // ── 2. Navigate to Beauty Services ───────────────────────────────────────
  await page.click('a:has-text("Beauty Services")');
  await page.waitForURL(/\/wellness/, { timeout: 10_000 }).catch(() => {});
  check("Navigated to /wellness", page.url().includes("/wellness"));

  // ── 3. Sidebar width = 288px (w-72) ──────────────────────────────────────
  const sidebarWidth = await page.locator("aside").first().evaluate(el => el.getBoundingClientRect().width);
  check("Sidebar width is 288px (w-72)", sidebarWidth === 288, `got ${sidebarWidth}px`);

  // ── 4. "Menu" section label present ──────────────────────────────────────
  const menuLabel = await page.locator("nav p:has-text('Menu')").isVisible().catch(() => false);
  check('"Menu" section label visible', menuLabel);

  // ── 5. Bulk Upload NOT in sidebar ─────────────────────────────────────────
  const hasBulkUpload = await page.locator('nav a:has-text("Bulk Upload")').isVisible().catch(() => false);
  check('"Bulk Upload" removed from sidebar', !hasBulkUpload,
        hasBulkUpload ? "STILL PRESENT" : "correctly absent");

  // ── 6. Expected nav items present ────────────────────────────────────────
  const expectedItems = ["Dashboard", "Calendar", "All Bookings", "Centers", "Services", "Staff"];
  for (const label of expectedItems) {
    const visible = await page.locator(`nav a:has-text("${label}")`).first().isVisible().catch(() => false);
    check(`Nav item "${label}" present`, visible);
  }

  // ── 7. Active item has bg-primary style ──────────────────────────────────
  // Dashboard is the active page — check it has the active class
  const activeClass = await page.locator('nav a:has-text("Dashboard")').first()
    .getAttribute("class").catch(() => "");
  check("Active item has bg-primary class", activeClass?.includes("bg-primary"), `classes: ${activeClass?.slice(0, 80)}`);

  // ── 8. Icon size is 20px (size-5) ────────────────────────────────────────
  const iconSize = await page.locator("nav a svg").first().evaluate(el => el.getBoundingClientRect().width);
  check("Nav icons are 20px (size-5)", iconSize === 20, `got ${iconSize}px`);

  // ── 9. "Back to Marketplace" footer link ─────────────────────────────────
  const backLink = await page.locator('a:has-text("Back to Marketplace")').isVisible().catch(() => false);
  check('"Back to Marketplace" link in footer', backLink);

  // ── 10. "Back to Marketplace" link href points to /dashboard ─────────────
  const backHref = await page.locator('a:has-text("Back to Marketplace")').first().getAttribute("href").catch(() => "");
  check("Back to Marketplace href is /dashboard", backHref === "/dashboard", `href: ${backHref}`);

  await browser.close();

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log("\n=== Beauty Services Sidebar Test ===");
  log.forEach(l => console.log(l));
  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail > 0) process.exit(1);
})();
