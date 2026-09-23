export interface ArretOuButClip {
  youtubeId: string;
  debut: number;
  gel: number;
  fin: number;
  reponse: "but" | "arret";
  equipes: [string, string];
}

export const CLIPS: ArretOuButClip[] = [
  { youtubeId: "KvZRo8Q5qwY", debut: 21, gel: 25, fin: 28, reponse: "but", equipes: ["NYR", "NYI"] },
  { youtubeId: "yhTyzy628So", debut: 2, gel: 7, fin: 10, reponse: "but", equipes: ["CHI", "MIN"] },
  { youtubeId: "yRlBvtZ0KNs", debut: 1842, gel: 1847, fin: 1850, reponse: "but", equipes: ["PIT", "BUF"] },
  { youtubeId: "feo6SsxrohU", debut: 144, gel: 150, fin: 154, reponse: "arret", equipes: ["DET", "TBL"] },
  { youtubeId: "XtpUtr2Vb9A", debut: 1605, gel: 1613, fin: 1616, reponse: "arret", equipes: ["DET", "PIT"] },
  { youtubeId: "8NCJgEgvV8Y", debut: 48, gel: 52, fin: 56, reponse: "arret", equipes: ["MTL", "OTT"] },
  { youtubeId: "Ia3uPZLZep0", debut: 2, gel: 6, fin: 10, reponse: "arret", equipes: ["VGK", "TOR"] },
  { youtubeId: "0AMIEzrA28M", debut: 5262, gel: 5268, fin: 5274, reponse: "but", equipes: ["PIT", "WSH"] },
];
