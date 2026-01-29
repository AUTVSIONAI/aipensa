import { WebhookModel } from "../../models/Webhook";

interface Request {
  companyId: number;
}

interface Response {
  webhooks: any[];
  count: number;
  hasMore: boolean;
}

const ListWebHookService = async ({
  companyId
}: Request): Promise<Response> => {
  const { count, rows } = await WebhookModel.findAndCountAll({
    where: {
      company_id: companyId
    }
  });

  const webhooks = rows.map(webhook => webhook.toJSON());

  return {
    webhooks,
    hasMore: false,
    count
  };
};

export default ListWebHookService;
