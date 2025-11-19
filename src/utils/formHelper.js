/**
 * Handles input changes for any single-entry form field.
 * Updates the given state with the specified key and value.
 *
 * @param {Function} setState - The state setter function (e.g., from useState)
 * @param {string} key - The property name to update in the state object
 * @param {*} value - The new value to assign to the specified key
 */
export function updateFormField(setState, key, value) {
  setState((prev) => ({
    ...prev,
    [key]: value,
  }));
}

/**
 * Handle multi-entry form field
 * Add items to the given state with the specified key and value
 * @param {*} setState - The state setter function (e.g., from useState)
 * @param {*} newItem  - The new value or object to be added to the list
 */
export function addMultiEntryFieldItem(
  setState,
  newItem = { name: "", value: "" },
  type
) {
  // Only adnotes wanted to be pushed at the front of the list
  if (type === "adnotes") {
    setState((prev) => [newItem, ...prev]);
    return;
  } else {
    setState((prev) => [...prev, newItem]);
  }
}

/**
 * Handles input changes for any multi-entry form field
 * Updates the given state with the specified key and value
 * @param {*} setState - The state setter function (e.g., from useState)
 * @param {*} index - The target index
 * @param {*} key - The key of the specific value to be updated
 * @param {*} value  - The new value or object to be updated in the list
 */
export function updateMultiEntryFieldItem(setState, index, key, value) {
  setState((prev) => {
    const updated = [...prev];
    updated[index] = { ...updated[index], [key]: value };
    return updated;
  });
}

/**
 * Handles input changes for any multi-entry form field
 * Drop the targeted item with index
 * @param {*} setState - The state setter function (e.g., from useState)
 * @param {*} indexToDelete - The targeted index to be deleted or dropped
 */
export function dropMultiEntryFieldItem(setState, indexToDelete) {
  setState((prev) => {
    const updated = [...prev];
    updated.splice(indexToDelete, 1);
    return updated;
  });
}



import { v4 as uuidv4, v4 } from "uuid";

/**
 * Generate an array of client custom values from form data and column definitions.
 * @param {Array} columns - Array of column objects (existing or missing columns)
 * @param {Object} formData - Key/value form data keyed by column_id
 * @param {String} client_id - ID of the client
 * @param {String} client_group_id - ID of the client group
 * @returns {Array} - Array of formatted custom value objects
 */
export function generateCustomValues(columns, formData, client_id, client_group_id) {
  return columns.map((col) => {
    const { field_type, column_id } = col;
    const matchingValue = formData[column_id];

    if (field_type === "alert") {
      const matchingObj = matchingValue || {};
      const defaultValue = {
        date: matchingObj.date ?? "",
        is_complete: matchingObj.is_complete ?? false,
      };

      return {
        client_custom_value_id: v4(),
        client_id,
        client_group_id,
        column_id,
        row_value: JSON.stringify(defaultValue),
      };
    }

    // For non-alert fields
    return {
      client_custom_value_id: uuidv4(),
      client_id,
      client_group_id,
      column_id,
      row_value: matchingValue || "",
    };
  });
}
