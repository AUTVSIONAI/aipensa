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
    {
      id: "start",
      type: "start",
      position: { x: 50, y: 50 },
      data: { label: "Início do fluxo" }
    },
    {
      id: "msg1",
      type: "message",
      position: { x: 300, y: 50 },
      data: { label: spec.greeting, text: spec.greeting }
    },
    {
      id: "confirm",
      type: "message",
      position: { x: 550, y: 50 },
      data: { label: "Confirmação enviada", text: "Confirmação enviada. Em breve você receberá detalhes." }
    }
  ],
  connections: [
    { id: "e-start-msg1", source: "start", target: "msg1" },
    { id: "e-msg1-confirm", source: "msg1", target: "confirm" }
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
        attributes: ["id", "name", "flow"]
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
            if (!n?.data || typeof n.data.label !== "string") {
              const fallback =
                n?.content ||
                n?.title ||
                (typeof n === "object" ? JSON.stringify(n).slice(0, 40) : "Bloco");
              n.data = { ...(n.data || {}), label: fallback };
              needsUpdate = true;
            }
            if (n?.type === "questions") {
              n.type = "question";
              needsUpdate = true;
            }
            if (n?.type === "menu") {
              n.data = {
                ...(n.data || {}),
                message: n.data?.message || "Selecione uma opção",
                arrayOption: Array.isArray(n.data?.arrayOption) ? n.data.arrayOption : []
              };
              needsUpdate = true;
            }
          });
          if (needsUpdate) {
            const connections = Array.isArray(f.flow?.connections)
              ? f.flow?.connections
              : Array.isArray(f.flow?.edges)
              ? f.flow?.edges.map((e: any, i: number) => ({
                  id: e.id || `e-${i}`,
                  source: e.from || e.source,
                  target: e.to || e.target
                }))
              : [];
            await FlowBuilderModel.update(
              { flow: { nodes, connections } as any },
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
