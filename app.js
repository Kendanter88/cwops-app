// Morse Practice Companion — vanilla JS SPA.
// Hash routes:
//   #/                                — class selector
//   #/c/<classId>                     — class home (lessons + intro/assessment)
//   #/c/<classId>/intro               — class intro / mindset
//   #/c/<classId>/assessment          — self-assessment
//   #/c/<classId>/lesson/<n>          — lesson detail

import { classes, loadClass } from "./data/classes.js";
import { extras } from "./data/extras.js";
import { guides } from "./data/guides.js";

const app = document.getElementById("app");

// ---------------------------------------------------------------------------
// Theme
// ---------------------------------------------------------------------------

const THEME_KEY = "mpc.theme";

function applyTheme(t) {
  document.documentElement.dataset.theme = t;
}

(function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  const prefersLight = window.matchMedia?.("(prefers-color-scheme: light)").matches;
  applyTheme(saved || (prefersLight ? "light" : "dark"));
  document.getElementById("theme-toggle").addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    applyTheme(next);
    localStorage.setItem(THEME_KEY, next);
  });
})();

// ---------------------------------------------------------------------------
// Progress (per class+lesson) and homework checks (per class+lesson+item)
// ---------------------------------------------------------------------------

const STATE_KEY = "mpc.state.v1";

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STATE_KEY) || "{}");
  } catch {
    return {};
  }
}
function saveState(s) {
  localStorage.setItem(STATE_KEY, JSON.stringify(s));
}

function isChecked(classId, lessonId, itemIdx) {
  const s = loadState();
  return !!s[classId]?.[lessonId]?.homework?.[itemIdx];
}
function setChecked(classId, lessonId, itemIdx, value) {
  const s = loadState();
  s[classId] ??= {};
  s[classId][lessonId] ??= {};
  s[classId][lessonId].homework ??= {};
  if (value) s[classId][lessonId].homework[itemIdx] = true;
  else delete s[classId][lessonId].homework[itemIdx];
  saveState(s);
}
function lessonProgress(classId, lessonId, total) {
  const s = loadState();
  const checks = s[classId]?.[lessonId]?.homework || {};
  const done = Object.values(checks).filter(Boolean).length;
  return { done, total, frac: total ? done / total : 0 };
}

function isDayDone(classId, lessonId, dayKey) {
  return !!loadState()[classId]?.[lessonId]?.days?.[dayKey];
}
function setDayDone(classId, lessonId, dayKey, value) {
  const s = loadState();
  s[classId] ??= {};
  s[classId][lessonId] ??= {};
  s[classId][lessonId].days ??= {};
  if (value) s[classId][lessonId].days[dayKey] = true;
  else delete s[classId][lessonId].days[dayKey];
  saveState(s);
}

function isDayItemChecked(classId, lessonId, dayKey, itemIdx) {
  return !!loadState()[classId]?.[lessonId]?.dayItems?.[dayKey]?.[itemIdx];
}
function setDayItemChecked(classId, lessonId, dayKey, itemIdx, value) {
  const s = loadState();
  s[classId] ??= {};
  s[classId][lessonId] ??= {};
  s[classId][lessonId].dayItems ??= {};
  s[classId][lessonId].dayItems[dayKey] ??= {};
  if (value) s[classId][lessonId].dayItems[dayKey][itemIdx] = true;
  else delete s[classId][lessonId].dayItems[dayKey][itemIdx];
  saveState(s);
}

function isLessonComplete(classId, lessonId) {
  return !!loadState()[classId]?.[lessonId]?.complete;
}
function setLessonComplete(classId, lessonId, value) {
  const s = loadState();
  s[classId] ??= {};
  s[classId][lessonId] ??= {};
  if (value) s[classId][lessonId].complete = true;
  else delete s[classId][lessonId].complete;
  saveState(s);
}
function isLessonAllChecked(classId, lesson) {
  const homeworkTotal = lesson.homework?.length || 0;
  const daysTotal = lesson.days?.length || 0;
  if (homeworkTotal + daysTotal === 0) return false;
  const ls = loadState()[classId]?.[lesson.id] || {};
  const homeworkDone = Object.values(ls.homework || {}).filter(Boolean).length;
  const daysDone = Object.values(ls.days || {}).filter(Boolean).length;
  return homeworkDone === homeworkTotal && daysDone === daysTotal;
}

// Track most-recent class+lesson so the landing page can offer "Resume".
function rememberLast(classId, lessonId) {
  const s = loadState();
  s._last = { classId, lessonId, at: Date.now() };
  saveState(s);
}
function getLast() {
  return loadState()._last || null;
}

// ---------------------------------------------------------------------------
// Tiny DOM helpers
// ---------------------------------------------------------------------------

function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === "class") node.className = v;
    else if (k === "html") node.innerHTML = v;
    else if (k.startsWith("on") && typeof v === "function") {
      node.addEventListener(k.slice(2).toLowerCase(), v);
    } else if (k === "dataset") {
      Object.assign(node.dataset, v);
    } else if (k in node && typeof v !== "object") {
      try { node[k] = v; } catch { node.setAttribute(k, v); }
    } else {
      node.setAttribute(k, v);
    }
  }
  for (const child of children.flat()) {
    if (child == null || child === false) continue;
    node.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
  }
  return node;
}

function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// Parse a day's bodyHtml into structured items: actionable tasks, section
// headers (rendered as labels without checkboxes), or skipped junk left over
// from the source HTML (Word artifacts, stray "Session N:" links).
// Items keep their original paragraph index so checkbox state stays stable
// even when classification changes.
function parseDayItems(html) {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  const paragraphs = Array.from(tmp.children).filter((c) => c.tagName === "P");
  return paragraphs.map((p, idx) => {
    const text = (p.textContent || "").replace(/\s+/g, " ").trim();
    const cls = p.getAttribute("class") || "";
    const hasHeading = !!p.querySelector("h1,h2,h3,h4,h5,h6");
    if (!text || hasHeading || /MsoNormal/i.test(cls) || /^session\s+\d+\s*:?$/i.test(text)) {
      return { type: "skip", idx };
    }
    if (/^hearing\s+sounds\b/i.test(text)) {
      return { type: "header", idx, nodes: Array.from(p.childNodes) };
    }
    return { type: "task", idx, nodes: Array.from(p.childNodes) };
  }).filter((it) => it.type !== "skip");
}

// ---------------------------------------------------------------------------
// In-app guide link rewriting
// ---------------------------------------------------------------------------
// Lesson source HTML links the external CWops LCWO ICR / MCW ICR PDFs and
// mentions Morse Runner inline as plain text. We swap those for in-app guide
// pages (see data/guides.js) so the procedure lives next to the lesson
// context. The same paragraph usually contains the day's target WPM
// ("set speed at 10 wpm…"), which we surface on the guide page.

