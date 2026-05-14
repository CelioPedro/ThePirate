import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const publicDir = path.resolve("public");
const sourceDir = path.resolve("..", "tools", "source-images", "frontend-app-public");

const profiles = [
  {
    source: path.join(sourceDir, "catalog", "products"),
    output: path.join(publicDir, "catalog", "products"),
    width: 640,
    quality: 80
  },
  {
    source: path.join(sourceDir, "catalog", "categories"),
    output: path.join(publicDir, "catalog", "categories"),
    width: 560,
    quality: 80
  },
  {
    source: path.join(sourceDir, "auth"),
    output: path.join(publicDir, "auth"),
    width: 1200,
    quality: 82
  },
  {
    source: path.join(sourceDir, "brand"),
    output: path.join(publicDir, "brand"),
    width: 512,
    quality: 82
  }
];

async function listPngFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return listPngFiles(fullPath);
    if (entry.isFile() && path.extname(entry.name).toLowerCase() === ".png") return [fullPath];
    return [];
  }));
  return files.flat();
}

function outputPathFor(filePath, sourceRoot, outputRoot) {
  const relativePath = path.relative(sourceRoot, filePath);
  return path.join(outputRoot, relativePath).replace(/\.png$/i, ".webp");
}

async function optimizeProfile({ source, output, width, quality }) {
  const files = await listPngFiles(source);
  const results = [];

  for (const input of files) {
    const outputPath = outputPathFor(input, source, output);
    const before = (await stat(input)).size;
    await sharp(input)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality, effort: 6 })
      .toFile(outputPath);
    const after = (await stat(outputPath)).size;
    results.push({ input, output: outputPath, before, after });
  }

  return results;
}

function formatBytes(bytes = 0) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

const results = (await Promise.all(profiles.map(optimizeProfile))).flat();
const before = results.reduce((total, item) => total + (item.before || 0), 0);
const after = results.reduce((total, item) => total + (item.after || 0), 0);

for (const item of results) {
  const relativeInput = path.relative(sourceDir, item.input).replaceAll(path.sep, "/");
  console.log(`${relativeInput}: ${formatBytes(item.before)} -> ${formatBytes(item.after)}`);
}

console.log(`\nOptimized ${results.length} images: ${formatBytes(before)} -> ${formatBytes(after)}`);
