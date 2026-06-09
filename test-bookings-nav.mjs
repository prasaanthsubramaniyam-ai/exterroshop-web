/**
 * Test: My Bookings vs All Bookings active state isolation
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
async function getActiveItems(page) {
  return page.locator("nav a.bg-primary").allTextContents();
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page    = await browser.newPage();

  // Login
  await page.goto(`${WEB}/login`, { waitUntil: "networkidle" });
  await page.fill('input[type="email"]', EMAIL);
  await page.fill('input[type="password"]', PASS);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/dashboard/, { timeout: 15_000 }).catch(() => {});

  // Go to Beauty Services
  await page.click('a:has-text("Beauty Services")');
  await page.waitForURL(/\/wellness/, { timeout: 10_000 }).catch(() => {});

  // ── Test 1: Navigate to My Bookings ──────────────────────────────────────
  const myBookingsLink = page.locator('nav a:has-text("My Bookings")').first();
  await myBookingsLink.waitFor({ state: "visible", timeout: 8_000 }).catch(() => {});
  await myBookingsLink.click();
  await page.waitForURL(/\/wellness\/bookings\/my/, { timeout: 10_000 }).catch(() => {});
  await page.waitForTimeout(500); // let active state settle

  const activeOnMyBookings = await getActiveItems(page);
  check(
    "On /wellness/bookings/my — only 'My Bookings' is active",
    activeOnMyBookings.length === 1 && activeOnMyBookings[0].trim() === "My Bookings",
    `active: [${activeOnMyBookings.map(s => s.trim()).join(", ")}]`
  );
  check(
    "On /wellness/bookings/my — 'All Bookings' is NOT active",
    !activeOnMyBookings.some(s => s.trim() === "All Bookings"),
    `active: [${activeOnMyBookings.map(s => s.trim()).join(", ")}]`
  );

  // ── Test 2: Navigate to All Bookings ─────────────────────────────────────
  const allBookingsLink = page.locator('nav a:has-text("All Bookings")').first();
  await allBookingsLink.click();
  await page.waitForURL(/\/wellness\/bookings$/, { timeout: 10_000 }).catch(() => {});
  await page.waitForTimeout(500);

  const activeOnAllBookings = await getActiveItems(page);
  check(
    "On /wellness/bookings — only 'All Bookings' is active",
    activeOnAllBookings.length === 1 && activeOnAllBookings[0].trim() === "All Bookings",
    `active: [${activeOnAllBookings.map(s => s.trim()).join(", ")}]`
  );
  check(
    "On /wellness/bookings — 'My Bookings' is NOT active",
    !activeOnAllBookings.some(s => s.trim() === "My Bookings"),
    `active: [${activeOnAllBookings.map(s => s.trim()).join(", ")}]`
  );

  // ── Test 3: Back to My Bookings again ─────────────────────────────────────
  await page.locator('nav a:has-text("My Bookings")').first().click();
  await page.waitForURL(/\/wellness\/bookings\/my/, { timeout: 10_000 }).catch(() => {});
  await page.waitForTimeout(500);

  const activeAgain = await getActiveItems(page);
  check(
    "Re-visit My Bookings — still only one active item",
    activeAgain.length === 1 && activeAgain[0].trim() === "My Bookings",
    `active: [${activeAgain.map(s => s.trim()).join(", ")}]`
  );

  await browser.close();

  console.log("\n=== Bookings Nav Active-State Test ===");
  log.forEach(l => console.log(l));
  console.log(`\n${pass} passed, ${fail} failed`);
  if (fail > 0) process.exit(1);
})();
