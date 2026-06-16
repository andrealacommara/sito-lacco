const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch();
  for (const scheme of ["light", "dark"]) {
    const page = await browser.newPage({ colorScheme: scheme });
    await page.goto("http://localhost:5176/", { waitUntil: "networkidle" });
    await page.waitForSelector("text=Pre-salva la sua prossima uscita", { timeout: 15000 });
    const heading = page.locator("text=Pre-salva la sua prossima uscita");
    await heading.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    await page.screenshot({ path: `/tmp/presave-${scheme}-before.png`, fullPage: false });
    await page.close();
  }
  await browser.close();
  console.log("done");
})();