const LCWO_ICR_EXTERNAL = "https://cwops.org/wp-content/uploads/2025/03/LCWO-ICR-Guidelines.htm";
const MCW_ICR_EXTERNAL = "https://cwops.org/wp-content/uploads/2024/08/MorseCode.World-ICR-Guidelines.htm";
const MCW_TRAINER_URL = "https://morsecode.world/international/trainer/words.html";

function extractWpm(text) {
  const m = /(\d+)\s*wpm/i.exec(text || "");
  return m ? Number(m[1]) : null;
}

function guideUrl(slug, ctx = {}) {
  const params = new URLSearchParams();
  if (ctx.speed != null) params.set("speed", String(ctx.speed));
  if (ctx.classId) params.set("class", ctx.classId);
  if (ctx.lessonId != null) params.set("lesson", String(ctx.lessonId));
  if (ctx.dayIdx != null) params.set("day", String(ctx.dayIdx + 1));
  const qs = params.toString();
  return `#/g/${slug}${qs ? "?" + qs : ""}`;
}

// Wraps the first text-node occurrence of `phrase` inside `root` in an <a>
// pointing at `href`. Skips text already inside an anchor.
function linkifyPhrase(root, phrase, href, className) {
  const re = new RegExp(`\\b${phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode: (node) => {
      if (!node.nodeValue || !re.test(node.nodeValue)) return NodeFilter.FILTER_REJECT;
      if (node.parentElement && node.parentElement.closest("a")) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  const target = walker.nextNode();
  if (!target) return false;
  const match = re.exec(target.nodeValue);
  const before = target.nodeValue.slice(0, match.index);
  const matched = target.nodeValue.slice(match.index, match.index + match[0].length);
  const after = target.nodeValue.slice(match.index + match[0].length);
  const a = document.createElement("a");
  a.href = href;
  if (className) a.className = className;
  a.textContent = matched;
  const parent = target.parentNode;
  if (before) parent.insertBefore(document.createTextNode(before), target);
  parent.insertBefore(a, target);
  if (after) parent.insertBefore(document.createTextNode(after), target);
  parent.removeChild(target);
  return true;
}

function rewriteGuideLinks(html, baseCtx) {
  if (!html) return html;
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  for (const p of Array.from(tmp.querySelectorAll("p"))) {
    const speed = extractWpm(p.textContent) ?? baseCtx.speed;
    const ctx = { ...baseCtx, speed };
    p.querySelectorAll(`a[href="${LCWO_ICR_EXTERNAL}"]`).forEach((a) => {
      a.setAttribute("href", guideUrl("lcwo-icr", ctx));
      a.removeAttribute("target");
      a.removeAttribute("rel");
    });
    p.querySelectorAll(`a[href="${MCW_ICR_EXTERNAL}"]`).forEach((a) => {
      a.setAttribute("href", MCW_TRAINER_URL);
    });
    if (/morse\s+runner/i.test(p.textContent)) {
      linkifyPhrase(p, "Morse Runner", guideUrl("morse-runner", ctx));
    }
  }
  return tmp.innerHTML;
}

// Returns Date objects keyed [lessonIdx][dayIdx]. Anchors each lesson's last
// day on a class meeting (Mon or Thu) and counts backward for the earlier
// days, skipping Sunday. `firstClassDateStr` is the date of Lesson 1's last
// day (the first class meeting). Lessons may share a calendar day at the
// seam (L(N) last day === L(N+1) first day) — that's expected.
function computeLessonDates(firstClassDateStr, lessons) {
  if (!firstClassDateStr || !lessons?.length) return null;
  const [y, m, d] = firstClassDateStr.split("-").map(Number);
  const classDay = new Date(y, m - 1, d);
  const out = [];
  for (const lesson of lessons) {
    const dayCount = lesson.days?.length || 0;
    const days = new Array(dayCount);
    if (dayCount >= 1) days[dayCount - 1] = new Date(classDay);
    const cursor = new Date(classDay);
    for (let i = dayCount - 2; i >= 0; i--) {
      cursor.setDate(cursor.getDate() - 1);
      if (cursor.getDay() === 0) cursor.setDate(cursor.getDate() - 1);
      days[i] = new Date(cursor);
    }
    out.push(days);
    // Advance to next class day: Mon (1) → Thu (+3); Thu (4) → next Mon (+4).
    const dow = classDay.getDay();
    classDay.setDate(classDay.getDate() + (dow === 1 ? 3 : dow === 4 ? 4 : 1));
  }
  return out;
}

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatDayDate(date) {
  if (!date) return "";
  return `${DOW[date.getDay()]} ${date.getMonth() + 1}/${date.getDate()}`;
}

const SUBMIT_HW_URL = "https://docs.google.com/forms/d/e/1FAIpQLScVofUQMR3P8G2Ayom5iEspPMsCRe51CdaNkF6Vc-WGk-WniA/viewform";

// ---------------------------------------------------------------------------
// Homework form (per-lesson) — feeds the CWA HW submission Google Form
// ---------------------------------------------------------------------------
// Values save to localStorage at state[classId][lessonId].hw[key].
// "HW output" button opens a new tab with question/answer pairs in the exact
// wording of the Google Form so values can be copy/pasted across.

const RATING_LABELS = { 1: "Poor", 2: "Fair", 3: "Good", 4: "Very Good" };

// CWA "files and speed" rows are derived from the lesson's exercise tools.
// Tool names follow `<code><file#>-<speed>` (e.g. WD101-10, DIS4-13, IR6-15).
// We bucket each code into the form row it belongs to; multiples join with `;`.
const CWA_CODE_BUCKETS = {
  WD: "shortWords", PR: "shortPhrases", QSO: "shortQso", POTA: "shortPota",
  DIS: "prefix", UN: "prefix", IM: "prefix", IN: "prefix", RE: "prefix", IR: "prefix",
  ING: "suffix", ES: "suffix", ED: "suffix", LY: "suffix",
};

function gatherLessonExerciseCodes(lesson) {
  const out = { shortWords: [], shortPhrases: [], shortQso: [], shortPota: [], prefix: [], suffix: [] };
  const seen = new Set();
  for (const day of lesson.days || []) {
    for (const tool of day.tools || []) {
      const name = (tool.name || "").trim();
      const m = /^([A-Z]+)\d+-\d+$/i.exec(name);
      if (!m) continue;
      const bucket = CWA_CODE_BUCKETS[m[1].toUpperCase()];
      if (!bucket) continue;
      if (seen.has(name)) continue;
      seen.add(name);
      out[bucket].push(name);
    }
  }
  return out;
}

const HW_FORM_GROUPS = [
  {
    id: "scales",
    title: "Scales",
    fields: [
      { key: "scales", type: "rating", label: "How did Scales go?", exportLabel: "How did Scales go" },
    ],
  },
  {
    id: "morse-runner",
    title: "Morse Runner",
    blurb: "Highest numbers from the last three days (desktop or web).",
    exportHeader: "Morse Runner (desktop or web) in last three days highest numbers",
    fields: [
      { key: "mrSpeed", type: "text", label: "Speed (WPM)", exportLabel: "Morse Runner Speed WPM", placeholder: 'i.e. "15"' },
      { key: "mrPoints", type: "text", label: "Highest verified points (1–60)", exportLabel: "Morse Runner Highest Verified Pts [1 to 60] not Score" },
    ],
  },
  {
    id: "lcwo-callsign",
    title: "LCWO Callsign Training",
    blurb: "Optional.",
    exportHeader: "LCWO Callsign Training Optional",
    fields: [
      { key: "callsignSpeed", type: "text", label: "Speed (WPM)", exportLabel: "Callsign Speed WPM" },
      { key: "callsignScore", type: "text", label: "Score", exportLabel: "Callsign Score" },
      { key: "callsignErrors", type: "text", label: "# of errors", exportLabel: "Callsign # of Errors" },
    ],
  },
  {
    id: "lcwo-code",
    title: "LCWO Code Practice",
    exportHeader: "LCWO Code Practice",
    fields: [
      { key: "lettersGroupLen", type: "text", label: "Letters — group length", exportLabel: "Letters Group Length", placeholder: 'i.e. "3"' },
      { key: "lettersSpeed", type: "text", label: "Letters — effective speed", exportLabel: "Letters Effective Speed", placeholder: 'i.e. "15"' },
      { key: "lettersErrors", type: "text", label: "Letters — % errors", exportLabel: "Letters Percent of Errors", placeholder: 'i.e. Errors: "30 = 29.4%"' },
      { key: "wordSpeed", type: "text", label: "Word — speed", exportLabel: "Word Training Speed (does not use CW settings)", placeholder: 'i.e. "13"' },
      { key: "wordMaxLen", type: "text", label: "Word — max length", exportLabel: "Word Training Maximum Length", placeholder: 'i.e. "3"' },
      { key: "wordErrors", type: "text", label: "Word — # errors", exportLabel: "Word Training Number of Errors", placeholder: "count the red 'received'  i.e. \"8\"" },
      { key: "wordScore", type: "text", label: "Word — score", exportLabel: "Word Training Score", placeholder: 'i.e. "850"' },
      { key: "figuresGroupLen", type: "text", label: "Figures — group length", exportLabel: "Figures Group Length", placeholder: 'i.e. "Numbers"' },
      { key: "figuresSpeed", type: "text", label: "Figures — effective speed", exportLabel: "Figures Effective Speed" },
      { key: "figuresErrors", type: "text", label: "Figures — % errors", exportLabel: "Figures Percent of Errors (correct answers)" },
      { key: "kochLen", type: "text", label: "Koch — length", exportLabel: "Custom Characters (Koch) Length" },
      { key: "kochSpeed", type: "text", label: "Koch — effective speed", exportLabel: "Custom Characters (Koch) Effective Speed" },
      { key: "kochErrors", type: "text", label: "Koch — % errors", exportLabel: "Custom Characters (Koch) Percent of Errors (correct answers)" },
    ],
  },
  {
    id: "cwa-sounds",
    title: "CWA New Sound Files",
    exportHeader: "CWA New Sound Files",
    fields: [
      { key: "shortWords", type: "derived", deriveKey: "shortWords", label: "Short Words — files and speed", exportLabel: "Short Words files and speed" },
      { key: "shortWordsRating", type: "rating", label: "How did Short Words go?", exportLabel: "How did Short Words go" },
      { key: "shortPhrases", type: "derived", deriveKey: "shortPhrases", label: "Short Phrases — files and speed", exportLabel: "Short Phrases Files and speed" },
      { key: "shortPhrasesRating", type: "rating", label: "How did Short Phrases go?", exportLabel: "How did Short Phrases go" },
      { key: "shortQso", type: "derived", deriveKey: "shortQso", label: "Short QSO — files and speed", exportLabel: "Short QSO files and speed" },
      { key: "shortQsoRating", type: "rating", label: "How did Short QSO's go?", exportLabel: "How did Short QSO's go" },
      { key: "shortPota", type: "derived", deriveKey: "shortPota", label: "Short POTA — files and speed", exportLabel: "Short POTA files and speed" },
      { key: "shortPotaRating", type: "rating", label: "How did Short POTA go?", exportLabel: "How did Short POTA go" },
      { key: "prefix", type: "derived", deriveKey: "prefix", label: "Prefix — files and speed", exportLabel: "Prefix files and speed" },
      { key: "prefixRating", type: "rating", label: "How did Prefixes go?", exportLabel: "How did Prefixes go" },
      { key: "suffix", type: "derived", deriveKey: "suffix", label: "Suffix — files and speed", exportLabel: "Suffix files and speed" },
      { key: "suffixRating", type: "rating", label: "How did Suffixes go?", exportLabel: "How did Suffixes go" },
    ],
  },
  {
    id: "new-words",
    title: "New Words",
    fields: [
      { key: "newWords", type: "textarea", label: "What new words did you learn?", exportLabel: "What new words did you learn" },
    ],
  },
  {
    id: "mst-sst-cwt",
    title: "MST / SST / CWT",
    blurb: "Actual MST on Mondays, K1USN SST Friday afternoon or Sunday evening, or Wednesday CWT's.",
    exportHeader: "Actual MST on Mondays,  K1USN SST Friday afternoon or Sunday evening,  or Wednesday CWT's",
    fields: [
      { key: "mstCallsigns", type: "textarea", label: "Callsigns you heard", exportLabel: "What Callsigns did you hear" },
      { key: "mstNames", type: "textarea", label: "Names and exchanges you heard", exportLabel: "What Names and Exchanges did you hear" },
      { key: "mstComments", type: "textarea", label: "Comments", exportLabel: "MST, SST or CWT Comments" },
    ],
  },
  {
    id: "on-air",
    title: "On-Air QSOs",
    blurb: "QSOs you made in the last three days.",
    exportHeader: "On Air QSO's you made - last three days",
    fields: [
      { key: "onAirCallsigns", type: "textarea", label: "Callsigns you worked", exportLabel: "What Callsigns did you work" },
      { key: "onAirNames", type: "textarea", label: "First names of people you worked", exportLabel: "First names of people you worked" },
    ],
  },
];

function getHw(classId, lessonId) {
  return loadState()[classId]?.[lessonId]?.hw || {};
}
function setHwField(classId, lessonId, key, value) {
  const s = loadState();
  s[classId] ??= {};
  s[classId][lessonId] ??= {};
  s[classId][lessonId].hw ??= {};
  if (value === "" || value == null || value === 0) {
    delete s[classId][lessonId].hw[key];
  } else {
    s[classId][lessonId].hw[key] = value;
  }
  saveState(s);
}

function renderRating(initial, onChange) {
  let current = Number(initial) || 0;
  const wrap = el("div", { class: "rating", role: "radiogroup" });
  const stars = [];
  for (let i = 1; i <= 4; i++) {
    const label = RATING_LABELS[i];
    const star = el("button", {
      type: "button",
      class: "star" + (i <= current ? " on" : ""),
      title: `${label} (${i})`,
      "aria-label": label,
      role: "radio",
      "aria-checked": String(i === current),
      onClick: () => {
        current = current === i ? 0 : i;
        stars.forEach((s, idx) => {
          s.classList.toggle("on", idx + 1 <= current);
          s.setAttribute("aria-checked", String(idx + 1 === current));
        });
        onChange(current);
      },
    }, "★");
    stars.push(star);
    wrap.appendChild(star);
  }
  return wrap;
}

function renderHwField(cls, lesson, field, derivedCodes) {
  const stored = getHw(cls.id, lesson.id)[field.key];
  const wrap = el("div", { class: `hw-field hw-field-${field.type}` });

  if (field.type === "rating") {
    wrap.appendChild(el("div", { class: "hw-label" }, field.label));
    wrap.appendChild(renderRating(Number(stored) || 0, (v) => {
      setHwField(cls.id, lesson.id, field.key, v);
    }));
    return wrap;
  }

  if (field.type === "derived") {
    wrap.appendChild(el("div", { class: "hw-label" }, field.label));
    const codes = derivedCodes[field.deriveKey] || [];
    const value = codes.join(";");
    if (value) {
      wrap.appendChild(el("div", { class: "hw-derived" }, value));
    } else {
      wrap.appendChild(el("div", { class: "hw-derived hw-derived-empty" }, "— none in this lesson —"));
    }
    return wrap;
  }

  const id = `hw-${cls.id}-${lesson.id}-${field.key}`;
  wrap.appendChild(el("label", { class: "hw-label", htmlFor: id }, field.label));

  const tag = field.type === "textarea" ? "textarea" : "input";
  const attrs = {
    id,
    class: "hw-input",
    placeholder: field.placeholder || "",
    value: stored || "",
    onInput: (e) => setHwField(cls.id, lesson.id, field.key, e.target.value),
  };
  if (tag === "input") attrs.type = "text";
  else attrs.rows = 3;
  wrap.appendChild(el(tag, attrs));
  return wrap;
}

function renderHwForm(cls, lesson) {
  const section = el("section", { class: "section hw-form" });
  section.appendChild(el("h3", {}, "Homework form"));
  section.appendChild(el("p", { class: "hw-blurb" },
    "Fill these in as you practice. Saved in this browser only — not synced anywhere. Click ",
    el("strong", {}, "HW output"),
    " below to get text you can paste into the Google Form."));

  const derivedCodes = gatherLessonExerciseCodes(lesson);
  for (const group of HW_FORM_GROUPS) {
    const block = el("div", { class: "hw-group", dataset: { groupId: group.id } });
    block.appendChild(el("h4", {}, group.title));
    if (group.blurb) block.appendChild(el("p", { class: "hw-group-blurb" }, group.blurb));
    const fields = el("div", { class: "hw-fields" });
    for (const f of group.fields) fields.appendChild(renderHwField(cls, lesson, f, derivedCodes));
    block.appendChild(fields);
    section.appendChild(block);
  }
  return section;
}

function buildHwItems(cls, lesson) {
  const values = getHw(cls.id, lesson.id);
  const derivedCodes = gatherLessonExerciseCodes(lesson);
  const items = [];
  for (const group of HW_FORM_GROUPS) {
    if (group.exportHeader) items.push({ type: "header", text: group.exportHeader });
    for (const f of group.fields) {
      let a = "";
      if (f.type === "rating") {
        const v = Number(values[f.key]) || 0;
        a = v ? RATING_LABELS[v] : "";
      } else if (f.type === "derived") {
        a = (derivedCodes[f.deriveKey] || []).join(";");
      } else {
        a = String(values[f.key] || "");
      }
      items.push({ type: "qa", q: f.exportLabel, a });
    }
  }
  return items;
}

function hwItemsToText(items) {
  const lines = [];
  for (const it of items) {
    if (it.type === "header") {
      if (lines.length) lines.push("");
      lines.push(it.text);
      lines.push("");
    } else {
      lines.push(it.q);
      lines.push(it.a);
      lines.push("");
    }
  }
  return lines.join("\n").replace(/\n+$/, "\n");
}

function hwItemsToHtml(items) {
  const parts = [];
  for (const it of items) {
    if (it.type === "header") {
      parts.push(`<h2 class="hdr">${escapeHtml(it.text)}</h2>`);
    } else {
      const a = it.a
        ? `<div class="a">${escapeHtml(it.a)}</div>`
        : `<div class="a empty">— blank —</div>`;
      parts.push(`<div class="qa"><div class="q">${escapeHtml(it.q)}</div>${a}</div>`);
    }
  }
  return parts.join("\n");
}

function openHwExport(cls, lesson) {
  const items = buildHwItems(cls, lesson);
  const text = hwItemsToText(items);
  const bodyHtml = hwItemsToHtml(items);
  const title = `Lesson ${lesson.id} HW — ${cls.shortName}`;
  const css = `
    body { font: 14px/1.45 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; max-width: 80ch; margin: 0 auto; padding: 0 1rem 2rem; color: #1a1d22; background: #f7f5f0; }
    .bar { position: sticky; top: 0; background: #f7f5f0; padding: 1rem 0 0.75rem; border-bottom: 1px solid #d8d4c4; z-index: 1; }
    h1 { font: 600 1.15rem/1.3 system-ui, sans-serif; margin: 0 0 0.3rem; color: #1a1d22; }
    .meta { color: #6b7079; font-size: 0.85rem; margin: 0 0 0.6rem; }
    button { padding: 0.5rem 0.9rem; font: 600 0.9rem system-ui, sans-serif; cursor: pointer; border: 1px solid #b8741a; background: #b8741a; color: #fff; border-radius: 6px; }
    button.copied { background: #6fbf73; border-color: #6fbf73; }
    .output { margin-top: 1rem; }
    .hdr { font: 600 1rem system-ui, sans-serif; color: #b8741a; margin: 1.6rem 0 0.4rem; padding-bottom: 0.3rem; border-bottom: 1px solid #d8d4c4; }
    .hdr:first-child { margin-top: 0.5rem; }
    .qa { padding: 0.45rem 0; }
    .q { font-size: 0.85rem; color: #6b7079; margin-bottom: 0.25rem; }
    .a { font-size: 1.15rem; font-weight: 600; color: #1a1d22; text-decoration: underline; text-decoration-thickness: 2px; text-underline-offset: 3px; word-break: break-word; }
    .a.empty { font-weight: 400; text-decoration: none; color: #b6b0a4; font-style: italic; font-size: 0.95rem; }
    @media (prefers-color-scheme: dark) {
      body { background: #14161b; color: #e8e6e1; }
      .bar { background: #14161b; border-bottom-color: #2a2e36; }
      h1 { color: #e8e6e1; }
      .meta, .q { color: #9aa0a8; }
      .hdr { color: #d99a3a; border-bottom-color: #2a2e36; }
      .a { color: #e8e6e1; }
      .a.empty { color: #6b7079; }
      button { background: #d99a3a; border-color: #d99a3a; color: #1a1207; }
    }
  `;
  const srcLiteral = JSON.stringify(text).replace(/<\/script/gi, "<\\/script");
  const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title>
<style>${css}</style></head>
<body>
<div class="bar">
  <h1>${escapeHtml(title)}</h1>
  <p class="meta">Underlined answers paste into the Google Form. Blank rows are unanswered.</p>
  <button id="cp" type="button">Copy all</button>
</div>
<div class="output">${bodyHtml}</div>
<script>
  const SRC = ${srcLiteral};
  const btn = document.getElementById('cp');
  btn.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(SRC); }
    catch {
      const ta = document.createElement('textarea');
      ta.value = SRC;
      ta.style.position = 'fixed'; ta.style.left = '-9999px';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch {}
      document.body.removeChild(ta);
    }
    btn.textContent = 'Copied ✓'; btn.classList.add('copied');
    setTimeout(() => { btn.textContent = 'Copy all'; btn.classList.remove('copied'); }, 1500);
  });
