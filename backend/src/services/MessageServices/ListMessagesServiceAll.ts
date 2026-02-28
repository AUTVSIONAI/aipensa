import { FindOptions } from "sequelize/types";
import { Op } from "sequelize";
import AppError from "../../errors/AppError";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import ShowTicketService from "../TicketServices/ShowTicketService";
import Queue from "../../models/Queue";

import { Sequelize } from "sequelize-typescript";
import { QueryTypes } from "sequelize";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const dbConfig = require("../../config/database");
const sequelize = new Sequelize(dbConfig);

interface Request {
  companyId: number;
  fromMe: boolean;
  dateStart: string;
  dateEnd: string;
}

interface Response {
  count: number;
}

const ListMessagesServiceAll = async ({
  companyId,
  fromMe,
  dateStart,
  dateEnd
}: Request): Promise<Response> => {
  let ticketsCounter: any;
  if (dateStart && dateEnd) {
    if (fromMe) {
      ticketsCounter = await sequelize.query(
        `select COUNT(*) from "Messages" m where "companyId" = :companyId and "fromMe" = :fromMe and "createdAt" between :dateStart and :dateEnd`,
        {
          type: QueryTypes.SELECT,
          replacements: {
            companyId,
            fromMe,
            dateStart: `${dateStart} 00:00:00`,
            dateEnd: `${dateEnd} 23:59:59`
          }
        }
      );
    } else {
      ticketsCounter = await sequelize.query(
        `select COUNT(*) from "Messages" m where "companyId" = :companyId and "createdAt" between :dateStart and :dateEnd`,
        {
          type: QueryTypes.SELECT,
          replacements: {
            companyId,
            dateStart: `${dateStart} 00:00:00`,
            dateEnd: `${dateEnd} 23:59:59`
          }
        }
      );
    }
  } else {
    if (fromMe) {
      ticketsCounter = await sequelize.query(
        `select COUNT(*) from "Messages" m where "companyId" = :companyId and "fromMe" = :fromMe`,
        {
          type: QueryTypes.SELECT,
          replacements: { companyId, fromMe }
        }
      );
    } else {
      ticketsCounter = await sequelize.query(
        `select COUNT(*) from "Messages" m where "companyId" = :companyId`,
        {
          type: QueryTypes.SELECT,
          replacements: { companyId }
        }
      );
    }
  }

  return {
    count: ticketsCounter
  };
};

export default ListMessagesServiceAll;
