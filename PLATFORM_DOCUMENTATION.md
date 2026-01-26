# 📘 Documentação Completa da Plataforma (AIPENSA/Whaticket)

Esta documentação detalha todas as funcionalidades, capacidades e integrações da plataforma. Este documento foi estruturado para ser lido por Assistentes de IA, Desenvolvedores e Gestores para compreender a totalidade do sistema.

---

## 1. Visão Geral do Sistema
A plataforma é um sistema de **Atendimento Multi-Canal (Omnichannel)** com foco em **WhatsApp**, integrado com capacidades avançadas de **Marketing (Meta Ads)** e **Inteligência Artificial (Superagent)**.

### Principais Pilares
1.  **Atendimento**: Gestão de tickets, filas, agentes e conexões (WhatsApp, Facebook, Instagram).
2.  **Automação**: Chatbots, fluxos de conversa e agendamentos.
3.  **Inteligência Artificial (Superagent)**: Agentes autônomos capazes de vender, dar suporte e executar ações de marketing.
4.  **Marketing 2.0**: Gestão de anúncios, criativos e postagens em redes sociais diretamente da plataforma.

---

## 2. Capacidades do Superagent (IA)

O "Superagent" é o cérebro de IA da plataforma. Ele intercepta mensagens e pode executar ações no mundo real através de "Tags de Comando" ou "Function Calling".

### 🧠 Configuração do Agente
- **Prompt do Sistema**: Instruções de personalidade e regras de negócio.
- **Contexto**: O agente recebe automaticamente:
    - Histórico da conversa.
    - Catálogo de Produtos do WhatsApp (se conectado).
    - Instruções de data/hora.
    - Transcrição de áudios (Whisper).
    - Imagens enviadas pelo usuário (Visão Computacional).

### 🛠️ Habilidades (Skills/Tools)
O agente pode executar as seguintes ações inserindo tags específicas na sua resposta:

#### A. Vendas e Catálogo
O agente tem acesso de leitura ao Catálogo do WhatsApp Business conectado.
- **Ação**: Enviar um cartão de produto para o cliente.
- **Comando**: `[SEND_PRODUCT: ID_DO_PRODUTO]`
- **Exemplo**: "Claro! Aqui está o nosso X-Bacon especial: [SEND_PRODUCT: 12345]"

#### B. Marketing e Ads (Meta)
O agente pode consultar dados de campanhas e performance.
- **Ação**: Consultar Insights (Métricas).
- **Comando**: 
  ```json
  [MARKETING] { "action": "get_insights", "period": "last_7d" } [/MARKETING]
  ```
- **Ação**: Listar Campanhas.
- **Comando**:
  ```json
  [MARKETING] { "action": "get_campaigns", "status": "ACTIVE" } [/MARKETING]
  ```

#### C. Gestão de Redes Sociais (Social Media)
O agente pode publicar conteúdo no Feed do Facebook e Instagram.
- **Ação**: Publicar Post.
- **Comando**:
  ```json
  [POST_FEED] { 
    "platform": "instagram", 
    "message": "Texto da legenda com hashtags #exemplo", 
    "image": "URL_DA_IMAGEM" 
  } [/POST_FEED]
  ```
  *Nota: Para Instagram, a imagem é obrigatória.*

#### D. Agendamento de Mensagens
O agente pode agendar lembretes ou mensagens futuras.
- **Ação**: Agendar mensagem.
- **Comando**:
  ```json
  [AGENDAR] { "sendAt": "2024-12-31T10:00:00", "body": "Olá, lembrete da reunião." } [/AGENDAR]
  ```

#### E. Transbordo (Human Handoff)
- **Ação**: Transferir para um humano/fila.
- **Comando**: Iniciar a resposta com `Ação: Transferir para o setor de atendimento`.

---

## 3. Módulo de Marketing

O módulo de Marketing permite gerenciar a presença digital e tráfego pago.

### Funcionalidades
1.  **Dashboard de Insights**:
    - Gráficos de Impressões, Alcance, Cliques, Gasto (Ads) e CTR.
    - Visão geral da conta de anúncios conectada.
2.  **Criação de Campanhas (Fluxo Rápido)**:
    - Criação simplificada de Campanhas > Conjuntos de Anúncios > Anúncios.
    - Foco em campanhas de "Mensagem para WhatsApp".
3.  **Gestão de Criativos**:
    - Upload de imagens/vídeos para a galeria da empresa.
    - Geração de Hash de imagem para uso em anúncios.
4.  **Publicar Conteúdo (Orgânico)**:
    - Postagem simultânea para Facebook e Instagram.
    - Upload de mídia local (Computador/Celular) ou via URL.
    - Agendamento de postagens.
5.  **Feed Interativo**:
    - Visualização do Feed do Facebook/Instagram dentro da plataforma.
    - Curtir e Comentar em postagens diretamente pelo painel.

---

## 4. Funcionalidades Core (Atendimento)

### 📨 Tickets (Chat)
- **Kanban**: Visualização de tickets por colunas (Tags/Etapas).
- **Aguardando/Abertos**: Separação de fluxo de atendimento.
- **Tags**: Classificação de clientes (ex: "Lead Quente", "Cliente Recorrente").
- **Respostas Rápidas**: Atalhos para mensagens frequentes (digite `/` no chat).
- **Notas Internas**: Comentários visíveis apenas para a equipe.

### 👥 Contatos (CRM)
- Importação/Exportação de contatos.
- Campos personalizados.
- Carteira de Clientes (vincular contato a um atendente específico).

### 📅 Agendamentos
- Disparo programado de mensagens (Lembretes, Felicitações).
- Recorrência de envios.

### 🤖 Fluxos e Chatbots
- **Filas (Queues)**: Departamentos (ex: Financeiro, Suporte) com chatbots simples de triagem.
- **Integrações de Fila**: Webhooks para sistemas externos (Typebot, n8n).

---

## 5. Estratégias para Assistentes de IA

Para criar um assistente eficaz nesta plataforma, siga estas diretrizes:

1.  **Personalidade**: Defina se ele é um vendedor agressivo ou consultor técnico.
2.  **Uso de Ferramentas**:
    - **Venda Ativa**: Instrua o agente a oferecer produtos do catálogo quando o cliente perguntar preço. Use `[SEND_PRODUCT]`.
    - **Gestão de Crise**: Se o cliente estiver irritado (análise de sentimento implícita), instrua a usar `Ação: Transferir...`.
    - **Social Media Manager**: Crie um agente que recebe fotos via WhatsApp e posta automaticamente no Instagram usando `[POST_FEED]`.
3.  **Fluxo de Marketing**:
    - O agente pode monitorar campanhas (`get_insights`) e sugerir ao gestor aumentar o orçamento se o CTR estiver alto.

---

## 6. Arquitetura Técnica (Resumo)
- **Backend**: Node.js, Express, Sequelize (PostgreSQL).
- **Frontend**: React, Material-UI.
- **Conexão WhatsApp**: Baileys (Socket).
- **Conexão Meta**: Graph API (Facebook/Instagram).
- **IA**: OpenAI API / Google Gemini / OpenRouter.

---
*Documento gerado automaticamente por Trae AI - 2026-01-26*
