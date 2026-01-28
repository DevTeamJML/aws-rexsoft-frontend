import React from "react";
import { ActionButton } from "./ActionButton";
import { RichTextField } from "../FormComponents/RichTextField";

const RtePreviewModal = ({ open, content, onCancel }) => {
  if (!open) return null;

  return (
    <div className="rte-preview-modal-overlay">
      <div className="modal-content">
        <p className="modal-description">Content</p>

        <RichTextField value={content} disabled={true} />

        <div className="modal-actions">
          <ActionButton onClick={onCancel} label={"Back"} type="outlined" />
        </div>
      </div>
    </div>
  );
};

export default RtePreviewModal;
