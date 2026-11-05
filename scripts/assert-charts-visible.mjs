#!/usr/bin/env node
/**
 * Smoke-check that Rainfall Atlas chart panels render SVG/path/bar graphics.
 * Usage: node scripts/assert-charts-visible.mjs [url ...]
 */
import { chromium } from "playwright";

const urls = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ["http://127.0.0.1:4317/", process.env.PUBLIC_URL].filter(Boolean);

if (!urls.length) {
  console.error("Pass at least one URL");
  process.exit(2);
}

const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox"],
});

let failed = false;

for (const url of urls) {
  const page = await browser.newPage({ viewport: { width: 1400, height: 2400 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));

  await page.goto(url, { waitUntil: "networkidle", timeout: 90000 });
  await page.waitForTimeout(2500);

  const title = await page.title();
  const measuring = await page.locator("text=Measuring").count();
  const viewports = await page.locator(".chart-viewport").count();
  const svgs = await page.locator(".chart-viewport svg, .recharts-surface").count();
  const paths = await page.locator(".chart-viewport svg path, .recharts-surface path").count();
  const bars = await page.locator(
    ".recharts-bar-rectangle, .chart-viewport svg .recharts-rectangle",
  ).count();
  const bodySnippet = (await page.locator("body").innerText()).slice(0, 120);

  const ok =
    title.includes("Rainfall Atlas") &&
    measuring === 0 &&
    viewports >= 4 &&
    svgs >= 4 &&
    (paths > 0 || bars > 0);

  const label = url.replace(/https?:\/\//, "").replace(/\/$/, "");
  console.log(
    JSON.stringify(
      {
        url,
        ok,
        title,
        measuring,
        viewports,
        svgs,
        paths,
        bars,
        pageErrors: errors.slice(0, 5),
        bodySnippet,
      },
      null,
      2,
    ),
  );

  const safe = label.replace(/[^a-z0-9.-]+/gi, "_").slice(0, 80);
  await page.screenshot({
    path: `/opt/cursor/artifacts/charts-${safe}.png`,
    fullPage: true,
  });

  if (!ok) failed = true;
  await page.close();
}

await browser.close();
process.exit(failed ? 1 : 0);
