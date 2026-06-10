// ========================== MAIN IMPORTS ========================== //
// Runtime smoke test: builds are validated for compilation by "npm run build",
// but compilation alone does not catch runtime crashes (e.g. a mismatched
// react / react-dom pair throws React error #527 only in the browser).
// This script serves the production build and loads it in a real browser to
// make sure the app actually renders without console/page errors.
import { spawn } from "node:child_process";
import { chromium } from "playwright";

// ========================== CONFIG ========================== //
const HOST = "127.0.0.1";
const PORT = 4173; // default port used by "vite preview"
const URL = `http://${HOST}:${PORT}/`;
const STARTUP_TIMEOUT_MS = 30000;

// ========================== START PREVIEW SERVER ========================== //
// Serve the already-built dist/ folder with vite preview.
const preview = spawn(
  "npx",
  ["vite", "preview", "--host", HOST, "--port", String(PORT), "--strictPort"],
  { stdio: ["ignore", "pipe", "inherit"] }
);

// Resolve once the server prints its ready line (or reject on timeout).
function waitForServer() {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error("[smoke] preview server did not start in time")),
      STARTUP_TIMEOUT_MS
    );
    preview.stdout.on("data", (chunk) => {
      const text = chunk.toString();
      process.stdout.write(text);
      if (text.includes(String(PORT)) || text.toLowerCase().includes("local")) {
        clearTimeout(timer);
        resolve();
      }
    });
    preview.on("exit", (code) => {
      clearTimeout(timer);
      reject(new Error(`[smoke] preview server exited early (code ${code})`));
    });
  });
}

// ========================== CLEANUP HELPER ========================== //
function shutdown(code) {
  try {
    preview.kill("SIGTERM");
  } catch {
    // ignore
  }
  process.exit(code);
}

// ========================== MAIN ========================== //
let browser;
try {
  await waitForServer();

  browser = await chromium.launch();
  const page = await browser.newPage();

  // Collect anything that signals a broken runtime.
  const errors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(`console.error: ${msg.text()}`);
  });
  page.on("pageerror", (err) => {
    errors.push(`pageerror: ${err.message}`);
  });

  await page.goto(URL, { waitUntil: "networkidle", timeout: STARTUP_TIMEOUT_MS });

  // The app must actually render something into #root.
  const rootHtml = await page.locator("#root").innerHTML();
  if (!rootHtml || rootHtml.trim().length === 0) {
    errors.push("render: #root is empty after load (blank screen)");
  }

  if (errors.length > 0) {
    console.error("[smoke] FAILED. Detected runtime problems:");
    for (const e of errors) console.error("  - " + e);
    shutdown(1);
  }

  console.log("[smoke] OK: app rendered with no console/page errors.");
  shutdown(0);
} catch (err) {
  console.error("[smoke] FAILED:", err.message);
  shutdown(1);
}
