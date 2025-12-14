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
      field_field_type: "name",
      sortable: true,
      width: 120,
    },
    {
      id: "status",
      label: "Status",
      field_field_type: "name",
      sortable: true,
      width: 120,
    },
    {
      id: "email",
      label: "Email",
      field_field_type: "email",
      sortable: true,
      width: 120,
    },
    // {
    //   id: "created_at",
    //   label: "Creation Date",
    //   field_field_type: ColumnType.DATE,
    //   sortable: true,
    //   width: 150,
    // },
  ],

  // Client Pages
  "client-list": [
    // {
    //   id: "handler",
    //   label: "Handler",
    //   field_field_type: "handler",
    //   sortable: true,
    //   width: 120,
    // },
    {
      id: "serial_number",
      label: "Serial Number",
      field_field_type: ColumnType.TEXT,
      sortable: true,
      width: 120,
    },
    {
      id: "created_at",
      label: "Creation Date",
      field_field_type: ColumnType.DATE,
      sortable: true,
      width: 150,
    },
  ],

  "client-group-list": [
    {
      id: "client_group_name",
      label: "Group Name",
      field_type: ColumnType.TEXT,
      sortable: true,
      fixed: true,
      width: 200,
    },
    {
      id: "created_at",
      label: "Creation Date",
      field_type: ColumnType.DATE,
      sortable: true,
      fixed: true,
      width: 150,
    },
  ],

  "role-list": [
    {
      id: "role_name",
      label: "Role Name",
      field_type: ColumnType.TEXT,
      sortable: true,
      fixed: true,
      width: 200,
    },
    {
      id: "member_count",
      label: "Members",
      field_type: ColumnType.TEXT,
      sortable: true,
      fixed: true,
      width: 150,
    },
  ],

  // Form Pages
  "form-template-list": [
    {
      id: "template_name",
      label: "Template Name",
      field_type: ColumnType.TEXT,
      sortable: true,
      fixed: true,
      width: 200,
    },
  ],
  // "form-submission-list": [
  //   {
  //     id: "template_name",
  //     label: "Template Name",
  //     field_type: ColumnType.TEXT,
  //     sortable: true,
  //     fixed: true,
  //     width: 200,
  //   },
  // ],
  "form-approval-list": [
    {
      id: "template_name",
      label: "Template Name",
      field_type: ColumnType.TEXT,
      sortable: true,
      fixed: true,
      width: 200,
    },
    {
      id: "status",
      label: "Status",
      field_type: ColumnType.TEXT,
      sortable: true,
      fixed: true,
      width: 200,
    },
    {
      id: "approved_at",
      label: "Approval Date",
      field_type: ColumnType.DATE,
      sortable: true,
      fixed: true,
      width: 200,
    },
    {
      id: "approved_by",
      label: "Approved By",
      field_type: ColumnType.USER,
      sortable: true,
      fixed: true,
      width: 200,
    },
    // {
    //   id: "rejected_at",
    //   label: "Rejection Date",
    //   field_type: ColumnType.DATE,
    //   sortable: true,
    //   fixed: true,
    //   width: 200,
    // },
    // {
    //   id: "rejected_by",
    //   label: "Rejected By",
    //   field_type: ColumnType.USER,
    //   sortable: true,
    //   fixed: true,
    //   width: 200,
    // },
    //  {
    //   id: "resubmit_at",
    //   label: "Resubmission Date",
    //   field_type: ColumnType.DATE,
    //   sortable: true,
    //   fixed: true,
    //   width: 200,
    // },
    {
      id: "created_at",
      label: "Submission Date",
      field_type: ColumnType.DATE,
      sortable: true,
      fixed: true,
      width: 200,
    },
  ],

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
