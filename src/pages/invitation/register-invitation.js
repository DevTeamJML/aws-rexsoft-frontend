import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  registerAndAcceptInvitation,
  selectRegisterAndAcceptInvitationLoading,
} from "../../../redux/slices/invitationSlice";
import { PlainTextField } from "@/components/FormComponents/PlainTextField";

export default function RegistrationForm({ invitation, role_id }) {
  const dispatch = useDispatch();
  const loading = selectRegisterAndAcceptInvitationLoading();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    password: "",
    confirm_password: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false,
  });

  useEffect(() => {
    // Reset errors when user types
    setErrors({});
  }, [form]);

  const validate = () => {
    const e = {};
    if (!form.first_name.trim()) e.first_name = "First name is required";
    if (!form.password) e.password = "Password is required";
    if (!form.confirm_password) e.confirm_password = "Confirm your password";
    if (
      form.password &&
      form.confirm_password &&
      form.password !== form.confirm_password
    ) {
      e.confirm_password = "Your passwords do not match";
    }
    return e;
  };

  const handleChange = (ev) => {
    const { name, value } = ev.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleToggle = (key) =>
    setShowPassword((p) => ({ ...p, [key]: !p[key] }));

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
      email: invitation.email,
      password: form.password,
      company_id: invitation.company_id,
      invitation_id: invitation.invitation_id,
      role_id: role_id,
      is_owner: 0,
    };

    dispatch(registerAndAcceptInvitation(payload));
  };

  return (
    <form
      className="form"
      onSubmit={handleSubmit}
      autoComplete="off"
      noValidate
    >
      <div className="form-header">
        <h1 className="form-title">SIGN UP</h1>
        <p className="form-sub">
          Sign up and accept invitation to{" "}
          <strong>{invitation?.company_name}</strong>
        </p>
      </div>

      <div className="field read-only-email">
        <label>Email</label>
        <div className="email-value">{invitation?.email}</div>
      </div>

      <div className="field">
        <PlainTextField
          placeholder="First Name"
          width="100%"
          required={true}
          type="text"
          value={form.first_name}
          onChange={(val) => setForm((prev) => ({ ...prev, first_name: val }))}
        />
        {errors.first_name && (
          <div className="field-error">{errors.first_name}</div>
        )}

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
          value={form.last_name}
          onChange={(val) => setForm((prev) => ({ ...prev, last_name: val }))}
        />
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

      <div className="field">
        <button className="btn primary" type="submit" disabled={loading}>
          {loading ? (
            <span className="btn-spinner" />
          ) : (
            "Sign Up & Accept Invitation"
          )}
        </button>
      </div>
    </form>
  );
}
