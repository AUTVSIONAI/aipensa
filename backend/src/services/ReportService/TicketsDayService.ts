import sequelize from "../../database/index";
import { QueryTypes } from "sequelize";

interface Return {
  data: {};
  count: number;
}

interface Request {
  initialDate: string;
  finalDate: string;
  companyId: number;
}

interface DataReturn {
  total: number;
  data?: number;
  horario?: string;
}

export const TicketsDayService = async ({
  initialDate,
  finalDate,
  companyId
}: Request): Promise<Return> => {
  let sql = "";
  let count = 0;

  if (initialDate && initialDate.trim() === finalDate && finalDate.trim()) {
    sql = `
    SELECT
      COUNT(*) AS total,
      extract(hour from tick."createdAt") AS horario
    FROM
      "Tickets" tick
    WHERE
      tick."companyId" = :companyId
      and DATE(tick."createdAt") >= :initialDate
      AND DATE(tick."createdAt") <= :finalDate
    GROUP BY
      extract(hour from tick."createdAt")
    ORDER BY
      horario asc;
    `;
  } else {
    sql = `
    SELECT
    COUNT(*) AS total,
    to_char(DATE(tick."createdAt"), 'dd/mm/YYYY') as data
  FROM
    "Tickets" tick
  WHERE
    tick."companyId" = :companyId
    and DATE(tick."createdAt") >= :initialDate
    AND DATE(tick."createdAt") <= :finalDate
  GROUP BY
    to_char(DATE(tick."createdAt"), 'dd/mm/YYYY')
  ORDER BY
    data asc;
  `;
  }

  const data: DataReturn[] = await sequelize.query(sql, {
    type: QueryTypes.SELECT,
    replacements: {
      companyId,
      initialDate: initialDate.trim() === finalDate?.trim()
        ? `${initialDate} 00:00:00`
        : initialDate,
      finalDate: initialDate.trim() === finalDate?.trim()
        ? `${finalDate} 23:59:59`
        : finalDate
    }
  });

  data.forEach(register => {
    count += Number(register.total);
  });

  return { data, count };
};
