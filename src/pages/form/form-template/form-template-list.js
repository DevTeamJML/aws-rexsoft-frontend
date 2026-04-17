// pages/client/client-list.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ReusableTable from "@/components/ReusableTable/ReusableTable";
import { getColumnsForPage } from "@/constants/tableColumns";
import { useRouter } from "next/router";
import {
  deleteClientGroup,
  getAllClientGroups,
  useSelectAllClientGroups,
} from "../../../../redux/slices/clientGroupSlice";
import { useSelectCurrCompanyId } from "../../../../redux/slices/companySlice";
import ConfirmModal from "@/components/Misc/ConfirmModal";
import {
  setShowModal,
  useSelectShowModal,
} from "../../../../redux/slices/confirmModalSlice";
import { ActionButton } from "@/components/Misc/ActionButton";
import { deleteFormTemplate, getAllFormTemplates, useSelectAllFormTemplates } from "../../../../redux/slices/formTemplateSlice";

const FormTemplateListPage = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const currCompanyID = useSelectCurrCompanyId();
  const formTemplates = useSelectAllFormTemplates();
  const showModal = useSelectShowModal();
  const [targetGroupId, setTargetGroupId] = useState();

  useEffect(() => {
    dispatch(getAllFormTemplates({ company_id: currCompanyID }));
  }, [currCompanyID]);

  const loading = false;

  const fixedColumns = getColumnsForPage("form-template-list");

  const tableData = (formTemplates || []).map((form) => {
    const row = {
      id: form.form_template_id,
      template_name: form.template_name,
      created_at: form.created_at,
    };

    return row;
  });

  const handleAction = (action, row) => {
    if (action === "edit") {
      router.push(`/form/form-template/${row.id}/edit-form-template`);
    }

    if (action === "delete") {
      dispatch(setShowModal(true));
      setTargetGroupId(row.id);
    }
  };

  const handleSelectionChange = (selectedIds) => {
    console.log("Selected form template:", selectedIds);
  };

  const handleRowClick = (row) => {
    console.log("Row clicked:", row);
  };

  const handleSort = (sortConfig) => {
    console.log("Sort config:", sortConfig);
  };

  const onHandleDeleteForm = () => {
    if (targetGroupId) {
      dispatch(
        deleteFormTemplate({
          form_template_id: targetGroupId,
          setTargetGroupId,
          company_id: currCompanyID,
        })
      );
    }

  };

  return (
    <div className="page-container">
      <ConfirmModal
        open={showModal}
        description={"Are you sure to delete this form ? "}
        onConfirm={() => {
          onHandleDeleteForm();
        }}
        onCancel={() => {
          dispatch(setShowModal(false));
        }}
      />
      <div className="title-container">
        <h1>Form Template List</h1>
        <div className="title-actions">
          <ActionButton
            label={"Add Template"}
            type="primary"
            onClick={() => router.push("/form/form-template/new-form-template")}
          />
        </div>
      </div>

      <ReusableTable
        tableId="form_template_list"
        data={tableData}
        fixedColumns={fixedColumns}
        dynamicColumns={[]}
        sortable={true}
        selectable={true}
        onAction={handleAction}
        onSort={handleSort}
        onRowClick={handleRowClick}
        onSelectionChange={handleSelectionChange}
        loading={loading}
        emptyMessage="No template is found"
      />
    </div>
  );
};

FormTemplateListPage.featureKey = "form_template_list"

export default FormTemplateListPage;
