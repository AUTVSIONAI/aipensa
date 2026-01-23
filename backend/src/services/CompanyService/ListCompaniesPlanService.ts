import Company from "../../models/Company";
import Plan from "../../models/Plan";

const ListCompaniesPlanService = async (): Promise<Company[]> => {
  console.log("[ListCompaniesPlanService] Fetching all companies with plans...");
  const companies = await Company.findAll({
    order: [["id", "ASC"]],
    include: [
      {
        model: Plan,
        as: "plan",
        attributes: [
          "id",
          "name",
          "users",
          "connections",
          "queues",
          "amount",
          "useWhatsapp",
          "useFacebook",
          "useInstagram",
          "useCampaigns",
          "useSchedules",
          "useInternalChat",
          "useExternalApi",
          "useKanban",
          "useOpenAi",
          "useIntegrations"
        ]
      },
    ]
  });
  return companies;
};

export default ListCompaniesPlanService;
