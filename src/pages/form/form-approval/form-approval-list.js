// pages/form/form-template-list.jsx

import React, { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";

import ReusableTable from "@/components/ReusableTable/ReusableTable";
import { getColumnsForPage } from "@/constants/tableColumns";

import { useSelectCurrCompanyId } from "../../../../redux/slices/companySlice";
import { useSelectUser } from "../../../../redux/slices/authSlice";

import {
  getAllFormSubmissions,
  useSelectAllFormSubmissions,
  useSelectAllFormSubmissionsCount,
} from "../../../../redux/slices/formSubmissionSlice";

import { ActionButton } from "@/components/Misc/ActionButton";

export default function FormApprovalListPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  const currCompanyId = useSelectCurrCompanyId();
  const user = useSelectUser();

  const submissions = useSelectAllFormSubmissions();
  const allFormSubmissionsCount = useSelectAllFormSubmissionsCount();

  const [statusFilter, setStatusFilter] = useState("Pending");

  useEffect(() => {
    if (!currCompanyId) return;

    dispatch(
      getAllFormSubmissions({
        company_id: currCompanyId,
        status: statusFilter,
      })
    );
  }, [currCompanyId, statusFilter]);

  // Format data for table
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
    if (action === "view") {
      router.push(`/form/form-approval/${row.id}/view-submission`);
    }
  };

  return (
    <div className="page-container">
      <div className="title-container">
        <h1> {`Form Approval (${statusFilter})`}</h1>

        <div className="form-filter-actions">
          <ActionButton
            label={`Pending (${allFormSubmissionsCount?.pending_count ?? 0})`}
            type="pending"
            externalClass={statusFilter === "Pending" ? "active" : ""}
            onClick={() => setStatusFilter("Pending")}
          />

          <ActionButton
            label={`Resubmission (${
              allFormSubmissionsCount?.resubmission_count ?? 0
            })`}
            type="resubmission"
            externalClass={statusFilter === "Resubmission" ? "active" : ""}
            onClick={() => setStatusFilter("Resubmission")}
          />

          <ActionButton
            label={`Approved (${allFormSubmissionsCount?.approved_count ?? 0})`}
            type="approved"
            externalClass={statusFilter === "Approved" ? "active" : ""}
            onClick={() => setStatusFilter("Approved")}
          />

          <ActionButton
            label={`Rejected (${allFormSubmissionsCount?.rejected_count ?? 0})`}
            type="rejected"
            externalClass={statusFilter === "Rejected" ? "active" : ""}
            onClick={() => setStatusFilter("Rejected")}
          />
        </div>
      </div>

      {/* TABLE */}
      <ReusableTable
        tableId="form_approval_list"
        data={tableData}
        fixedColumns={fixedColumns}
        dynamicColumns={[]}
        sortable
        selectable={true}
        onAction={handleAction}
        emptyMessage="No submissions found"
        actionButtons={["view"]}
      />
    </div>
  );
}