<\/script>
</body></html>`;
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const w = window.open(url, "_blank");
  if (!w) {
    URL.revokeObjectURL(url);
    alert("Popup blocked — allow popups for this site to open the HW output.");
  }
}

function rewriteGuideTools(tools, baseCtx) {
  if (!tools) return tools;
  return tools.map((t) => {
    if (t.url === LCWO_ICR_EXTERNAL) {
      return { ...t, url: guideUrl("lcwo-icr", baseCtx) };
    }
    if (t.url === MCW_ICR_EXTERNAL) {
      return { ...t, url: MCW_TRAINER_URL };
    }
    return t;
  });
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

function parseHash() {
  const raw = location.hash.replace(/^#/, "") || "/";
  const [pathPart, queryPart = ""] = raw.split("?");
  const params = new URLSearchParams(queryPart);
  const parts = pathPart.split("/").filter(Boolean);
  if (parts.length === 0) return { route: "home" };
  if (parts[0] === "extras") return { route: "extras" };
  if (parts[0] === "g" && parts[1]) return { route: "guide", slug: parts[1], params };
  if (parts[0] === "c" && parts[1]) {
    const classId = parts[1];
    if (parts[2] === "intro") return { route: "intro", classId };
    if (parts[2] === "assessment") return { route: "assessment", classId };
    if (parts[2] === "lesson" && parts[3]) {
      return { route: "lesson", classId, lessonId: Number(parts[3]) };
    }
    return { route: "class", classId };
  }
  return { route: "notfound" };
}

async function render() {
  const r = parseHash();
  clear(app);
  app.appendChild(el("p", { class: "loading" }, "Loading…"));
  try {
    if (r.route === "home") return renderHome();
    if (r.route === "extras") return renderExtrasPage();
    if (r.route === "guide") return renderGuide(r.slug, r.params);
    const cls = await loadClass(r.classId);
    if (!cls) return renderNotFound();
    if (r.route === "class") return renderClass(cls);
    if (r.route === "intro") return renderIntro(cls);
    if (r.route === "assessment") return renderAssessment(cls);
    if (r.route === "lesson") return renderLesson(cls, r.lessonId);
    return renderNotFound();
  } catch (err) {
    console.error(err);
    clear(app);
    app.appendChild(el("p", { class: "empty" }, "Something went wrong loading this page. Try refreshing."));
  }
  window.scrollTo(0, 0);
}

window.addEventListener("hashchange", render);
window.addEventListener("DOMContentLoaded", render);

// Intercept clicks on internal links so we can scroll to top on navigation.
document.addEventListener("click", (e) => {
  const a = e.target.closest("a[href^='#/']");
  if (!a) return;
  // Let the hashchange listener handle it; just scroll on next tick.
  setTimeout(() => window.scrollTo(0, 0), 0);
});

// ---------------------------------------------------------------------------
// Views
// ---------------------------------------------------------------------------

function crumbs(items) {
  const c = el("nav", { class: "crumbs" });
  items.forEach((item, i) => {
    if (i > 0) c.appendChild(el("span", { class: "sep" }, "›"));
    if (item.href) c.appendChild(el("a", { href: item.href }, item.label));
    else c.appendChild(el("span", {}, item.label));
  });
  return c;
}

function renderHome() {
  clear(app);
  app.appendChild(el("h1", {}, "Practice classes"));
  app.appendChild(el("p", { class: "subtitle" }, "Pick a class to begin. Progress is saved per class in your browser."));

  const last = getLast();
  if (last) {
    const cls = classes.find((c) => c.id === last.classId);
    if (cls) {
      app.appendChild(
        el("div", { class: "callout section" },
          el("strong", {}, "Resume: "),
          el("a", { href: `#/c/${cls.id}/lesson/${last.lessonId}` },
            `${cls.shortName} · Lesson ${last.lessonId}`
          )
        )
      );
    }
  }

  const grid = el("div", { class: "grid" });
  for (const c of classes) {
    const card = el("a", { class: "card", href: `#/c/${c.id}` });
    card.appendChild(el("h2", {}, c.shortName));
    card.appendChild(el("div", { class: "meta" }, c.subtitle));
    card.appendChild(el("p", {}, c.blurb));
    if (c.status === "stub") {
      card.appendChild(el("div", { class: "section", style: "margin: 0.6rem 0 0" },
        el("span", { class: "tag muted" }, "In progress")
      ));
    }
    grid.appendChild(card);
  }

  const copyCount = (extras.copy || []).length;
  const sendCount = (extras.sending || []).length;
  if (copyCount + sendCount > 0) {
    const card = el("a", { class: "card", href: "#/extras" });
    card.appendChild(el("h2", {}, "Extra practice"));
    card.appendChild(el("div", { class: "meta" }, `${copyCount} copy · ${sendCount} sending`));
    card.appendChild(el("p", {}, "Standalone copy audio and sending exercises that aren't tied to a class lesson."));
    grid.appendChild(card);
  }

  app.appendChild(grid);
}

