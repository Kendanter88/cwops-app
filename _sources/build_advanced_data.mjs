// Parse the Advanced Prototype curriculum + practice-file library and emit the
// streamlined data module data/cwops-advanced-proto.js.
//
//   node _sources/build_advanced_data.mjs        # writes the module
//   node _sources/build_advanced_data.mjs --dry  # report only
//
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const DRY = process.argv.includes("--dry");

const SCALES = "https://cwops.org/wp-content/uploads/2024/08/Everyday-Send-Code-Web.htm";
const norm = (s) =>
  s.replace(/\.mp3$/i, "").replace(/^.*\//, "").replace(/[^a-z0-9]/gi, "").toUpperCase();

// ---- Library: norm(code) -> url --------------------------------------------
const lib = readFileSync(resolve(here, "advanced-practice-files.htm"), "utf8");
const library = new Map();
for (const m of lib.matchAll(/href="([^"]+\.mp3)"/gi)) {
  const k = norm(m[1]);
  if (!library.has(k)) library.set(k, m[1]);
}
const urlFor = (code) => {
  const u = library.get(norm(code));
  if (!u) throw new Error(`No library file for ${code}`);
  return u;
};

// ---- Curriculum: Word-export HTML → clean text lines -----------------------
function htmlToLines(file) {
  let h = readFileSync(resolve(here, file), "utf8");
  h = h.replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<!--[\s\S]*?-->/g, " ");
  h = h.replace(/<\/(p|div|h[1-6]|li|tr)>/gi, "\n").replace(/<br[^>]*>/gi, "\n");
  h = h.replace(/<[^>]+>/g, " ");
  h = h.replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&")
    .replace(/&#8217;|&rsquo;/gi, "’").replace(/&#8211;|&ndash;/gi, "-")
    .replace(/&#8212;|&mdash;/gi, "-").replace(/&quot;/gi, '"').replace(/&#39;/g, "’");
  return h.split("\n").map((l) => l.replace(/\s+/g, " ").trim()).filter(Boolean);
}

// ---- Curriculum: split into session/day blocks -----------------------------
const lines = htmlToLines("advanced-curriculum-proto-v2.23.htm");
const FAM = "PR|WD|SS|QSO|POTA|ING|ED|ES|LY|IN|RE|IM|DIS|IR|UN";
const CODE = new RegExp(`\\b(${FAM})\\s*([0-9]{1,3})\\s*[\\s\\u2010-\\u2015-]\\s*(20|25|30|35)\\b`, "gi");

const sessions = [];
let cur = null, day = null;
for (const raw of lines) {
  const l = raw.trim();
  const ms = /^S\s?ession\s*(\d+)\s*:/i.exec(l);
  const md = /^Day\s+(one|two|three)\s*:/i.exec(l);
  if (ms) { cur = { n: Number(ms[1]), days: [] }; sessions.push(cur); day = null; continue; }
  if (md && cur) { day = { codes: [] }; cur.days.push(day); continue; }
  if (day) {
    for (const m of l.matchAll(CODE)) day.codes.push(`${m[1].toUpperCase()}${m[2]}-${m[3]}`);
  }
}
const real = sessions.filter((s) => s.days.length === 3);
if (real.length !== 16) throw new Error(`Expected 16 sessions, got ${real.length}`);

// ---- Streamlined templates (terse + tiny hint) -----------------------------
const famOf = (code) => /^([A-Z]+)\d/.exec(code)[1];
const SUFFIX = new Set(["ING", "ED", "ES", "LY"]);
const PREFIX = new Set(["IN", "RE", "IM", "DIS", "IR", "UN"]);
const a = (code) => `<a class="audio" href="${urlFor(code)}" target="_blank" rel="noopener">${code}</a>`;
const scales = (full) =>
  `<p>Sending warm-up${full ? " + exercise" : ""}: <a href="${SCALES}" target="_blank" rel="noopener">Morse Code Scales</a></p>`;

function lineFor(code) {
  const f = famOf(code);
  if (f === "PR") return `<p>Listen to ${a(code)} ×2 — phrase file, copy letter &amp; 2-letter combos</p>`;
  if (f === "WD") return `<p>Listen to ${a(code)} ×2 — word file, pick out whole words</p>`;
  if (f === "SS") return `<p>Head-copy ${a(code)} ×1 — long story, play straight through</p>`;
  if (f === "QSO") return `<p>Copy ${a(code)} — one-sided QSO: who's calling, who answers, RST/QTH/name</p>`;
  if (f === "POTA") return `<p>Copy ${a(code)} — POTA activation: who's calling, what's the exchange</p>`;
  if (SUFFIX.has(f)) return `<p>Listen to ${a(code)} — “-${f}” suffix sound</p>`;
  if (PREFIX.has(f)) return `<p>Listen to ${a(code)} — “${f}-” prefix sound</p>`;
  throw new Error(`Unknown family for ${code}`);
}

function buildDay(codes, dayIdx) {
  const body = [scales(dayIdx === 2), ...codes.map(lineFor)].join("\n");
  const tools = [
    { name: "Morse Code Scales", url: SCALES },
    ...codes.map((c) => ({ name: c, url: urlFor(c) })),
  ];
  return { label: `Day ${dayIdx + 1}`, bodyHtml: body, tools };
}

function summary(s) {
  const speed = s.days[0].codes[0].split("-")[1];
  const fams = new Set(s.days.flatMap((d) => d.codes.map(famOf)));
  const suf = [...SUFFIX].filter((f) => fams.has(f));
  const pre = [...PREFIX].filter((f) => fams.has(f));
  const drill = suf.length ? `suffix drills (${suf.join("/")})` : pre.length ? `prefix drills (${pre.join("/")})` : "";
  return `Phrase, word, short-story head copy, QSO & POTA at ${speed} WPM${drill ? "; " + drill : ""}.`;
}

const lessons = real.map((s) => {
  const speed = s.days[0].codes[0].split("-")[1];
  return {
    id: s.n,
    title: `Session ${s.n} · ${speed} WPM`,
    summary: summary(s),
    speedRange: `${speed} WPM`,
    days: s.days.map((d, i) => buildDay(d.codes, i)),
  };
});

const course = {
  id: "cwops-advanced-proto",
  shortName: "CWA Advanced",
  longName: "CW Academy Advanced Curriculum (Prototype v2.23)",
  subtitle: "16 sessions · 20→35 WPM",
  description:
    "CW Academy's Advanced course, prototype edition. Sixteen sessions building head-copy speed from 20 through 35 WPM with phrase, word, QSO, POTA, suffix and prefix files — plus a daily long-form short-story head-copy assignment unique to this version.",
  source: {
    org: "CW Academy / CWops",
    author: "Buz Tarlow, AC6AC",
    referenceUrl: "https://cwops.org/wp-content/uploads/2025/08/Advanced-Curriculum-Proto-v2.23.htm",
    filesUrl: "https://cwops.org/advanced-practice-files/",
  },
  intro: {
    title: "Advanced Head Copy",
    sections: [
      {
        heading: "How to work the short-story files",
        html:
          "<p>The Day-1 short story is the heart of this course. Play it straight through — no pausing, no rewinding.</p>" +
          "<p>Hear whole words as a flowing stream, not spelled-out letters. Guess when you need to, relax, and trust your unconscious mind — a little spelling is fine too.</p>" +
          "<p>Bonus: replay the same file at different speeds to build flexibility.</p>",
      },
    ],
  },
  assessment: null,
  lessons,
};

// ---- Emit -------------------------------------------------------------------
const banner =
  "// Auto-generated by _sources/build_advanced_data.mjs — do not edit by hand.\n" +
  "// Re-run the script after updating _sources/advanced-curriculum-proto-v2.23.htm.\n\n";
// JSON strings are valid JS string literals, so stringify handles all escaping.
const out = banner + "export default " + JSON.stringify(course, null, 2) + ";\n";

console.log(`Sessions: ${lessons.length}  |  audio refs: ${real.flatMap((s) => s.days).flatMap((d) => d.codes).length}`);
if (DRY) {
  console.log("\n--- Session 1 sample ---");
  for (const d of lessons[0].days) console.log(`\n${d.label}\n` + d.bodyHtml.replace(/<[^>]+>/g, (m) => (m === "</p>" ? "" : m.startsWith("<a") ? "" : m === "<p>" ? "  • " : "")).replace(/\n/g, "\n"));
} else {
  writeFileSync(resolve(root, "data/cwops-advanced-proto.js"), out);
  console.log("Wrote data/cwops-advanced-proto.js");
}
