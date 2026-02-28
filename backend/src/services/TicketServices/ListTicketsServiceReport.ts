/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable camelcase */
import { QueryTypes } from "sequelize";
import * as _ from "lodash";
import sequelize from "../../database";

export interface DashboardData {
  tickets: any[];
  totalTickets: any;
}

export interface Params {
  searchParam: string;
  contactId: string;
  whatsappId: string[];
  dateFrom: string;
  dateTo: string;
  status: string[];
  queueIds: number[];
  tags: number[];
  users: number[];
  userId: string;
  onlyRated: string;
}

export default async function ListTicketsServiceReport(
  companyId: string | number,
  params: Params,
  page: number = 1,
  pageSize: number = 20
): Promise<DashboardData> {
  const offset = (page - 1) * pageSize;

  const onlyRated = params.onlyRated === "true" ? true : false;

  const replacements: Record<string, any> = {
    companyId: Number(companyId),
    pageSize,
    offset
  };

  let query = "";
  if (onlyRated) {
    query = `
  select
	  t.id,
	  w."name" as "whatsappName",
    c."name" as "contactName",
	  u."name" as "userName",
	  q."name" as "queueName",
	  t."lastMessage",
    t.uuid,
    case t.status
      when 'open' then 'ABERTO'
      when 'closed' then 'FECHADO'
      when 'pending' then 'PENDENTE'
      when 'group' then 'GRUPO'
      when 'nps' then 'NPS'
      when 'lgpd' then 'LGPD'
    end as "status",
    TO_CHAR(tt."createdAt", 'DD/MM/YYYY HH24:MI') as "createdAt",
    TO_CHAR(tt."finishedAt", 'DD/MM/YYYY HH24:MI') as "closedAt",
    coalesce((
      (date_part('day', age(coalesce(tt."ratingAt", tt."finishedAt") , tt."createdAt"))) || ' d, ' ||
      (date_part('hour', age(coalesce(tt."ratingAt", tt."finishedAt"), tt."createdAt"))) || ' hrs e ' ||
      (date_part('minutes', age(coalesce(tt."ratingAt", tt."finishedAt"), tt."createdAt"))) || ' m'
    ), '0') "supportTime",
    coalesce(ur.rate, 0) "NPS"
  from "Tickets" t
  LEFT JOIN (
        SELECT DISTINCT ON ("ticketId") *
        FROM "TicketTraking"
        WHERE "companyId" = :companyId
        ORDER BY "ticketId", "id" DESC
    ) tt ON t.id = tt."ticketId"
	inner join "UserRatings" ur on
   		t.id = ur."ticketId"
       and ur.rate > 0
    left join "Contacts" c on
      t."contactId" = c.id
    left join "Whatsapps" w on
      t."whatsappId" = w.id
    left join "Users" u on
      t."userId" = u.id
    left join "Queues" q on
      t."queueId" = q.id
  -- filterPeriod`;
  } else {
    query = `
  select
	  t.id,
	  w."name" as "whatsappName",
    c."name" as "contactName",
	  u."name" as "userName",
	  q."name" as "queueName",
	  t."lastMessage",
    t.uuid,
    case t.status
      when 'open' then 'ABERTO'
      when 'closed' then 'FECHADO'
      when 'pending' then 'PENDENTE'
      when 'group' then 'GRUPO'
      when 'nps' then 'NPS'
      when 'lgpd' then 'LGPD'
    end as "status",
    TO_CHAR(tt."createdAt", 'DD/MM/YYYY HH24:MI') as "createdAt",
    TO_CHAR(tt."finishedAt", 'DD/MM/YYYY HH24:MI') as "closedAt",
    coalesce((
      (date_part('day', age(coalesce(tt."ratingAt", tt."finishedAt") , tt."createdAt"))) || ' d, ' ||
      (date_part('hour', age(coalesce(tt."ratingAt", tt."finishedAt"), tt."createdAt"))) || ' hrs e ' ||
      (date_part('minutes', age(coalesce(tt."ratingAt", tt."finishedAt"), tt."createdAt"))) || ' m'
    ), '0') "supportTime",
    coalesce(ur.rate, 0) "NPS"
  from "Tickets" t
  LEFT JOIN (
        SELECT DISTINCT ON ("ticketId") *
        FROM "TicketTraking"
        WHERE "companyId" = :companyId
        ORDER BY "ticketId", "id" DESC
    ) tt ON t.id = tt."ticketId"
	left join "UserRatings" ur on
   		t.id = ur."ticketId"
    left join "Contacts" c on
      t."contactId" = c.id
    left join "Whatsapps" w on
      t."whatsappId" = w.id
    left join "Users" u on
      t."userId" = u.id
    left join "Queues" q on
      t."queueId" = q.id
  -- filterPeriod`;
  }

  let where = `where t."companyId" = :companyId`;

  if (_.has(params, "dateFrom")) {
    replacements.dateFrom = `${params.dateFrom} 00:00:00`;
    where += ` and t."createdAt" >= :dateFrom`;
  }

  if (_.has(params, "dateTo")) {
    replacements.dateTo = `${params.dateTo} 23:59:59`;
    where += ` and t."createdAt" <= :dateTo`;
  }

  if (params.whatsappId !== undefined && params.whatsappId.length > 0) {
    const whatsappIds = params.whatsappId.map(Number).filter(n => !isNaN(n));
    if (whatsappIds.length > 0) {
      replacements.whatsappIds = whatsappIds;
      where += ` and t."whatsappId" in (:whatsappIds)`;
    }
  }

  if (params.users.length > 0) {
    const userIds = params.users.map(Number).filter(n => !isNaN(n));
    if (userIds.length > 0) {
      replacements.userIds = userIds;
      where += ` and t."userId" in (:userIds)`;
    }
  }

  if (params.queueIds.length > 0) {
    const queueIds = params.queueIds.map(Number).filter(n => !isNaN(n));
    if (queueIds.length > 0) {
      replacements.queueIds = queueIds;
      where += ` and COALESCE(t."queueId",0) in (:queueIds)`;
    }
  }

  if (params.status.length > 0) {
    const allowedStatuses = ["open", "closed", "pending", "group", "nps", "lgpd"];
    const safeStatuses = params.status.filter(s => allowedStatuses.includes(s));
    if (safeStatuses.length > 0) {
      replacements.statuses = safeStatuses;
      where += ` and t."status" in (:statuses)`;
    }
  }

  if (params.contactId !== undefined && params.contactId !== "") {
    replacements.contactId = Number(params.contactId);
    where += ` and t."contactId" = :contactId`;
  }

  if (params.onlyRated === "true") {
    query += ` and coalesce(ur.rate, 0) > 0`;
  }

  const finalQuery = query.replace("-- filterPeriod", where);

  const totalTicketsQuery = `
    SELECT COUNT(*) as total FROM "Tickets" t
    ${where}  `;

  const totalTicketsResult = await sequelize.query(totalTicketsQuery, {
    type: QueryTypes.SELECT,
    replacements
  });
  const totalTickets = totalTicketsResult[0];

  const paginatedQuery = `${finalQuery} ORDER BY t."createdAt" DESC LIMIT :pageSize OFFSET :offset`;

  const responseData: any[] = await sequelize.query(paginatedQuery, {
    type: QueryTypes.SELECT,
    replacements
  });

  return { tickets: responseData, totalTickets };
}