function renderExtrasPage() {
  clear(app);
  app.appendChild(crumbs([{ label: "Classes", href: "#/" }, { label: "Extra practice" }]));
  app.appendChild(el("h1", {}, "Extra practice"));
  app.appendChild(el("p", { class: "subtitle" }, "Copy audio and sending exercises outside of any specific class."));

  const groups = [
    { key: "copy", title: "Copy", items: extras.copy || [] },
    { key: "sending", title: "Sending", items: extras.sending || [] },
  ];

  for (const g of groups) {
    if (!g.items.length) continue;
    const sec = el("section", { class: "section" });
    sec.appendChild(el("h3", {}, g.title));
    const list = el("ul", { class: "extras-list" });
    for (const item of g.items) {
      const li = el("li", { class: "extras-item" });
      li.appendChild(el("div", { class: "extras-name" }, item.name));
      if (item.blurb) li.appendChild(el("div", { class: "extras-blurb" }, item.blurb));
      if (item.speeds?.length) {
        const chips = el("ul", { class: "tool-strip" });
        for (const s of item.speeds) {
          chips.appendChild(el("li", {},
            el("a", {
              class: "tool-chip audio",
              href: encodeURI(s.url),
              target: "_blank",
              rel: "noopener",
              title: `${item.name} · ${s.wpm} wpm`,
            }, `${s.wpm} ▶`)
          ));
        }
        li.appendChild(chips);
      } else if (item.url) {
        const isAudio = /\.mp3$/i.test(item.url);
        li.appendChild(el("a", {
          class: `tool-chip${isAudio ? " audio" : ""}`,
          href: encodeURI(item.url),
          target: "_blank",
          rel: "noopener",
          title: item.url,
        }, isAudio ? "Listen ▶" : "Open PDF ↗"));
      }
      list.appendChild(li);
    }
    sec.appendChild(list);
    app.appendChild(sec);
  }
}

