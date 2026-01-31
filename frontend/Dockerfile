# Estágio de Build
FROM node:16-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./

# Instalar dependências
RUN npm install --legacy-peer-deps

COPY . .

# Variável de ambiente para build (pode ser sobrescrita via ARG no docker-compose)
# ENV NODE_OPTIONS=--openssl-legacy-provider
ARG REACT_APP_BACKEND_URL
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL
ARG REACT_APP_FACEBOOK_APP_ID
ENV REACT_APP_FACEBOOK_APP_ID=$REACT_APP_FACEBOOK_APP_ID

# Build do React
RUN npm run build:docker

# --- Estágio de Produção ---
FROM nginx:stable-alpine

# Copiar build do React
COPY --from=builder /app/build /usr/share/nginx/html

# Copiar configuração personalizada do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
