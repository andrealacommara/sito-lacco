// ========================== MAIN IMPORTS ========================== //
// Node.js utilities used to resolve file paths and copy files after the build.
import { copyFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// ========================== PATH RESOLUTION ========================== //
// Resolve project root relative to this script (located in scripts/).
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

// Source and destination for the .htaccess file.
const source = path.join(rootDir, ".htaccess");
const distDir = path.join(rootDir, "dist");
const destination = path.join(distDir, ".htaccess");

// ========================== SAFETY CHECKS ========================== //
if (!existsSync(source)) {
  console.warn("[copyHtaccess] .htaccess file not found, skipping.");
  process.exit(0);
}

if (!existsSync(distDir)) {
  console.warn("[copyHtaccess] dist directory not found, skipping.");
  process.exit(0);
}

// ========================== COPY STEP ========================== //
copyFileSync(source, destination);
console.log("[copyHtaccess] Copied .htaccess -> dist/.htaccess");