function renderClass(cls) {
  clear(app);
  app.appendChild(crumbs([{ label: "Classes", href: "#/" }, { label: cls.shortName }]));
  app.appendChild(el("h1", {}, cls.longName || cls.shortName));
  if (cls.subtitle) app.appendChild(el("p", { class: "subtitle" }, cls.subtitle));
  if (cls.description) app.appendChild(el("p", {}, cls.description));

  const buttons = el("div", { class: "button-row section" });
  buttons.appendChild(el("a", { class: "btn ghost", href: `#/c/${cls.id}/intro` }, "Mindset / Intro"));
  if (cls.assessment) {
    buttons.appendChild(el("a", { class: "btn ghost", href: `#/c/${cls.id}/assessment` }, "Self-assessment"));
  }
  if (cls.source?.pdfUrl) {
    buttons.appendChild(el("a", { class: "btn ghost", href: cls.source.pdfUrl, target: "_blank", rel: "noopener" }, "Source PDF ↗"));
  }
  if (cls.source?.referenceUrl) {
    buttons.appendChild(el("a", { class: "btn ghost", href: cls.source.referenceUrl, target: "_blank", rel: "noopener" }, "Reference materials ↗"));
  }
  app.appendChild(buttons);

  app.appendChild(el("h2", { class: "section" }, "Lessons"));
  const grid = el("div", { class: "grid" });
  for (const lesson of cls.lessons) {
    const homeworkTotal = lesson.homework?.length || 0;
    const prog = lessonProgress(cls.id, lesson.id, homeworkTotal);
    const complete = isLessonComplete(cls.id, lesson.id);
    const allChecked = isLessonAllChecked(cls.id, lesson);

    const cardClasses = ["card", "lesson-card"];
    if (complete) cardClasses.push("complete");
    else if (allChecked) cardClasses.push("ready");
    const card = el("a", { class: cardClasses.join(" "), href: `#/c/${cls.id}/lesson/${lesson.id}` });

    const head = el("div", { class: "lesson-card-head" });
    head.appendChild(el("h2", {}, `${lesson.id}. ${lesson.title}`));

    const stop = (e) => { e.stopPropagation(); };
    const cb = el("input", {
      type: "checkbox",
      checked: complete,
      "aria-label": `Mark lesson ${lesson.id} complete`,
      onClick: stop,
      onChange: (e) => {
        e.stopPropagation();
        setLessonComplete(cls.id, lesson.id, e.target.checked);
        card.classList.toggle("complete", e.target.checked);
        if (e.target.checked) card.classList.remove("ready");
        else if (isLessonAllChecked(cls.id, lesson)) card.classList.add("ready");
      },
    });
    const label = el("label", {
      class: "lesson-complete",
      title: complete ? "Mark lesson incomplete" : (allChecked ? "All items checked — mark lesson complete" : "Mark lesson complete"),
      onClick: stop,
    }, cb, el("span", {}, "Done"));
    head.appendChild(label);
    card.appendChild(head);

    const metaParts = [];
    if (lesson.days?.length) {
      metaParts.push(`${lesson.days.length} days`);
      const audioCount = lesson.days.flatMap((d) => d.tools || []).filter((t) => /\.mp3$/i.test(t.url)).length;
      if (audioCount) metaParts.push(`${audioCount} audio files`);
    } else if (lesson.exercises?.length) {
      metaParts.push(`${lesson.exercises.length} exercises`);
    }
    if (homeworkTotal) metaParts.push(`${prog.done}/${homeworkTotal} homework`);
    card.appendChild(el("div", { class: "meta" }, metaParts.join(" · ")));

    if (lesson.summary) card.appendChild(el("p", {}, lesson.summary));
    if (homeworkTotal) {
      const bar = el("div", { class: "progress" },
        el("div", { class: "bar" }, el("span", { style: `width:${(prog.frac * 100).toFixed(0)}%` })),
      );
      card.appendChild(bar);
    }
    grid.appendChild(card);
  }
  app.appendChild(grid);
}

