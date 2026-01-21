# Configurações de Deploy
$VPS_IP = "69.62.97.6"
$USER = "root"
$REMOTE_DIR = "/root/aipensa"

Write-Host "Iniciando deploy para $VPS_IP..."

# 1. Verificar conexão SSH e aceitar host key
Write-Host "Verificando conexão SSH..."
ssh -o StrictHostKeyChecking=no $USER@$VPS_IP "echo 'Conexão OK'"
if ($LASTEXITCODE -ne 0) {
    Write-Error "Falha na conexão SSH. Verifique sua senha ou chave."
    exit
}

# 2. Criar diretório remoto
Write-Host "Criando diretório remoto..."
ssh $USER@$VPS_IP "mkdir -p $REMOTE_DIR"

# 3. Copiar arquivos
Write-Host "Copiando arquivos..."
# Usar scp para copiar arquivos essenciais
scp docker-compose.yml $USER@$VPS_IP:$REMOTE_DIR/
scp nginx-proxy.conf $USER@$VPS_IP:$REMOTE_DIR/
scp deploy.sh $USER@$VPS_IP:$REMOTE_DIR/
scp .env $USER@$VPS_IP:$REMOTE_DIR/

# Copiar pastas de código (excluindo node_modules)
# Nota: rsync seria melhor, mas scp -r funciona se tivermos cuidado com tamanho.
# Como scp não tem exclude fácil, vamos zipar localmente e enviar.

Write-Host "Zipando código fonte (backend)..."
Compress-Archive -Path "backend" -DestinationPath "backend.zip" -Force
Write-Host "Enviando backend.zip..."
scp backend.zip $USER@$VPS_IP:$REMOTE_DIR/

Write-Host "Zipando código fonte (frontend)..."
Compress-Archive -Path "frontend" -DestinationPath "frontend.zip" -Force
Write-Host "Enviando frontend.zip..."
scp frontend.zip $USER@$VPS_IP:$REMOTE_DIR/

# 4. Executar script de deploy remoto
Write-Host "Executando script de deploy remoto..."
ssh $USER@$VPS_IP "cd $REMOTE_DIR && \
    unzip -o backend.zip -d . && \
    unzip -o frontend.zip -d . && \
    chmod +x deploy.sh && \
    ./deploy.sh"

Write-Host "Deploy concluído! Acesse http://aipensa.com"

# Limpeza local
Remove-Item backend.zip
Remove-Item frontend.zip
