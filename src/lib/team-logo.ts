const BASE_URL = "https://assets.nhle.com/logos/nhl/svg";

export function teamLogoUrl(team: string, variant: "light" | "dark" = "light"): string {
  return `${BASE_URL}/${team}_${variant}.svg`;
}

// Large wire-frame outline logo, used as reveal-banner background art.
export function teamWireLogoUrl(team: string): string {
  return `https://assets.nhle.com/logos/nhl/wires/${team}.svg`;
}

// Tiled jersey texture pattern, used as the reveal banner's base layer.
export function teamJerseyTextureUrl(team: string): string {
  return `https://assets.nhle.com/textures/nhl/jersey/png/${team}.png`;
}
