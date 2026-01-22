"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";

import { PlainTextField } from "@/components/FormComponents/PlainTextField";
import { InputColor } from "@/components/FormComponents/InputColor";
import { ActionButton } from "@/components/Misc/ActionButton";

import { useSelectCurrCompany } from "../../../redux/slices/companySlice";
import {
  createRole,
  updateRole,
  getRole,
  useSelectRoleCurrent,
  useSelectRoleCreating,
  useSelectRoleUpdating,
  useSelectRoleError,
} from "../../../redux/slices/roleSlice";

import { useSelectAllCompanyUsers } from "../../../redux/slices/companySlice";
import { defaultPermissions, PERMISSION_DEFINITIONS } from "@/constants/permissions";
import { expandPermissions, flattenPermissions } from "@/utils/format";

function formatTitle(key) {
  return key
    .split("_") // split snake_case → ["control", "panel"]
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize
    .join(" "); // join → "Control Panel"
}

// small hook to track previous value
function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}


export default function NewRoleWithMembers({ onCreate }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const query = router.query || {};
  const roleIdFromQuery = query.role_id ?? query.id ?? null;

  const company = useSelectCurrCompany();
  const allCompanyUsers = useSelectAllCompanyUsers() || []; // users selector from company slice

  // Role slice selectors
  const roleCurrent = useSelectRoleCurrent();
  const creating = useSelectRoleCreating();
  const updating = useSelectRoleUpdating();
  const roleError = useSelectRoleError();

  const prevCreating = usePrevious(creating);
  const prevUpdating = usePrevious(updating);

  // === Permissions metadata / defaults (kept same as your earlier) ===
  // const defaultPermissions = useMemo(
  //   () => ({
  //     graph: { view_graph: false, manage_graph: false, publish_graph: false },
  //     logs: { view_all: false },
  //     client: {
  //       manage_client: false,
  //       export_client: false,
  //       delete_client: false,
  //       manage_handler: false,
  //     },
  //     client_group: {
  //       manage_client_group: false,
  //     },
  //     kpi: { view_kpi: false, manage_kpi: false, delete_kpi: false },
  //     form: {
  //       view_form: false,
  //       manage_form: false,
  //       delete_form: false,
  //       approval: false,
  //     },
  //     appointment: { view_all_appointment: false, manage_appointment: false },
  //     control_panel: { manage_roles: false, company_profile: false },
  //   }),
  //   []
  // );

  // Normalize different member shapes to { id, name, email }
  function normalizeMember(u) {
    if (!u) return null;
    const id = u.user_id ?? u.id ?? u.userId ?? u.member_id ?? null;
    const first = u.first_name ?? u.firstName ?? "";
    const last = u.last_name ?? u.lastName ?? "";
    const name =
      first || last
        ? `${first} ${last}`.trim()
        : u.name ?? u.full_name ?? u.displayName ?? u.email ?? "—";
    const email = u.email ?? u.email_address ?? u.emailAddress ?? "";
    return { id, name, email };
  }

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

  // Role fields
  const [roleName, setRoleName] = useState("");
  const [roleColor, setRoleColor] = useState("#53459d");
  const [permissions, setPermissions] = useState(defaultPermissions);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Tabs + members
  const [activeTab, setActiveTab] = useState("role");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [memberSearch, setMemberSearch] = useState("");

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSearch, setModalSearch] = useState("");
  const [modalSelected, setModalSelected] = useState({}); // id -> bool

  // Fill form when editing (roleCurrent loaded)
  useEffect(() => {
    if (roleIdFromQuery) {
      // dispatch getRole to load
      dispatch(getRole({ role_id: roleIdFromQuery }));
    }
  }, [roleIdFromQuery, dispatch]);

  useEffect(() => {
    if (roleCurrent && roleCurrent.role_id === roleIdFromQuery) {
      // roleCurrent.permissions is expected to be array of keys
      setRoleName(roleCurrent.role_name ?? roleCurrent.name ?? "");
      setRoleColor(roleCurrent.color ?? "#53459d");
      setPermissions((prev) =>
        expandPermissions(roleCurrent.permissions ?? [], defaultPermissions)
      );

      setSelectedMembers(
        (roleCurrent.members ?? [])
          .map((m) => normalizeMember(m))
          .filter(Boolean)
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleCurrent, roleIdFromQuery, defaultPermissions]);

  // Watch for create/update completion: when creating/updating flips from true -> false without error => navigate back
  useEffect(() => {
    // create finished
    if (prevCreating && !creating && !roleError) {
      router.push("/control-panel/role-list"); // or "/control-panel/roles" depends on your route
    }
    // update finished
    if (prevUpdating && !updating && !roleError) {
      router.push("/control-panel/role-list");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creating, updating, roleError, prevCreating, prevUpdating]);

  const validate = () => {
    const e = {};
    if (!roleName.trim()) e.roleName = "Role name is required";
    if (!/^#([0-9A-F]{3}){1,2}$/i.test(roleColor))
      e.roleColor = "Enter a valid hex color (e.g. #aabbcc)";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const setNestedPermission = (path, value) => {
    setPermissions((prev) => {
      const next = structuredClone(prev);
      let cur = next;
      path.slice(0, -1).forEach((p) => (cur = cur[p]));
      cur[path[path.length - 1]] = value;
      return next;
    });
  };

  /* Members helpers using real company users */
  // if company users selector returns an object, adapt to array; expect [{ user_id, first_name, last_name, email }]
  const normalizedCompanyUsers = useMemo(() => {
    // map company user objects to { id, name, email } for modal display
    return (allCompanyUsers || []).map((u) => {
      const id = u.user_id ?? u.id ?? u.userId;
      const name =
        `${u.first_name ?? u.firstName ?? ""} ${
          u.last_name ?? u.lastName ?? ""
        }`.trim() ||
        u.email ||
        "—";
      return { id, name, email: u.email ?? u.email_address ?? "" };
    });
  }, [allCompanyUsers]);

  const filteredSelectedMembers = useMemo(() => {
    const q = memberSearch.trim().toLowerCase();
    if (!q) return selectedMembers;
    return selectedMembers.filter(
      (m) =>
        (m.name || "").toLowerCase().includes(q) ||
        (m.email || "").toLowerCase().includes(q)
    );
  }, [memberSearch, selectedMembers]);

  const filteredModalMembers = useMemo(() => {
    const q = modalSearch.trim().toLowerCase();
    return normalizedCompanyUsers.filter((m) => {
      if (!q) return true;
      return (
        m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q)
      );
    });
  }, [modalSearch, normalizedCompanyUsers]);

  const removeMember = (id) => {
    setSelectedMembers((prev) => prev.filter((m) => m.id !== id));
  };

  const openAddMembersModal = () => {
    // prepare modalSelected with already-selected member ids checked
    const initial = {};
    selectedMembers.forEach((m) => {
      if (m?.id) initial[m.id] = true;
    });
    setModalSelected(initial);
    setModalSearch("");
    setModalOpen(true);
  };

  const toggleModalSelect = (id) => {
    setModalSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleModalAdd = () => {
    const toAdd = Object.keys(modalSelected).filter((id) => modalSelected[id]);
    if (toAdd.length === 0) {
      setModalOpen(false);
      return;
    }
    const membersToAdd = normalizedCompanyUsers.filter((m) =>
      toAdd.includes(m.id)
    );
    setSelectedMembers((prev) => {
      const ids = new Set(prev.map((p) => p.id));
      const merged = [...prev];
      membersToAdd.forEach((m) => {
        if (!ids.has(m.id)) merged.push(m);
      });
      return merged;
    });
    setModalOpen(false);
  };

  const handleModalCancel = () => {
    setModalOpen(false);
  };

  const handleCreateRole = (ev) => {
    // no form submit auto behavior — this is explicit action only
    ev?.preventDefault?.();
    if (!validate()) return;

    const payload = {
      name: roleName.trim(),
      color: roleColor,
      company_id: company?.company_id ?? null,
      permissions: flattenPermissions(permissions), // array of keys
      members: selectedMembers.map((m) => m.id), // send array of user ids
    };

    setSubmitting(true);
    try {
      if (roleIdFromQuery) {
        // update
        dispatch(updateRole({ role_id: roleIdFromQuery, ...payload }));
      } else {
        // create
        dispatch(createRole({ ...payload }));
      }
    } catch (err) {
      console.error("Failed to create/update role", err);
    } finally {
      setSubmitting(false);
    }
  };

  const renderPermissionSection = (sectionKey, title) => (
    <div className="permission-section" key={sectionKey}>
      <div className="section-header">{formatTitle(title)}</div>
      {PERMISSION_DEFINITIONS[sectionKey].map((item) => {
        const value = permissions?.[sectionKey]?.[item.key] ?? false;
        return (
          <div className="permission-item" key={item.key}>
            <div className="permission-main">
              <div className="permission-text">
                <div className="permission-title">{item.label}</div>
                <div className="permission-desc">{item.desc}</div>
              </div>
              <div className="permission-switch">
                <Switch
                  checked={value}
                  onChange={(val) =>
                    setNestedPermission([sectionKey, item.key], val)
                  }
                />
              </div>
            </div>
            <hr className="permission-sep" />
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="new-role-container">
      <header className="page-header">
        <h1 className="title">
          {roleIdFromQuery ? "Edit Role" : "Create New Role"}
        </h1>
      </header>

      <div className="tabs">
        <button
          className={`tab ${activeTab === "role" ? "active" : ""}`}
          type="button"
          onClick={() => setActiveTab("role")}
        >
          Role & Permissions
        </button>
        <button
          className={`tab ${activeTab === "members" ? "active" : ""}`}
          type="button"
          onClick={() => setActiveTab("members")}
        >
          Manage Members
        </button>
      </div>

      <form
        className="form"
        onSubmit={(e) => e.preventDefault()} // defensive: prevent native submit
        noValidate
      >
        {activeTab === "role" && (
          <>
            <div className="form-row">
              <div className="form-col">
                <PlainTextField
                  value={roleName}
                  onChange={setRoleName}
                  label="Role Name"
                  placeholder="Enter role name (e.g. Manager)"
                />
                {errors.roleName && (
                  <div className="error">{errors.roleName}</div>
                )}
              </div>

              <div className="form-col">
                <label className="field-label">Role Color</label>
                <div className="color-picker-container">
                  <InputColor
                    placeholder="Role Color"
                    value={roleColor}
                    onChange={(value) => setRoleColor(value)}
                  />
                  <PlainTextField
                    className="plain-text-field"
                    value={roleColor}
                    onChange={setRoleColor}
                    placeholder="#53459d"
                  />
                </div>
                {errors.roleColor && (
                  <div className="error">{errors.roleColor}</div>
                )}
              </div>
            </div>

            <div className="permissions">
              <div className="permissions-scroll">
                {Object.keys(PERMISSION_DEFINITIONS).map((sectionKey) =>
                  renderPermissionSection(sectionKey, sectionKey)
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === "members" && (
          <div className="manage-members">
            <div className="members-header">
              <div style={{ flex: 1 }}>
                <PlainTextField
                  value={memberSearch}
                  onChange={setMemberSearch}
                  placeholder="Search members by name or email"
                />
              </div>

              <div style={{ marginLeft: 12 }}>
                <ActionButton
                  label="Add Members"
                  type="primary"
                  onClick={openAddMembersModal}
                  htmlType="button"
                />
              </div>
            </div>

            <div className="members-list">
              {filteredSelectedMembers.length === 0 ? (
                <div className="empty">
                  {selectedMembers.length === 0
                    ? "No members added to this role yet."
                    : "No matching members."}
                </div>
              ) : (
                filteredSelectedMembers.map((m) => (
                  <div className="member-row" key={m.id}>
                    <div className="member-info">
                      <div className="member-name">{m.name}</div>
                      <div className="member-email">{m.email}</div>
                    </div>
                    <div className="member-actions">
                      <button
                        className="icon-btn remove"
                        type="button"
                        onClick={() => removeMember(m.id)}
                        aria-label={`Remove ${m.name}`}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <div className="form-actions">
          <ActionButton
            type="outlined"
            label="Cancel"
            onClick={(e) => {
              e.preventDefault();
              router.back();
            }}
            htmlType="button"
          />
          <ActionButton
            type="primary"
            label={roleIdFromQuery ? "Save Changes" : "Create Role"}
            onClick={handleCreateRole}
            htmlType="button"
          />
        </div>
      </form>

      {/* Add Members Modal */}
      {modalOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal">
            <div className="modal-header">
              <div>
                <h2 className="modal-title">Add Members to Role</h2>
                <p className="modal-desc">
                  Select one or more members to add to this role.
                </p>
              </div>
              <button
                className="modal-close"
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="modal-search">
                <PlainTextField
                  value={modalSearch}
                  onChange={setModalSearch}
                  placeholder="Search by name or email"
                />
              </div>

              <div className="modal-list">
                {filteredModalMembers.length === 0 ? (
                  <div className="empty">No members found</div>
                ) : (
                  filteredModalMembers.map((m) => (
                    <label key={m.id} className="modal-list-item">
                      <input
                        type="checkbox"
                        checked={!!modalSelected[m.id]}
                        onChange={() => toggleModalSelect(m.id)}
                        aria-label={`Select ${m.name}`}
                      />
                      <div className="modal-member-info">
                        <div className="modal-member-name">{m.name}</div>
                        <div className="modal-member-email">{m.email}</div>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </div>

            <div className="modal-actions">
              <ActionButton
                type="outlined"
                label="Cancel"
                onClick={handleModalCancel}
                htmlType="button"
              />
              <ActionButton
                type="primary"
                label="Add"
                onClick={handleModalAdd}
                htmlType="button"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
