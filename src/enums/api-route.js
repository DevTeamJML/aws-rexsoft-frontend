import { getUserRoles } from "../../redux/slices/roleAuthSlice";

export const ApiRoute = {
  appointment: {
    getAppointments: "/appointment/getAppointments",
    createAppointment: "/appointment/createAppointment",
    updateAppointment: "/appointment/updateAppointment",
    deleteAppointment: "/appointment/deleteAppointment",
    searchClientListInAppointment: "/appointment/searchClientListInAppointment",
  },
  dashboard: {
    getDashboard: "/dashboard/getDashboard",
  },
  user: {
    getUserDetailsById: "/user/getUserDetailsById",
  },
  company: {
    createCompany: "/company/createCompany",
    getAllCompanies: "/company/getAllCompanies",
  },
  companyUser: {
    getAllCompanyUsers: "/companyUser/getAllCompanyUsers",
  },
  clientGroup: {
    duplicateClientGroup: "/clientGroup/duplicateClientGroup",
    create: "/clientGroup/createClientGroup",
    getAllClientGroups: "/clientGroup/getAllClientGroups",
    getClientGroupById: "/clientGroup/getClientGroupById",
    deleteClientGroupById: "/clientGroup/deleteClientGroupById",
    updateClientGroup: "/clientGroup/updateClientGroup",
    getAllClientGroupsName: "/clientGroup/getAllClientGroupsName",
    getSelectedClientGroup: "/clientGroup/getSelectedClientGroup",
  },
  client: {
    bulkCreateClient: "/client/bulkCreateClient",
    create: "/client/create",
    get: "/client/get",
    update: "/client/update",
    bulkUpdate: "/client/bulkUpdate",
    delete: "/client/delete",
    bulkDelete: "/client/bulkDelete",
    archive: "/client/archive",
    bulkArchive: "/client/bulkArchive",
    restore: "/client/restore",
    bulkRestore: "/client/bulkRestore",
    getClientDataByClientId: "/client/getClientDataByClientId",
    getAllClientsCount: "/client/getAllClientsCount",
    checkDuplicate: "/client/checkDuplicate",
  },

  formTemplate: {
    createFormTemplate: "/form/createFormTemplate",
    getAllFormTemplates: "/form/getAllFormTemplates",
    getFormTemplateById: "/form/getFormTemplateById",
    deleteFromTemplate: "/form/deleteFormTemplate",
    updateFormTemplate: "/form/updateFormTemplate",
  },
  formSubmission: {
    getUserFormSubmission: "/form/getUserFormSubmission",
    createFormSubmission: "/form/createFormSubmission",
    updateFormSubmission: "/form/updateFormSubmission",
    getAllFormSubmissions: "/form/getAllFormSubmissions",
    getFormSubmissionById: "/form/getFormSubmissionById",
    deleteFormSubmission: "/form/deleteFormSubmission",
    getFormSubmissionById: "/form/getFormSubmissionById",
  },
  formApproval: {
    updateFormSubmissionApproval: "/form/updateFormSubmissionApproval",
  },
  invitation: {
    getInvitationById: "/invitation/getInvitationById",
    create: "/invitation/create",
    accept: "/invitation/accept",
    signUpAndAcceptInvitation: "/invitation/signUpAndAcceptInvitation",
    resend: "/invitation/resend",
    remove: "/invitation/remove",
    inviteUserToCompany: "/invitation/inviteUserToCompany",
    getAllInvitationAndUser: "/invitation/getAllInvitationAndUser",
    removeInvitationAndUser: "/invitation/removeInvitationAndUser",
  },
  form: {
    create: "/form/create",
    getAll: "/form/retrieve-all",
    get: "/form/retrieve",
    update: "/form/update",
    delete: "/form/delete",
  },
  graph: {
    generateGraphData: "/graph/generateGraphData",
    saveGraph: "/graph/saveGraph",
    getGraphsBySource: "/graph/getGraphsBySource",
    getGraphById: "/graph/getGraphById",
    getPublishedGraph: "/graph/getPublishedGraph",
    getPublishedGraphById: "/graph/getPublishedGraphById",
    deleteGraph: "/graph/deleteGraph",
  },

  kpi: {
    saveKpi: "/kpi/saveKpi",
    deleteKpi: "/kpi/deleteKpiGroup",
    getKpisBySource: "/kpi/getKpisBySource",
    getKpiById: "/kpi/getKpiById",
    getPublishedKpi: "/kpi/getPublishedKpi",
    getPublishedKpiById: "/kpi/getPublishedKpiById",
  },

  // suggestion for ApiRoute (not required here, just for reference)
  role: {
    getAllRoles: "/roles/roles",
    getRole: "/roles/get-role",
    createRole: "/roles/create",
    updateRole: "/roles/update",
    deleteRole: "/roles/delete",
    getUserRoles: "/roles/get-user-role",
  },
  logs: {
    list: "/logs/getLogs",
    me: "/logs/getMyLogs",
    create: "/logs/createLogs",
  },
};
