const BASE_URL = "https://assets.nhle.com/logos/nhl/svg";

export function teamLogoUrl(team: string, variant: "light" | "dark" = "light"): string {
  return `${BASE_URL}/${team}_${variant}.svg`;
}
