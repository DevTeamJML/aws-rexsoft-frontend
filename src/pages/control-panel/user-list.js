// pages/user/user-list.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";
import ReusableTable from "@/components/ReusableTable/ReusableTable";
import { getColumnsForPage } from "@/constants/tableColumns";
import ConfirmModal from "@/components/Misc/ConfirmModal";
import { ActionButton } from "@/components/Misc/ActionButton";

import {
  setShowModal,
  useSelectShowModal,
} from "../../../redux/slices/confirmModalSlice";
import {
  useSelectAllCompanyUsers,
  useSelectCurrCompanyId,
} from "../../../redux/slices/companySlice";
import { PlainTextField } from "@/components/FormComponents/PlainTextField";
import {
  getAllInvitationAndUser,
  removeInvitationAndUser,
  useSelectAllInvitationAndUser,
} from "../../../redux/slices/invitationSlice";

const UserList = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const users = useSelectAllCompanyUsers();
  const showModal = useSelectShowModal();
  const companyId = useSelectCurrCompanyId();
  const [modalMode, setModalMode] = useState("delete"); // "delete" | "edit"
  const [targetUserId, setTargetUserId] = useState(null);
  const [modalInitialPayload, setModalInitialPayload] = useState({});
  const [selectedData, setSelectedData] = useState(null);

  const allInvitationAndUser = useSelectAllInvitationAndUser();
  useEffect(() => {
    if (companyId) {
      dispatch(getAllInvitationAndUser(companyId));
    }
  }, [companyId]);

  const fixedColumns = getColumnsForPage("user-list");
  const role = [
    { label: "Admin", value: "ADMIN" },
    { label: "User", value: "USER" },
  ];

  const tableData = useMemo(() => {
    if (!allInvitationAndUser || !Array.isArray(allInvitationAndUser))
      return [];

    return allInvitationAndUser.map((u) => {
      const id = u.user_id ?? u.id ?? null;

      const first = u.first_name ?? "";
      const last = u.last_name ?? "";
      const nameFromParts = `${first} ${last}`.trim();
      const name = nameFromParts || "—";

      const email = u.email ?? "—";
      const role = u.role ?? "User";

      let status = "—";
      if (typeof u.status === "string" && u.status.length > 0) {
        status = u.status;
      }

      const created_at = u.created_at ?? "—";
      
      return {
        id,
        raw: u,
        name,
        email,
        role,
        status,
        created_at,
      };
    });
  }, [allInvitationAndUser]);

  const findUserById = (id) => (tableData.find((r) => r.id === id) || {}).raw;

  const handleAction = (action, row) => {
    if (action === "edit") {
        console.log("Test")
    //   router.push(`/user/${row.id}/view`);
      return;
    }

    if (action === "delete") {
      setModalMode("delete");
      setTargetUserId(row.id);
      setModalInitialPayload({});
      setSelectedData(row);
      dispatch(setShowModal(true));
      return;
    }
  };

  // Called when ConfirmModal's Confirm clicked (receives payload set by modal)
  const handleModalConfirm = (payload) => {
    if (modalMode === "edit") {
      console.log("Edit payload:", payload, "user:", targetUserId);

      // dispatch updateUser thunk if you have one:
      // dispatch(updateUser({ user_id: targetUserId, ...payload }));

      dispatch(setShowModal(false));
      setTargetUserId(null);
      setModalInitialPayload({});
      return;
    } else {
      if (selectedData) {
        const id = selectedData.id;
        const status = selectedData.status;
        dispatch(
          removeInvitationAndUser({
            id,
            status,
            company_id: companyId,
          })
        );
        dispatch(setShowModal(false));
        setTargetUserId(null);
      }
    }
  };

  const handleModalCancel = () => {
    dispatch(setShowModal(false));
    setTargetUserId(null);
  };

  return (
    <div className={"user-page-container"}>
      <ConfirmModal
        open={showModal}
        initialPayload={modalInitialPayload}
        onConfirm={handleModalConfirm}
        onCancel={handleModalCancel}
        description={"Are you sure to remove this user ?"}
      />

      <div className={"title-container"}>
        <h1 className={"title"}>User List</h1>
        <div className={"title-actions"}>
          <ActionButton
            label="Invite User"
            type="primary"
            onClick={() => router.push("/control-panel/new-invite-user")}
          />
        </div>
      </div>

      <ReusableTable
        tableId="user_list"
        data={tableData}
        fixedColumns={fixedColumns}
        dynamicColumns={[]}
        onAction={handleAction}
        onSelectionChange={(ids) => console.log("Selected:", ids)}
        loading={false}
        emptyMessage="No users found"
      />
    </div>
  );
};

export default UserList;
