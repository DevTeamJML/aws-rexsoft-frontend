// constants/tableColumns.js
import { ColumnType } from "./tableConstants";

export const TableColumns = {
  // Dashboard Page
  dashboard: [],

  // Graph Pages
  "graph-client": [],
  "graph-kpi": [],
  "graph-form": [],

  // KPI Pages
  "kpi-list": [],
  "kpi-group": [],

  "user-list": [
    {
      id: "name",
      label: "Name",
      field_type: "name",
      sortable: true,
      width: 120,
    },
    {
      id: "status",
      label: "Status",
      field_type: "name",
      sortable: true,
      width: 120,
    },
    {
      id: "email",
      label: "Email",
      field_type: "email",
      sortable: true,
      width: 120,
    },
    // {
    //   id: "created_at",
    //   label: "Creation Date",
    //   field_type: ColumnType.DATE,
    //   sortable: true,
    //   width: 150,
    // },
  ],

  // Client Pages
  "client-list": [
    // {
    //   id: "handler",
    //   label: "Handler",
    //   field_type: "handler",
    //   sortable: true,
    //   width: 120,
    // },
    {
      id: "serial_number",
      label: "Serial Number",
      field_type: ColumnType.TEXT,
      sortable: true,
      width: 120,
    },
    {
      id: "created_at",
      label: "Creation Date",
      field_type: ColumnType.DATE,
      sortable: true,
      width: 150,
    },
  ],

  "client-group-list": [
    {
      id: "client_group_name",
      label: "Group Name",
      type: ColumnType.TEXT,
      sortable: true,
      fixed: true,
      width: 200,
    },
    {
      id: "created_at",
      label: "Creation Date",
      type: ColumnType.DATE,
      sortable: true,
      fixed: true,
      width: 150,
    },
  ],

  "role-list": [
    {
      id: "role_name",
      label: "Role Name",
      type: ColumnType.TEXT,
      sortable: true,
      fixed: true,
      width: 200,
    },
    {
      id: "member_count",
      label: "Members",
      type: ColumnType.TEXT,
      sortable: true,
      fixed: true,
      width: 150,
    },
  ],

  // Form Pages
  "form-template": [],
  "form-submission": [],
  "form-approval": [],
  "form-tracker": [],

  // Appointment Pages
  "appointment-calendar": [],
  "appointment-upcoming-appointment": [],

  // Control Panel Pages
  "control-panel-user": [],
  "control-panel-role": [],
  "control-panel-company-profile": [],
};

// Helper function to get columns for a page
export const getColumnsForPage = (pageKey) => {
  return TableColumns[pageKey] || [];
};
