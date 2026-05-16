export const VEHICLE_CATEGORIES = [
  {
    id: "smart",
    name: "MOVNLY Start",
    tagline: "Prático e Inteligente",
    badge: "Melhor preço",
    badgeColor: "emerald",
    description: "Ideal para viagens individuais ou a dois, com conforto essencial e pontualidade garantida.",
    passengers: 3,
    luggage: 2,
    examples: "Toyota Corolla, Volkswagen Passat ou similar",
    image: "/vehicles/smart.png",
    basePrice: 22.5,
    features: ["Acolhimento no Terminal", "Wi-Fi Grátis", "Ar Condicionado", "Águas a Bordo", "Motorista Profissional"],
    idealFor: "Viajantes individuais e casais",
    color: "from-slate-800 to-slate-900",
  },
  {
    id: "comfort",
    name: "MOVNLY Business",
    tagline: "Elegância e Performance",
    badge: "O Mais Reservado",
    badgeColor: "blue",
    description: "A escolha predileta para o mundo corporativo. Veículos com acabamentos em pele e conforto acústico superior.",
    passengers: 4,
    luggage: 3,
    examples: "Mercedes-Benz Classe E, BMW Série 5 ou similar",
    image: "/vehicles/business.png",
    basePrice: 28,
    features: ["Meet & Greet incluído", "Até 4 Passageiros", "Estofos em Pele Premium", "Carregadores de Bordo", "Conforto Acústico"],
    idealFor: "Negócios e famílias pequenas",
    color: "from-blue-900 to-slate-900",
  },
  {
    id: "group",
    name: "MOVNLY Van XL",
    tagline: "Privacidade para Grupos",
    badge: "Ideal para Famílias",
    badgeColor: "amber",
    description: "Minivans de luxo projetadas para grupos numerosos e famílias com volumes de bagagem elevados.",
    passengers: 7,
    luggage: 6,
    examples: "Mercedes-Benz Classe V, Volkswagen Multivan ou similar",
    image: "/vehicles/group.png",
    basePrice: 35,
    features: ["Meet & Greet incluído", "Configuração Conferência", "Até 7 Passageiros", "Porta-Bagagens Extensivo", "Wi-Fi Grátis"],
    idealFor: "Grupos e equipas de trabalho",
    color: "from-amber-900 to-slate-900",
  },
  {
    id: "executive",
    name: "MOVNLY VIP",
    tagline: "A Joia da Coroa",
    badge: "Serviço Prestigiado",
    badgeColor: "gold",
    description: "O expoente máximo da mobilidade privada. Chauffeurs dedicados a bordo dos veículos mais luxuosos de Portugal.",
    passengers: 3,
    luggage: 2,
    examples: "Mercedes-Benz Classe S LWB, Maybach ou similar",
    image: "/vehicles/vip.png",
    basePrice: 39.5,
    features: ["Acolhimento Exclusivo", "Chauffeur Dedicado", "Total Privacidade (Max 3 px)", "Amenities Premium", "Wi-Fi de Alta Velocidade"],
    idealFor: "Eventos VIP e figuras executivas",
    color: "from-yellow-900 to-slate-900",
  },
];

export const CASCAIS_PRICES: Record<string, number> = {
  smart: 31,
  comfort: 38,
  group: 43,
  executive: 48,
};

export const LISBON_PRICES: Record<string, number> = {
  smart: 22.5,
  comfort: 28,
  group: 35,
  executive: 39.5,
};

export function getBasePrice(category: string, origin: string, destination: string): number {
  if (!origin || !destination) return 0;

  const isCascais =
    origin.toLowerCase().includes("cascais") ||
    destination.toLowerCase().includes("cascais");

  const prices = isCascais ? CASCAIS_PRICES : LISBON_PRICES;
  return prices[category] || LISBON_PRICES.smart;
}

export const MAIN_ROUTES = [
  { from: "Aeroporto de Lisboa", to: "Centro de Lisboa", duration: "25 min", price: 22.5, image: "/locations/lisbon_centre.png" },
  { from: "Aeroporto de Lisboa", to: "Cascais", duration: "45 min", price: 31, image: "/locations/cascais.png" },
  { from: "Aeroporto de Lisboa", to: "Sintra", duration: "50 min", price: 70, image: "/locations/sintra.png" },
  { from: "Aeroporto de Lisboa", to: "Setúbal", duration: "55 min", price: 75, image: "/locations/lisbon_airport.png" },
  { from: "Centro de Lisboa", to: "Óbidos", duration: "1h 10min", price: 90, image: "/locations/lisbon_centre.png" },
  { from: "Aeroporto de Lisboa", to: "Algarve", duration: "2h 30min", price: 220, image: "/locations/cascais.png" },
];

export const EXTRAS = [
  { id: "baby_seat", name: "Cadeira de bebé", price: 10, icon: "baby" },
  { id: "booster", name: "Assento elevatório", price: 8, icon: "child" },
  { id: "meet_greet", name: "Meet & Greet", price: 0, icon: "handshake" },
  { id: "name_board", name: "Placa personalizada", price: 5, icon: "sign" },
  { id: "water", name: "Água a bordo", price: 5, icon: "droplet" },
  { id: "wifi", name: "Wi-Fi de Alta Velocidade", price: 8, icon: "wifi" },
  { id: "extra_stop", name: "Paragem adicional", price: 20, icon: "map-pin" },
  { id: "extra_wait", name: "Tempo extra de espera", price: 15, icon: "clock" },
];

