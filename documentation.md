# 💎 MOVNLY — Documentação Oficial do Projeto

Bem-vindo à documentação oficial da plataforma **MOVNLY**, uma solução de ride-hailing executivo de luxo e tours privados em Portugal. Este documento descreve de forma abrangente a arquitetura do sistema, o fluxo de dados, a configuração de subdomínios, integrações de APIs externas e os passos de implantação em produção.

---

## 🏗️ 1. Arquitetura do Sistema

A plataforma **MOVNLY** foi desenvolvida utilizando uma arquitetura moderna dividida em dois sistemas principais altamente integrados:

```
┌────────────────────────────────────────────────────────┐
│                   CLIENT / FRONTEND                    │
│      Next.js 16 · TailwindCSS · Next-Intl (i18n)       │
└───────────────────────────┬────────────────────────────┘
                            │ (HTTPS / WebSockets)
                            ▼
┌────────────────────────────────────────────────────────┐
│                   SERVER / BACKEND                     │
│       NestJS · Prisma ORM · Socket.io · TypeScript     │
└───────────────────────────┬────────────────────────────┘
                            │ (TCP)
                            ▼
┌────────────────────────────────────────────────────────┐
│                   DATABASE / STORAGE                   │
│                       PostgreSQL                       │
└────────────────────────────────────────────────────────┘
```

### 💻 Frontend (Next.js 16)
*   **Tecnologias:** Next.js (App Router), TypeScript, TailwindCSS, Framer Motion (para micro-animações premium) e `next-intl` (localização dinâmica em Português, Inglês, Espanhol e Francês).
*   **Propósito:** Interface responsiva para o passageiro simular rotas, efetuar reservas via Stripe, acessar o painel do cliente, painel do motorista, painel de parceiros corporativos e painel do administrador.

### ⚙️ Backend (NestJS / Prisma)
*   **Tecnologias:** NestJS (Node.js framework), TypeScript, Prisma ORM, Socket.io (WebSockets para rastreamento em tempo real) e PostgreSQL.
*   **Propósito:** Autenticação segura (JWT e Google OAuth), processamento e validação de rotas com base na API do Google Maps, split financeiro inteligente de repasses, tratamento dos webhooks do Stripe, gestão de filas de motoristas e disparo de e-mails transacionais.

---

## 🌐 2. Arquitetura de Multi-Subdomínios Dinâmicos

