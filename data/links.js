// Helpful links shown on the #/links page.
//
// `url`    — the original source. Always shown, and shown at the top of the
//            local viewer page, so credit goes back to the author.
// `mirror` — a local copy under docs/links/. Present only for STATIC documents
//            whose host is http-only (kk5na.com), because an http page or image
//            cannot be embedded in this https site — browsers block it as mixed
//            content. Mirrored items open in-app at #/links/<id>.
// `live`   — a page whose whole value is real-time data. Never mirrored; a
//            frozen copy of solar numbers would be worse than no copy at all.
export const links = {
  categories: [
    {
      name: "Propagation",
      blurb: "Solar activity and how it shapes HF propagation. The three reference documents are mirrored here so they load over https; the live dashboards open at the source.",
      items: [
        {
          id: "kk5na-prop",
          name: "Propagation Info Page",
          by: "Paul Harden, NA5N · hosted by Joe Spencer, KK5NA",
          blurb: "Plain-language walk through sunspots, flux, A and K indices, and what each one does to the bands.",
          url: "http://kk5na.com/prop-1.htm",
          mirror: "docs/links/kk5na-prop-1.html",
          kind: "html",
        },
        {
          id: "kk5na-fdim81",
          name: "Solar Activity & HF Propagation",
          by: "Paul Harden, NA5N · FDIM Symposium 2005, © QRP-ARCI",
          blurb: "Eight-page conference handout on the solar cycle and band-by-band effects.",
          url: "http://kk5na.com/prop-1_files/FDIM81.pdf",
          mirror: "docs/links/kk5na-FDIM81.pdf",
          kind: "pdf",
        },
        {
          id: "kk5na-solar-ho",
          name: "Handiman's Guide to Solar Activity",
          by: "Paul Harden, NA5N · hosted by Joe Spencer, KK5NA",
          blurb: "One-page cheat sheet for reading sunspot groups and magnetic classifications.",
          url: "http://kk5na.com/solar/SOLAR_HO.pdf",
          mirror: "docs/links/kk5na-SOLAR_HO.pdf",
          kind: "pdf",
        },
        {
          name: "SolarHam",
          blurb: "Live solar flares, coronal holes and aurora watch, updated continuously.",
          url: "https://solarham.com/",
          live: true,
        },
        {
          name: "NOAA Space Weather Enthusiasts Dashboard",
          blurb: "Official NOAA dashboard: solar wind, K-index, flare probability and aurora forecast.",
          url: "https://www.swpc.noaa.gov/communities/space-weather-enthusiasts-dashboard",
          live: true,
        },
        {
          name: "HamQSL Solar Data",
          blurb: "Paul Herrman N0NBH's solar-conditions banner, the one you see on thousands of QRZ pages.",
          url: "https://www.hamqsl.com/solar.html",
          live: true,
        },
      ],
    },
    {
      name: "Misc",
      items: [
        {
          id: "cw-qso-protocol",
          name: "CW QSO Protocol",
          by: "Jim Crites, W6JIM",
          blurb: "The shape of a CW contact phase by phase — intro, info, then ragchew — with a standard and a quick version of each exchange, plus notes on QRL, calling CQ and signing off.",
          mirror: "docs/links/cw-qso-protocol.pdf",
          kind: "pdf",
        },
        {
          id: "cut-numbers",
          name: "Cut Numbers",
          blurb: "Why CW operators send T for 0 and N for 9, and where the habit came from on the maritime bands.",
          mirror: "docs/links/cut-numbers.pdf",
          kind: "pdf",
        },
      ],
    },
  ],
};

// Flat lookup for the #/links/<id> viewer route.
export function findLink(id) {
  for (const cat of links.categories) {
    const hit = (cat.items || []).find((i) => i.id === id);
    if (hit) return hit;
  }
  return null;
}