export const TESTIMONIALS = [
  {
    name: "Sarah Mitchell",
    role: "Viajante frequente",
    country: "Reino Unido",
    rating: 5,
    text: "Serviço absolutamente impecável. O motorista estava à minha espera com uma placa personalizada, o carro era luxuoso e a viagem foi perfeita. Já reservei para a próxima visita.",
    avatar: "SM",
    route: "Aeroporto → Cascais",
    category: "Executive",
  },
  {
    name: "Marco Fernández",
    role: "Diretor Comercial",
    country: "Espanha",
    rating: 5,
    text: "Uso o MOVNLY para todas as minhas viagens de negócios em Lisboa. Pontualidade perfeita, veículos impecáveis e a plataforma de reserva é a mais intuitiva que já usei.",
    avatar: "MF",
    route: "Aeroporto → Parque das Nações",
    category: "Comfort",
  },
  {
    name: "Familie Müller",
    role: "Turistas",
    country: "Alemanha",
    rating: 5,
    text: "Viajámos com 2 crianças e muita bagagem. O motorista foi extremamente atencioso, o veículo espaçoso e o serviço superou todas as expectativas. Recomendamos a 100%.",
    avatar: "FM",
    route: "Aeroporto → Sintra",
    category: "Group",
  },
  {
    name: "Isabelle Dupont",
    role: "Consultora",
    country: "França",
    rating: 5,
    text: "Reservei em menos de 2 minutos, recebi confirmação imediata e o motorista chegou 10 minutos antes. Exatamente o que se espera de um serviço profissional.",
    avatar: "ID",
    route: "Hotel Bairro Alto → Aeroporto",
    category: "Smart",
  },
];

export const TRUST_BADGES = [
  { label: "Motoristas verificados", icon: "shield-check" },
  { label: "Pagamento seguro", icon: "lock" },
  { label: "Suporte 24/7", icon: "headphones" },
  { label: "Monitoramento de voo", icon: "plane" },
  { label: "Confirmação instantânea", icon: "zap" },
  { label: "Cancelamento gratuito", icon: "refresh-cw" },
];

export const TOURS = [
  {
    id: "sintra-palaces",
    title: "Sintra Palaciana",
    shortTitle: "Sintra",
    sub: "Palácio da Pena · Regaleira · Monserrate",
    duration: "8h",
    maxPax: 7,
    price: 380,
    tag: "O Favorito",
    desc: "Uma viagem no tempo pela arquitetura romântica de Sintra. Explore o Palácio da Pena e a Quinta da Regaleira com o acompanhamento de um motorista especialista na vila.",
    img: "https://images.pexels.com/photos/1010657/pexels-photo-1010657.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    id: "alentejo-wine",
    title: "Alentejo & Herdades",
    shortTitle: "Alentejo",
    sub: "Évora · Provas de Vinho · Azeites",
    duration: "10h",
    maxPax: 7,
    price: 490,
    tag: "Experiência Curada",
    desc: "Descubra a alma do Alentejo. Visita guiada a Évora (Património UNESCO), seguida de uma degustação privada em herdades de renome internacional.",
    img: "https://images.pexels.com/photos/592753/pexels-photo-592753.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    id: "douro-valley",
    title: "Vinhos do Douro",
    shortTitle: "Douro",
    sub: "Peso da Régua · Pinhão · Cruzeiro Privado",
    duration: "Dia Inteiro",
    maxPax: 6,
    price: 560,
    tag: "Luxo Rural",
    desc: "A região vinícola demarcada mais antiga do mundo. Cruzeiro privativo pelo rio Douro e visitas exclusivas às quintas onde nasce o Vinho do Porto.",
    img: "https://images.unsplash.com/photo-1559827291-72ee739d0d9a?w=800&q=80",
  },
  {
    id: "obidos-nazare",
    title: "Vilas Medievais e Mar",
    shortTitle: "Óbidos/Nazaré",
    sub: "Castelo de Óbidos · Farol da Nazaré",
    duration: "9h",
    maxPax: 7,
    price: 420,
    tag: "Tradição",
    desc: "Caminhe pelas muralhas de Óbidos e sinta a força do Atlântico na Nazaré, palco das maiores ondas do mundo. Uma ligação perfeita entre história e natureza.",
    img: "https://images.pexels.com/photos/1612351/pexels-photo-1612351.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    id: "algarve-private",
    title: "Costa Algarvia Privada",
    shortTitle: "Algarve",
    sub: "Lagos · Sagres · Grutas Marítimas",
    duration: "Full Day",
    maxPax: 6,
    price: 650,
    tag: "Exclusivo",
    desc: "Explore o sul de Portugal com total privacidade. Das arribas de Sagres às águas turquesa de Lagos, uma jornada inesquecível pelo litoral algarvio.",
    img: "https://images.pexels.com/photos/1285625/pexels-photo-1285625.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    id: "setubal-arrabida",
    title: "Arrábida & Setúbal",
    shortTitle: "Arrábida",
    sub: "Serra da Arrábida · Moscatel · Praias",
    duration: "6h",
    maxPax: 7,
    price: 310,
    tag: "Refúgio Local",
    desc: "A beleza crua da Serra da Arrábida e as suas praias de águas cristalinas. Inclui paragem para prova do icónico Moscatel de Setúbal nas caves José Maria da Fonseca.",
    img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
  },
];

