#!/bin/bash

# Configurações
DOMAIN="aipensa.com"
EMAIL="contato@aipensa.com" # Altere se desejar
PROJECT_DIR="/root/whaticket"

echo "=== Iniciando Setup do VPS para $DOMAIN ==="

# 1. Instalar Docker e Docker Compose (se não existirem)
if ! command -v docker &> /dev/null; then
    echo "Docker não encontrado. Instalando..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
else
    echo "Docker já instalado."
fi

# 2. Permissões
echo "Ajustando permissões..."
chmod +x backend/wait-for-it.sh 2>/dev/null

# 3. Build e Start Inicial (HTTP apenas)
echo "Subindo containers (HTTP)..."
# Garante que usamos o nginx-proxy.conf (HTTP)
cp nginx-proxy.conf nginx-proxy-active.conf
# Atualiza docker-compose para usar o nginx-proxy-active.conf se necessário, 
# mas no nosso caso o docker-compose.yml aponta para nginx-proxy.conf.
# Então vamos garantir que nginx-proxy.conf seja o arquivo HTTP.
# (Assumindo que o arquivo enviado nginx-proxy.conf é o HTTP)

docker compose up -d --build

echo "Aguardando 10 segundos para serviços subirem..."
sleep 10

# 4. Gerar Certificados SSL
echo "Gerando certificados SSL..."
docker compose run --rm certbot certonly --webroot \
    -w /var/www/certbot \
    -d "$DOMAIN" -d "www.$DOMAIN" -d "api.$DOMAIN" \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    --force-renewal

# 5. Configurar HTTPS
if [ -d "./certbot/conf/live/$DOMAIN" ]; then
    echo "Certificados gerados com sucesso!"
    echo "Ativando configuração HTTPS..."
    
    # Substitui o conf do nginx pelo versão SSL
    cp nginx-proxy-ssl.conf nginx-proxy.conf
    
    # Reinicia o Nginx para pegar a nova configuração e certificados
    docker compose restart nginx
    
    echo "=== Setup Concluído! ==="
    echo "Acesse: https://$DOMAIN"
else
    echo "ERRO: Falha ao gerar certificados. Verifique se o domínio aponta para este IP."
fi
