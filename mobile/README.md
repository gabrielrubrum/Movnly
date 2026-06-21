# MOVNLY Mobile

App nativo iOS e Android (React Native + Expo) que partilha a mesma API NestJS do frontend web.

## Portais incluídos

| Role | Tabs | API |
|------|------|-----|
| **PASSENGER** | Início, Viagens, Reservar, Perfil | `/bookings`, `/auth` |
| **DRIVER** | Painel, Viagens, Ganhos, Conta | `/bookings`, `/driver`, `/payments/stats/driver` |
| **PARTNER** | Dashboard, Reservas, Clientes, Comissões, Conta | `/partners/*` |

## Setup

```bash
cd mobile
cp .env.example .env
npm install
npm start
```

- **iOS:** `npm run ios` (requer Xcode + simulador)
- **Android:** `npm run android` (requer Android Studio + emulador)
- **Dispositivo físico:** Expo Go + `EXPO_PUBLIC_API_URL` apontando para o IP da máquina

## Funcionalidades integradas

- **Stripe** — `/(passenger)/payment` com Payment Sheet nativo
- **Push** — Expo Push → `POST /auth/push-token` (motoristas recebem `new_ride_available`)
- **GPS motorista** — `PATCH /driver/location` a cada 15s quando online

## Setup automático (Windows)

```powershell
.\scripts\setup-mobile.ps1
```

## Build produção (EAS)

```bash
npm install -g eas-cli
eas login
eas build --platform all
```

Configure em `mobile/.env`:
- `EXPO_PUBLIC_API_URL=https://api.movnly.com`
- `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...`

> Stripe e push notifications requerem **development build** (`eas build --profile development`), não funcionam no Expo Go padrão.

## Estrutura

```
mobile/
├── app/                    # Expo Router (file-based)
│   ├── (auth)/login.tsx
│   ├── (passenger)/        # App passageiro
│   ├── (driver)/           # App motorista
│   └── (partner)/          # App parceiro
└── src/
    ├── lib/                # api, auth, theme, socket, types
    ├── components/         # UI reutilizável
    └── hooks/              # useBookings, etc.
```

## Design

Reutiliza o tema luxury do web: fundo `#07070A`, accent gold `#D4AF37`, tipografia bold.
