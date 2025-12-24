const MENU_PERMISSION_MAP = {
  graph_client: "graph_client",
  graph_publish: "graph_publish",
  graph_form: "graph_form",
  form: "view_form",
  appointment: "view_all_appointment",
  kpi: "view_kpi",
  client: "manage_client",
  "control-panel": "manage-roles",
  "manage-group": "manage_client_group",
};

export function filterMenuByPermissions(menuItems, userPermissions, isAdmin, currCompany) {
  // First apply permission checks as before
  const filtered = menuItems
    .map((item) => {
      // Skip checks if admin
      if (!isAdmin) {
        const requiredPerm = MENU_PERMISSION_MAP[item.id];

        // Block entire section if they don't have the permission
        if (requiredPerm && !userPermissions.includes(requiredPerm)) {
          return null;
        }
      }

      // If section has subitems → filter them
      let filteredSubs = item.subItems;
      if (!isAdmin && item.subItems) {
        filteredSubs = item.subItems.filter((sub) => {
          const subPerm = MENU_PERMISSION_MAP[sub.id];
          if (!subPerm) return true; // no permission needed
          return userPermissions.includes(subPerm);
        });

        // If no sub-items remain, hide the whole section
        if (filteredSubs.length === 0) return null;
      }

      return { ...item, subItems: filteredSubs };
    })
    .filter(Boolean);

  // If there's no current company, only show "create-company" (if present after permission filtering)
  if (!currCompany) {
    return filtered.filter((item) => item.id === "create-company");
  }

  // otherwise return full filtered menu
  return filtered;
}
