# Guia de Deploy - Whaticket (Via GitHub)

Este guia orienta a instalação do sistema na sua VPS usando o repositório GitHub.

## Pré-requisitos
- VPS Ubuntu 20.04 ou superior.
- Domínio apontado para o IP da VPS (aipensa.com -> 69.62.97.6).
- Acesso SSH à VPS.

## Passo a Passo

### 1. Acessar a VPS
Abra seu terminal ou Putty:
```bash
ssh root@69.62.97.6
```

### 2. Clonar o Repositório
Baixe o código atualizado do GitHub:
```bash
cd /root
git clone https://github.com/AUTVSIONAI/aipensa.git whaticket
cd whaticket
```

### 3. Criar o Arquivo de Configuração (.env)
O arquivo `.env` não vai para o GitHub por segurança. Crie-o manualmente:

```bash
nano .env
```

Cole o seguinte conteúdo (ajuste as senhas se desejar):

```env
DB_USER=zapcash_user
DB_PASS=zapcash_secure_password
DB_NAME=zapcash_db
REDIS_PASS=sua_senha_redis
JWT_SECRET=super_secret_jwt_key_change_me
JWT_REFRESH_SECRET=super_secret_refresh_key_change_me

# Domínios
BACKEND_DOMAIN=api.aipensa.com
FRONTEND_DOMAIN=aipensa.com

VERIFY_TOKEN=change_me
FACEBOOK_APP_ID=896644689531143
FACEBOOK_APP_SECRET=98fc067dc6c91b2b502038e6d07900e8
```
*Para salvar no nano: `Ctrl+O`, `Enter`, `Ctrl+X`.*

### 4. Executar o Script de Instalação
Dê permissão e rode o script automático:
```bash
chmod +x setup_vps.sh
./setup_vps.sh
```

### O que o script fará:
1. Instalará Docker e Docker Compose.
2. Subirá os containers (Backend, Frontend, Banco, Redis).
3. Gerará certificados SSL gratuitos (HTTPS).
4. Configurará o Nginx.

### 5. Verificar Instalação
Acesse no navegador:
- Frontend: https://aipensa.com
- Backend: https://api.aipensa.com
