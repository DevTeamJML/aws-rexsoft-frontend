// pages/form/form-template-list.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";

import ReusableTable from "@/components/ReusableTable/ReusableTable";
import { getColumnsForPage } from "@/constants/tableColumns";

import { useSelectCurrCompanyId } from "../../../../redux/slices/companySlice";
import { useSelectUser } from "../../../../redux/slices/authSlice";

import ConfirmModal from "@/components/Misc/ConfirmModal";
import {
  setShowModal,
  useSelectShowModal,
} from "../../../../redux/slices/confirmModalSlice";
import { ActionButton } from "@/components/Misc/ActionButton";

import {
  deleteFormTemplate,
  getAllFormTemplates,
  useSelectAllFormTemplates,
} from "../../../../redux/slices/formTemplateSlice";
import {
  deleteFormSubmission,
  getUserFormSubmission,
  useSelectUserFormSubmissions,
} from "../../../../redux/slices/formSubmissionSlice";

export default function FormTemplateListPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  const currCompanyId = useSelectCurrCompanyId();
  const showModal = useSelectShowModal();
  const user = useSelectUser();

  const formTemplates = useSelectAllFormTemplates();
  const submissions = useSelectUserFormSubmissions();

  // templates | submissions
  const [mode, setMode] = useState("templates");
  const [targetId, setTargetId] = useState(null);

  useEffect(() => {
    if (!currCompanyId) return;

    if (mode === "templates") {
      dispatch(getAllFormTemplates({ company_id: currCompanyId }));
    }

    if (mode === "submissions") {
      dispatch(
        getUserFormSubmission({ company_id: currCompanyId, user_id: user?.uid })
      );
    }
  }, [mode, currCompanyId]);

  const tableData = useMemo(() => {
    if (mode === "templates") {
      return (formTemplates || []).map((form) => ({
        id: form.form_template_id,
        template_name: form.template_name,
        created_at: form.created_at,
      }));
    }

    if (mode === "submissions") {
      return (submissions || []).map((sub) => ({
        id: sub.form_submission_id,
        template_name: sub.template_name,
        status: sub.status,
        created_at: sub.created_at,
      }));
    }

    return [];
  }, [mode, formTemplates, submissions]);

  const fixedColumns = useMemo(() => {
    if (mode === "templates") return getColumnsForPage("form-template-list");
    return getColumnsForPage("form-submission-list");
  }, [mode]);

  const handleAction = (action, row) => {
    if (mode === "templates") {
      if (action === "apply") {
        router.push(`/form/form-template/${row.id}/new-form-submission`);
      }

      if (action === "delete") {
        dispatch(setShowModal(true));
        setTargetId(row.id);
      }
    }

    if (mode === "submissions") {
      if (action === "edit") {
        router.push(`/form/form-submission/${row.id}/edit-form-submission`);
      }
      if (action === "delete") {
        dispatch(setShowModal(true));
        setTargetId(row.id);
      }
    }
  };

  const onHandleDelete = () => {
    if (targetId) {
      dispatch(
        deleteFormTemplate({
          form_template_id: targetId,
          setTargetGroupId: setTargetId,
          company_id: currCompanyId,
        })
      );
    }
  };

    const onHandleDeleteSubmission = () => {
    if (targetId) {
      dispatch(
        deleteFormSubmission({
          form_submission_id: targetId,
          setTargetGroupId: setTargetId,
          company_id: currCompanyId,
        })
      );
    }
  };

  return (
    <div className="page-container">
      <ConfirmModal
        open={showModal}
        description="Are you sure to delete this form?"
        onConfirm={mode === "templates" ? onHandleDelete : onHandleDeleteSubmission}
        onCancel={() => dispatch(setShowModal(false))}
      />
      <div className="title-container">
        <h1>{mode === "templates" ? "Apply Form" : "Your Submitted Forms"}</h1>

        <div className="title-actions">
          {/* {mode === "templates" && (
            <>
              <ActionButton
                type="primary"
                label="Add Template"
                onClick={() => router.push("/form/new-form-template")}
              />
              <ActionButton
                type="outlined"
                label="Your Submitted Forms"
                onClick={() => setMode("submissions")}
              />
            </>
          )} */}

          {/* {mode === "submissions" && (
            <ActionButton
              type="outlined"
              label="Back to Templates"
              onClick={() => setMode("templates")}
            />
          )} */}
        </div>
      </div>

      <ReusableTable
        tableId={
          mode === "templates" ? "form_template_list" : "form_submission_list"
        }
        data={tableData}
        fixedColumns={fixedColumns}
        dynamicColumns={[]}
        sortable
        selectable={true}
        onAction={handleAction}
        onSort={(sort) => console.log("Sort:", sort)}
        onRowClick={(row) => console.log("Row clicked:", row)}
        onSelectionChange={(ids) => console.log("Selected:", ids)}
        emptyMessage={
          mode === "templates" ? "No template found." : "No submissions found."
        }
        actionButtons={mode === "templates" ? ["apply"] : ["edit", "delete"]}
      />
    </div>
  );
}
