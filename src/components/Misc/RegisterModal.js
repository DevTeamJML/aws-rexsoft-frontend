import { useSelectUser, useSelectUserList } from "../../../redux/slices/authSlice";
import React, { Fragment, useEffect, useState } from "react";
import SearchDropdownField from "../FormComponents/SearchDropdownField";

export const RegisterModal = ({
  open,
  description,
  onConfirm,
  onCancel,
  selectedUser,
  setSelectedUser,
}) => {
  const user = useSelectUser();
  const userList = useSelectUserList();

  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    if (userList.length > 0) {
      const updatedList = userList.map((user) => {
        return {
          label: user.display_name,
          value: user,
        };
      });

      setAllUsers(updatedList);
    }
  }, [userList]);

  if (!open) return null;

  return (
    <div className="register-modal-overlay">
      <div className="modal-content">
        <p className="modal-description">{description}</p>
        {(user && user?.role === "admin" && selectedUser !== undefined) && (
          <Fragment>
            <SearchDropdownField
              placeholder={"Select User"}
              options={allUsers}
              width={"100%"}
              value={selectedUser}
              onChange={(value) => setSelectedUser(value)}
              returnFullObject={true}
            />
            &nbsp;
          </Fragment>
        )}

        <div className="modal-actions">
          <button className="btn cancel-btn" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn confirm-btn" onClick={onConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};
