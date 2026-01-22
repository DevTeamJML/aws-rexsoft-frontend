// pages/role/role-list.jsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";
import ReusableTable from "@/components/ReusableTable/ReusableTable";
import { getColumnsForPage } from "@/constants/tableColumns";
import ConfirmModal from "@/components/Misc/ConfirmModal";
import { ActionButton } from "@/components/Misc/ActionButton";

import { useSelectCurrCompanyId } from "../../../redux/slices/companySlice";
import { deleteRole, getAllRoles, useSelectAllRoles, useSelectRoleListLoading } from "../../../redux/slices/roleSlice";

/**
 * Role list page (wired to redux)
 */

const RoleList = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const companyId = useSelectCurrCompanyId();
  const roles = useSelectAllRoles();
  const listLoading = useSelectRoleListLoading();

  // local modal state (self-contained)
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("delete"); // "delete" | "edit"
  const [targetRoleId, setTargetRoleId] = useState(null);
  const [modalInitialPayload, setModalInitialPayload] = useState({});
  const [selectedData, setSelectedData] = useState(null);

  useEffect(() => {
    if (companyId) {
      dispatch(getAllRoles({ company_id: companyId }));
    }
  }, [companyId, dispatch]);

  // fixed columns come from your existing tableColumns constant
  const fixedColumns = getColumnsForPage("role-list");

  // build table rows expected by ReusableTable from roles in store
  const tableData = useMemo(() => {
    if (!roles || !Array.isArray(roles)) return [];

    return roles.map((r) => {
      // handle either role.role_id or role.id
      const id = r.role_id ?? r.id ?? r.roleId ?? null;
      return {
        id,
        raw: r,
        role_name: r.role_name ?? r.name ?? r.roleName ?? "—",
        member_count: String(r.member_count ?? r.memberCount ?? 0),
        created_at: r.created_at ?? r.createdAt ?? "—",
      };
    });
  }, [roles]);

  const handleAction = (action, row) => {
    if (action === "edit") {
      router.push(`/control-panel/new-role?role_id=${row.id}`);
      return;
    }

    if (action === "delete") {
      setModalMode("delete");
      setTargetRoleId(row.id);
      setModalInitialPayload({});
      setSelectedData(row);
      setShowModal(true);
      return;
    }
  };

  const handleModalConfirm = (payload) => {
    if (modalMode === "edit") {
      console.log("Edit payload (demo):", payload, "role:", targetRoleId);
      setShowModal(false);
      setTargetRoleId(null);
      setModalInitialPayload({});
      return;
    } else {
      if (selectedData) {
        console.log("Deleting role (demo):", selectedData.id);
        dispatch(deleteRole({role_id : selectedData.id}));
        setShowModal(false);
        setTargetRoleId(null);
      }
    }
  };

  const handleModalCancel = () => {
    setShowModal(false);
    setTargetRoleId(null);
  };

  return (
    <div className={"role-page-container"}>
      <ConfirmModal
        open={showModal}
        initialPayload={modalInitialPayload}
        onConfirm={handleModalConfirm}
        onCancel={handleModalCancel}
        description={"Are you sure you want to remove this role?"}
      />

      <div className={"title-container"}>
        <h1 className={"title"}>Role List</h1>
        <div className={"title-actions"}>
          <ActionButton
            label="Create Role"
            type="primary"
            onClick={() => router.push("/control-panel/new-role")}
          />
        </div>
      </div>

      <ReusableTable
        tableId="role_list"
        data={tableData}
        fixedColumns={fixedColumns}
        dynamicColumns={[]}
        onAction={handleAction}
        onSelectionChange={(ids) => console.log("Selected roles:", ids)}
        emptyMessage="No roles found"
      />
    </div>
  );
};

export default RoleList;
