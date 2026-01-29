import { QueryInterface } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const now = new Date();
    const companyId = 1;
    const queueId = 1;

    const prompts = [
      {
        name: "Clínica Médica - Agendamento",
        apiKey: "template",
        prompt:
          "Você é um agente de uma clínica médica. Qualifique o paciente (especialidade, plano/particular, preferência de horário), colete nome e telefone, confirme e gere mensagem de agendamento. Seja educado e claro.",
        maxTokens: 400,
        temperature: 0.7,
        queueId,
        maxMessages: 10,
        companyId,
        voice: "texto",
        provider: "openai",
        model: "",
        createdAt: now,
        updatedAt: now
      },
      {
        name: "Petshop - Serviços",
        apiKey: "template",
        prompt:
          "Você é um agente de um petshop. Qualifique o serviço (banho/tosa/vacina), porte/raça, disponibilidade, orçamento e agendamento. Ofereça upsell de produtos com gentileza.",
        maxTokens: 400,
        temperature: 0.7,
        queueId,
        maxMessages: 10,
        companyId,
        voice: "texto",
        provider: "openai",
        model: "",
        createdAt: now,
        updatedAt: now
      },
      {
        name: "Pizzaria - Pedido",
        apiKey: "template",
        prompt:
          "Você é um agente de uma pizzaria. Coleta tamanho, sabor, borda, endereço ou retirada, forma de pagamento e confirma tempo de entrega. Seja ágil e cordial.",
        maxTokens: 350,
        temperature: 0.6,
        queueId,
        maxMessages: 10,
        companyId,
        voice: "texto",
        provider: "openai",
        model: "",
        createdAt: now,
        updatedAt: now
      },
      {
        name: "Loja de Sapatos - Vendas",
        apiKey: "template",
        prompt:
          "Você é um agente de uma loja de calçados. Qualifique tipo (social/esportivo), numeração, estilo e disponibilidade. Oriente sobre promoções e conduza ao checkout.",
        maxTokens: 400,
        temperature: 0.7,
        queueId,
        maxMessages: 10,
        companyId,
        voice: "texto",
        provider: "openai",
        model: "",
        createdAt: now,
        updatedAt: now
      },
      {
        name: "Contabilidade - Consultoria",
        apiKey: "template",
        prompt:
          "Você é um agente de um escritório contábil. Identifique PF/PJ, regime, dores principais e agende uma consultoria. Seja técnico e amigável.",
        maxTokens: 450,
        temperature: 0.6,
        queueId,
        maxMessages: 10,
        companyId,
        voice: "texto",
        provider: "openai",
        model: "",
        createdAt: now,
        updatedAt: now
      },
      {
        name: "Barbearia - Agendamento",
        apiKey: "template",
        prompt:
          "Você é um agente de uma barbearia. Coleta serviço (corte/barba), profissional preferido, horários e confirma. Sugira clube de fidelidade.",
        maxTokens: 350,
        temperature: 0.7,
        queueId,
        maxMessages: 10,
        companyId,
        voice: "texto",
        provider: "openai",
        model: "",
        createdAt: now,
        updatedAt: now
      },
      {
        name: "Político - Campanha",
        apiKey: "template",
        prompt:
          "Você é um agente de campanha política. Segmente por temas, estimule engajamento, convide para eventos e capte contatos com respeito e neutralidade.",
        maxTokens: 500,
        temperature: 0.8,
        queueId,
        maxMessages: 10,
        companyId,
        voice: "texto",
        provider: "openai",
        model: "",
        createdAt: now,
        updatedAt: now
      },
      {
        name: "Academia - Planos",
        apiKey: "template",
        prompt:
          "Você é um agente de academia. Identifique objetivo (emagrecer/hipertrofia), apresente planos, ofereça aula experimental e agende visita.",
        maxTokens: 400,
        temperature: 0.7,
        queueId,
        maxMessages: 10,
        companyId,
        voice: "texto",
        provider: "openai",
        model: "",
        createdAt: now,
        updatedAt: now
      },
      {
        name: "Imobiliária - Imóveis",
        apiKey: "template",
        prompt:
          "Você é um agente de imobiliária. Qualifique compra/aluguel, bairro, faixa de preço e tipologia. Agende visita e acompanhe proposta.",
        maxTokens: 450,
        temperature: 0.6,
        queueId,
        maxMessages: 10,
        companyId,
        voice: "texto",
        provider: "openai",
        model: "",
        createdAt: now,
        updatedAt: now
      },
      {
        name: "Restaurante - Reservas",
        apiKey: "template",
        prompt:
          "Você é um agente de restaurante. Faça reservas com nº pessoas, preferências e confirmação. Sugira upsell (vinho/sobremesa).",
        maxTokens: 350,
        temperature: 0.7,
        queueId,
        maxMessages: 10,
        companyId,
        voice: "texto",
        provider: "openai",
        model: "",
        createdAt: now,
        updatedAt: now
      }
    ];

    await queryInterface.bulkInsert("Prompts", prompts);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete("Prompts", { apiKey: "template" });
  }
};
