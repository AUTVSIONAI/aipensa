# Estágio de Build
FROM node:20-bookworm-slim AS builder

WORKDIR /app

# Instalar dependências de build (python, make, g++) se necessário para módulos nativos
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json* ./

# Instalar TODAS as dependências (incluindo dev) para compilar o TS
RUN npm install --legacy-peer-deps

COPY . .

# Compilar o TypeScript
RUN npm run build

# --- Estágio de Produção ---
FROM node:20-bookworm-slim

WORKDIR /app

# Instalar dependências do sistema necessárias para o Puppeteer/Chrome
RUN apt-get update && apt-get install -y \
    chromium \
    libgbm-dev \
    libnss3 \
    libatk-bridge2.0-0 \
    libgtk-3-0 \
    libasound2 \
    git \
    && rm -rf /var/lib/apt/lists/*

# Configurar variáveis para o Puppeteer usar o Chromium instalado
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Copiar package.json
COPY package.json ./

# Instalar apenas dependências de produção
RUN npm install --only=production --legacy-peer-deps

# Copiar a aplicação compilada do estágio de build
COPY --from=builder /app/dist ./dist
# Copiar .sequelizerc para que o CLI do Sequelize saiba onde estão as configs
COPY --from=builder /app/.sequelizerc ./.sequelizerc
# Copiar pasta public se existir (ativos estáticos)
COPY --from=builder /app/public ./public
# Copiar certificados se existirem (mas idealmente usar volumes)
# COPY --from=builder /app/certs ./certs

EXPOSE 8080

ENV NODE_ENV=production
ENV PORT=8080

CMD ["node", "dist/server.js"]
