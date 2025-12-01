"use client";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  acceptInvitation,
  selectAcceptInvitationLoading,
} from "../../../redux/slices/invitationSlice";

export default function AcceptInvitationForm({ invitation, role_id }) {
  const dispatch = useDispatch();
  const loading = selectAcceptInvitationLoading();

  const handleAccept = () => {
    const data = {
      invitation_id: invitation.invitation_id,
      company_id: invitation.company_id,
      is_owner: 0,
      role_id: role_id,
      user_id: invitation.user_id,
    };
    dispatch(acceptInvitation(data));
  };

  return (
    <div className="form">
      <div className="center-icon">📧</div>

      <div className="form-header center">
        <h1 className="form-title">{`You have Been Invited`}</h1>
        <p className="form-sub">
          {invitation.company_name} invited you to join
        </p>
      </div>

      <div className="field">
        <button
          className="btn primary"
          onClick={handleAccept}
          disabled={loading}
        >
          {loading ? <span className="btn-spinner" /> : "Accept Invitation"}
        </button>
      </div>
    </div>
  );
}