function renderIntro(cls) {
  clear(app);
  app.appendChild(crumbs([
    { label: "Classes", href: "#/" },
    { label: cls.shortName, href: `#/c/${cls.id}` },
    { label: "Intro" },
  ]));
  app.appendChild(el("h1", {}, cls.intro?.title || "Introduction"));

  for (const sec of cls.intro?.sections || []) {
    const block = el("div", { class: "section" });
    block.appendChild(el("h2", {}, sec.heading));
    if (sec.body) block.appendChild(el("p", {}, sec.body));
    if (sec.html) {
      const wrap = el("div", { class: "rich" });
      wrap.innerHTML = sec.html;
      block.appendChild(wrap);
    }
    if (sec.list) {
      const ul = el("ul");
      for (const [name, body] of sec.list) {
        ul.appendChild(el("li", {}, el("strong", {}, name + ": "), body));
      }
      block.appendChild(ul);
    }
    app.appendChild(block);
  }
}

function renderAssessment(cls) {
  clear(app);
  app.appendChild(crumbs([
    { label: "Classes", href: "#/" },
    { label: cls.shortName, href: `#/c/${cls.id}` },
    { label: "Self-assessment" },
  ]));
  const a = cls.assessment;
  if (!a) {
    app.appendChild(el("p", { class: "empty" }, "No self-assessment for this class."));
    return;
  }
  app.appendChild(el("h1", {}, a.title));
  for (const q of a.questions) {
    const block = el("div", { class: "assess-question" });
    block.appendChild(el("h3", {}, q.q));
    const row = el("div", { class: "assess-row" });
    row.appendChild(el("div", { class: "assess-cell thinking" },
      el("div", { class: "ttl" }, "Thinking"),
      el("div", {}, q.thinking)
    ));
    row.appendChild(el("div", { class: "assess-cell flowing" },
      el("div", { class: "ttl" }, "Flowing"),
      el("div", {}, q.flowing)
    ));
    block.appendChild(row);
    app.appendChild(block);
  }
  if (a.summary) app.appendChild(el("div", { class: "callout section" }, a.summary));
}

