// One-shot audit: verify every exercise label matches its audio file link,
// flag plain-text file mentions that should be links, and flag cited files
// that don't exist in the CWops practice-file library.
//
//   node _sources/audit_audio_links.mjs
//
import { readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");

// Compare on alphanumerics only: separators (space, _, -, en/em dash) are
// cosmetic, so "QSO101-10", "QSO 101 10" and "QSO_101_10.mp3" are all equal,
// while a real digit change like "CWT209-20" vs "CWT-209-25" still differs.
const norm = (s) =>
  s.replace(/\.mp3$/i, "")
    .replace(/^.*\//, "") // strip path → stem
    .replace(/[^a-z0-9]/gi, "")
    .toUpperCase();

// 1. Build the library: every .mp3 the practice-files page links to.
const libHtml = readFileSync(resolve(root, "_sources/cwops-practice-files.htm"), "utf8");
const library = new Map(); // normKey -> url
for (const m of libHtml.matchAll(/href="([^"]+\.mp3)"/gi)) {
  const url = m[1];
  const key = norm(url);
  if (!library.has(key)) library.set(key, url);
}

// 2. Load the curriculum data.
const data = (await import(pathToFileURL(resolve(root, "data/cwops-intermediate.js")).href)).default;

// File-code shape used in prose, e.g. "CWT 209-20", "SS 103–18", "WD401-18".
const CODE = /\b([A-Z]{2,5})[  ]?(\d{2,4})[  ]?[–—-][  ]?(\d{2})\b/g;

const findings = [];
const add = (lesson, day, kind, detail) =>
  findings.push({ where: `L${lesson.id} · ${day.label}`, kind, detail });

for (const lesson of data.lessons) {
  for (const day of lesson.days || []) {
    const html = day.bodyHtml || "";

    // a/b. Each <a> with an mp3 href: label must match file; file must exist.
    for (const a of html.matchAll(/<a\b[^>]*href="([^"]+\.mp3)"[^>]*>(.*?)<\/a>/gi)) {
      const url = a[1];
      const label = a[2].replace(/<[^>]+>/g, "").trim();
      if (norm(label) !== norm(url))
        add(lesson, day, "LABEL≠FILE", `link text "${label}" → ${url.split("/").pop()}`);
      if (!library.has(norm(url)))
        add(lesson, day, "FILE-NOT-IN-LIBRARY", `${label} → ${url.split("/").pop()}`);
    }

    // c. Plain-text file codes outside any link.
    const stripped = html.replace(/<a\b[^>]*>.*?<\/a>/gi, " ");
    for (const m of stripped.matchAll(CODE)) {
      const code = m[0].trim();
      const key = norm(code);
      const exists = library.has(key);
      add(
        lesson,
        day,
        "PLAIN-TEXT",
        `"${code}" not linked` + (exists ? ` (file exists: ${library.get(key).split("/").pop()})` : " (NO matching file in library)")
      );
    }

    // d. tools entries: label vs file, and existence.
    for (const t of day.tools || []) {
      if (!/\.mp3$/i.test(t.url || "")) continue;
      if (norm(t.name) !== norm(t.url))
        add(lesson, day, "TOOL-LABEL≠FILE", `tool "${t.name}" → ${t.url.split("/").pop()}`);
      if (!library.has(norm(t.url)))
        add(lesson, day, "TOOL-FILE-NOT-IN-LIBRARY", `${t.name} → ${t.url.split("/").pop()}`);
    }
  }
}

console.log(`Library files indexed: ${library.size}`);
console.log(`Findings: ${findings.length}\n`);
const byKind = {};
for (const f of findings) (byKind[f.kind] ||= []).push(f);
for (const kind of Object.keys(byKind)) {
  console.log(`## ${kind} (${byKind[kind].length})`);
  for (const f of byKind[kind]) console.log(`  ${f.where.padEnd(16)} ${f.detail}`);
  console.log();
}
