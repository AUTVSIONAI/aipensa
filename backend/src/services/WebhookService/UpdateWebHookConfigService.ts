import { WebhookModel } from "../../models/Webhook";

interface Request {
  companyId: number;
  details: Record<string, unknown>;
  webhookId: number;
}

const UpdateWebHookConfigService = async ({
  companyId,
  details,
  webhookId
}: Request): Promise<string> => {
  const webhookOld = await WebhookModel.findOne({
    where: {
      company_id: companyId,
      id: webhookId
    }
  });

  if (!webhookOld) {
    throw new Error("Webhook não encontrado");
  }

  const config = { ...webhookOld.config, details };

  await WebhookModel.update(
    { config },
    {
      where: { id: webhookId, company_id: companyId }
    }
  );

  return "ok";
};

export default UpdateWebHookConfigService;
