#!/usr/bin/env node
/** Descarga emotes 7TV a public/emotes/ para servirlos en local. */
import fs from "fs";
import https from "https";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const emotesFile = path.join(__dirname, "../lib/game/emotes.ts");
const outDir = path.join(__dirname, "../public/emotes");

const src = fs.readFileSync(emotesFile, "utf8");
const ids = [...new Set([...src.matchAll(/id: "([^"]+)"/g)].map((m) => m[1]))];

fs.mkdirSync(outDir, { recursive: true });

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https
      .get(url, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          file.close();
          fs.unlinkSync(dest);
          return resolve(download(res.headers.location, dest));
        }
        if (res.statusCode !== 200) {
          file.close();
          fs.unlinkSync(dest);
          return reject(new Error(`${url} → HTTP ${res.statusCode}`));
        }
        res.pipe(file);
        file.on("finish", () => {
          file.close();
          resolve();
        });
      })
      .on("error", reject);
  });
}

let ok = 0;
let fail = 0;

for (const id of ids) {
  const dest = path.join(outDir, `${id}.webp`);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 0) {
    ok++;
    continue;
  }
  const url = `https://cdn.7tv.app/emote/${id}/4x.webp`;
  try {
    await download(url, dest);
    ok++;
    process.stdout.write(".");
  } catch (e) {
    fail++;
    console.error(`\n✗ ${id}: ${e.message}`);
  }
}

console.log(`\nListo: ${ok} descargados, ${fail} fallidos (${ids.length} total).`);
