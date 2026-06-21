export const VEHICLE_CATEGORIES = [
  {
    id: "smart",
    name: "Economy",
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
    name: "Conforto",
    tagline: "Elegaância e Performance",
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
    name: "Monovolume",
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
    name: "Executivo",
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

// ── Preços ao Cliente (Lisboa) ────────────────────────────────────────
// Margem plataforma: ~55–60%   |   Driver: flat rate fixo
export const LISBON_PRICES: Record<string, number> = {
  smart: 22.5,     // Econômico
  comfort: 28,     // Conforto
  group: 35,       // Monovolume
  executive: 39.5, // Executivo
};

// ── Preços ao Cliente (Cascais ~30 km) ───────────────────────────────
// Margem plataforma: ~40–45%   |   Driver: flat rate fixo
export const CASCAIS_PRICES: Record<string, number> = {
  smart: 31,       // Econômico
  comfort: 38,     // Conforto
  group: 43,       // Monovolume
  executive: 48,   // Executivo
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
  { id: "baby_seat", name: "Cadeira de bebé", description: "Cadeira de segurança para crianças pequenas.", price: 10, icon: "baby" },
  { id: "booster", name: "Assento elevatório", description: "Assento elevatório para crianças mais velhas.", price: 8, icon: "child" },
  { id: "meet_greet", name: "Meet & Greet", description: "Recepção personalizada no terminal com placa nominal.", price: 0, icon: "handshake" },
  { id: "name_board", name: "Placa personalizada", description: "O motorista aguarda com uma placa com o seu nome.", price: 0, icon: "sign" },
  { id: "water", name: "Água a bordo", description: "Água engarrafada disponível durante a viagem.", price: 5, icon: "droplet" },
  { id: "wifi", name: "Wi-Fi de Alta Velocidade", description: "Conexão Wi-Fi de alta velocidade a bordo.", price: 8, icon: "wifi" },
  { id: "extra_stop", name: "Paragem adicional", description: "Adicione paragens ao longo do trajeto.", price: 20, icon: "map-pin" },
  { id: "extra_wait", name: "Tempo extra de espera", description: "Aguardamos o tempo adicional necessário para o seu conforto.", price: 15, icon: "clock" },
  { id: "return_transfer", name: "Transfer de Retorno", description: "Reserve também a viagem de volta.", price: 25, icon: "refresh-cw" },
  { id: "private_tour", name: "Tour Privado", description: "Adicione um tour privado personalizado.", price: 50, icon: "map" },
  { id: "multilingual_driver", name: "Motorista Multilíngue", description: "Motorista com suporte multilíngue.", price: 18, icon: "globe" },
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

// ════════════════════════════════════════════════════════════════
//  TOURS — Destinos mais famosos e desejados de Portugal
//  Modelo financeiro dos Tours: 70% driver · 30% plataforma
//
//  Exemplo (Sintra €420):
//    → Driver:     €294  (70%)
//    → Plataforma: €126  (30%)
// ════════════════════════════════════════════════════════════════
export const TOURS = [
  {
    id: "sintra-palaces",
    title: "Sintra Palaciana",
    shortTitle: "Sintra",
    sub: "Palácio da Pena · Quinta da Regaleira · Monserrate",
    duration: "8h",
    maxPax: 7,
    price: 420,           // Driver: €294 · Plataforma: €126
    driverEarns: 294,
    platformEarns: 126,
    tag: "O Favorito",
    featured: true,
    desc: "O destino mais visitado de Portugal. Explore a arquitectura romántica e os jardins secretos de Sintra com um chauffeur especialista, sem filas nem stress.",
    img: "https://images.pexels.com/photos/1010657/pexels-photo-1010657.jpeg?auto=compress&cs=tinysrgb&w=800",
    highlights: ["Palácio da Pena", "Quinta da Regaleira", "Palácio de Monserrate", "Centro Histórico UNESCO"],
  },
  {
    id: "cascais-estoril",
    title: "Cascais & Riviera",
    shortTitle: "Cascais",
    sub: "Boca do Inferno · Casino Estoril · Praia do Guincho",
    duration: "5h",
    maxPax: 7,
    price: 280,           // Driver: €196 · Plataforma: €84
    driverEarns: 196,
    platformEarns: 84,
    tag: "Costa Dourada",
    featured: true,
    desc: "A vila mais sofisticada da Riviera Portuguesa. Da Boca do Inferno ao Casino mais antigo da Europa, passando pelas praias selvagens do Guincho.",
    img: "https://images.pexels.com/photos/1285625/pexels-photo-1285625.jpeg?auto=compress&cs=tinysrgb&w=800",
    highlights: ["Boca do Inferno", "Casino Estoril", "Praia do Guincho", "Marina de Cascais"],
  },
  {
    id: "obidos-nazare",
    title: "Óbidos & Nazaré",
    shortTitle: "Óbidos/Nazaré",
    sub: "Castelo Medieval · Ondas Gigantes · Aldeia Branca",
    duration: "9h",
    maxPax: 7,
    price: 460,           // Driver: €322 · Plataforma: €138
    driverEarns: 322,
    platformEarns: 138,
    tag: "Ícone de Portugal",
    desc: "Caminhe nas muralhas medievais de Óbidos e testemunhe as maiores ondas surfadas do mundo na Nazaré — dois dos cartões postais mais icónicos de Portugal.",
    img: "https://images.pexels.com/photos/1612351/pexels-photo-1612351.jpeg?auto=compress&cs=tinysrgb&w=800",
    highlights: ["Castelo de Óbidos", "Farol da Nazaré", "Praia Norte", "Ginjinha de Óbidos"],
  },
  {
    id: "setubal-arrabida",
    title: "Serra da Arrábida",
    shortTitle: "Arrábida",
    sub: "Praias Cristalinas · Moscatel · Reserva Natural",
    duration: "6h",
    maxPax: 7,
    price: 330,           // Driver: €231 · Plataforma: €99
    driverEarns: 231,
    platformEarns: 99,
    tag: "Mar Azul Turquesa",
    desc: "As praias mais bonitas da costa portuguesa, com águas que rivalizam com o Mediterrâneo. Inclui prova de Moscatel nas caves históricas de Setúbal.",
    img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80",
    highlights: ["Praia de Galapinhos", "Serra da Arrábida", "Caves José Maria da Fonseca", "Portinho da Arrábida"],
  },
  {
    id: "alentejo-wine",
    title: "Alentejo & Herdades",
    shortTitle: "Alentejo",
    sub: "Évora UNESCO · Provas Privadas · Planície Dourada",
    duration: "10h",
    maxPax: 7,
    price: 520,           // Driver: €364 · Plataforma: €156
    driverEarns: 364,
    platformEarns: 156,
    tag: "Experiência Curada",
    desc: "Descubra a alma do Alentejo. Visita guiada a Évora (Património UNESCO), seguida de uma degustação privada em herdades de renome internacional e almoço típico.",
    img: "https://images.pexels.com/photos/592753/pexels-photo-592753.jpeg?auto=compress&cs=tinysrgb&w=800",
    highlights: ["Évora UNESCO", "Cromeleque dos Almendres", "Herdade Vinícola Privada", "Gastronomia Alentejana"],
  },
  {
    id: "algarve-private",
    title: "Algarve Privado",
    shortTitle: "Algarve",
    sub: "Lagos · Sagres · Ponta mais Ocidental da Europa",
    duration: "Full Day",
    maxPax: 6,
    price: 680,           // Driver: €476 · Plataforma: €204
    driverEarns: 476,
    platformEarns: 204,
    tag: "Exclusivo",
    desc: "Do Cabo de São Vicente — o fim do mundo dos navegadores — às grutas marinhas de Lagos. A rota mais épica do litoral algarvio em total privacidade.",
    img: "https://images.pexels.com/photos/1482193/pexels-photo-1482193.jpeg?auto=compress&cs=tinysrgb&w=800",
    highlights: ["Cabo de São Vicente", "Praia da Marinha", "Grutas de Benagil", "Lagos Centro Histórico"],
  },
  {
    id: "lisbon-highlights",
    title: "Lisboa Essencial",
    shortTitle: "Lisboa",
    sub: "Belém · Alfama · Castelo de São Jorge · Tram 28",
    duration: "4h",
    maxPax: 7,
    price: 220,           // Driver: €154 · Plataforma: €66
    driverEarns: 154,
    platformEarns: 66,
    tag: "Clássico",
    desc: "Os pontos mais emblemáticos de Lisboa num só dia. Do Mosteiro dos Jerónimos à vista panorâmica do Castelo, com paragem obrigatória para pastel de nata em Belém.",
    img: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&q=80",
    highlights: ["Mosteiro dos Jerónimos", "Torre de Belém", "Castelo de São Jorge", "Miradouro da Graça"],
  },
  {
    id: "summer-tour",
    title: "Comporta & Melides",
    shortTitle: "Comporta",
    sub: "Arrozais · Praias Virgens · Alentejo Costeiro",
    duration: "7h",
    maxPax: 6,
    price: 390,           // Driver: €273 · Plataforma: €117
    driverEarns: 273,
    platformEarns: 117,
    tag: "Edição Verão",
    featured: true,
    desc: "O segredo mais bem guardado de Portugal. Comporta e Melides são o destino preferido da realeza e das celebridades europeias — praias desertas e arrozais infinitos.",
    img: "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=800&q=80",
    highlights: ["Praia da Comporta", "Arrozais do Sado", "Melides Lagoon", "Gastronomia de Mariscos"],
  },
];


