import { WebhookModel } from "../../models/Webhook";

interface Request {
  status: boolean;
  webhookId: number;
}

const UpdateActiveWebHookService = async ({
  status,
  webhookId
}: Request): Promise<string> => {
  await WebhookModel.update(
    { active: status },
    {
      where: { id: webhookId }
    }
  );

  return "ok";
};

export default UpdateActiveWebHookService;
