export const getColumnType = (column, dynamicColumns, fixedColumns) => {
  if (!column) return "";

  if (column.field_type) return column.field_type;

  const fixed = fixedColumns.find((c) => c.id === column.id);
  if (fixed) return fixed.field_type;

  const dynamic = dynamicColumns.find((c) => c.column_id === column.id);
  return dynamic?.field_type || "";
};

export const shouldShowSearchField = (columnType) => {
  const textTypes = [
    "short_text",
    "multiline",
    "rich_text",
    "alert",
    "dropdown",
    "number",
    "text",
  ];
  return textTypes.includes(columnType);
};

export const shouldShowDropdownOptions = (columnType, options) => {
  return (columnType === "dropdown" || columnType === "handler") &&
    options.length > 0;
};

export const shouldShowNumberRange = (columnType, columnId) => {
  return columnType === "number" || columnId === "serial_number";
};

export const shouldShowDateRange = (columnType) => {
  return columnType === "date";
};
