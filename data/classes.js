// Registry of available classes. Add a new entry here to surface a new class
// in the selector. Each module is loaded lazily on demand.

// `firstClassDate` (YYYY-MM-DD) is the date Lesson 1 Day 3 lands on — the first
// class meeting. It anchors the schedule; every other day-slot (L1D1, L1D2,
// L1D3, L2D1, …) is the next calendar day, skipping Sundays. Six day-slots fill
// one Mon–Sat week, so any starting weekday works (Mon/Thu, Tue/Fri, …) — see
// computeLessonDates in app.js. It can also be set per-browser from the class
// page's date gear (see app.js getFirstClassDate).
export const classes = [
  {
    id: "cwops-fundamental",
    shortName: "CWA Fundamental",
    subtitle: "16 sessions · Farnsworth 6→11 WPM",
    blurb: "CW Academy's entry-level course. Eight weeks of Instant Character Recognition and well-formed sending with the Daily Scales and LCWO, from 6 to ~11 WPM.",
    status: "ready",
    loader: () => import("./cwops-fundamental.js?v=6"),
  },
  {
    id: "cwops-intermediate",
    shortName: "CWA Intermediate",
    subtitle: "16 sessions · 10→25 WPM",
    blurb: "CW Academy's Intermediate curriculum. Speed-building over eight weeks with daily practice files, callsign drills, and CWT events.",
    status: "ready",
    firstClassDate: "2026-05-04",
    homeworkForm: true, // only Intermediate has a HW Google Form for now
    loader: () => import("./cwops-intermediate.js?v=6"),
  },
  {
    id: "cwops-advanced-proto",
    shortName: "CWA Advanced",
    subtitle: "16 sessions · 20→35 WPM",
    blurb: "CW Academy's Advanced curriculum (prototype). Head-copy speed building from 20 to 35 WPM with a daily long-form short-story assignment.",
    status: "ready",
    loader: () => import("./cwops-advanced-proto.js?v=6"),
  },
];

const cache = new Map();

export async function loadClass(id) {
  if (cache.has(id)) return cache.get(id);
  const entry = classes.find((c) => c.id === id);
  if (!entry) throw new Error(`Unknown class: ${id}`);
  const mod = await entry.loader();
  const merged = { ...mod.default };
  if (entry.firstClassDate && !merged.firstClassDate) merged.firstClassDate = entry.firstClassDate;
  if (merged.homeworkForm == null) merged.homeworkForm = !!entry.homeworkForm;
  cache.set(id, merged);
  return merged;
}
