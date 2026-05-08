import React, { useEffect, useMemo, useState } from "react";
import { ActionButton } from "./ActionButton";
import { useSelectAllCompanyUsers } from "../../../redux/slices/companySlice";
import { DropdownField } from "../FormComponents/DropdownField";
import { PlainTextField } from "../FormComponents/PlainTextField";

const AssignLeaderModal = ({
  open,
  description,
  onConfirm,
  onCancel,
  leaderForm,
  setLeaderForm,
}) => {
  if (!open) return null;

  const allCompanyUsers = useSelectAllCompanyUsers();

  const [memberSearch, setMemberSearch] = useState("");
  const selectedMembers = leaderForm.assigned_members || [];

  const normalizedCompanyUsers = useMemo(() => {
    const search = memberSearch.trim().toLowerCase();

    return (allCompanyUsers || [])
      .filter((u) => u.user_id !== leaderForm.user_id)
      .map((u) => {
        const id = u.user_id ?? u.id ?? u.userId;

        const name =
          `${u.first_name ?? u.firstName ?? ""} ${
            u.last_name ?? u.lastName ?? ""
          }`.trim() ||
          u.email ||
          "—";

        const email = u.email ?? u.email_address ?? "";

        return {
          id,
          name,
          email,
        };
      })
      .filter((u) => {
        if (!search) return true;

        return (
          u.name.toLowerCase().includes(search) ||
          u.email.toLowerCase().includes(search)
        );
      });
  }, [allCompanyUsers, leaderForm.user_id, memberSearch]);

  const listData = useMemo(() => {
    if (!allCompanyUsers) return [];
    return allCompanyUsers.map((u) => {
      return {
        label: u.displayName,
        value: u.user_id,
      };
    });
  }, [allCompanyUsers]);

  const handlerLeaderSelection = (val) => {
    setLeaderForm((prev) => {
      return {
        ...prev,
        user_id: val,
        assigned_members: prev.assigned_members.filter((id) => id !== val),
      };
    });
  };
  const handleMemberToggle = (memberId) => {
    setLeaderForm((prev) => {
      const alreadySelected = prev.assigned_members.includes(memberId);

      return {
        ...prev,
        assigned_members: alreadySelected
          ? prev.assigned_members.filter((id) => id !== memberId)
          : [...prev.assigned_members, memberId],
      };
    });
  };

  return (
    <div className="modal-overlay assign-leader-modal-overlay">
      <div className="modal-content">
        <div className="assign-leader-modal-body">
          <div className="leader-container">
            <div className="list-header">
              <span className="list-title">Choose Leader</span>
              <span className="list-desc">
                Select one user to be the leader.
              </span>
            </div>
            <DropdownField
              dropdownList={listData}
              value={leaderForm["user_id"]}
              onChange={handlerLeaderSelection}
            />
          </div>

          <div className="assign-member-container">
            <div className="list-container">
              <div className="list-header">
                <span className="list-title">Assign Members</span>
                <span className="list-desc">
                  Select one or more members to be under the chosen leader.
                </span>
              </div>

              <div className="list-body">
                <div className="list-search">
                  <PlainTextField
                    value={memberSearch}
                    onChange={setMemberSearch}
                    placeholder="Search by name or email"
                  />
                </div>

                <div className="list">
                  {normalizedCompanyUsers.length === 0 ? (
                    <div className="empty">No members found</div>
                  ) : (
                    normalizedCompanyUsers.map((m) => (
                      <label key={m.id} className="list-item">
                        <input
                          type="checkbox"
                          checked={selectedMembers.includes(m.id)}
                          onChange={() => handleMemberToggle(m.id)}
                          aria-label={`Select ${m.name}`}
                        />
                        <div className="member-info">
                          <div className="member-name">{m.name}</div>
                          <div className="member-email">{m.email}</div>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="modal-actions">
          <ActionButton onClick={onCancel} label={"Cancel"} type="outlined" />
          <ActionButton onClick={onConfirm} label={"Confirm"} type="primary" />
        </div>
      </div>
    </div>
  );
};

export default AssignLeaderModal;
