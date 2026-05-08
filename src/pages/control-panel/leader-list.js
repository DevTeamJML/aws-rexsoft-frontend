// pages/user/user-list.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";
import ReusableTable from "@/components/ReusableTable/ReusableTable";
import { getColumnsForPage } from "@/constants/tableColumns";
import { ActionButton } from "@/components/Misc/ActionButton";
import AssignLeaderModal from "@/components/Misc/AssignLeaderModal";
import {
  assignLeader,
  deleteLeader,
  getAllLeader,
  updateLeader,
  useSelectAllLeader,
} from "../../../redux/slices/leaderSlice";
import { v4 } from "uuid";
import { useSelectCurrCompanyId } from "../../../redux/slices/companySlice";
import { showToast } from "../../../redux/slices/toastSlice";

const UserList = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const currCompany = useSelectCurrCompanyId();
  const allLeaders = useSelectAllLeader();

  const [showModal, setShowModal] = useState(false);
  const [leaderForm, setLeaderForm] = useState({
    user_id: null,
    assigned_members: [],
  });

  const [isEditMode, setIsEditMode] = useState(false);
  const [editingLeaderId, setEditingLeaderId] = useState(null);

  const fixedColumns = getColumnsForPage("leader-list");

  useEffect(() => {
    if (!currCompany) return;

    dispatch(getAllLeader({ company_id: currCompany }));
  }, [currCompany]);

  // const tableData = useMemo(() => {
  //   return [
  //     {
  //       leader_id: 1,
  //       leader_name: "David Lee",
  //       assigned_members: [
  //         { value: 2, label: "John Tan" },
  //         { value: 3, label: "Sarah" },
  //         { value: 9, label: "Teh" },
  //         { value: 10, label: "Ariana" },
  //         { value: 11, label: "Liz" },
  //         { value: 12, label: "Amelia" },
  //         { value: 14, label: "Christina" },
  //         { value: 15, label: "Eva" },
  //       ],
  //       total_members: 2,
  //     },
  //     {
  //       leader_id: 6,
  //       leader_name: "Chang Lun",
  //       assigned_members: [
  //         { value: 4, label: "Pattalung" },
  //         { value: 5, label: "Mae Sa Lung" },
  //       ],
  //       total_members: 2,
  //     },
  //   ];
  // }, []);

  const tableData = useMemo(() => {
    return allLeaders;
  }, [allLeaders]);

  const handleAction = (action, row) => {
    if (action === "edit") {
      setIsEditMode(true);
      setEditingLeaderId(row.leader_id);

      setLeaderForm({
        user_id: row.user_id,
        assigned_members: row.assigned_members.map((m) => m.value) || [],
      });

      setShowModal(true);
    }

    if (action === "delete") {
      dispatch(
        deleteLeader({
          leader_id: row.leader_id,
        }),
      );

      dispatch(
        showToast({
          message: "Leader deleted successfully",
          status: "success",
        }),
      );
    }
  };

  const handleModalConfirm = () => {
    if (!leaderForm.user_id) {
      dispatch(
        showToast({
          message: "Leader must be selected to proceed",
          status: "error",
        }),
      );
      return;
    }

    if (isEditMode) {
      dispatch(
        updateLeader({
          leader_id: editingLeaderId,
          user_id: leaderForm.user_id,
          assigned_members: leaderForm.assigned_members,
          company_id: currCompany,
        }),
      );
    } else {
      dispatch(
        assignLeader({
          leader_id: v4(),
          user_id: leaderForm.user_id,
          assigned_members: leaderForm.assigned_members,
          company_id: currCompany,
        }),
      );
    }

    // reset states
    setShowModal(false);

    setIsEditMode(false);
    setEditingLeaderId(null);

    setLeaderForm({
      user_id: null,
      assigned_members: [],
    });
  };

  const handleModalCancel = () => {
    setShowModal(false);
  };

  return (
    <div className={"leader-page-container"}>
      <div className={"title-container"}>
        <h1 className={"title"}>Leader List</h1>
        <div className={"title-actions"}>
          <ActionButton
            label="Assign Leader"
            type="primary"
            onClick={() => {
              setIsEditMode(false);
              setEditingLeaderId(null);
              setLeaderForm({
                user_id: null,
                assigned_members: [],
              });
              setShowModal(true);
            }}
          />
        </div>
      </div>

      <AssignLeaderModal
        open={showModal}
        onConfirm={handleModalConfirm}
        onCancel={handleModalCancel}
        leaderForm={leaderForm}
        setLeaderForm={setLeaderForm}
      />

      <ReusableTable
        tableId="leader_list"
        editableAction={false}
        data={tableData}
        fixedColumns={fixedColumns}
        dynamicColumns={[]}
        onAction={handleAction}
        onSelectionChange={(ids) => console.log("Selected:", ids)}
        loading={false}
        emptyMessage="No leaders found"
        actionButtons={["edit", "delete"]}
      />
    </div>
  );
};

export default UserList;
