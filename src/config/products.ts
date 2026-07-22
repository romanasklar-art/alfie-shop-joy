export interface PlacementZone {
  id: string;
  nazev: string;
  info: string;
  typ: "mala" | "velka" | "navic";
  select: string;
  value: string;
  barva: string;
  predni: boolean;
  position: { x: number; y: number };
  imageScale: number;
}

export interface ProductConfig {
  slugy: string[];
  zony: PlacementZone[];
  kolize: string[][];
}

// Position coordinates for product mockup preview (% based)
const POSITIONS = {
  srdce: { x: 62, y: 38, scale: 18 },
  hrudnik: { x: 50, y: 45, scale: 35 },
  "lem-p": { x: 38, y: 75, scale: 18 },
  krk: { x: 50, y: 25, scale: 18 },
  zada: { x: 50, y: 45, scale: 40 },
  "lem-z": { x: 38, y: 75, scale: 18 },
  "hrudnik-v": { x: 50, y: 45, scale: 35 },
  predni: { x: 50, y: 45, scale: 35 },
  zadni: { x: 50, y: 45, scale: 35 },
  prirodni: { x: 50, y: 45, scale: 35 },
  barvena: { x: 50, y: 45, scale: 35 },
  mala: { x: 50, y: 45, scale: 22 },
  velka: { x: 50, y: 45, scale: 35 },
};

function pos(id: string) {
  const p = POSITIONS[id as keyof typeof POSITIONS] || { x: 50, y: 45, scale: 25 };
  return { position: { x: p.x, y: p.y }, imageScale: p.scale };
}

export const PRODUKTY: Record<string, ProductConfig> = {
  tricko: {
    slugy: ["panske-tricko", "damske-tricko", "tricko"],
    zony: [
      { id: "srdce", nazev: "Vlevo u srdce", info: "13×13 cm · přední strana", typ: "mala", select: "Výšivka (13x13 cm)", value: "Vlevo u srdce", barva: "#ff2600", predni: true, ...pos("srdce") },
      { id: "hrudnik", nazev: "Uprostřed hrudníku", info: "25×15 cm · přední strana", typ: "velka", select: "Velká výšivka (25x15 cm)", value: "Uprostřed hrudníku", barva: "#1D9E75", predni: true, ...pos("hrudnik") },
      { id: "lem-p", nazev: "Vpravo dole · přední lem", info: "13×13 cm · přední strana", typ: "navic", select: "Výšivka navíc (13x13 cm)", value: "Vpravo dole u předního lemu", barva: "#7F77DD", predni: true, ...pos("lem-p") },
      { id: "krk", nazev: "Za krkem", info: "13×13 cm · zadní strana", typ: "navic", select: "Výšivka navíc (13x13 cm)", value: "Za krkem", barva: "#BA7517", predni: false, ...pos("krk") },
      { id: "zada", nazev: "Uprostřed zad", info: "25×15 cm · zadní strana", typ: "velka", select: "Velká výšivka (25x15 cm)", value: "Uprostřed zad", barva: "#1D9E75", predni: false, ...pos("zada") },
      { id: "lem-z", nazev: "Vpravo dole · zadní lem", info: "13×13 cm · zadní strana", typ: "navic", select: "Výšivka navíc (13x13 cm)", value: "Vpravo dole u zadního lemu", barva: "#7F77DD", predni: false, ...pos("lem-z") },
    ],
    kolize: [["srdce", "hrudnik"]],
  },
  mikina: {
    slugy: ["mikina", "panska-mikina", "damska-mikina"],
    zony: [
      { id: "srdce", nazev: "Vlevo u srdce", info: "13×13 cm · přední strana", typ: "mala", select: "Výšivka (13x13 cm)", value: "Vlevo u srdce", barva: "#ff2600", predni: true, ...pos("srdce") },
      { id: "hrudnik", nazev: "Uprostřed hrudníku", info: "25×15 cm · přední strana", typ: "velka", select: "Velká výšivka (25x15 cm)", value: "Uprostřed hrudníku", barva: "#1D9E75", predni: true, ...pos("hrudnik") },
      { id: "krk", nazev: "Za krkem", info: "13×13 cm · zadní strana", typ: "navic", select: "Výšivka navíc (13x13 cm)", value: "Za krkem", barva: "#BA7517", predni: false, ...pos("krk") },
      { id: "zada", nazev: "Uprostřed zad", info: "25×15 cm · zadní strana", typ: "velka", select: "Velká výšivka (25x15 cm)", value: "Uprostřed zad", barva: "#1D9E75", predni: false, ...pos("zada") },
      { id: "lem-z", nazev: "Vpravo dole · zadní lem", info: "13×13 cm · zadní strana", typ: "navic", select: "Výšivka navíc (13x13 cm)", value: "Vpravo dole u zadního lemu", barva: "#7F77DD", predni: false, ...pos("lem-z") },
    ],
    kolize: [["srdce", "hrudnik"]],
  },
  detske: {
    slugy: ["detske", "detska-mikina", "detske-tricko"],
    zony: [
      { id: "hrudnik", nazev: "Uprostřed hrudníku", info: "13×13 cm · přední strana", typ: "mala", select: "Výšivka (13x13 cm)", value: "Uprostřed hrudníku", barva: "#ff2600", predni: true, ...pos("hrudnik") },
      { id: "lem-p", nazev: "Vpravo dole · přední lem", info: "13×13 cm · přední strana", typ: "navic", select: "Výšivka navíc (13x13 cm)", value: "Vpravo dole u předního lemu", barva: "#7F77DD", predni: true, ...pos("lem-p") },
      { id: "hrudnik-v", nazev: "Uprostřed hrudníku (velká)", info: "25×15 cm · přední strana", typ: "velka", select: "Velká výšivka (25x15 cm)", value: "Uprostřed hrudníku", barva: "#1D9E75", predni: true, ...pos("hrudnik-v") },
      { id: "krk", nazev: "Za krkem", info: "13×13 cm · zadní strana", typ: "navic", select: "Výšivka navíc (13x13 cm)", value: "Za krkem", barva: "#BA7517", predni: false, ...pos("krk") },
      { id: "zada", nazev: "Uprostřed zad", info: "25×15 cm · zadní strana", typ: "velka", select: "Velká výšivka (25x15 cm)", value: "Uprostřed zad", barva: "#1D9E75", predni: false, ...pos("zada") },
      { id: "lem-z", nazev: "Vpravo dole · zadní lem", info: "13×13 cm · zadní strana", typ: "navic", select: "Výšivka navíc (13x13 cm)", value: "Vpravo dole u zadního lemu", barva: "#7F77DD", predni: false, ...pos("lem-z") },
    ],
    kolize: [["hrudnik", "hrudnik-v"]],
  },
  taska_velka: {
    slugy: ["platena-taska", "taska-s-vysivkou"],
    zony: [
      { id: "predni", nazev: "Přední strana", info: "20×20 cm", typ: "mala", select: "Výšivka (13x13 cm)", value: "Vlevo u srdce", barva: "#ff2600", predni: true, ...pos("predni") },
      { id: "zadni", nazev: "Zadní strana", info: "20×20 cm", typ: "navic", select: "Výšivka navíc (13x13 cm)", value: "Vpravo dole u zadního lemu", barva: "#1D9E75", predni: false, ...pos("zadni") },
    ],
    kolize: [],
  },
  polstar: {
    slugy: ["polstar", "povlak-na-polstar"],
    zony: [
      { id: "prirodni", nazev: "Přírodní strana", info: "20×20 cm", typ: "mala", select: "Výšivka polštáře", value: "Přírodní strana", barva: "#ff2600", predni: true, ...pos("prirodni") },
      { id: "barvena", nazev: "Barevná strana", info: "20×20 cm", typ: "navic", select: "Výšivka polštáře", value: "Barevná strana", barva: "#1D9E75", predni: false, ...pos("barvena") },
    ],
    kolize: [],
  },
  zastera: {
    slugy: ["zastera"],
    zony: [
      { id: "mala", nazev: "Malá výšivka", info: "13×13 cm · přední strana", typ: "mala", select: "Velikost výšivky na zástěru", value: "Malá výšivka (13x13 cm)", barva: "#ff2600", predni: true, ...pos("mala") },
      { id: "velka", nazev: "Velká výšivka", info: "25×15 cm · přední strana", typ: "velka", select: "Velikost výšivky na zástěru", value: "Velká výšivka (25x15 cm) (+500 Kč)", barva: "#1D9E75", predni: true, ...pos("velka") },
    ],
    kolize: [["mala", "velka"]],
  },
};

