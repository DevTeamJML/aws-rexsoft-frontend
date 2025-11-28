import React, { useEffect, useState, useMemo } from "react";
import { useDispatch } from "react-redux";
import {
  registerAndAcceptInvitation,
  selectRegisterAndAcceptInvitationLoading,
} from "../../../redux/slices/invitationSlice";
import { PlainTextField } from "@/components/FormComponents/PlainTextField";
import {
  getAllRoles,
  useSelectAllRoles,
} from "../../../redux/slices/roleSlice";
import { useSelectCurrCompanyId } from "../../../redux/slices/companySlice";
import { DropdownField } from "@/components/FormComponents/DropdownField";
import { ActionButton } from "@/components/Misc/ActionButton";

export default function RegistrationForm() {
  const dispatch = useDispatch();
  const loading = selectRegisterAndAcceptInvitationLoading();

  const currCompanyId = useSelectCurrCompanyId();
  const allRoles = useSelectAllRoles();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    confirm_password: "",
    role_id: "", // selected role id
    is_owner: 0,
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false,
  });

  // admin options (privilege)
  const adminOptions = [
    { label: "Admin", value: "ADMIN" },
    { label: "User", value: "USER" },
  ];

  // map roles into DropdownField format (label/value)
  const roleOptions = useMemo(() => {
    if (!allRoles || !Array.isArray(allRoles)) return [];
    return allRoles.map((r) => ({ label: r.role_name, value: r.role_id }));
  }, [allRoles]);

  useEffect(() => {
    // reset errors when user types
    setErrors({});
  }, [form]);

  useEffect(() => {
    if (currCompanyId) {
      dispatch(getAllRoles({ company_id: currCompanyId }));
    }
  }, [currCompanyId, dispatch]);

  const validate = () => {
    const e = {};
    if (!form.first_name.trim()) e.first_name = "First name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = "Enter a valid email";
    if (!form.password) e.password = "Password is required";
    if (!form.confirm_password) e.confirm_password = "Confirm your password";
    if (
      form.password &&
      form.confirm_password &&
      form.password !== form.confirm_password
    )
      e.confirm_password = "Your passwords do not match";
    // require role and admin selection
    if (!form.role_id) e.role_id = "Please select a user role";
    // is_owner is derived from admin dropdown; we still require admin selection
    // (we store it as numeric 0/1 below)
    return e;
  };

  const handleChange = (ev) => {
    const { name, value } = ev.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleToggle = (key) =>
    setShowPassword((p) => ({ ...p, [key]: !p[key] }));

  // called when admin dropdown changes (ADMIN / USER)
  const handleAdminChange = (value) => {
    // convert ADMIN => is_owner: 1, USER => is_owner: 0
    const isOwner = value === "ADMIN" ? 1 : 0;
    setForm((p) => ({ ...p, is_owner: isOwner }));
  };

  // called when role dropdown changes
  const handleRoleChange = (value) => {
    setForm((p) => ({ ...p, role_id: value }));
  };

  const handleSubmit = (ev) => {
    ev.preventDefault();
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      return;
    }

    const payload = {
      first_name: form.first_name,
      last_name: form.last_name,
      email: form.email,
      password: form.password,
      company_id: currCompanyId,
      invitation_id: null,
      role_id: form.role_id,
      is_owner: form.is_owner,
    };

    dispatch(registerAndAcceptInvitation(payload));
  };

  return (
    <div className="create-user-container">
      <form
        className="form"
        onSubmit={handleSubmit}
        autoComplete="off"
        noValidate
      >
        <div className="form-header">
          <h1 className="form-title">SIGN UP</h1>
        </div>

        <div className="field">
          <PlainTextField
            placeholder="First Name"
            width="100%"
            required={true}
            type="text"
            name="first_name"
            value={form.first_name}
            onChange={(val) =>
              setForm((prev) => ({ ...prev, first_name: val }))
            }
          />
          {errors.first_name && (
            <div className="field-error">{errors.first_name}</div>
          )}
        </div>

        <div className="field">
          <PlainTextField
            placeholder="Last Name"
            width="100%"
            required={false}
            type="text"
            name="last_name"
            value={form.last_name}
            onChange={(val) => setForm((prev) => ({ ...prev, last_name: val }))}
          />
        </div>

        <div className="field">
          <PlainTextField
            placeholder="Email"
            width="100%"
            required={true}
            type="email"
            name="email"
            value={form.email}
            onChange={(val) => setForm((prev) => ({ ...prev, email: val }))}
          />
          {errors.email && <div className="field-error">{errors.email}</div>}
        </div>

        <div className="field">
          <label htmlFor="password">Password</label>
          <div className="input-with-action">
            <input
              id="password"
              name="password"
              type={showPassword.password ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              className={errors.password ? "input error" : "input"}
            />
            <button
              type="button"
              className="action-btn"
              onClick={() => handleToggle("password")}
              aria-label="toggle password visibility"
            >
              {showPassword.password ? "Hide" : "Show"}
            </button>
          </div>
          {errors.password && (
            <div className="field-error">{errors.password}</div>
          )}
        </div>

        <div className="field">
          <label htmlFor="confirm_password">Confirm Password</label>
          <div className="input-with-action">
            <input
              id="confirm_password"
              name="confirm_password"
              type={showPassword.confirmPassword ? "text" : "password"}
              value={form.confirm_password}
              onChange={handleChange}
              className={errors.confirm_password ? "input error" : "input"}
            />
            <button
              type="button"
              className="action-btn"
              onClick={() => handleToggle("confirmPassword")}
              aria-label="toggle confirm password visibility"
            >
              {showPassword.confirmPassword ? "Hide" : "Show"}
            </button>
          </div>
          {errors.confirm_password && (
            <div className="field-error">{errors.confirm_password}</div>
          )}
        </div>

        {/* Admin/User privilege */}
        <div className="field">
          <label className="field-label">Admin / User</label>
          <DropdownField
            value={form.is_owner === 1 ? "ADMIN" : "USER"}
            dropdownList={adminOptions}
            onChange={(val) => handleAdminChange(val)}
          />
          {/* Note: we store privilege as is_owner: 1 for ADMIN else 0 */}
        </div>

        {/* Role selection */}
        <div className="field">
          <label className="field-label">User Role</label>
          <DropdownField
            value={form.role_id ?? ""}
            dropdownList={roleOptions}
            onChange={(val) => handleRoleChange(val)}
          />
          {errors.role_id && (
            <div className="field-error">{errors.role_id}</div>
          )}
        </div>

        <div className="footer">
          <ActionButton type="primary" label={"Create User"} />
        </div>
      </form>
    </div>
  );
}
