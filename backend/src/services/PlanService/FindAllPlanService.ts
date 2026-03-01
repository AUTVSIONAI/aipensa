import Plan from "../../models/Plan";

const FindAllPlanService = async (listPublic?: any): Promise<Plan[]> => {
  let whereCondition = {};

  if (listPublic === "true") {
    whereCondition = {
      isPublic: true
    };
  } else if (listPublic === "false") {
    whereCondition = {
      isPublic: false
    };
  }

  const plans = await Plan.findAll({
    where: whereCondition,
    order: [["name", "ASC"]]
  });
  return plans;
};

export default FindAllPlanService;
