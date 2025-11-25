"use client";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "next/navigation";

import AcceptInvitationForm from "./invitation/accept-invitation";
import RegistrationForm from "./invitation/register-invitation";
import ExpiredInvitationForm from "./invitation/expired-invitation";
import {
  getInvitationById,
  selectInvitation,
  selectRetrieveInvitationError,
  selectRetrieveInvitationLoading,
} from "../../redux/slices/invitationSlice";

export default function InvitationPage() {
  const searchParams = useSearchParams();
  const dispatch = useDispatch();

  const invitation = selectInvitation();
  const invitationLoading = selectRetrieveInvitationLoading();
  const invitationError = selectRetrieveInvitationError();
  const invitation_id = searchParams.get("invitation_id");

  console.log(invitation);

  useEffect(() => {
    if (invitation_id) {
      dispatch(getInvitationById(invitation_id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invitation_id]);

  const renderContent = () => {
    if (invitationLoading) {
      return (
        <div className="centered">
          <div className="spinner" data-testid="invitation-progressbar" />
        </div>
      );
    }

    if (invitationError) {
      return <ExpiredInvitationForm />;
    }

    // invitation might be null while loading or before load
    if (!invitation) {
      return null;
    }

    if (invitation.user_exists) {
      return <AcceptInvitationForm invitation={invitation} />;
    } else {
      return <RegistrationForm invitation={invitation} />;
    }
  };

  return (
    <main className="invitation-page">
      <section className="invitation-left">
        <div className="invitation-panel">{renderContent()}</div>
      </section>
    </main>
  );
}
