import { QueryInterface } from "sequelize";

export const up = async (queryInterface: QueryInterface) => {
  const plans = [
    {
      name: "Plano Start",
      users: 5,
      connections: 2,
      queues: 5,
      amount: "199.90",
      useWhatsapp: true,
      useFacebook: true,
      useInstagram: true,
      useCampaigns: true,
      useSchedules: true,
      useInternalChat: true,
      useExternalApi: false,
      useKanban: true,
      useOpenAi: true,
      useIntegrations: false,
      isPublic: true,
      trial: false,
      trialDays: 0,
      recurrence: "MENSAL",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: "Plano Growth",
      users: 15,
      connections: 5,
      queues: 15,
      amount: "499.90",
      useWhatsapp: true,
      useFacebook: true,
      useInstagram: true,
      useCampaigns: true,
      useSchedules: true,
      useInternalChat: true,
      useExternalApi: true,
      useKanban: true,
      useOpenAi: true,
      useIntegrations: true,
      isPublic: true,
      trial: false,
      trialDays: 0,
      recurrence: "MENSAL",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: "Plano Enterprise",
      users: 50,
      connections: 20,
      queues: 50,
      amount: "999.90",
      useWhatsapp: true,
      useFacebook: true,
      useInstagram: true,
      useCampaigns: true,
      useSchedules: true,
      useInternalChat: true,
      useExternalApi: true,
      useKanban: true,
      useOpenAi: true,
      useIntegrations: true,
      isPublic: true,
      trial: false,
      trialDays: 0,
      recurrence: "MENSAL",
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  // Update or Insert Plano 1 (Mini)
  const miniPlan = {
      name: "Plano Mini",
      users: 2,
      connections: 1,
      queues: 3,
      amount: "99.90",
      useWhatsapp: true,
      useFacebook: true,
      useInstagram: true,
      useCampaigns: true,
      useSchedules: true,
      useInternalChat: true,
      useExternalApi: false,
      useKanban: true,
      useOpenAi: true,
      useIntegrations: false,
      isPublic: true,
      trial: false,
      trialDays: 0,
      recurrence: "MENSAL",
      createdAt: new Date(),
      updatedAt: new Date()
  };

  const existingMiniPlan = await queryInterface.rawSelect('Plans', {
      where: { id: 1 },
  }, ['id']);

  if (existingMiniPlan) {
      await queryInterface.bulkUpdate('Plans', miniPlan, { id: 1 });
  } else {
      await queryInterface.bulkInsert('Plans', [{ ...miniPlan, id: 1 }]);
  }

  for (const plan of plans) {
    const [existingPlan] = await queryInterface.sequelize.query(
      `SELECT id FROM "Plans" WHERE name = '${plan.name}' LIMIT 1`
    );

    if (existingPlan.length > 0) {
        await queryInterface.bulkUpdate('Plans', plan, { name: plan.name });
    } else {
        await queryInterface.bulkInsert('Plans', [plan]);
    }
  }
};

export const down = async (queryInterface: QueryInterface) => {
  // Do not delete everything, maybe just the ones we added?
  // But for safety in dev, we can leave it empty or delete specific names.
};
