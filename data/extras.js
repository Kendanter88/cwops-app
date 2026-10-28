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
      name: "Double Letters with Words",
      blurb: "Each double letter sent on its own, then three words that contain it. Expand the text below to check your copy.",
      textUrl: "audio/double-letters-words.txt",
      speeds: [
        { wpm: 20, url: "audio/double-letters-words-200000.mp3" },
        { wpm: 22, url: "audio/double-letters-words-220000.mp3" },
        { wpm: 25, url: "audio/double-letters-words-250000.mp3" },
        { wpm: 28, url: "audio/double-letters-words-280000.mp3" },
      ],
    },
    {
      name: "More Dits (3x each)",
      blurb: "Dit-heavy words — radishes, wishes, shush, machine — each sent three times. Expand the text below to check your copy.",
      textUrl: "audio/more-dits-x3.txt",
      speeds: [
        { wpm: 25, url: "audio/more-dits-x3-250000.mp3" },
        { wpm: 28, url: "audio/more-dits-x3-280000.mp3" },
        { wpm: 30, url: "audio/more-dits-x3-300000.mp3" },
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
    {
      name: "Copy Test 2 — Antenna Switching",
      blurb: "A short plain-language paragraph about a station's feed lines, antenna switch and band decoder. Expand the text below to check your copy.",
      textUrl: "audio/copy-test-2.txt",
      speeds: [
        { wpm: 22, url: "audio/copy-test-2-220000.mp3" },
        { wpm: 25, url: "audio/copy-test-2-250000.mp3" },
        { wpm: 28, url: "audio/copy-test-2-280000.mp3" },
        { wpm: 30, url: "audio/copy-test-2-300000.mp3" },
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
    {
      name: "Double Letters by Frequency",
      blurb: "Here is the list of double letters by their frequency of use:",
      text: `ll
ee
ss
tt
oo
mm
ff
pp
rr
nn
cc
dd`,
    },
    {
      name: "Double Letters by Position",
      blurb: "Words grouped by where the double letter falls, after the frequency list.",
      parts: [
        {
          title: "By frequency of use",
          text: `ll
ee
ss
tt
oo
mm
ff
pp
rr
nn
cc
dd`,
        },
        {
          title: "1st position",
          text: `eerie, llama`,
        },
        {
          title: "2nd position",
          text: `meccaneeds, books, offer, issue, added, seems, allow, tools, weeks, looks, apply, error, occur, rooms, upper, goods, inner, foods, array, doors, roots, feels, keeps, teeth, meets, essay, loose, seeds, woods, seeks, asset, boost, arrow, peers, pools, boots, deeds, apple, teens, assay, booth, tooth, loops, feeds, weeds, utter, heels, hooks, alley, beers, reefs, alloy, goose, roofs, oddly, needy, moose, fools, attic, geese, cooks, moods, moons, annum, reels, looms, woody, reeds, erred, otter, deems, geeks, abbey, beech, annex, hoops, goofy, booty, abbot, annoy, asses, moody, roost, cools, hoods, booze, httpd, https, jeeps, ellos, leech, booms, illus, roomy, beets, soooo, noose, noone, peels, allot, seers, peeps, zooms, affix, seedy, sooty, allay, upped, moors, booby, seeps, weedy, adder, beeps, allen, goons, geeky, alles, udder, leery, nooks, loons, leeks, gooey`,
        },
        {
          title: "3rd position",
          text: `cells, blood, green, speed, fully, happy, calls, floor, carry, trees, sleep, tells, steel, walls, stood, sorry, falls, proof, sheet, sweet, hills, funny, wheel, worry, fleet, shoot, breed, sheep, flood, bills, gonna, balls, rally, sells, wells, steep, rolls, marry, queen, silly, mills, knees, ferry, sheer, shook, villa, kills, fatty, lobby, puppy, sunny, pizza, polls, hobby, pulls, gotta, belly, halls, buddy, wanna, freed, bloom, dolls, hurry, fills, bells, gamma, sweep, troop, pills, fuzzy, creek, greed, cheek, petty, cheer, greet, spoon, wills, penny, steer, motto, hello, scoop, bulls, muddy, creed, groom, cello, stool, witty, curry, savvy, messy, jelly, creep, della, bleed, malls, folly, comma, sleek, buggy, dummy, poppy, queer, merry, rabbi, tally, ebook, watts, jolly, paddy, mummy, bully, furry, dizzy, hilly, gloom, brood, berry, dunno, daddy, riffs, frees, broom, brook, bunny, teddy, butts, spool, sheen, matte, buffs, outta, crook, gulls, kitty, jazzy, kamma, cuffs, lotto, gully, yells, nanny, hulls, yummy, posse, terra, tolls, aloof, foggy, masse, greek, gills, filly, pussy, citta, spoof, tummy, tonne, kneel, freer, nutty, jetty, putty, flees, steed, mommy, henna, swoop, delle, giddy, parry, piggy, afoot, tabby, potty, soooo, puffs, lorry, fella, sassy, soggy, puffy, stoop, fussy, drool, femme, holly, hells, runny, baggy, mamma, mecca, sills, manna, sleet, kappa, hadde, sneer, sloop, hubby, spook, fells, cotta, caddy, fossa, harry, cette, terry, lemma, swoon, mossy, metta, hippy, latte, galls, bossa, canny, tarry, telly, lotta, dolly, belle, whoop, doggy, ditto, sappy, hippo, comms, tutti, myrrh, lossy, lasso`,
        },
        {
          title: "4th position",
          text: `three, still, small, shall, class, staff, press, stuff, cross, agree, glass, guess, skill, shell, grass, dress, spell, gross, smell, brass, chess, skull, drill, bless, stiff, cliff, grill, bliss, spill, dwell, chill, stall, swell, bluff, abyss, gloss, troll, melee, yahoo, taboo, sniff, spree, fluff, truss, floss, quell, quill, snuff, ascii, radii, knoll, chaff, soooo, amiss, payee, puree, whiff, rupee, crass, gruff, levee, twill, atoll, amass, skiff, swiss, scott, loess, hiatt, krill, trill, scoff, emcee, knell`,
        },
      ],
    },
    {
      name: "Dits Practice",
      blurb: "Dit-heavy sending drill — warm up on S, 5 and H, then work the exercise lines.",
      parts: [
        {
          title: "Warm up drill",
          steps: [
            "First send \"S\" a few times.",
            "After this feels good then alternate sending \"5\" and \"H\".",
            "Once you feel good about your sending do the dit exercise.",
          ],
        },
        {
          title: "Dit exercise",
          text: `She is him & he is she.
Is she he?
He is she.
Shall his be these?
Did she see his fees?
This is she.
N5SHS is his call.
Is NS5H hers?
She is HH5HHS.
Did she see these?
He is in these trees.
His trees are these.
His tree is here.
She & he.`,
        },
        {
          title: "Extra dit practice",
          steps: [
            "She is 55 es she is his sister",
            "MISSISSIPPI",
            "W5HSH",
            "RADIOTELETYPEWRITER",
            "GEGEBEN",
            "MISSISSIPPI SISSIES ARE SISSIER THAN TENNESSEE SISSIES",
          ],
        },
      ],
    },
    {
      name: "Dells little feet",
      text: `Dells little feet looked different during summer
session classes especially after he fell off the roof
in Mississippi and shattered his goofy little glasses.`,
    },
    {
      name: "Deep in the Weeds",
      blurb: "One long sentence dense with E and EE words.",
      text: `"The sixteen kneeling greens keepers ceased weeding
to say shes been seen sweeping greenflies from the
sheets beside the beehive where the busily buzzing
bees followed the queen bee in her breeding flight
under the watchful eyes of seventeen beekeepers
standing knee deep in weeds"`,
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
  // Reference books (PDF). Each opens in the inline viewer and offers a
  // download; only books whose authors allow free redistribution go here.
  books: [
    {
      name: "The New DXer's Handbook (3rd ed., 2021)",
      blurb: "Bryce Anderson, K7UA — listening, DX clusters, split operation, pileups, propagation and QSLing for new DXers. Shared with credit under the author's permission for personal, non-commercial use.",
      url: "docs/The-New-DXers-Handbook-3rd-Ed-2021-K7UA.pdf",
    },
  ],
};
