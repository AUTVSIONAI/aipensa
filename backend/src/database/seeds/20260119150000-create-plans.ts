import { QueryInterface } from "sequelize";

export const up = async (queryInterface: QueryInterface) => {
  const plans = [
    {
      name: "Plano Base",
      users: 3,
      connections: 1,
      queues: 1,
      amount: "147.00",
      useWhatsapp: true,
      useFacebook: true, // Read-only access to connections
      useInstagram: true, // Read-only access to connections
      useCampaigns: false,
      useSchedules: true,
      useInternalChat: true,
      useExternalApi: false,
      useKanban: true,
      useOpenAi: true, // Basic AI
      useIntegrations: false,
      isPublic: true,
      trial: false,
      trialDays: 0,
      recurrence: "MENSAL",
      useMarketing: true, // View-only
      useMetaAds: false,
      useAgentAi: false,
      useVoiceCommands: false,
      useAutoPosts: false,
      useDmComments: false,
      useProReports: false,
      limitVoiceMinutes: 0,
      limitPosts: 0,
      limitConversations: 500,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: "Pack Social Media IA",
      users: 3,
      connections: 1,
      queues: 1,
      amount: "197.00",
      useWhatsapp: true,
      useFacebook: true,
      useInstagram: true,
      useCampaigns: false,
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
      useMarketing: true,
      useMetaAds: false,
      useAgentAi: true,
      useVoiceCommands: false,
      useAutoPosts: true,
      useDmComments: true,
      useProReports: false,
      limitVoiceMinutes: 0,
      limitPosts: 30,
      limitConversations: 500,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: "Pack Automação Total",
      users: 3,
      connections: 1,
      queues: 1,
      amount: "297.00",
      useWhatsapp: true,
      useFacebook: true,
      useInstagram: true,
      useCampaigns: false,
      useSchedules: true,
      useInternalChat: true,
      useExternalApi: false,
      useKanban: true,
      useOpenAi: true,
      useIntegrations: true, // Maybe enabled? User didn't specify, but it's "Total"
      isPublic: true,
      trial: false,
      trialDays: 0,
      recurrence: "MENSAL",
      useMarketing: true,
      useMetaAds: false,
      useAgentAi: true,
      useVoiceCommands: true,
      useAutoPosts: true,
      useDmComments: true,
      useProReports: true,
      limitVoiceMinutes: 60,
      limitPosts: 30,
      limitConversations: 500,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: "Plano Pro",
      users: 10,
      connections: 2,
      queues: 3,
      amount: "497.00",
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
      useMarketing: true,
      useMetaAds: false, // Not listed in Pro modules, only in Enterprise? User said "Criação de anúncios (Meta Ads)" in Enterprise.
      useAgentAi: true,
      useVoiceCommands: true,
      useAutoPosts: true,
      useDmComments: true,
      useProReports: false, // Not listed in Pro explicitly, but "Relatórios avançados" is in Business
      limitVoiceMinutes: 120,
      limitPosts: 60,
      limitConversations: 2000,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: "Plano Business",
      users: 30,
      connections: 5,
      queues: 10,
      amount: "997.00",
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
      useMarketing: true,
      useMetaAds: true, // Maybe? "Business" usually has more. User put "Criação de anúncios" in Enterprise list but Business is "Todos os módulos".
      useAgentAi: true,
      useVoiceCommands: true,
      useAutoPosts: true,
      useDmComments: true,
      useProReports: true,
      limitVoiceMinutes: 300,
      limitPosts: 150,
      limitConversations: 10000,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: "Plano Enterprise",
      users: 999,
      connections: 20, // "Até 20 números"
      queues: 999,
      amount: "9500.00",
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
      isPublic: false, // "Somente reunião"
      trial: false,
      trialDays: 0,
      recurrence: "MENSAL",
      useMarketing: true,
      useMetaAds: true,
      useAgentAi: true,
      useVoiceCommands: true,
      useAutoPosts: true,
      useDmComments: true,
      useProReports: true,
      limitVoiceMinutes: 9999, // Custom
      limitPosts: 300, // "300 posts/mês"
      limitConversations: 100000,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  for (const plan of plans) {
    const existingPlan = await queryInterface.rawSelect('Plans', {
      where: {
        name: plan.name,
      },
    }, ['id']);

    if (existingPlan) {
      await queryInterface.bulkUpdate('Plans', plan, { name: plan.name });
    } else {
      await queryInterface.bulkInsert('Plans', [plan]);
    }
  }
};

export const down = async (queryInterface: QueryInterface) => {
  await queryInterface.bulkDelete("Plans", {});
};
