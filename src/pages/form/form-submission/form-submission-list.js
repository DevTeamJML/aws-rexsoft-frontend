import React, { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";

import ReusableTable from "@/components/ReusableTable/ReusableTable";
import { getColumnsForPage } from "@/constants/tableColumns";

import { useSelectCurrCompanyId } from "../../../../redux/slices/companySlice";
import { useSelectUser } from "../../../../redux/slices/authSlice";

import {
  getUserFormSubmission,
  useSelectUserFormSubmissions,
  useSelectUserFormSubmissionsCount,
} from "../../../../redux/slices/formSubmissionSlice";

import { ActionButton } from "@/components/Misc/ActionButton";

const FormSubmissionListPage = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const currCompanyId = useSelectCurrCompanyId();
  const user = useSelectUser();

  const submissions = useSelectUserFormSubmissions();
  const userFormSubmissionsCount = useSelectUserFormSubmissionsCount();

  const [statusFilter, setStatusFilter] = useState("Pending");

  useEffect(() => {
    if (!currCompanyId) return;

    dispatch(
      getUserFormSubmission({
        company_id: currCompanyId,
        user_id: user?.uid,
        status: statusFilter,
      })
    );
  }, [currCompanyId, statusFilter]);

  // Format table data
  const tableData = useMemo(() => {
    return (submissions || []).map((sub) => ({
      id: sub.form_submission_id,
      template_name: sub.template_name,
      status: sub.status,
      created_at: sub.created_at,
      approved_at: sub.approved_at,
      approved_by: sub.approved_by,
    }));
  }, [submissions]);

  const fixedColumns = useMemo(() => {
    return getColumnsForPage("form-approval-list");
  }, []);

  const handleAction = (action, row) => {
    if (action === "edit") {
      router.push(`/form/form-submission/${row.id}/edit-form-submission`);
    }
  };

  return (
    <div className="page-container">
      <div className="title-container flex justify-between items-center">
        <h1> {`Your Submitted Forms (${statusFilter})`}</h1>

        <div className="form-filter-actions">
          <ActionButton
            label={`Pending (${userFormSubmissionsCount?.pending_count ?? 0})`}
            type="pending"
            externalClass={statusFilter === "Pending" ? "active" : ""}
            onClick={() => setStatusFilter("Pending")}
          />

          <ActionButton
            label={`Resubmission (${
              userFormSubmissionsCount?.resubmission_count ?? 0
            })`}
            type="resubmission"
            externalClass={statusFilter === "Resubmission" ? "active" : ""}
            onClick={() => setStatusFilter("Resubmission")}
          />

          <ActionButton
            label={`Approved (${userFormSubmissionsCount?.approved_count ?? 0})`}
            type="approved"
            externalClass={statusFilter === "Approved" ? "active" : ""}
            onClick={() => setStatusFilter("Approved")}
          />

          <ActionButton
            label={`Rejected (${userFormSubmissionsCount?.rejected_count ?? 0})`}
            type="rejected"
            externalClass={statusFilter === "Rejected" ? "active" : ""}
            onClick={() => setStatusFilter("Rejected")}
          />
        </div>
      </div>

      <ReusableTable
        tableId="form_approval_list"
        data={tableData}
        fixedColumns={fixedColumns}
        dynamicColumns={[]}
        sortable
        selectable={true}
        onAction={handleAction}
        emptyMessage="No submissions found"
        actionButtons={["edit"]}
      />
    </div>
  );
}

FormSubmissionListPage.featureKey = "form_submission_list"

export default FormSubmissionListPage;