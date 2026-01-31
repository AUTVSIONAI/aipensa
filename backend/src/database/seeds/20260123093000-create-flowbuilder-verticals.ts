import { QueryInterface } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const now = new Date();
    const companyId = 1;
    const userId = 1;

    const mkFlow = (
      name: string,
      greeting: string,
      qualify: string[],
      cta: string,
      variables: any
    ) => ({
      user_id: userId,
      name,
      company_id: companyId,
      active: true,
      flow: JSON.stringify({
        nodes: [
          { id: "start", type: "message", content: greeting },
          { id: "qualify", type: "questions", fields: qualify },
          { id: "cta", type: "action", action: cta },
          {
            id: "confirm",
            type: "message",
            content: "Confirmação enviada. Em breve você receberá detalhes."
          }
        ],
        edges: [
          { from: "start", to: "qualify" },
          { from: "qualify", to: "cta" },
          { from: "cta", to: "confirm" }
        ]
      }),
      variables: JSON.stringify(variables),
      createdAt: now,
      updatedAt: now
    });

    const flows = [
      mkFlow(
        "Clínica Médica",
        "Olá, bem-vindo à nossa clínica. Vamos agendar sua consulta.",
        [
          "Especialidade",
          "Plano ou Particular",
          "Horário preferido",
          "Nome",
          "Telefone"
        ],
        "schedule",
        { companyName: "", phone: "", address: "" }
      ),
      mkFlow(
        "Petshop",
        "Olá, bem-vindo ao petshop. Qual serviço você precisa para seu pet?",
        ["Serviço", "Porte/Raça", "Disponibilidade", "Nome", "Telefone"],
        "schedule",
        { companyName: "", phone: "", address: "" }
      ),
      mkFlow(
        "Pizzaria",
        "Olá, bem-vindo à pizzaria. Vamos montar seu pedido.",
        ["Tamanho", "Sabor", "Borda", "Entrega ou Retirada", "Pagamento"],
        "order",
        { companyName: "", phone: "", address: "" }
      ),
      mkFlow(
        "Loja de Sapatos",
        "Olá, bem-vindo à loja. Vamos encontrar o melhor calçado para você.",
        ["Tipo", "Numeração", "Estilo", "Disponibilidade"],
        "checkout",
        { companyName: "", phone: "", address: "" }
      ),
      mkFlow(
        "Contabilidade",
        "Olá, bem-vindo ao escritório contábil. Conte sua necessidade.",
        ["PF ou PJ", "Regime", "Principal dor", "Preferência de horário"],
        "schedule",
        { companyName: "", phone: "", address: "" }
      ),
      mkFlow(
        "Barbearia",
        "Olá, bem-vindo à barbearia. Vamos agendar seu horário.",
        ["Serviço", "Profissional preferido", "Horário", "Nome", "Telefone"],
        "schedule",
        { companyName: "", phone: "", address: "" }
      ),
      mkFlow(
        "Político",
        "Olá, bem-vindo ao canal da campanha. Vamos conversar.",
        ["Tema de interesse", "Participação em eventos", "Contato"],
        "engage",
        { campaignName: "", contactEmail: "" }
      ),
      mkFlow(
        "Academia",
        "Olá, bem-vindo à academia. Qual seu objetivo?",
        [
          "Objetivo",
          "Plano de interesse",
          "Aula experimental",
          "Agendar visita"
        ],
        "schedule",
        { companyName: "", phone: "", address: "" }
      ),
      mkFlow(
        "Imobiliária",
        "Olá, bem-vindo à imobiliária. Vamos encontrar seu imóvel.",
        ["Comprar ou Alugar", "Bairro", "Faixa de preço", "Tipologia"],
        "schedule_visit",
        { companyName: "", phone: "", address: "" }
      ),
      mkFlow(
        "Restaurante",
        "Olá, bem-vindo ao restaurante. Vamos fazer sua reserva.",
        ["Número de pessoas", "Data e horário", "Preferências"],
        "reserve",
        { companyName: "", phone: "", address: "" }
      )
    ];

    await queryInterface.bulkInsert("FlowBuilders", flows);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete("FlowBuilders", { active: true });
  }
};
