/**
 * Playwright test — User Management navigation fix
 *
 * Verifies:
 *  1. SUPER_ADMIN can log in
 *  2. "User Management" appears in the main dashboard sidebar
 *  3. Clicking it navigates to /dashboard/users (NOT /wellness/users)
 *  4. The page title says "User Management" (NOT "Users")
 *  5. The sidebar shows the MAIN dashboard nav (Home, Categories…)
 *     and does NOT show the Beauty Services nav (Beauty Services, Bookings…)
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
  const afterLogin = page.url();
  check("Login → redirected to /dashboard", afterLogin.includes("/dashboard"), afterLogin);

  // ── 2. User Management link visible in sidebar ───────────────────────────
  await page.waitForSelector("nav", { timeout: 8_000 }).catch(() => {});
  const umLink = await page.locator('a:has-text("User Management")').first();
  const umVisible = await umLink.isVisible().catch(() => false);
  check("Sidebar shows 'User Management' link", umVisible);

  // ── 3. Click → lands on /dashboard/users ─────────────────────────────────
  if (umVisible) {
    const href = await umLink.getAttribute("href").catch(() => "");
    check("Link href is /dashboard/users", href === "/dashboard/users", href);

    await umLink.click();
    await page.waitForURL(/\/dashboard\/users/, { timeout: 10_000 }).catch(() => {});
    const currentUrl = page.url();
    check("URL after click is /dashboard/users", currentUrl.includes("/dashboard/users"), currentUrl);
    check("URL does NOT contain /wellness/users", !currentUrl.includes("/wellness/users"), currentUrl);
  }

  // ── 4. Page heading says "User Management" ───────────────────────────────
  const heading = await page.locator('h1, h2').first().textContent().catch(() => "");
  check("Page heading is 'User Management'",
        heading?.toLowerCase().includes("user management"),
        `got: "${heading?.trim()}"`);

  // ── 5. Dashboard sidebar items visible (not Beauty Services sidebar) ──────
  // Main dashboard sidebar has "Home", "Categories", "Favorites"
  const hasHome       = await page.locator('nav a:has-text("Home")').first().isVisible().catch(() => false);
  const hasCategories = await page.locator('nav a:has-text("Categories")').first().isVisible().catch(() => false);
  check("Dashboard sidebar: 'Home' link visible",       hasHome);
  check("Dashboard sidebar: 'Categories' link visible", hasCategories);

  // Beauty Services sidebar would show "Beauty Services" as a heading / nav item
  const hasBeautyHeader = await page.locator('nav a:has-text("Beauty Services")').first().isVisible().catch(() => false);
  // Note: "Beauty Services" IS a link in the main sidebar too, so check for wellness-specific items
  const hasAllBookings  = await page.locator('nav a:has-text("All Bookings")').first().isVisible().catch(() => false);
  const hasCenters      = await page.locator('nav a:has-text("Centers")').first().isVisible().catch(() => false);
  check("Beauty Services sidebar items NOT visible (All Bookings)", !hasAllBookings,
        hasAllBookings ? "FOUND — wrong sidebar!" : "correctly absent");
  check("Beauty Services sidebar items NOT visible (Centers)",      !hasCenters,
        hasCenters ? "FOUND — wrong sidebar!" : "correctly absent");

  // ── 6. User table loads ───────────────────────────────────────────────────
  const tableVisible = await page.locator("table, [role='table']")
    .first()
    .waitFor({ state: "visible", timeout: 15_000 })
    .then(() => true)
    .catch(() => false);
  check("User table rendered on /dashboard/users", tableVisible);

  await browser.close();

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log("\n=== User Management Nav Test ===");
  log.forEach(l => console.log(l));
  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail > 0) process.exit(1);
})();