export function getProductBySlug(slug: string): { typ: string; data: ProductConfig } | null {
  for (const [typ, data] of Object.entries(PRODUKTY)) {
    if (data.slugy.some((s) => slug.includes(s))) return { typ, data };
  }
  return null;
}

export function getProductByParam(param: string): { typ: string; data: ProductConfig } | null {
  if (PRODUKTY[param]) return { typ: param, data: PRODUKTY[param] };
  // Try slug match
  return getProductBySlug(param);
}

export function isZoneBlocked(
  zoneId: string,
  activeZones: string[],
  kolize: string[][]
): boolean {
  for (const pair of kolize) {
    if (!pair.includes(zoneId)) continue;
    const otherInPair = pair.filter((id) => id !== zoneId);
    if (otherInPair.some((id) => activeZones.includes(id))) return true;
  }
  return false;
}

export function getZonePriceBadge(
  zone: PlacementZone,
  activeZones: string[],
  allZones: PlacementZone[]
): { label: string; free: boolean } {
  if (zone.typ === "velka") return { label: "+500 Kč", free: false };
  // Small embroidery (13x13) — both "mala" and "navic" count as small.
  // The FIRST small embroidery on the order is always free, no matter which position.
  const smallActive = activeZones.filter((id) => {
    const z = allZones.find((x) => x.id === id);
    return z && (z.typ === "mala" || z.typ === "navic");
  });
  const isActive = activeZones.includes(zone.id);
  if (!isActive) {
    return smallActive.length === 0 ? { label: "v ceně", free: true } : { label: "+300 Kč", free: false };
  }
  const isFirstSmall = smallActive[0] === zone.id;
  return isFirstSmall ? { label: "v ceně", free: true } : { label: "+300 Kč", free: false };
}
