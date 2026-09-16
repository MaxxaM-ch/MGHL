const BASE_URL = "https://assets.nhle.com/logos/nhl/svg";

export function teamLogoUrl(team: string): string {
  return `${BASE_URL}/${team}_light.svg`;
}
