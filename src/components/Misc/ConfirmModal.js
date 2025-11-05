import React from "react";

const ConfirmModal = ({ open, description, onConfirm, onCancel }) => {
  if (!open) return null;

  return (
    <div className="confirm-modal-overlay modal-overlay">
      <div className="modal-content">
        <p className="modal-description">{description}</p>
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

export default ConfirmModal;
