import React from "react";
import { ActionButton } from "./ActionButton";

const ConfirmModal = ({ open, description, onConfirm, onCancel }) => {
  if (!open) return null;

  return (
    <div className="confirm-modal-overlay">
      <div className="modal-content">
        <p className="modal-description">{description}</p>
        <div className="modal-actions">
          {/* <button className="btn cancel-btn" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn confirm-btn" onClick={onConfirm}>
            Confirm
          </button> */}
          <ActionButton onClick={onCancel} label={"Cancel"} type="outlined"/>
          <ActionButton onClick={onConfirm} label={"Confirm"} type="primary"/>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
