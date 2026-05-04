import React, { useEffect, useState } from "react";
import { ActionButton } from "@/components/Misc/ActionButton";
import { PlainTextField } from "../FormComponents/PlainTextField";

const EditUserModal = ({ open, initialData, onSubmit, onCancel }) => {
  const [form, setForm] = useState(initialData || {});

  useEffect(() => {
    setForm(initialData || {});
  }, [initialData]);

  if (!open) return null;

  return (
    <div className="modal-overlay confirm-modal-overlay">
      <div className="modal-content">
        <p className="modal-description">Update user</p>

        <div className="modal-body edit-modal-body" style={{ display: "flex", gap: "12px" }}>
          <PlainTextField
            placeholder={"First Name"}
            width={"100%"}
            required={false}
            type={"text"}
            value={form.first_name || ""}
            onChange={(val) => {
              setForm((prev) => ({ ...prev, first_name: val }));
            }}
          />

          <PlainTextField
            placeholder={"Last Name"}
            width={"100%"}
            required={false}
            type={"text"}
            value={form.last_name || ""}
            onChange={(val) => {
              setForm((prev) => ({ ...prev, last_name: val }));
            }}
          />
        </div>

        <div className="modal-actions">
          <ActionButton onClick={onCancel} label="Cancel" type="outlined" />
          <ActionButton
            onClick={() => onSubmit(form)}
            label="Update"
            type="primary"
          />
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;
