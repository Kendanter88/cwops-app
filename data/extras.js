// Extras shown on the home page — copy and sending practice that isn't tied
// to a specific class lesson.
export const extras = {
  copy: [
    {
      name: "SS-201a (Original)",
      blurb: "Sentence Set 201a, multiple speeds.",
      speeds: [
        { wpm: 10, url: "audio/SS-201aORG-10wpm.mp3" },
        { wpm: 13, url: "audio/SS-201aORG-13wpm.mp3" },
        { wpm: 15, url: "audio/SS-201aORG-15wpm.mp3" },
        { wpm: 18, url: "audio/SS-201aORG-18wpm.mp3" },
        { wpm: 20, url: "audio/SS-201aORG-20wpm.mp3" },
        { wpm: 25, url: "audio/SS-201aORG-25wpm.mp3" },
      ],
    },
    {
      name: "77.5",
      speeds: [
        { wpm: 40, url: "audio/77.5.40.mp3" },
      ],
    },
    {
      name: "77 Words (3x)",
      speeds: [
        { wpm: 40, url: "audio/77words3x40wpm.mp3" },
      ],
    },
    {
      name: "Common Abbreviations (3x each)",
      blurb: "Common ham abbreviations, each sent three times. Expand the text below to check your copy.",
      textUrl: "audio/new-cw-3t-a.txt",
      speeds: [
        { wpm: 20, url: "audio/new-cw-3t-a-200000.mp3" },
        { wpm: 22, url: "audio/new-cw-3t-a-220000.mp3" },
        { wpm: 25, url: "audio/new-cw-3t-a-250000.mp3" },
      ],
    },
    {
      name: "Common Abbreviations II (3x each)",
      blurb: "A second set of common abbreviations, each sent three times. Expand the text below to check your copy.",
      textUrl: "audio/new-cw-3t.txt",
      speeds: [
        { wpm: 20, url: "audio/new-cw-abrv-3t-200000.mp3" },
        { wpm: 22, url: "audio/new-cw-abrv-3t-220000.mp3" },
        { wpm: 25, url: "audio/new-cw-abrv-3t-250000.mp3" },
      ],
    },
    {
      name: "Abbreviations & Punctuation (5x each)",
      blurb: "Abbreviations plus ? / and comma, each sent five times. Expand the text below to check your copy.",
      textUrl: "audio/abbrv3a.txt",
      speeds: [
        { wpm: 20, url: "audio/abbrv-times-3a-200000.mp3" },
        { wpm: 22, url: "audio/abbrv-times-3a-220000.mp3" },
        { wpm: 25, url: "audio/abbrv-times-3a-250000.mp3" },
      ],
    },
    {
      name: "ING Suffix Words (3x each)",
      blurb: "The -ING suffix sound followed by words that contain it, each sent three times. Expand the text below to check your copy.",
      textUrl: "audio/ing-ext-words-extended.txt",
      speeds: [
        { wpm: 20, url: "audio/ing-ext-words-extended-200000.mp3" },
        { wpm: 22, url: "audio/ing-ext-words-extended-220000.mp3" },
        { wpm: 25, url: "audio/ing-ext-words-extended-250000.mp3" },
        { wpm: 28, url: "audio/ing-ext-words-extended-280000.mp3" },
      ],
    },
  ],
  sending: [
    {
      name: "Everyday Send Code (WR7Q)",
      url: "docs/Everyday-Send-Code-WR7Q-6-1.pdf",
    },
    {
      name: "Pangrams Plus",
      url: "docs/Pangrams Plus.pdf",
    },
    {
      name: "Sending Practice Article (Sep 2026)",
      blurb: "Short news article to send as plain-language practice — the Korean Air \"nut rage\" story.",
      url: "docs/Sending-Practice-Article-Cho-9-2026.pdf",
    },
  ],
  // External practice tools. Each entry names a guide slug from data/guides.js;
  // the extras page expands it into that guide's own steps, so the procedure is
  // written once and shared with the full guide page at #/g/<slug>.
  externalTools: [
    { guide: "lcwo-icr" },
    { guide: "morse-runner" },
  ],
  // Homework exercises. `id` keys the done-checkbox in localStorage; `classId`
  // (optional) also surfaces the item on that class's Homework page.
  homework: [
    {
      id: "adv-1a",
      classId: "cwops-advanced-proto",
      name: "ADV 1A",
      blurb: "Six CQ calls and their QSO exchanges. Copy at 20 wpm, then listen casually at the faster speeds.",
      instructions: [
        "List the 6 callsigns that are calling CQ.",
        "For the QSO lines, write down the QSO.",
        "Once you have done this listen casually (don't write anything down) to the other faster files and see how much you can copy. This will help get you acclimated to the faster speeds.",
      ],
      speeds: [
        { wpm: 20, url: "audio/HM-WK-1a-200000.mp3" },
        { wpm: 22, url: "audio/HM-WK-1a-220000.mp3" },
        { wpm: 25, url: "audio/HM-WK-1a-250000.mp3" },
        { wpm: 28, url: "audio/HM-WK-1a-280000.mp3" },
        { wpm: 30, url: "audio/HM-WK-1a-300000.mp3" },
      ],
    },
  ],
};
