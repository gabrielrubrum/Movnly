# --- Build Stage ---
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependências necessárias para compilação (bcrypt, prisma, etc)
RUN apk add --no-cache python3 make g++

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

RUN npm run build

# --- Production Stage ---
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

ENV NODE_ENV=production
ENV PORT=3002

EXPOSE 3002

# O comando de inicialização executa as migrações e depois o servidor
CMD npx prisma migrate deploy && node dist/main.js
