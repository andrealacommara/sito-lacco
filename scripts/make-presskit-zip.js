import fs from "fs";
import archiver from "archiver";
import path from "path";

// Output: public/presskit/HQ/photos.zip
const outputPath = path.resolve("public/presskit-files/HQ/photos.zip");

// Check if folder exists
fs.mkdirSync(path.dirname(outputPath), { recursive: true });

const output = fs.createWriteStream(outputPath);
const archive = archiver("zip", { zlib: { level: 9 } });

archive.pipe(output);

// Source folder: HQ originals
archive.directory("src/assets/images/presskit/HQ/", false);

archive.finalize();
