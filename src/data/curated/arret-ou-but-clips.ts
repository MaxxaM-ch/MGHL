// Placeholder development data — replaced with real curated clips in a
// later task. youtubeId "M7lc1UVf-VE" is Google's own public "Big Buck
// Bunny" trailer, safe to embed for local testing; timestamps are
// arbitrary since the actual content isn't a hockey clip.
export interface ArretOuButClip {
  youtubeId: string;
  debut: number;
  gel: number;
  fin: number;
  reponse: "but" | "arret";
  equipes: [string, string];
}

export const CLIPS: ArretOuButClip[] = [
  { youtubeId: "M7lc1UVf-VE", debut: 0, gel: 5, fin: 8, reponse: "but", equipes: ["MTL", "TOR"] },
  { youtubeId: "M7lc1UVf-VE", debut: 10, gel: 15, fin: 18, reponse: "arret", equipes: ["BOS", "TBL"] },
  { youtubeId: "M7lc1UVf-VE", debut: 20, gel: 25, fin: 28, reponse: "but", equipes: ["EDM", "CGY"] },
  { youtubeId: "M7lc1UVf-VE", debut: 30, gel: 35, fin: 38, reponse: "arret", equipes: ["NYR", "NYI"] },
  { youtubeId: "M7lc1UVf-VE", debut: 40, gel: 45, fin: 48, reponse: "but", equipes: ["VAN", "SEA"] },
  { youtubeId: "M7lc1UVf-VE", debut: 50, gel: 55, fin: 58, reponse: "arret", equipes: ["CHI", "DET"] },
  { youtubeId: "M7lc1UVf-VE", debut: 60, gel: 65, fin: 68, reponse: "but", equipes: ["PIT", "WSH"] },
  { youtubeId: "M7lc1UVf-VE", debut: 70, gel: 75, fin: 78, reponse: "arret", equipes: ["COL", "STL"] },
];
