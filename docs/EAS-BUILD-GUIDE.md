# MOVNLY — Guia EAS Build (iOS + Android)

## Pré-requisitos

1. Conta [Expo](https://expo.dev/signup)
2. Node 20+
3. Para iOS: conta Apple Developer ($99/ano)
4. Para Android: conta Google Play Console ($25 única)

## Passo 1 — Instalar EAS CLI

```bash
npm install -g eas-cli
eas login
```

## Passo 2 — Ligar o projeto

```bash
cd mobile
eas init
```

Isto cria o `projectId` no `app.json`. Aceita quando perguntar se queres criar o projeto na Expo.

## Passo 3 — Variáveis de ambiente

Edita `mobile/.env`:

```env
EXPO_PUBLIC_API_URL=http://SEU_IP:3002        # dev local
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...  # Stripe Dashboard
```

No backend `.env`, adiciona também:

```env
STRIPE_PUBLISHABLE_KEY=pk_live_...
```

> A chave `pk_live_` corresponde à tua `sk_live_` no [Stripe Dashboard → API keys](https://dashboard.stripe.com/apikeys).

## Passo 4 — Development build (Stripe + Push)

O Expo Go **não suporta** Stripe nativo nem push em produção. Usa development build:

```bash
# Android APK (instala direto no telemóvel)
eas build --profile development --platform android

# iOS simulador (Mac)
eas build --profile development --platform ios

# iOS dispositivo físico (precisa Apple Developer)
eas build --profile development --platform ios --local
```

Após o build, instala o APK/IPA e corre:

```bash
npx expo start --dev-client
```

## Passo 5 — Preview (teste interno)

```bash
eas build --profile preview --platform all
```

Distribui o link de download da Expo para testers.

## Passo 6 — Produção (App Store + Play Store)

### Android

1. Cria service account no Google Cloud Console
2. Liga ao Play Console → API access
3. Descarrega JSON → `mobile/google-play-service-account.json`
4. Atualiza `eas.json` → `submit.production.android`
5. Build + submit:

```bash
eas build --profile production --platform android
eas submit --platform android --latest
```

### iOS

1. Cria app no [App Store Connect](https://appstoreconnect.apple.com)
2. Copia o **App ID** (número) para `eas.json`
3. Copia o **Team ID** da Apple Developer
4. Build + submit:

```bash
eas build --profile production --platform ios
eas submit --platform ios --latest
```

## Passo 7 — Ícones (obrigatório antes de publicar)

Coloca estes ficheiros em `mobile/assets/`:

| Ficheiro | Tamanho |
|----------|---------|
| `icon.png` | 1024×1024 |
| `adaptive-icon.png` | 1024×1024 (Android) |
| `splash.png` | 1284×2778 |

Depois atualiza `app.json`:

```json
"icon": "./assets/icon.png",
"splash": { "image": "./assets/splash.png", ... }
```

## Profiles disponíveis

| Profile | Uso | API URL |
|---------|-----|---------|
| `development` | Dev client + simulador | IP local |
| `preview` | Teste interno APK | api.movnly.com |
| `production` | App Store / Play Store | api.movnly.com |

## Contas demo (após seed)

| Role | Email | Password |
|------|-------|----------|
| Parceiro | parceiro@movnly.com | Partner2026_Elite! |
| Motorista | chauffeur.prime@movnly.com | Driver2026_Elite! |
| Admin | admin@movnly.com | (INITIAL_ADMIN_PASSWORD no seed) |
| Cliente | gabrielflamengof50@gmail.com | Gabriel1512@# |

## Troubleshooting

- **API não conecta no telemóvel:** usa o IP da rede (`192.168.x.x`), não `localhost`
- **PostgreSQL:** Docker na porta `5433` → `DATABASE_URL=...@localhost:5433/movnly`
- **Stripe mock:** sem `pk_live_` configurado, pagamentos entram em modo simulado
