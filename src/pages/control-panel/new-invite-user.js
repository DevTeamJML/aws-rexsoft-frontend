"use client";

import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/router";
import { v4 } from "uuid";

import { PlainTextField } from "@/components/FormComponents/PlainTextField";
import { useSelectCurrCompany } from "../../../redux/slices/companySlice";
import { useSelectUser } from "../../../redux/slices/authSlice";
import { inviteUserToCompany } from "../../../redux/slices/invitationSlice";
import { ActionButton } from "@/components/Misc/ActionButton";

export default function NewInviteUser() {
  const dispatch = useDispatch();
  const router = useRouter();
  const company = useSelectCurrCompany();
  const user = useSelectUser();

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
  const [role, setRole] = useState("USER");
  // const [permissions, setPermissions] = useState(defaultPermissions);

  const [errors, setErrors] = useState({});

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

    const body = {
      invitation_id: v4(),
      first_name: firstName.trim(),
      email: email.trim(),
      is_admin: role,
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

  /** Update nested boolean permission */
  // const setNestedPermission = (path, value) => {
  //   setPermissions((prev) => {
  //     const next = structuredClone(prev);
  //     let cur = next;
  //     path.slice(0, -1).forEach((p) => (cur = cur[p]));
  //     cur[path[path.length - 1]] = value;
  //     return next;
  //   });
  // };

  /** Render a permission section */
  // const renderPermissionSection = (sectionKey, title) => (
  //   <div className="permission-section">
  //     <div className="section-header">{title}</div>
  //     {PERMISSION_DEFINITIONS[sectionKey].map((item) => {
  //       const value = permissions?.[sectionKey]?.[item.key] ?? false;
  //       return (
  //         <div className="permission-item" key={item.key}>
  //           <div className="permission-main">
  //             <div className="permission-text">
  //               <div className="permission-title">{item.label}</div>
  //               <div className="permission-desc">{item.desc}</div>
  //             </div>
  //             <div className="permission-switch">
  //               <Switch
  //                 checked={value}
  //                 onChange={(val) =>
  //                   setNestedPermission([sectionKey, item.key], val)
  //                 }
  //               />
  //             </div>
  //           </div>
  //           <hr className="permission-sep" />
  //         </div>
  //       );
  //     })}
  //   </div>
  // );

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
            </select>
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
          <ActionButton
            type="primary"
            label="Create Role"
            onClick={handleInvite}
          />
        </div>
      </form>
    </div>
  );
}
