// constants/tableColumns.js
import { ColumnType } from './tableConstants';

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
  
  // Client Pages
  "client-list": [
    {
      id: 'handler',
      label: 'Handler',
      field_type: "handler",
      sortable: true,
      width: 120
    },
    {
      id: 'serial_number',
      label: 'Serial Number',
      field_type: ColumnType.TEXT,
      sortable: true,
      width: 120
    },
    {
      id: 'created_at',
      label: 'Creation Date',
      field_type: ColumnType.DATE,
      sortable: true,
      width: 150
    },
    // {
    //   id: 'actions',
    //   label: 'Actions',
    //   type: ColumnType.ACTION,
    //   sortable: false,
    //   fixed: true,
    //   width: 120
    // }
  ],
  
  "client-group-list": [
    {
      id: 'client_group_name',
      label: 'Group Name',
      type: ColumnType.TEXT,
      sortable: true,
      fixed: true,
      width: 200
    },
    {
      id: 'created_at',
      label: 'Creation Date',
      type: ColumnType.DATE,
      sortable: true,
      fixed: true,
      width: 150
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
  "control-panel-company-profile": []
};

// Helper function to get columns for a page
export const getColumnsForPage = (pageKey) => {
  return TableColumns[pageKey] || [];
};