export const ApiRoute = {
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
    create: "/clientGroup/createClientGroup",
    getAllClientGroups: "/clientGroup/getAllClientGroups",
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
    getClientDataByClientId: "/client/getClientDataByClientId",
    getAllClientsCount: "/client/getAllClientsCount",
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
    removeInvitatioAndUser: "/invitation/removeInvitatioAndUser",
  },
  form: {
    create: "/form/create",
    getAll: "/form/retrieve-all",
    get: "/form/retrieve",
    update: "/form/update",
    delete: "/form/delete",
  },
  formSubmission: {
    create: "/form/form-submission/create",
    getAll: "/form/form-submission/retrieve-all",
    get: "/form/form-submission/retrieve",
    update: "/form/form-submission/update",
    delete: "/form/form-submission/delete"
  },
};
