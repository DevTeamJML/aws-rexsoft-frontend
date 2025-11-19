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
  // const { clientGroups, loading, clientCustomFields, pagination } = useSelector(state => state.client);

  useEffect(() => {
    dispatch(getAllClientGroups({ company_id: currCompanyID }));
  }, [currCompanyID]);

  // Mock data for testing
  // const clientGroups = [
  //   {
  //     client_group_id: 1,
  //     client_group_name: "CL001",
  //     created_at: "2024-01-15",
  //   },
  //   {
  //     client_group_id: 2,
  //     client_group_name: "CL002",
  //     created_at: "2024-01-16",
  //   },
  //   {
  //     client_group_id: 3,
  //     client_group_name: "CL003",
  //     created_at: "2024-01-17",
  //   },
  // ];
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

    // console.log("Delete id : ", targetGroupId);
  };

  return (
    <div className="page-container">
      {/* <PageHeader /> */}
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
        // Pagination props
        // pagination={true}
        // currentPage={pagination.currentPage}
        // totalPages={pagination.totalPages}
        // totalItems={pagination.totalItems}
        // pageSize={pagination.pageSize}
        // onPageChange={handlePageChange}
        // onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
};

export default ClientGroupList;
