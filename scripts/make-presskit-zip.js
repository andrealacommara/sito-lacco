// ========================== MAIN IMPORTS ========================== //
// Node.js utilities and archiver used to build the press-kit ZIP package.
import fs from "fs";
import archiver from "archiver";
import path from "path";

// ========================== OUTPUT TARGET ========================== //
// Resulting ZIP file: public/presskit-files/HQ/photos.zip
const outputPath = path.resolve("public/presskit-files/HQ/photos.zip");

// Ensure the parent folder exists before streaming the archive.
fs.mkdirSync(path.dirname(outputPath), { recursive: true });

// ========================== ARCHIVE GENERATION ========================== //
const output = fs.createWriteStream(outputPath);
const archive = archiver("zip", { zlib: { level: 9 } }); // max compression

// Stream the archive contents to disk.
archive.pipe(output);

// Add the HQ photo directory contents, preserving root file names only.
archive.directory("src/assets/images/presskit/HQ/", false);

// Finalize the ZIP build (returns a promise).
archive.finalize();
