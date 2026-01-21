# Deploy em VPS (Docker)

## Pré-requisitos

- VPS Linux (Ubuntu 20.04+ recomendado)
- Domínios apontados para o IP da VPS:
  - `aipensa.com` e `www.aipensa.com` (frontend)
  - `api.aipensa.com` (backend)
- Portas liberadas no firewall: 80 e 443
- Docker + Docker Compose instalados

## 1) Configurar variáveis

Edite o arquivo [.env](file:///c:/ZAPCASH/zappro/zappro/whaticket/.env) na raiz e preencha:

- `BACKEND_DOMAIN` e `FRONTEND_DOMAIN`
- `JWT_SECRET` e `JWT_REFRESH_SECRET` (use valores fortes)
- `REDIS_PASS`
- `VERIFY_TOKEN` (para validação do webhook do Meta)
- `FACEBOOK_APP_ID` e `FACEBOOK_APP_SECRET` (do Meta Developers)

## 2) Ajustar domínios do Nginx

Edite o arquivo [nginx-proxy.conf](file:///c:/ZAPCASH/zappro/zappro/whaticket/nginx-proxy.conf) e troque:

- `api.seudominio.com` pelo seu domínio do backend
- `app.seudominio.com` e `www.app.seudominio.com` pelo seu domínio do frontend

## 3) Subir containers

Na pasta do projeto:

- `docker compose up -d --build`

Isso sobe:

- Postgres (porta interna 5432)
- Redis (porta interna 6379)
- Backend (porta interna 8080)
- Frontend (porta interna 80)
- Nginx (80/443)

## 4) HTTPS (Certbot)

O `docker-compose.yml` já inclui o container `certbot` e os volumes.

Passo comum para gerar o certificado (substitua pelos seus domínios):

- `docker compose run --rm certbot certonly --webroot -w /var/www/certbot -d app.seudominio.com -d www.app.seudominio.com -d api.seudominio.com --email seuemail@seudominio.com --agree-tos --no-eff-email`

Depois disso, você deve adicionar blocos `listen 443 ssl;` no [nginx-proxy.conf](file:///c:/ZAPCASH/zappro/zappro/whaticket/nginx-proxy.conf) apontando para:

- `ssl_certificate /etc/letsencrypt/live/<dominio>/fullchain.pem;`
- `ssl_certificate_key /etc/letsencrypt/live/<dominio>/privkey.pem;`

E reiniciar o nginx:

- `docker compose restart nginx`

## 5) Observações sobre Meta (Facebook/Instagram)

- O frontend precisa do App ID em build time (Create React App):
  - `FACEBOOK_APP_ID` da raiz é repassado no build como `REACT_APP_FACEBOOK_APP_ID` via `docker-compose.yml`.
- O backend usa `FACEBOOK_APP_ID` e `FACEBOOK_APP_SECRET` para trocar tokens no Graph API.
- O webhook do Meta usa `VERIFY_TOKEN` e o endpoint do backend é:
  - `https://api.aipensa.com/webhook`
