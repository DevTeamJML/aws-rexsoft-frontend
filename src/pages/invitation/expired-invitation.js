"use client";
import React from "react";

export default function ExpiredInvitationForm() {
  return (
    <div className="form expired">
      <div className="center-icon">⏰</div>
      <h2 className="form-title">Invitation Expired</h2>
      <p className="form-sub">This invitation is no longer valid. Please contact your administrator for a new invitation.</p>
    </div>
  );
}
