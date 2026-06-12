// In-app practice tool guides. Lesson links to LCWO ICR / Morse Runner are
// rewritten at render time to point at these pages instead of the original
// external PDFs / docs, so the steps live alongside the lesson context.
//
// Source material:
//   lcwo-icr     — CWops "LCWO ICR Guidelines" handout
//   morse-runner — Bob Carter WR7Q, "Morse Runner Community Edition — CW
//                  Academy User Guide" (v01, 06may24)

// Daily Morse Code Scales — the literal sending-practice rows, replicated from
// https://cwops.org/wp-content/uploads/2024/08/Everyday-Send-Code-Web.htm so the
// exercise lives in-app. Lessons ask for a subset (Warm Up only, Warm Up +
// Drill, or Warm Up + Exercise); each maps to one of the scales-* guides below.
const SC_WARMUP = `eeeee  ttttt  iiiii  mmmmm  sssss  ooooo  hhhhh  00000  55555

aaaaa  nnnnn  uuuuu  ddddd  vvvvv  bbbbb  44444  66666

abcdef ghijk lmnop qrstu vwxyz  12345  67890  /   ,   .   ?

the quick brown fox jumpED over the lazy dogs back   7 0 3 6 4 5 1 2 8 9`;

const SC_EXERCISE = `aaaaa  bbbbb  ccccc  ddddd  eeeee  fffff  ggggg  hhhhh  iiiii  jjjjj

kkkkk  lllll  mmmmm  nnnnn  ooooo  ppppp  qqqqq  rrrrr

sssss  ttttt  uuuuu  vvvvv   wwwww   xxxxx   yyyyy   zzzzz

11111  22222  33333  44444  55555  66666  77777  88888  99999  00000`;

// Punctuation drill: seven 5-char groups separated by 4 spaces, with prosigns
// aligned under specific groups — <DN> under /, <sk> under *, <ar> under +,
// <BT> under =. Built by column math so the two rows stay aligned.
const SC_PUNCT = ["/", ",", ".", "?", "*", "+", "="];
const SC_DRILL_SYMBOLS = SC_PUNCT.map((c) => `${c} ${c} ${c} ${c} ${c}`).join("    ");
const SC_DRILL_PROSIGNS = (() => {
  const stride = 9 + 4; // 9-char group + 4-space separator
  const marks = { 0: "<DN>", 4: "<sk>", 5: "<ar>", 6: "<BT>" };
  let line = "";
  for (const gi of Object.keys(marks)) line = line.padEnd(Number(gi) * stride) + marks[gi];
  return line;
})();
const SC_DRILL = `the quick brown fox jumpED over the lazy dogs back   7 0 3 6 4 5 1 2 8 9

the quick brown fox jumpED over the lazy dogs back   7 0 3 6 4 5 1 2 8 9

BENS BEST BENT WIRE/5      BENS BEST BENT WIRE/5      BENS BEST BENT WIRE/5

${SC_DRILL_SYMBOLS}

${SC_DRILL_PROSIGNS}`;

const SCALES_SOURCE = "https://cwops.org/wp-content/uploads/2024/08/Everyday-Send-Code-Web.htm";

function scalesGuide(id, label, blocks) {
  return {
    id,
    title: `Daily Morse Code Scales — ${label}`,
    subtitle: "Send these on your key/paddle as today's warm-up. Don't rush — focus on clean, even spacing.",
    sourceLabel: "CWops Everyday Send Code",
    sourceUrl: SCALES_SOURCE,
    scalesAll: id !== "scales-all", // show a "full scales" link on the subset pages
    blocks,
  };
}

