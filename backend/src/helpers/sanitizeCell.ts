/**
 * Sanitize a spreadsheet cell value to prevent formula injection.
 * Strips leading characters that could be interpreted as formulas
 * by spreadsheet applications (=, +, -, @, \t, \r).
 */
const sanitizeCell = (value: any): string => {
  if (value === null || value === undefined) return "";
  const str = String(value);
  return str.replace(/^[=+\-@\t\r]+/, "");
};

export default sanitizeCell;
