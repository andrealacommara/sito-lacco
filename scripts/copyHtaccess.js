import { copyFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const source = path.join(rootDir, ".htaccess");
const distDir = path.join(rootDir, "dist");
const destination = path.join(distDir, ".htaccess");

if (!existsSync(source)) {
  console.warn("[copyHtaccess] .htaccess file not found, skipping.");
  process.exit(0);
}

if (!existsSync(distDir)) {
  console.warn("[copyHtaccess] dist directory not found, skipping.");
  process.exit(0);
}

copyFileSync(source, destination);
console.log("[copyHtaccess] Copied .htaccess -> dist/.htaccess");
