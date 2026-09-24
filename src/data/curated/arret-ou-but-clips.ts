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
    guessReveal: 28, 
    fin: 31, 
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
    gel: 1847,
    guessReveal: 1850,
    fin: 1853,
    reponse: "but",
    equipes: ["PIT", "BUF"],
  },
  {
    youtubeId: "feo6SsxrohU",
    debut: 144,
    gel: 150,
    guessReveal: 154,
    fin: 157,
    reponse: "arret",
    equipes: ["DET", "TBL"],
  },
  {
    youtubeId: "XtpUtr2Vb9A",
    debut: 1605,
    gel: 1613,
    guessReveal: 1616,
    fin: 1619,
    reponse: "arret",
    equipes: ["DET", "PIT"],
  },
  {
    youtubeId: "8NCJgEgvV8Y",
    debut: 48,
    gel: 53,
    guessReveal: 56,
    fin: 59,
    reponse: "arret",
    equipes: ["MTL", "OTT"],
  },
  { 
    youtubeId: "Ia3uPZLZep0", 
    debut: 2, 
    gel: 6, 
    guessReveal: 10, 
    fin: 13, 
    reponse: "arret", 
    equipes: ["VGK", "TOR"] 
  },
  {
    youtubeId: "0AMIEzrA28M",
    debut: 5262,
    gel: 5268,
    guessReveal: 5274,
    fin: 5277,
    reponse: "but",
    equipes: ["PIT", "WSH"],
  },
];
