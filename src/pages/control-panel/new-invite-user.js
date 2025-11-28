"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { v4 } from "uuid";

import { PlainTextField } from "@/components/FormComponents/PlainTextField";
import {
  useSelectCurrCompany,
  useSelectCurrCompanyId,
} from "../../../redux/slices/companySlice";
import { useSelectUser } from "../../../redux/slices/authSlice";
import { inviteUserToCompany } from "../../../redux/slices/invitationSlice";
import { ActionButton } from "@/components/Misc/ActionButton";
import {
  getAllRoles,
  useSelectAllRoles,
} from "../../../redux/slices/roleSlice";
import { DropdownField } from "@/components/FormComponents/DropdownField";
import { showToast } from "../../../redux/slices/toastSlice";

export default function NewInviteUser() {
  const dispatch = useDispatch();
  const router = useRouter();
  const company = useSelectCurrCompany();
  const user = useSelectUser();
  const currCompanyId = useSelectCurrCompanyId();

  /** ---------------------------
   * Permissions (boolean version)
   * --------------------------- */
  /** Switch Component */
  const Switch = ({ checked, onChange, ariaLabel }) => (
    <label className="toggle">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        aria-label={ariaLabel}
      />
      <span className="slider" />
    </label>
  );

  /** Role Options */
  const roleOptions = [
    { label: "Admin", value: "ADMIN" },
    { label: "User", value: "USER" },
  ];

  /** Form Inputs */
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [adminRole, setAdminRole] = useState("USER");
  const allRoles = useSelectAllRoles();

  // const [permissions, setPermissions] = useState(defaultPermissions);

  const [errors, setErrors] = useState({});

  const roles = useMemo(() => {
    if (!allRoles || !Array.isArray(allRoles)) return [];

    return allRoles.map((r) => {
        return {
          label: r.role_name,
          value: r.role_id
        }
    });
  }, [allRoles]);

  /** Validate fields */
  const validate = () => {
    const e = {};
    if (!firstName.trim()) e.first_name = "First name is required";
    if (!email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      e.email = "Enter a valid email";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /** Submit Handler */
  const handleInvite = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;

    if(adminRole === "" || role === ""){
      dispatch(showToast({
        message : "You must assign privilege and role to the user",
        status : "error"
      }))
      return;
    }
    const body = {
      invitation_id: v4(),
      first_name: firstName.trim(),
      email: email.trim(),
      is_admin: adminRole,
      role_id: role,
      company_name: company?.company_name,
      company_id: company?.company_id,
      inviterName: `${user?.first_name || ""} ${user?.last_name || ""}`.trim(),
    };

    try {
      dispatch(inviteUserToCompany({ router, body }));
    } catch (err) {
      console.error("Invite failed", err);
    }
  };

  useEffect(() => {
    if (currCompanyId) {
      dispatch(getAllRoles({ company_id: currCompanyId }));
    }
  }, [currCompanyId]);

  const handleCancel = (e) => {
    e.preventDefault();
    router.back();
  };


  return (
    <div className="new-invite-user-container">
      <header className="page-header">
        <h1 className="title">Invite New User</h1>
      </header>

      <form className="form" onSubmit={handleInvite} noValidate>
        {/* First row */}
        <div className="form-row">
          <div className="form-col">
            <PlainTextField
              className="plain-text-field"
              value={firstName}
              onChange={setFirstName}
              label="First Name"
              placeholder="Enter first name"
            />
            {errors.first_name && (
              <div className="error">{errors.first_name}</div>
            )}
          </div>

          <div className="form-col">
            <PlainTextField
              className="plain-text-field"
              value={email}
              onChange={setEmail}
              label="Email"
              placeholder="user@example.com"
            />
            {errors.email && <div className="error">{errors.email}</div>}
          </div>
        </div>

        {/* Role */}
        <div className="form-row">
          <div className="form-col-full">
            <label className="field-label">Admin/User</label>
            {/* <select
              className="select"
              value={adminRole}
              onChange={(e) => setAdminRole(e.target.value)}
            >
              {roleOptions.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select> */}

            <DropdownField
              value={adminRole ?? ""}
              dropdownList={roleOptions}
              onChange={(value) => setAdminRole(value)}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-col-full">
            <label className="field-label">User Role</label>
            {/* <label className="field-label">Role</label>
            <select
              className="select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              {roleOptions.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select> */}
            <DropdownField
              value={role ?? ""}
              dropdownList={roles}
              onChange={(value) => setRole(value)}
            />
          </div>
        </div>

        {/* Permission Sections */}
        {/* {role !== "ADMIN" && (
          <div className="permissions">
            <div className="permissions-scroll">
              {renderPermissionSection("graph", "Graph Permissions")}
              {renderPermissionSection("logs", "Logs")}
              {renderPermissionSection("client", "Client Permissions")}
              {renderPermissionSection("kpi", "KPI Permissions")}
              {renderPermissionSection("form", "Form Permissions")}
              {renderPermissionSection("appointment", "Appointment Permissions")}
              {renderPermissionSection("control_panel", "Control Panel")}
            </div>
          </div>
        )} */}

        {/* Submit Button */}
        <div className="form-actions">
          <ActionButton type="outlined" label="Cancel" onClick={handleCancel} />
          <ActionButton type="primary" label="Invite" onClick={handleInvite} />
        </div>
      </form>
    </div>
  );
}
