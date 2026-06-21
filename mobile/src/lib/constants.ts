export const LISBON_PRICES: Record<string, number> = {
  smart: 22.5,
  comfort: 28,
  group: 35,
  executive: 39.5,
};

export const CASCAIS_PRICES: Record<string, number> = {
  smart: 31,
  comfort: 38,
  group: 43,
  executive: 48,
};

export function getBasePrice(category: string, origin: string, destination: string): number {
  if (!origin || !destination) return 0;
  const isCascais =
    origin.toLowerCase().includes("cascais") || destination.toLowerCase().includes("cascais");
  const prices = isCascais ? CASCAIS_PRICES : LISBON_PRICES;
  return prices[category] || LISBON_PRICES.smart;
}

export const VEHICLE_CATEGORIES = [
  { id: "smart", name: "Económico", basePrice: 22.5, passengers: 3 },
  { id: "comfort", name: "Conforto", basePrice: 28, passengers: 4 },
  { id: "group", name: "Monovolume", basePrice: 35, passengers: 7 },
  { id: "executive", name: "Executivo", basePrice: 39.5, passengers: 3 },
] as const;

export const EXTRAS = [
  { id: "baby_seat", name: "Cadeira de bebé", price: 10 },
  { id: "booster", name: "Assento elevatório", price: 8 },
  { id: "meet_greet", name: "Meet & Greet", price: 0 },
  { id: "name_board", name: "Placa personalizada", price: 0 },
  { id: "water", name: "Água a bordo", price: 5 },
  { id: "wifi", name: "Wi-Fi", price: 8 },
  { id: "extra_stop", name: "Paragem adicional", price: 20 },
  { id: "extra_wait", name: "Tempo extra de espera", price: 15 },
] as const;

export const MAIN_ROUTES = [
  { from: "Aeroporto de Lisboa (LIS)", to: "Centro de Lisboa", duration: "25 min", price: 22.5 },
  { from: "Aeroporto de Lisboa (LIS)", to: "Cascais", duration: "45 min", price: 31 },
  { from: "Aeroporto de Lisboa (LIS)", to: "Sintra", duration: "50 min", price: 70 },
  { from: "Centro de Lisboa", to: "Cascais", duration: "40 min", price: 38 },
] as const;

export const LOCATIONS = [
  "Aeroporto de Lisboa (LIS)",
  "Centro de Lisboa",
  "Cascais",
  "Sintra",
  "Belém",
  "Parque das Nações",
  "Setúbal",
  "Óbidos",
] as const;

export const BOOKING_STEPS = [
  { id: 1, label: "Trajeto" },
  { id: 2, label: "Veículo" },
  { id: 3, label: "Opcionais" },
  { id: 4, label: "Dados" },
  { id: 5, label: "Pagamento" },
] as const;

export const POPULAR_ROUTES = MAIN_ROUTES;
