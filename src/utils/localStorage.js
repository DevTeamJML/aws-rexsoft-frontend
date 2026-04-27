export const addToSessionStorage = (key, value) => {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(key, value);
  }
};

export const removeFromSessionStorage = (key) => {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(key);
  }
};

export const getFromSessionStorage = (key) => {
  if (typeof window !== "undefined") {
    return sessionStorage.getItem(key);
  }
  return null;
};

export const saveFilterPreference = (groupId, { filters, search, sort }) => {
  const existing = JSON.parse(localStorage.getItem("filterPreference") || "{}");

  const updated = {
    ...existing,
    [groupId]: {
      filters,
      search,
      sort,
    },
  };

  localStorage.setItem("filterPreference", JSON.stringify(updated));
};
