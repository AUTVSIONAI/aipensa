import { WebhookModel } from "../../models/Webhook";

interface Request {
  companyId: number;
  hashId: string;
}

interface Response {
  webhook: WebhookModel;
}

const GetWebHookService = async ({
  companyId,
  hashId
}: Request): Promise<Response> => {
  const webhook = await WebhookModel.findOne({
    where: {
      company_id: companyId,
      hash_id: hashId
    }
  });

  if (!webhook) {
    throw new Error("Webhook não encontrado");
  }

  return {
    webhook
  };
};

export default GetWebHookService;