const TOOL_LABEL = { mpp: "MPP", wlt: "WLT" };

function renderLesson(cls, lessonId) {
  clear(app);
  const lesson = cls.lessons.find((l) => l.id === lessonId);
  if (!lesson) return renderNotFound();
  rememberLast(cls.id, lessonId);

  app.appendChild(crumbs([
    { label: "Classes", href: "#/" },
    { label: cls.shortName, href: `#/c/${cls.id}` },
    { label: `Lesson ${lesson.id}` },
  ]));

  const head = el("div", { class: "lesson-head" },
    el("h1", {}, `Lesson ${lesson.id}: ${lesson.title}`)
  );
  app.appendChild(head);
  if (lesson.summary) app.appendChild(el("p", { class: "subtitle" }, lesson.summary));

  if (lesson.goals?.length) {
    const sec = el("section", { class: "section" });
    sec.appendChild(el("h3", {}, "Goals"));
    const ul = el("ul");
    lesson.goals.forEach((g) => ul.appendChild(el("li", {}, g)));
    sec.appendChild(ul);
    app.appendChild(sec);
  }

  if (lesson.guidance) {
    app.appendChild(el("div", { class: "callout section" }, lesson.guidance));
  }

  if (lesson.homework?.length) {
    const sec = el("section", { class: "section" });
    sec.appendChild(el("h3", {}, "Homework"));
    const list = el("ul", { class: "checklist" });
    lesson.homework.forEach((item, idx) => {
      const cb = el("input", {
        type: "checkbox",
        checked: isChecked(cls.id, lesson.id, idx),
        onChange: (e) => {
          setChecked(cls.id, lesson.id, idx, e.target.checked);
        },
      });
      const li = el("li", {},
        el("label", {}, cb, el("span", { class: "text" }, item))
      );
      list.appendChild(li);
    });
    sec.appendChild(list);
    app.appendChild(sec);
  }

  const allDates = computeLessonDates(cls.firstClassDate, cls.lessons);
  const lessonIdx = cls.lessons.indexOf(lesson);
  const dayDates = allDates && lessonIdx >= 0 ? allDates[lessonIdx] : null;

  if (lesson.days?.length) {
    const sec = el("section", { class: "section" });
    sec.appendChild(el("h3", {}, "Daily practice"));
    lesson.days.forEach((day, dayIdx) => {
      const dayKey = `day-${dayIdx}`;
      const ctx = { classId: cls.id, lessonId: lesson.id, dayIdx };
      const bodyHtml = rewriteGuideLinks(day.bodyHtml || "", ctx);
      const tools = rewriteGuideTools(day.tools, ctx);
      const dateStr = dayDates ? formatDayDate(dayDates[dayIdx]) : "";
      const block = el("div", { class: "day-block" });
      const head = el("div", { class: "day-head" });
      const heading = el("h2", {}, day.label);
      if (dateStr) heading.appendChild(el("span", { class: "day-date" }, dateStr));
      head.appendChild(heading);
      const dayChecked = isDayDone(cls.id, lesson.id, dayKey);
      const dayCheck = el("label", { class: "day-done" },
        el("input", {
          type: "checkbox",
          checked: dayChecked,
          onChange: (e) => {
            setDayDone(cls.id, lesson.id, dayKey, e.target.checked);
            block.classList.toggle("done", e.target.checked);
          },
        }),
        el("span", {}, "Done")
      );
      head.appendChild(dayCheck);
      block.appendChild(head);
      if (dayChecked) block.classList.add("done");

      const items = parseDayItems(bodyHtml);
      if (items.length) {
        const list = el("ul", { class: "checklist day-items" });
        items.forEach((item) => {
          if (item.type === "header") {
            const span = el("span", { class: "text" });
            for (const n of item.nodes) span.appendChild(n);
            list.appendChild(el("li", { class: "day-item-header" }, span));
            return;
          }
          const cb = el("input", {
            type: "checkbox",
            checked: isDayItemChecked(cls.id, lesson.id, dayKey, item.idx),
            onChange: (e) => {
              setDayItemChecked(cls.id, lesson.id, dayKey, item.idx, e.target.checked);
            },
          });
          const text = el("span", { class: "text" });
          for (const n of item.nodes) text.appendChild(n);
          list.appendChild(el("li", {}, el("label", {}, cb, text)));
        });
        block.appendChild(list);
      } else {
        const body = el("div", { class: "rich" });
        body.innerHTML = bodyHtml;
        block.appendChild(body);
      }

      if (tools?.length) {
        const toolList = el("ul", { class: "tool-strip" });
        tools.forEach((t) => {
          const isAudio = /\.mp3$/i.test(t.url);
          const isInternal = t.url.startsWith("#/");
          toolList.appendChild(el("li", {},
            el("a", {
              class: `tool-chip${isAudio ? " audio" : ""}`,
              href: t.url,
              target: isInternal ? null : "_blank",
              rel: isInternal ? null : "noopener",
              title: t.url,
            }, t.name, isAudio ? " ▶" : isInternal ? "" : " ↗")
          ));
        });
        const wrap = el("details", { class: "tool-wrap" },
          el("summary", {}, `Quick links · ${tools.length}`),
          toolList,
        );
        block.appendChild(wrap);
      }

      sec.appendChild(block);
    });
    app.appendChild(sec);
  }

  if (lesson.exercises?.length) {
    const sec = el("section", { class: "section" });
    sec.appendChild(el("h3", {}, "Exercises"));

    // Build category set
    const cats = [...new Set(lesson.exercises.map((e) => e.category))];

    // Filter chips
    const filterState = { active: "all" };
    const filterbar = el("div", { class: "filterbar" });
    const allChip = el("button", { class: "chip", type: "button", "aria-pressed": "true" }, "All");
    filterbar.appendChild(allChip);
    const chipMap = { all: allChip };
    cats.forEach((cat) => {
      const c = el("button", { class: "chip", type: "button", "aria-pressed": "false" }, cat);
      filterbar.appendChild(c);
      chipMap[cat] = c;
    });
    Object.entries(chipMap).forEach(([key, chip]) => {
      chip.addEventListener("click", () => {
        filterState.active = key;
        Object.entries(chipMap).forEach(([k, c]) => {
          c.setAttribute("aria-pressed", k === key ? "true" : "false");
        });
        applyFilter();
      });
    });
    sec.appendChild(filterbar);

    function applyFilter() {
      sec.querySelectorAll("[data-cat]").forEach((g) => {
        const show = filterState.active === "all" || g.dataset.cat === filterState.active;
        g.style.display = show ? "" : "none";
      });
    }

    // Group by category, preserve original order
    const groups = new Map();
    for (const ex of lesson.exercises) {
      if (!groups.has(ex.category)) groups.set(ex.category, []);
      groups.get(ex.category).push(ex);
    }
    for (const [cat, list] of groups) {
      const group = el("div", { class: "exercise-group", dataset: { cat } });
      group.appendChild(el("div", { class: "group-head" },
        el("h3", {}, cat),
        el("span", { class: "tag muted" }, `${list.length}`)
      ));
      const ul = el("ul", { class: "ex-list" });
      for (const ex of list) {
        const row = el("li", { class: "ex-row" });
        row.appendChild(el("span", { class: "name" }, ex.name));
        row.appendChild(toolLink("mpp", ex.mpp));
        row.appendChild(toolLink("wlt", ex.wlt));
        ul.appendChild(row);
      }
      group.appendChild(ul);
      sec.appendChild(group);
    }
    app.appendChild(sec);
  }

  app.appendChild(renderHwForm(cls, lesson));

  const submit = el("div", { class: "submit-hw section" });
  const submitRow = el("div", { class: "submit-hw-buttons" });
  submitRow.appendChild(el("button", {
    type: "button",
    class: "btn ghost",
    onClick: () => openHwExport(cls, lesson),
  }, "HW output ↗"));
  submitRow.appendChild(el("a", {
    class: "btn",
    href: SUBMIT_HW_URL,
    target: "_blank",
    rel: "noopener",
  }, "Submit HW ↗"));
  submit.appendChild(submitRow);
  submit.appendChild(el("p", { class: "submit-hw-note" },
    "Submit HW NLT 3 hours prior to class time."));
  app.appendChild(submit);

  // Lesson nav
  const nav = el("div", { class: "lesson-nav" });
  const prev = cls.lessons.find((l) => l.id === lesson.id - 1);
  const next = cls.lessons.find((l) => l.id === lesson.id + 1);
  if (prev) {
    nav.appendChild(el("a", { class: "btn ghost", href: `#/c/${cls.id}/lesson/${prev.id}` }, `← Lesson ${prev.id}`));
  }
  if (next) {
    nav.appendChild(el("a", { class: "btn", href: `#/c/${cls.id}/lesson/${next.id}` }, `Lesson ${next.id} →`));
  }
  if (nav.children.length) app.appendChild(nav);
}

