// ========================== MAIN IMPORTS ========================== //
// Node.js utilities and yazl used to build the press-kit ZIP package.
import fs from "fs";
import { ZipFile } from "yazl";
import path from "path";

// ========================== OUTPUT TARGET ========================== //
// Resulting ZIP file: dist/presskit-files/HQ/photos.zip
const outputPath = path.resolve("dist/presskit-files/HQ/photos.zip");

// Ensure the parent folder exists before streaming the archive.
fs.mkdirSync(path.dirname(outputPath), { recursive: true });

// ========================== ARCHIVE GENERATION ========================== //
const sourceDir = "src/assets/images/presskit/HQ/";
const zipfile = new ZipFile();

// Add every file in the source directory (flat, no sub-folders).
const files = fs.readdirSync(sourceDir).filter((f) =>
  fs.statSync(path.join(sourceDir, f)).isFile(),
);

for (const file of files) {
  zipfile.addFile(path.join(sourceDir, file), file, { compress: true });
}

// Stream the archive contents to disk.
const output = fs.createWriteStream(outputPath);
zipfile.outputStream.pipe(output);

// Finalize the ZIP build.
zipfile.end();
