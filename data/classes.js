// Registry of available classes. Add a new entry here to surface a new class
// in the selector. Each module is loaded lazily on demand.

// `firstClassDate` (YYYY-MM-DD) is the date Lesson 1 Day 3 lands on — the
// first class meeting. Must be a Tuesday or Thursday. Each subsequent lesson's
// Day 3 is the next class day (Tue→Thu = +2, Thu→Tue = +5). Day 2 is the day
// before Day 3; Day 1 is the day before that, skipping Sunday if it lands on
// one. Lessons may share a day (e.g. L1 D3 = L2 D1 on the same Tue) — that's
// expected: class meets, then the next lesson's prep begins.
export const classes = [
  {
    id: "cwops-intermediate",
    shortName: "CWA Intermediate",
    subtitle: "16 sessions · 10→25 WPM",
    blurb: "CW Academy's Intermediate curriculum. Speed-building over eight weeks with daily practice files, callsign drills, and CWT events.",
    status: "ready",
    firstClassDate: "2026-05-05",
    loader: () => import("./cwops-intermediate.js"),
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
  cache.set(id, merged);
  return merged;
}