export const guides = {
  "scales-warmup": scalesGuide("scales-warmup", "Warm Up", [
    { heading: "Warm Up", text: SC_WARMUP },
  ]),
  "scales-warmup-drill": scalesGuide("scales-warmup-drill", "Warm Up + Drill", [
    { heading: "Warm Up", text: SC_WARMUP },
    { heading: "Drill", text: SC_DRILL },
  ]),
  "scales-warmup-exercise": scalesGuide("scales-warmup-exercise", "Warm Up + Exercise", [
    { heading: "Warm Up", text: SC_WARMUP },
    { heading: "Exercise", text: SC_EXERCISE },
  ]),
  "scales-all": scalesGuide("scales-all", "All Sections", [
    { heading: "Warm Up", text: SC_WARMUP },
    { heading: "Exercise", text: SC_EXERCISE },
    { heading: "Drill", text: SC_DRILL },
  ]),

  "lcwo-icr": {
    id: "lcwo-icr",
    title: "LCWO ICR — Practice Guide",
    subtitle: "Setup and step-by-step procedure for Code Groups, Word Training, and Callsign Training on LCWO.",
    app: { name: "LCWO (Learn CW Online)", url: "https://lcwo.net/" },
    sourceLabel: "CWops LCWO ICR Guidelines",
    sourceUrl: "https://cwops.org/wp-content/uploads/2025/03/LCWO-ICR-Guidelines.htm",
    intro: "You'll use two LCWO speed-practice features — Code Groups and Word Training — plus an optional Callsign Training drill. Always keep the effective speed at least as fast as the class curriculum, and step up from there.",
    speedHint: (wpm) =>
      `For today's lesson, start at an effective speed of ${wpm} WPM. Use that wherever the steps below say "class speed".`,
    sections: [
      {
        id: "code-groups",
        title: "Code Groups",
        where: "Menu → Test → Code Groups",
        blurb: "Mode can be set to letters, figures, mixed, or custom. While the audio plays, type what you hear into the empty text box for checking.",
        procedure: {
          title: "General procedure (every run)",
          steps: [
            "Set Duration (min) to 1.",
            "Uncheck 'use REAL speed (not PARIS)'.",
            "Click Play/Pause and prepare to copy.",
            "After completion, click Check Results and review your errors.",
            "Click Continue Training and repeat the exercise five or more times.",
          ],
        },
        modes: [
          {
            id: "letters",
            title: "Letters",
            startWpm: 10,
            startChars: 3,
            ladder: [10, 13, 15, 20],
            charLadder: [3, 4, 5],
            steps: [
              "Start at an effective speed of 10 WPM with 3 characters (never below your class speed).",
              "Practice until you average ~10% errors or less (≥90% accuracy).",
              "Step the speed up: 13 WPM, then 15 WPM, working up to at least 20 WPM.",
              "Reset to class speed, raise to 4 characters, repeat the speed ladder.",
              "Reset to class speed, raise to 5 characters, repeat the speed ladder.",
            ],
          },
          {
            id: "figures",
            title: "Figures (numbers)",
            startWpm: 10,
            startChars: 3,
            ladder: [10, 12, 13, 15, 20],
            charLadder: [3, 4],
            steps: [
              "Start at an effective speed of 10 WPM with 3 characters (never below your class speed).",
              "Practice until you average ~10% errors or less (≥90% accuracy).",
              "Step the speed up: 12 WPM, then 13 WPM, then 15 WPM, working up to 20 WPM.",
              "Reset to class speed, raise to 4 characters, repeat the speed ladder.",
            ],
          },
          {
            id: "custom",
            title: "Custom Characters (Koch)",
            startWpm: 10,
            startChars: 2,
            ladder: [10, 13, 15, 20],
            charLadder: [2, 3],
            steps: [
              "Start at an effective speed of 10 WPM with 2 characters (never below your class speed).",
              "Practice until you average ~10% errors or less (≥90% accuracy).",
              "Step the speed up: 13 WPM, then 15 WPM, working up to at least 20 WPM.",
              "Reset to class speed, raise to 3 characters, repeat the speed ladder.",
            ],
          },
        ],
      },
      {
        id: "word-training",
        title: "Word Training",
        where: "Menu → Test → Word Training",
        blurb: "Click Start to open the practice page. Click the play-sound arrow, then type each word and press Return after each one.",
        procedure: {
          title: "Initial settings",
          steps: [
            "Speed — 25 WPM",
            "Min Character Speed — 10 WPM",
            "Characters from lesson — 40",
            "Maximum length — 3 characters",
          ],
        },
        modes: [
          {
            id: "wt-progression",
            title: "Progression",
            startWpm: 10,
            startChars: 3,
            ladder: [10, 13, 15, 20],
            charLadder: [3, 4, 5],
            steps: [
              "Start at an effective speed of 10 WPM with 3 characters (never below your class speed).",
              "Practice until you average fewer than 3 errors per run.",
              "Step the speed up: 13 WPM, then 15 WPM, working up to at least 20 WPM.",
              "Reset to class speed, raise to 4 characters, repeat the speed ladder.",
              "Reset to class speed, raise to 5 characters, repeat the speed ladder.",
            ],
          },
        ],
      },
      {
        id: "callsign-training",
        title: "Callsign Training",
        where: "Menu → Test → Callsign Training",
        blurb: "A simplified version of RufzXP. Click Start, then the play-sound arrow and OK. Type each callsign and press Return.",
        procedure: {
          title: "Initial settings",
          steps: [
            "Speed — 15 WPM",
            "Min Character Speed — 25 WPM",
            "Fixed speed — checked",
          ],
        },
        modes: [
          {
            id: "cs-progression",
            title: "Progression",
            startWpm: 15,
            ladder: [15, 18, 20, 25],
            steps: [
              "Start at an effective speed of 15 WPM.",
              "Work up through 18, 20, etc. until you reach 25 WPM.",
            ],
          },
        ],
      },
      {
        id: "beyond",
        title: "Beyond the Intermediate Curriculum",
        blurb: "When you've cleared the curriculum, keep building.",
        procedure: null,
        modes: [
          {
            id: "get-better",
            title: "Get better yet",
            steps: [
              "Keep increasing speed, character count, and decreasing word spacing.",
            ],
          },
          {
            id: "mixed",
            title: "Mixed (in Code Groups)",
            startWpm: 15,
            startChars: 3,
            ladder: [15, 18, 20],
            charLadder: [3, 4, 5],
            steps: [
              "Start at an effective speed of 15 WPM with 3 characters.",
              "Practice until you average ~10% errors or less (≥90% accuracy).",
              "Step the speed up to 18 WPM, then 20 WPM.",
              "Reset to 15 WPM, raise to 4 characters, repeat the process.",
              "Reset to 15 WPM, raise to 5 characters, repeat the process.",
            ],
          },
          {
            id: "copy-behind",
            title: "Copy Behind",
            steps: [
              "Instead of hitting Enter immediately after each character, wait until you've heard the whole word — then enter it.",
              "Trains your brain to hear words instead of letters.",
            ],
          },
        ],
      },
    ],
  },

  "morse-runner": {
    id: "morse-runner",
    title: "Morse Runner — Practice Guide",
    subtitle: "How to set up Morse Runner Community Edition for CW Academy callsign / contest practice.",
    app: { name: "Web Morse Runner", url: "https://fritzsche.github.io/WebMorseRunner/" },
    sourceLabel: "Bob Carter WR7Q — CW Academy User Guide (v01, 06may24)",
    intro: "Morse Runner simulates pile-ups and contest contacts. The day's lesson tells you the mode (single call, pile-up, or WPX) and the speed. This guide covers the standing setup and how to work each call.",
    speedHint: (wpm) =>
      `For today's lesson, set the speed to ${wpm} WPM (the lesson note above also tells you which Run mode to pick).`,
    sections: [
      {
        id: "setup",
        title: "Setup",
        where: "Open Morse Runner Community Edition (latest version).",
        blurb: "Do this once per session before you start.",
        procedure: {
          title: "Standing settings",
          steps: [
            "Use the latest version of Morse Runner Community Edition.",
            "Select the CW WPX contest.",
            "Leave all band-conditions boxes unchecked.",
            "Set the speed a little faster than you're comfortable with — pushes you to learn faster and saves clock time.",
            "Set Run for time to 15 minutes.",
            "Set pitch to your comfort level.",
          ],
        },
        modes: [
          {
            id: "cut-numbers",
            title: "Cut numbers (used in the NR exchange)",
            steps: [
              "0 → O (OOO or TTT)",
              "9 → N",
              "1 → A",
              "5 → E",
            ],
          },
        ],
      },
      {
        id: "exchange",
        title: "Working a contact",
        blurb: "Pattern for every QSO.",
        procedure: {
          title: "Sequence",
          steps: [
            "Wait for him to finish sending — don't enter until he's through (Esc may save you).",
            "The first exchange you send is always 001. Morse Runner automatically sends 599 / 5NN.",
            "After he hears a correct callsign from you, one of three things happens:",
            "  1. He sends 'R' and his exchange — log it and move on.",
            "  2. He sends 'NR?' — press F2 to resend your exchange.",
            "  3. He sends 'AGN' — press F2 to resend your exchange.",
            "If you missed something, press F7 to ask 'AGN?' (don't wait for him to repeat on his own — it wastes the clock).",
            "If you can't hear him at all, press F2 to send 'AGN' or 'NR?'.",
          ],
        },
        modes: [
          {
            id: "chk-column",
            title: "Reading the CHK column",
            steps: [
              "Blank → you logged the exchange correctly.",
              "NR → you logged the wrong number.",
              "NIL → you hit Enter out of sequence. Should be rare — if you see a lot of these, stop and figure out what's going wrong.",
            ],
          },
        ],
      },
      {
        id: "function-keys",
        title: "Function keys",
        blurb: "The keys you'll actually use in CWA practice.",
        procedure: null,
        modes: [
          {
            id: "fk-core",
            title: "Core keys",
            steps: [
              "F1 — Send CQ. Use if he stops sending; consider wiping with Alt-W or Ctrl-W first.",
              "F2 — Send your exchange (also use to repeat after NR? or AGN).",
              "F5 — Send 'His Call'. Use after you've correctly copied 2–3 elements of his call and have pressed F7 more than 2–3 times; keeps him with you. He'll prepend 'DE'.",
              "F7 — '? AGN' — ask him to resend his call or exchange.",
            ],
          },
          {
            id: "fk-other",
            title: "Other keys (not normally needed)",
            steps: [
              "F3 — TU",
              "F4 — My Call",
              "F6 — B4 (called before)",
              "F8 — NIL (not in log)",
            ],
          },
        ],
      },
    ],
  },
};
