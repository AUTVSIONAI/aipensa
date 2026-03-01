#!/bin/bash

# Carregar variáveis do .env
if [ -f .env ]; then
  export $(echo $(cat .env | sed 's/#.*//g' | xargs) | envsubst)
else
  echo "Erro: Arquivo .env não encontrado!"
  exit 1
fi

echo "--- Iniciando Deploy ZAPCASH ---"
echo "Backend Domain: $BACKEND_DOMAIN"
echo "Frontend Domain: $FRONTEND_DOMAIN"

# Gerar nginx configs a partir dos templates
echo "Configurando Nginx..."
envsubst '${BACKEND_DOMAIN} ${FRONTEND_DOMAIN}' < nginx-proxy.conf.template > nginx-proxy.conf
if [ -f nginx-proxy-ssl.conf.template ]; then
  envsubst '${BACKEND_DOMAIN} ${FRONTEND_DOMAIN}' < nginx-proxy-ssl.conf.template > nginx-proxy-ssl.conf
fi

# Verificar Docker
if ! command -v docker &> /dev/null
then
    echo "Docker não encontrado. Instalando..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
fi

# Verificar Docker Compose
if ! command -v docker-compose &> /dev/null
then
    echo "Instalando Docker Compose..."
    sudo apt-get install -y docker-compose
fi

# Subir Containers
echo "Subindo containers (isso pode demorar na primeira vez)..."
docker-compose up -d --build

echo "Aguardando Banco de Dados iniciar..."
sleep 20

# Rodar Migrations
echo "Rodando Migrations e Seeds..."
docker-compose exec backend npx sequelize db:migrate
docker-compose exec backend npx sequelize db:seed:all

echo "--- DEPLOY CONCLUÍDO ---"
echo "Acesse: https://$FRONTEND_DOMAIN"
echo "API: https://$BACKEND_DOMAIN"
echo "IMPORTANTE: Para ativar HTTPS, rode o certbot manualmente ou descomente a seção SSL no nginx-proxy.conf após gerar os certificados."
