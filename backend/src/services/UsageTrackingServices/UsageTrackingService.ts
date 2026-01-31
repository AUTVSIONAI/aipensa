import { startOfMonth, endOfMonth } from "date-fns";
import { Op } from "sequelize";
import UsageTracking from "../../models/UsageTracking";
import Company from "../../models/Company";
import Plan from "../../models/Plan";

export const incrementUsage = async (
  companyId: number,
  type: string,
  amount: number = 1,
  resourceId?: string
): Promise<void> => {
  await UsageTracking.create({
    companyId,
    type,
    amount,
    resourceId
  });
};

export const getUsage = async (
  companyId: number,
  type: string
): Promise<number> => {
  const startDate = startOfMonth(new Date());
  const endDate = endOfMonth(new Date());

  const usage = await UsageTracking.sum("amount", {
    where: {
      companyId,
      type,
      createdAt: {
        [Op.between]: [startDate, endDate]
      } as any
    }
  });

  return usage || 0;
};

export const checkPlanFeature = async (
  companyId: number,
  feature: string
): Promise<boolean> => {
  const company = await Company.findByPk(companyId, {
    include: [{ model: Plan, as: "plan" }]
  });

  if (!company || !company.plan) return false;

  return !!company.plan[feature];
};

export const checkPlanLimit = async (
  companyId: number,
  featureLimitColumn: string, // e.g., 'limitPosts', 'limitVoiceMinutes'
  usageType: string // e.g., 'POST', 'VOICE_SECONDS'
): Promise<boolean> => {
  const company = await Company.findByPk(companyId, {
    include: [{ model: Plan, as: "plan" }]
  });

  if (!company || !company.plan) return true;

  const limit = company.plan[featureLimitColumn];

  if (limit === undefined || limit === null) return true;
  if (typeof limit !== "number") return true;
  if (limit <= 0) return true;

  let currentUsage = await getUsage(companyId, usageType);

  if (usageType === "VOICE_SECONDS") {
    // Convert limit from minutes to seconds for comparison
    const limitInSeconds = limit * 60;
    return currentUsage < limitInSeconds;
  }

  return currentUsage < limit;
};