function toolLink(kind, url) {
  const label = TOOL_LABEL[kind] || kind.toUpperCase();
  if (!url) {
    return el("span", { class: "ex-link", "data-empty": "1", title: `No ${label} link` },
      el("span", { class: "label" }, label),
      "—"
    );
  }
  return el("a", { class: "ex-link", href: url, target: "_blank", rel: "noopener", title: `${label}: ${url}` },
    el("span", { class: "label" }, label),
    "↗"
  );
}

async function renderGuide(slug, params) {
  clear(app);
  const guide = guides[slug];
  if (!guide) return renderNotFound();

  const speed = params.get("speed") ? Number(params.get("speed")) : null;
  const classId = params.get("class");
  const lessonId = params.get("lesson") ? Number(params.get("lesson")) : null;
  const dayNum = params.get("day") ? Number(params.get("day")) : null;

  const trail = [{ label: "Classes", href: "#/" }];
  if (classId) {
    try {
      const cls = await loadClass(classId);
      if (cls) {
        trail.push({ label: cls.shortName, href: `#/c/${cls.id}` });
        if (lessonId != null) {
          trail.push({ label: `Lesson ${lessonId}`, href: `#/c/${cls.id}/lesson/${lessonId}` });
        }
      }
    } catch { /* class not found — fall through with bare crumb */ }
  }
  trail.push({ label: guide.title.split(" — ")[0] });
  app.appendChild(crumbs(trail));

  app.appendChild(el("h1", {}, guide.title));
  if (guide.subtitle) app.appendChild(el("p", { class: "subtitle" }, guide.subtitle));

  const buttons = el("div", { class: "button-row section" });
  if (guide.app?.url) {
    buttons.appendChild(el("a", { class: "btn", href: guide.app.url, target: "_blank", rel: "noopener" },
      `Open ${guide.app.name} ↗`));
  }
  if (classId && lessonId != null) {
    buttons.appendChild(el("a", { class: "btn ghost", href: `#/c/${classId}/lesson/${lessonId}` },
      `← Back to Lesson ${lessonId}`));
  }
  if (guide.sourceUrl) {
    buttons.appendChild(el("a", { class: "btn ghost", href: guide.sourceUrl, target: "_blank", rel: "noopener" },
      "Original source ↗"));
  }
  app.appendChild(buttons);

  if (speed && typeof guide.speedHint === "function") {
    const dayLabel = dayNum ? ` Day ${dayNum} ·` : "";
    const callout = el("div", { class: "callout section guide-speed" });
    callout.appendChild(el("strong", {}, `Lesson context:${dayLabel} `));
    callout.appendChild(document.createTextNode(guide.speedHint(speed)));
    app.appendChild(callout);
  }

  if (guide.intro) {
    app.appendChild(el("p", { class: "guide-intro" }, guide.intro));
  }

  for (const sec of guide.sections) {
    const section = el("section", { class: "section guide-section" });
    section.appendChild(el("h2", {}, sec.title));
    if (sec.where) section.appendChild(el("p", { class: "guide-where" }, sec.where));
    if (sec.blurb) section.appendChild(el("p", {}, sec.blurb));

    if (sec.procedure?.steps?.length) {
      const block = el("div", { class: "guide-procedure" });
      block.appendChild(el("h3", {}, sec.procedure.title || "Procedure"));
      const ol = el("ol");
      for (const step of sec.procedure.steps) ol.appendChild(el("li", {}, step));
      block.appendChild(ol);
      section.appendChild(block);
    }

    for (const mode of sec.modes || []) {
      const card = el("div", { class: "guide-mode" });
      card.appendChild(el("h3", {}, mode.title));
      const meta = [];
      if (mode.startWpm != null) meta.push(`Start: ${mode.startWpm} WPM`);
      if (mode.startChars != null) meta.push(`${mode.startChars} chars`);
      if (mode.ladder?.length) meta.push(`Speed ladder: ${mode.ladder.join(" → ")} WPM`);
      if (mode.charLadder?.length) meta.push(`Char ladder: ${mode.charLadder.join(" → ")}`);
      if (meta.length) {
        card.appendChild(el("div", { class: "guide-mode-meta" }, meta.join("  ·  ")));
      }
      if (mode.steps?.length) {
        const ol = el("ol", { class: "guide-steps" });
        for (const step of mode.steps) ol.appendChild(el("li", {}, step));
        card.appendChild(ol);
      }
      section.appendChild(card);
    }

    app.appendChild(section);
  }

  if (guide.sourceLabel) {
    const note = el("p", { class: "guide-attrib" }, `Source: ${guide.sourceLabel}`);
    app.appendChild(note);
  }
}

function renderNotFound() {
  clear(app);
  app.appendChild(el("h1", {}, "Not found"));
  app.appendChild(el("p", {}, "That page doesn't exist. ", el("a", { href: "#/" }, "Back to classes.")));
}