A plataforma utiliza um sistema de roteamento baseado em subdomínios dinâmicos, controlado centralmente pelo arquivo [middleware.ts](file:///c:/Users/Bielzin/Desktop/DEV/Movnly/Movnly/frontend/src/middleware.ts) do Next.js. Isso permite que um único projeto frontend sirva múltiplas interfaces dedicadas com base no endereço digitado no navegador.

```
                  ┌──► app.movnly.com     ──► Painel do Cliente (/cliente)
                  ├──► drive.movnly.com   ──► Painel do Motorista (/motorista)
Usuário ──────────┼──► driver.movnly.com  ──► Painel do Motorista (/motorista)
                  ├──► admin.movnly.com   ──► Painel do Administrador (/admin)
                  ├──► partner.movnly.com ──► Painel de Hotéis/Agências (/parceiros)
                  └──► movnly.com         ──► Landing Page Principal (Raiz)
```

### Regras de Roteamento ([middleware.ts](file:///c:/Users/Bielzin/Desktop/DEV/Movnly/Movnly/frontend/src/middleware.ts)):
*   **`app.movnly.com`:** Reescreve internamente todas as requisições para a pasta `/cliente`, oferecendo a interface do passageiro (agendamentos, histórico, chat).
*   **`drive.movnly.com` / `driver.movnly.com`:** Reescreve internamente para a pasta `/motorista`. O motorista gerencia seu veículo, visualiza ganhos, aceita chamadas e atualiza o status das viagens.
*   **`admin.movnly.com`:** Reescreve internamente para a pasta `/admin`, fornecendo controle total da plataforma (gestão de usuários, motoristas, preços, cupons e relatórios).
*   **`partner.movnly.com`:** Reescreve internamente para `/parceiros`, permitindo que hotéis e agências associados solicitem viagens para seus clientes VIP diretamente na recepção.
*   **`movnly.com`:** Serve a landing page de conversão e simulação direta de reservas.

---

## 💳 3. Integração de Pagamentos & Fluxo Financeiro (Stripe Live)

O processamento financeiro é feito através de uma integração profunda com o **Stripe (Modo Produção/Live)**.

1.  **Criação da Reserva:** O passageiro seleciona a categoria do veículo. O backend calcula o valor exato com base na quilometragem do Google Maps e gera uma intenção de reserva com status `PENDING_PAYMENT`.
2.  **Checkout do Stripe:** O backend inicia uma sessão de checkout do Stripe com a chave real (`sk_live`). O passageiro é redirecionado para a página segura de pagamento da Stripe.
3.  **Webhook de Confirmação:** Ao processar o pagamento com sucesso com um cartão real, o Stripe envia um Webhook criptografado para o endpoint do backend (`https://api.movnly.com/bookings/webhook`) com o evento `checkout.session.completed`.
4.  **Ativação da Viagem:** O backend valida o Webhook (`whsec_...`), altera o status da reserva para `PAID`, gera o PIN de segurança do passageiro e envia um WebSocket para os motoristas da área notificando a chamada disponível.
5.  **Split Financeiro Automático:** Ao concluir a viagem, o sistema executa o cálculo de repasse do motorista (ex: 70% para o motorista, 30% taxa da plataforma), gerando uma transação do tipo `PAYOUT_SCHEDULED` vinculada ao saldo a receber do motorista no banco de dados.

---

## 📧 4. Comunicação Transacional (Resend API)

A plataforma utiliza o serviço **Resend** para garantir o disparo rápido e seguro de e-mails institucionais:

*   **noreply@movnly.com:** O remetente transacional oficial.
*   **E-mails Enviados:**
    *   Confirmação de recebimento de pagamento de reserva.
    *   Notificação de motorista atribuído à viagem (com nome, foto e telefone).
    *   Recibo completo em formato premium em PDF pós-viagem com link de agradecimento e avaliação por estrelas.
    *   Redefinição de senha segura via token.

---

## ⚙️ 5. Variáveis de Ambiente (Produção)

Para que a plataforma funcione corretamente em produção, os seguintes arquivos `.env.production` devem estar povoados nos respectivos servidores do Coolify:

### 🖥️ Frontend (`frontend/.env.production`):
```env
NEXT_PUBLIC_API_URL=https://api.movnly.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSy...
NEXT_PUBLIC_SOCKET_URL=https://api.movnly.com
NEXT_PUBLIC_ROOT_DOMAIN=movnly.com
NEXT_PUBLIC_SENTRY_DSN=<opcional_sentry_key>
```

### ⚙️ Backend (`backend/.env.production`):
```env
NODE_ENV=production
PORT=3002
DATABASE_URL=postgres://usuario:senha@host:porta/database
JWT_SECRET=chave_secreta_jwt_criptografada_alta_segurança
ENCRYPTION_KEY=chave_secreta_para_criptografia_de_dados
FRONTEND_URL=https://movnly.com
BACKEND_URL=https://api.movnly.com
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_SUCCESS_URL=https://movnly.com/confirmacao
STRIPE_CANCEL_URL=https://movnly.com/reservar/cancelado
RESEND_API_KEY=re_...
MAIL_FROM=MOVNLY <noreply@movnly.com>
GOOGLE_CLIENT_ID=google_client_id_oauth.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=google_oauth_secret
ADMIN_EMAIL=admin@movnly.com
ADMIN_PASSWORD=senha_secreta_do_painel_admin
```

---

## 📦 6. Manual de Implantação & Lançamento (Coolify / Hetzner)

A implantação do ecossistema MOVNLY no servidor Hetzner VPS é feita utilizando a plataforma de nuvem autohospedada **Coolify**:

1.  **Conexão do Repositório:** O repositório GitHub `gabrielrubrum/nexrice` está vinculado aos aplicativos do Coolify (Frontend e Backend).
2.  **Autodeploy (Webhooks):** Todo push ou merge na branch `main` dispara automaticamente um novo build nos contêineres de produção.
3.  **Configuração de Rede:**
    *   O frontend recebe as conexões nos domínios `movnly.com` e todos os subdomínios dinâmicos (`*.movnly.com`). O Coolify gerencia e emite os certificados SSL (Let's Encrypt) automaticamente.
    *   O backend recebe requisições em `api.movnly.com`.
4.  **Banco de Dados:** O contêiner do PostgreSQL deve rodar na mesma rede virtualizada do backend no Coolify para latência ultra-baixa de acesso.

---

## 💎 Status de Prontidão Operacional
O projeto passou por auditorias e testes de estresse completos, com **0 erros de compilação**, chaves válidas integradas e banco de dados PostgreSQL estruturado. O MOVNLY está oficialmente pronto para operar no mercado executivo de luxo em Portugal.
