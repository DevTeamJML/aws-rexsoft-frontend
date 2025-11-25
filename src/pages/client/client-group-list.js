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
} from "../../../redux/slices/clientGroupSlice";
import { useSelectCurrCompanyId } from "../../../redux/slices/companySlice";
import ConfirmModal from "@/components/Misc/ConfirmModal";
import {
  setShowModal,
  useSelectShowModal,
} from "../../../redux/slices/confirmModalSlice";
import { ActionButton } from "@/components/Misc/ActionButton";

const ClientGroupList = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const currCompanyID = useSelectCurrCompanyId();
  const clientGroups = useSelectAllClientGroups();
  const showModal = useSelectShowModal();
  const [targetGroupId, setTargetGroupId] = useState();

  useEffect(() => {
    dispatch(getAllClientGroups({ company_id: currCompanyID }));
  }, [currCompanyID]);

  const loading = false;

  const fixedColumns = getColumnsForPage("client-group-list");

  const tableData = (clientGroups || []).map((group) => {
    const row = {
      id: group.client_group_id,
      client_group_name: group.client_group_name,
      created_at: group.created_at,
    };

    return row;
  });

  const handleAction = (action, row) => {
    if (action === "edit") {
      router.push(`/client/group-list/${row.id}/edit-client-group`);
    }

    if (action === "delete") {
      dispatch(setShowModal(true));
      setTargetGroupId(row.id);
    }
  };

  const handleSelectionChange = (selectedIds) => {
    console.log("Selected clientGroups:", selectedIds);
  };

  const handleRowClick = (row) => {
    console.log("Row clicked:", row);
  };

  const handleSort = (sortConfig) => {
    console.log("Sort config:", sortConfig);
  };

  const onHandleDeleteGroup = () => {
    if (targetGroupId) {
      dispatch(
        deleteClientGroup({
          client_group_id: targetGroupId,
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
        description={"Are you sure to delete this group ? "}
        onConfirm={() => {
          onHandleDeleteGroup();
        }}
        onCancel={() => {
          dispatch(setShowModal(false));
        }}
      />
      <div className="title-container">
        <h1>Client Group List</h1>
        <div className="title-actions">
          <ActionButton
            label={"Add New Group"}
            type="primary"
            onClick={() => router.push("/client/group-list/new-client-group")}
          />
        </div>
      </div>

      <ReusableTable
        tableId="client_group_list"
        data={tableData}
        fixedColumns={fixedColumns}
        dynamicColumns={[]}
        sortable={true}
        resizable={true}
        selectable={true}
        onAction={handleAction}
        onSort={handleSort}
        onRowClick={handleRowClick}
        onSelectionChange={handleSelectionChange}
        loading={loading}
        emptyMessage="No client groups found"
      />
    </div>
  );
};

export default ClientGroupList;
