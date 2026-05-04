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
  updateAllInvitationAndUser,
  useSelectAllInvitationAndUser,
} from "../../../redux/slices/invitationSlice";
import { hideToast, showToast } from "../../../redux/slices/toastSlice";
import EditUserModal from "@/components/Misc/EditUserModal";

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
      const user = findUserById(row.id);

      setModalMode("edit");
      setTargetUserId(row.id);

      setModalInitialPayload({
        first_name: user?.first_name || "",
        last_name: user?.last_name || "",
        email: user?.email || "",
        role: user?.role || "USER",
      });

      if (row.status === "active") {
        dispatch(setShowModal(true));
      } else {
        dispatch(showToast({
          message : "User has not joined yet. Please try again later.",
          status : "error"
        }))
      }
    }

    if (action === "delete") {
      setModalMode("delete");
      setTargetUserId(row.id);
      setModalInitialPayload({});
      setSelectedData(row);
      dispatch(setShowModal(true));
      return;
    }

    if (action === "copy") {
      navigator.clipboard.writeText(String(row));
      dispatch(
        showToast({
          message: "Copied UID successfully",
          status: "success",
        }),
      );
      setTimeout(() => {
        dispatch(hideToast());
      }, 2000);
    }
  };

  const handleModalConfirm = (payload) => {
    if (modalMode === "edit") {
      const newPayload = {
        user_id: targetUserId,
        ...payload,
      };

      dispatch(updateAllInvitationAndUser(newPayload));

      dispatch(setShowModal(false));
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
          }),
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

      <EditUserModal
        open={showModal && modalMode === "edit"}
        initialData={modalInitialPayload}
        onSubmit={handleModalConfirm}
        onCancel={handleModalCancel}
      />

      <div className={"title-container"}>
        <h1 className={"title"}>User List</h1>
        <div className={"title-actions"}>
          <ActionButton
            label="Invite User"
            type="primary"
            onClick={() => router.push("/control-panel/new-invite-user")}
          />
          {/* <ActionButton
            label="Create User"
            type="primary"
            onClick={() => router.push("/control-panel/create-user")}
          /> */}
        </div>
      </div>

      <ReusableTable
        tableId="user_list"
        editableAction={false}
        data={tableData}
        fixedColumns={fixedColumns}
        dynamicColumns={[]}
        onAction={handleAction}
        onSelectionChange={(ids) => console.log("Selected:", ids)}
        loading={false}
        emptyMessage="No users found"
        actionButtons={["copy", "edit", "delete"]}
      />
    </div>
  );
};

export default UserList;
