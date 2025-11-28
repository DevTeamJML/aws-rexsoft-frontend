/**
 * Validate header strictly against column labels.
 *
 * Rules:
 * - A header entry is valid only if it matches a column.label OR is in optionalColumnNames.
 * - All column.labels (except those present in optionalColumnNames) MUST appear in header.
 *
 * @param {string[]} header
 * @param {Object[]} columns - use col.label; filter out field_type "alert" and "rich_text"
 * @param {string[]} optionalColumnNames - labels allowed to be missing or present (e.g. ["Handler"])
 * @returns {{ ok: boolean, missing: string[], extra: string[] }}
 */
export function validateHeader(header, columns, optionalColumnNames = []) {
  const norm = (s) => String(s ?? "").trim().toLowerCase();

  // header normalized set
  const headerSet = new Set(header.map(norm));

  // allowed column labels (filtered)
  const compareColumn = columns.filter(
    (col) => col.field_type !== "alert" && col.field_type !== "rich_text"
  );

  const columnLabelSet = new Set(
    compareColumn
      .map((c) => c.label)
      .filter(Boolean)
      .map(norm)
  );

  // optional normalized set
  const optionalSet = new Set(optionalColumnNames.map(norm));

  // 1) missing = required column labels (not optional) that are not in header
  const missing = Array.from(columnLabelSet).filter(
    (lbl) => !optionalSet.has(lbl) && !headerSet.has(lbl)
  );

  // 2) extra = header entries that are neither a column label nor an optional name
  const extra = Array.from(headerSet).filter(
    (h) => h && !columnLabelSet.has(h) && !optionalSet.has(h)
  );

  return { isValid: missing.length === 0 && extra.length === 0, missing, extra };
}
