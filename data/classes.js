// Registry of available classes. Add a new entry here to surface a new class
// in the selector. Each module is loaded lazily on demand.
//
// An entry is either a single course (has its own `loader`) or a version
// family (has a `versions` array of selectable courses). A family renders one
// card on the home page that routes to a version picker (#/v/<familyId>);
// each version is itself loadable by its own id via #/c/<versionId>.

// `firstClassDate` (YYYY-MM-DD) is the date Lesson 1 Day 3 lands on — the
// first class meeting. Must be a Monday or Thursday. Each subsequent lesson's
// Day 3 is the next class day (Mon→Thu = +3, Thu→Mon = +4). Day 2 is the day
// before Day 3; Day 1 is the day before that, skipping Sunday if it lands on
// one. Lessons may share a day (e.g. L1 D3 = L2 D1 on the same Mon) — that's
// expected: class meets, then the next lesson's prep begins. It can also be
// set per-browser from the class page's date gear (see app.js getFirstClassDate).
export const classes = [
  {
    id: "cwops-intermediate",
    shortName: "CWA Intermediate",
    subtitle: "16 sessions · 10→25 WPM",
    blurb: "CW Academy's Intermediate curriculum. Speed-building over eight weeks with daily practice files, callsign drills, and CWT events.",
    status: "ready",
    firstClassDate: "2026-05-04",
    loader: () => import("./cwops-intermediate.js"),
  },
  {
    id: "cwops-advanced",
    shortName: "CWA Advanced",
    subtitle: "16 sessions · 20→35 WPM",
    blurb: "CW Academy's Advanced curriculum. Head-copy speed building from 20 to 35 WPM. Choose a curriculum version to begin.",
    status: "ready",
    versions: [
      {
        id: "cwops-advanced-proto",
        label: "Prototype (v2.23)",
        note: "Current draft. Adds a daily long-form short-story head-copy assignment on Day 1.",
        status: "ready",
        loader: () => import("./cwops-advanced-proto.js"),
      },
      {
        id: "cwops-advanced-v21",
        label: "Classic (v2.1)",
        note: "The established 2.1 curriculum by KK5NA.",
        status: "coming-soon",
      },
    ],
  },
];

// Flattened lookup of every loadable course id → its registry entry, including
// versions nested inside families.
function findEntry(id) {
  for (const c of classes) {
    if (c.id === id && c.loader) return c;
    if (c.versions) {
      const v = c.versions.find((v) => v.id === id);
      if (v) return v;
    }
  }
  return null;
}

// Returns the family entry whose id matches, or that contains a version id.
export function findFamily(id) {
  return classes.find((c) => c.versions && (c.id === id || c.versions.some((v) => v.id === id))) || null;
}

const cache = new Map();

export async function loadClass(id) {
  if (cache.has(id)) return cache.get(id);
  const entry = findEntry(id);
  if (!entry?.loader) throw new Error(`Unknown class: ${id}`);
  const mod = await entry.loader();
  const merged = { ...mod.default };
  if (entry.firstClassDate && !merged.firstClassDate) merged.firstClassDate = entry.firstClassDate;
  cache.set(id, merged);
  return merged;
}
