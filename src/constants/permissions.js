export const defaultPermissions = {
  graph: { view_graph: true, manage_graph: false, publish_graph: false },
  logs: { view_all: false },
  client: {
    manage_client: true,
    export_client: true,
    delete_client: true,
    manage_handler: false,
  },
  client_group: {
    manage_client_group: false,
  },
  kpi: { view_kpi: true, manage_kpi: false, delete_kpi: false },
  form: {
    view_form: true,
    manage_form: false,
    delete_form: false,
    approval: false,
  },
  appointment: { view_all_appointment: true, manage_appointment: false },
  control_panel: { manage_roles: false, company_profile: false },
};

export const PERMISSION_DEFINITIONS = {
  graph: [
    {
      key: "view_graph",
      label: "View Analytics",
      desc: "Allows user to view analytics graphs.",
    },
    {
      key: "manage_graph",
      label: "Manage Analytics",
      desc: "Allows user to generate, publish and delete analytics (full management).",
    },
    {
      key: "publish_graph",
      label: "Publish Analytics",
      desc: "Allows user to publish analytics for others to view.",
    },
  ],
  logs: [
    {
      key: "view_all",
      label: "View Logs",
      desc: "Allows user to view application logs and audit trails.",
    },
  ],
  client: [
    {
      key: "manage_client",
      label: "Manage Client",
      desc: "Create, edit and import clients.",
    },
    {
      key: "export_client",
      label: "Export Client",
      desc: "Export client data to CSV/Excel.",
    },
    {
      key: "delete_client",
      label: "Delete Client",
      desc: "Delete client records permanently.",
    },
    {
      key: "manage_handler",
      label: "Manage Handler",
      desc: "Allows user to manage handler records inside Client module.",
    },
  ],
  client_group: [
    {
      key: "manage_client_group",
      label: "Manage Client Group",
      desc: "Allows user to create, edit, or delete client groups.",
    },
  ],

  kpi: [
    {
      key: "view_kpi",
      label: "View KPI",
      desc: "Allows user to view KPI dashboards and analytics.",
    },
    {
      key: "manage_kpi",
      label: "Manage KPI",
      desc: "Create and edit KPIs.",
    },
    {
      key: "delete_kpi",
      label: "Delete KPI",
      desc: "Delete KPIs permanently.",
    },
  ],
  form: [
    {
      key: "view_form",
      label: "View Form",
      desc: "View form content and submissions.",
    },
    {
      key: "manage_form",
      label: "Manage Form",
      desc: "Create/edit form templates.",
    },
    {
      key: "delete_form",
      label: "Delete Form",
      desc: "Delete form templates.",
    },
    {
      key: "approval",
      label: "Approval Flow",
      desc: "Approve or reject form submissions.",
    },
  ],
  appointment: [
    {
      key: "view_all_appointment",
      label: "View Appointments",
      desc: "Allows user to view all appointments.",
    },
    {
      key: "manage_appointment",
      label: "Manage Appointments",
      desc: "Create/edit appointments.",
    },
  ],
  control_panel: [
    {
      key: "manage_roles",
      label: "Manage Roles",
      desc: "Create and edit role permissions.",
    },
    {
      key: "company_profile",
      label: "Company Profile",
      desc: "Edit company profile settings.",
    },
  ],
};
