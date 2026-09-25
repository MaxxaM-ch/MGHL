export interface ArretOuButClip {
  youtubeId: string;
  debut: number;
  gel: number;
  // The real resolution moment (goal crossing the line / save completed).
  // Distinct from "fin" below: the clip plays through this point without
  // stopping, and this is when the reveal badge and "Suivant" button
  // appear — not when the clip actually stops.
  guessReveal: number;
  // Where the clip actually stops after resuming, a few seconds past
  // guessReveal — gives the viewer a moment to see the outcome's aftermath
  // instead of freezing the instant it happens.
  fin: number;
  reponse: "but" | "arret";
  equipes: [string, string];
}

export const CLIPS: ArretOuButClip[] = [
  { 
    youtubeId: "KvZRo8Q5qwY", 
    debut: 21, 
    gel: 26,
    guessReveal: 27,
    fin: 30,
    reponse: "but", 
    equipes: ["NYR", "NYI"] 
  },
  { 
    youtubeId: "yhTyzy628So", 
    debut: 2, 
    gel: 7, 
    guessReveal: 10, 
    fin: 13, 
    reponse: "but", 
    equipes: ["CHI", "MIN"] 
  },
  {
    youtubeId: "yRlBvtZ0KNs",
    debut: 1842,
    gel: 1847.25,
    guessReveal: 1850,
    fin: 1853,
    reponse: "but",
    equipes: ["PIT", "BUF"],
  },
  {
    youtubeId: "feo6SsxrohU",
    debut: 144,
    gel: 150,
    guessReveal: 153,
    fin: 156,
    reponse: "arret",
    equipes: ["DET", "TBL"],
  },
  {
    youtubeId: "XtpUtr2Vb9A",
    debut: 1605,
    gel: 1613,
    guessReveal: 1615,
    fin: 1618,
    reponse: "arret",
    equipes: ["DET", "PIT"],
  },
  {
    youtubeId: "8NCJgEgvV8Y",
    debut: 48,
    gel: 53,
    guessReveal: 55,
    fin: 58,
    reponse: "arret",
    equipes: ["MTL", "OTT"],
  },
  { 
    youtubeId: "Ia3uPZLZep0", 
    debut: 2, 
    gel: 6.75, 
    guessReveal: 10, 
    fin: 13, 
    reponse: "arret", 
    equipes: ["VGK", "TOR"] 
  },
  {
    youtubeId: "0AMIEzrA28M",
    debut: 5262,
    gel: 5268,
    guessReveal: 5271,
    fin: 5274,
    reponse: "but",
    equipes: ["PIT", "WSH"],
  },
  {
    youtubeId: "Z96MQEpTkQ0",
    debut: 6284,
    gel: 6289,
    guessReveal: 6292,
    fin: 6295,
    reponse: "but",
    equipes: ["PIT", "OTT"],
  },
  {
    youtubeId: "eLUb4s8O_X4",
    debut: 165,
    gel: 173,
    guessReveal: 176,
    fin: 179,
    reponse: "arret",
    equipes: ["BUF", "MTL"],
  },
  {
    youtubeId: "fUHTMh0NzU0",
    debut: 110,
    gel: 117,
    guessReveal: 120,
    fin: 123,
    reponse: "but",
    equipes: ["CGY", "PIT"],
  },
  {
    youtubeId: "iSY4vliozTs",
    debut: 403,
    gel: 409,
    guessReveal: 411,
    fin: 414,
    reponse: "arret",
    equipes: ["NYR", "WSH"],
  },
  {
    youtubeId: "x29mS98G6f0",
    debut: 54,
    gel: 57,
    guessReveal: 59,
    fin: 62,
    reponse: "arret",
    equipes: ["NSH", "MIN"],
  },
  {
    youtubeId: "x29mS98G6f0",
    debut: 191,
    gel: 193.5,
    guessReveal: 195,
    fin: 198,
    reponse: "arret",
    equipes: ["CBJ", "NJD"],
  },
  {
    youtubeId: "_iW2WCRuiwk",
    debut: 47,
    gel: 52,
    guessReveal: 55,
    fin: 58,
    reponse: "but",
    equipes: ["DAL", "MIN"],
  },
  {
    youtubeId: "jWpmFWcynso",
    debut: 52,
    gel: 58.25,
    guessReveal: 61,
    fin: 64,
    reponse: "but",
    equipes: ["MTL", "TBL"],
  },
  {
    youtubeId: "zMwyzwkRi0k",
    debut: 398,
    gel: 404,
    guessReveal: 406,
    fin: 409,
    reponse: "arret",
    equipes: ["EDM", "ANA"],
  },
  {
    youtubeId: "K_K9vhHb9vY",
    debut: 1584,
    gel: 1591,
    guessReveal: 1594,
    fin: 1597,
    reponse: "arret",
    equipes: ["PHI", "CHI"],
  },
  {
    youtubeId: "NNOWNXH1P5E",
    debut: 1642,
    gel: 1649,
    guessReveal: 1652,
    fin: 1655,
    reponse: "but",
    equipes: ["BOS", "STL"],
  },
];
