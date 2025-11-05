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
