import { format, isValid, parse, parseISO } from "date-fns";

export function useDate() {
  const parseAnyDate = (value: any) => {
    if (!value) return null;
    if (value instanceof Date) return value;

    if (typeof value === "string") {
      const iso = parseISO(value);
      if (isValid(iso)) return iso;

      const brDateTime = parse(value, "dd/MM/yyyy HH:mm", new Date());
      if (isValid(brDateTime)) return brDateTime;

      const brDate = parse(value, "dd/MM/yyyy", new Date());
      if (isValid(brDate)) return brDate;

      const jsDate = new Date(value);
      if (isValid(jsDate)) return jsDate;

      return null;
    }

    const jsDate = new Date(value);
    return isValid(jsDate) ? jsDate : null;
  };

  function dateToClient(strDate) {
    const date = parseAnyDate(strDate);
    return date ? format(date, "dd/MM/yyyy") : strDate;
  }

  function datetimeToClient(strDate) {
    const date = parseAnyDate(strDate);
    return date ? format(date, "dd/MM/yyyy HH:mm") : strDate;
  }

  function dateToDatabase(strDate) {
    if (typeof strDate !== "string") return strDate;
    const date = parse(strDate, "dd/MM/yyyy", new Date());
    return isValid(date) ? format(date, "yyyy-MM-dd HH:mm:ss") : strDate;
  }

  function returnDays(date) {
    const data1 = new Date();
    const data2 = new Date(date);
    const result = data2.getTime() - data1.getTime();
    const days = Math.ceil(result / (1000 * 60 * 60 * 24));
    return Object.is(days, -0) ? 0 : days;
  }

  return {
    dateToClient,
    datetimeToClient,
    dateToDatabase,
    returnDays
  };
}
