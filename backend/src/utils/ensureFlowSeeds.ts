import Company from "../models/Company";
import { FlowBuilderModel } from "../models/FlowBuilder";
import { FlowDefaultModel } from "../models/FlowDefault";

type FlowSpec = {
  name: string;
  greeting: string;
  qualify: string[];
  action: string;
  variables: Record<string, string>;
};

const FLOW_SPECS: FlowSpec[] = [
  {
    name: "Clínica Médica",
    greeting: "Olá, bem-vindo à nossa clínica. Vamos agendar sua consulta.",
    qualify: ["Especialidade", "Plano ou Particular", "Horário preferido", "Nome", "Telefone"],
    action: "schedule",
    variables: { companyName: "", phone: "", address: "" }
  },
  {
    name: "Petshop",
    greeting: "Olá, bem-vindo ao petshop. Qual serviço você precisa para seu pet?",
    qualify: ["Serviço", "Porte/Raça", "Disponibilidade", "Nome", "Telefone"],
    action: "schedule",
    variables: { companyName: "", phone: "", address: "" }
  },
  {
    name: "Pizzaria",
    greeting: "Olá, bem-vindo à pizzaria. Vamos montar seu pedido.",
    qualify: ["Tamanho", "Sabor", "Borda", "Entrega ou Retirada", "Pagamento"],
    action: "order",
    variables: { companyName: "", phone: "", address: "" }
  },
  {
    name: "Loja de Sapatos",
    greeting: "Olá, bem-vindo à loja. Vamos encontrar o melhor calçado para você.",
    qualify: ["Tipo", "Numeração", "Estilo", "Disponibilidade"],
    action: "checkout",
    variables: { companyName: "", phone: "", address: "" }
  },
  {
    name: "Contabilidade",
    greeting: "Olá, bem-vindo ao escritório contábil. Conte sua necessidade.",
    qualify: ["PF ou PJ", "Regime", "Principal dor", "Preferência de horário"],
    action: "schedule",
    variables: { companyName: "", phone: "", address: "" }
  },
  {
    name: "Barbearia",
    greeting: "Olá, bem-vindo à barbearia. Vamos agendar seu horário.",
    qualify: ["Serviço", "Profissional preferido", "Horário", "Nome", "Telefone"],
    action: "schedule",
    variables: { companyName: "", phone: "", address: "" }
  },
  {
    name: "Político",
    greeting: "Olá, bem-vindo ao canal da campanha. Vamos conversar.",
    qualify: ["Tema de interesse", "Participação em eventos", "Contato"],
    action: "engage",
    variables: { campaignName: "", contactEmail: "" }
  },
  {
    name: "Academia",
    greeting: "Olá, bem-vindo à academia. Qual seu objetivo?",
    qualify: ["Objetivo", "Plano de interesse", "Aula experimental", "Agendar visita"],
    action: "schedule",
    variables: { companyName: "", phone: "", address: "" }
  },
  {
    name: "Imobiliária",
    greeting: "Olá, bem-vindo à imobiliária. Vamos encontrar seu imóvel.",
    qualify: ["Comprar ou Alugar", "Bairro", "Faixa de preço", "Tipologia"],
    action: "schedule_visit",
    variables: { companyName: "", phone: "", address: "" }
  },
  {
    name: "Restaurante",
    greeting: "Olá, bem-vindo ao restaurante. Vamos fazer sua reserva.",
    qualify: ["Número de pessoas", "Data e horário", "Preferências"],
    action: "reserve",
    variables: { companyName: "", phone: "", address: "" }
  }
];

const buildFlowPayload = (spec: FlowSpec) => ({
  nodes: [
    { id: "start", type: "message", content: spec.greeting, position: { x: 50, y: 50 } },
    { id: "qualify", type: "questions", fields: spec.qualify, position: { x: 300, y: 50 } },
    { id: "cta", type: "action", action: spec.action, position: { x: 550, y: 50 } },
    { id: "confirm", type: "message", content: "Confirmação enviada. Em breve você receberá detalhes.", position: { x: 800, y: 50 } }
  ],
  edges: [
    { from: "start", to: "qualify" },
    { from: "qualify", to: "cta" },
    { from: "cta", to: "confirm" }
  ]
});

export const ensureFlowSeeds = async () => {
  try {
    const companies = await Company.findAll({
      where: { status: true },
      attributes: ["id"]
    });

    for (const company of companies) {
      const companyId = company.id;

      const existing = await FlowBuilderModel.findAll({
        where: { company_id: companyId },
        attributes: ["id", "name"]
      });

      const existingNames = new Set(existing.map(f => f.name));
      for (const spec of FLOW_SPECS) {
        if (!existingNames.has(spec.name)) {
          await FlowBuilderModel.create({
            user_id: 1,
            company_id: companyId,
            name: spec.name,
            active: true,
            flow: buildFlowPayload(spec) as any,
            variables: spec.variables as any
          });
        }
      }

      for (const flow of existing) {
        const f = flow.toJSON() as any;
        const nodes = f.flow?.nodes;
        let needsUpdate = false;
        if (Array.isArray(nodes)) {
          const positions = [
            { x: 50, y: 50 },
            { x: 300, y: 50 },
            { x: 550, y: 50 },
            { x: 800, y: 50 }
          ];
          nodes.forEach((n: any, idx: number) => {
            if (!n?.position || typeof n.position.x !== "number" || typeof n.position.y !== "number") {
              n.position = positions[Math.min(idx, positions.length - 1)];
              needsUpdate = true;
            }
          });
          if (needsUpdate) {
            await FlowBuilderModel.update(
              { flow: { nodes, edges: f.flow?.edges || [] } as any },
              { where: { id: flow.id } }
            );
          }
        }
      }

      // Ensure defaults for the company if not present
      const defaultExists = await FlowDefaultModel.findOne({
        where: { companyId }
      });
      if (!defaultExists) {
        const welcome = await FlowBuilderModel.findOne({
          where: { company_id: companyId, name: "Clínica Médica" },
          attributes: ["id"]
        });
        const fallback = await FlowBuilderModel.findOne({
          where: { company_id: companyId, name: "Restaurante" },
          attributes: ["id"]
        });
        if (welcome && fallback) {
          await FlowDefaultModel.create({
            companyId,
            userId: 1,
            flowIdWelcome: welcome.id,
            flowIdNotPhrase: fallback.id
          });
        }
      }
    }
  } catch (err) {
    console.error("[ensureFlowSeeds] Falha ao garantir fluxos:", err);
  }
};
