import { ActionButton } from "@/components/Misc/ActionButton";
import { useSelectUser } from "../../../../../redux/slices/authSlice";
import {
  getSelectedClientGroup,
  useSelectCurrGroup,
} from "../../../../../redux/slices/clientGroupSlice";
import {
  createClient,
  useSelectCurrSelectedGroupId,
} from "../../../../../redux/slices/clientSlice";
import {
  useSelectAllCompanyUsers,
  useSelectCurrCompanyId,
  useSelectIsAdmin,
} from "../../../../../redux/slices/companySlice";
import { useRouter } from "next/router";
import { useState, useEffect, useMemo } from "react";
import { useDispatch } from "react-redux";
import { v4 } from "uuid";
import { renderClientInputField } from "@/utils/renderField";
import { useSelectUserPermissions } from "../../../../../redux/slices/roleAuthSlice";
import { checkDuplicate } from "@/utils/checkDuplicate";
import { onValue, ref } from "firebase/database";
import { db } from "@/config/firebaseConfig";

export default function NewClientPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const user = useSelectUser();
  const allCompanyUsers = useSelectAllCompanyUsers();
  const currSelectedGroupId = useSelectCurrSelectedGroupId();
  const currSelectedGroup = useSelectCurrGroup();
  const [handler, setHandler] = useState([]);

  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({}); // new: field-level errors
  const currCompanyId = useSelectCurrCompanyId();
  const userPermissions = useSelectUserPermissions();
  const isAdmin = useSelectIsAdmin();
  const canManageHandler =
    isAdmin || userPermissions.includes("manage_handler");
  const { client_group_id } = router.query;

  const [userSortingArray, setUserSortingArray] = useState(null);
  const [columnSortingArray, setColumnSortingArray] = useState(null);

  useEffect(() => {
    if (!currSelectedGroupId) return;
    if (!user) return;

    const userRef = ref(
      db,
      `UserColumnSorting/${user?.uid}/${currSelectedGroupId}`
    );
    const unsubUser = onValue(userRef, (snap) => {
      const val = snap.val();
      const arr = Array.isArray(val) ? val : val?.columnsOrder;
      setUserSortingArray(Array.isArray(arr) ? arr : null);
    });

    const groupRef = ref(db, `ColumnSorting/${currSelectedGroupId}`);
    const unsubGroup = onValue(groupRef, (snap) => {
      const arr = snap.val();
      setColumnSortingArray(Array.isArray(arr) ? arr : null);
    });

    // Cleanup listeners when unmounting or group changes
    return () => {
      unsubUser();
      unsubGroup();
    };
  }, [user, currSelectedGroupId]);

  const clientColumns = useMemo(() => {
    const cols = [];

    if (canManageHandler) {
      cols.push({
        column_id: "handler",
        label: "Handler",
        field_type: "handler",
        options: handler,
        width: 100,
        is_required: false,
        permission: "editable",
        allow_duplicate: 1,
      });
    }

    if (currSelectedGroup) {
      const groupColumns = currSelectedGroup.columns.map((c) => ({
        ...c,
        options: c.options,
      }));
      cols.push(...groupColumns);
    }

    return cols;
  }, [currSelectedGroup, handler, canManageHandler]);

  const sortedColumns = useMemo(() => {
    if (!clientColumns) return [];

    const FIXED = ["handler", "created_at", "serial_number"];
    const getId = (c) => c.id ?? c.column_id;

    const orderIds =
      (Array.isArray(userSortingArray) &&
        userSortingArray.length > 0 &&
        userSortingArray) ||
      (Array.isArray(columnSortingArray) &&
        columnSortingArray.length > 0 &&
        columnSortingArray) ||
      null;

    const fixed = clientColumns.filter((c) => FIXED.includes(getId(c)));
    const dynamic = clientColumns.filter((c) => !FIXED.includes(getId(c)));

    if (!orderIds) {
      return [...fixed, ...dynamic];
    }

    const idToCol = new Map(dynamic.map((c) => [getId(c), c]));

    const ordered = orderIds.map((id) => idToCol.get(id)).filter(Boolean);

    const remaining = dynamic.filter((c) => !orderIds.includes(getId(c)));

    return [...fixed, ...ordered, ...remaining];
  }, [clientColumns, userSortingArray, columnSortingArray]);

  // Columns that will be rendered in the UI (hide not_viewable)
  // show columns in UI: admins see everything, non-admins hide `not_viewable`
  const visibleColumns = useMemo(() => {
    if (isAdmin) return sortedColumns; // admin sees all columns (including not_viewable)
    return sortedColumns.filter((c) => c.permission !== "not_viewable");
  }, [sortedColumns, isAdmin]);

  useEffect(() => {
    if (!currSelectedGroup && client_group_id) {
      dispatch(getSelectedClientGroup({ client_group_id: client_group_id }));
    }
  }, [client_group_id]);

  useEffect(() => {
    const handlerList =
      allCompanyUsers.map((list) => {
        return {
          name: list.first_name + " " + list.last_name,
          label: list.first_name + " " + list.last_name,
          value: list.user_id,
        };
      }) || [];
    setHandler(handlerList);
  }, [allCompanyUsers]);

  // initialize form data for all columns (including not_viewable, to ensure submit payload completeness)
  useEffect(() => {
    const initialData = {};
    clientColumns.forEach((column) => {
      if (column.column_id === "handler") {
        initialData.handler = [];
      } else {
        initialData[column.column_id] = "";
      }
    });

    setFormData(initialData);
  }, [clientColumns]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({}); // clear previous

    const client_id = v4();
    const client_group_id = currSelectedGroupId;

    // If user is admin, bypass frontend validations completely
    if (isAdmin) {
      const custom_values = clientColumns
        .filter((c) => c.column_id !== "handler")
        .map((col) => {
          const type = col.field_type;
          const matchingValue = formData[col.column_id];

          if (type === "alert") {
            const matchingObj = matchingValue || {};
            const defaultValue = { date: "", is_complete: false };
            if (matchingObj.date !== undefined)
              defaultValue.date = matchingObj.date;
            if (matchingObj.is_complete !== undefined)
              defaultValue.is_complete = matchingObj.is_complete;
            return {
              client_custom_value_id: v4(),
              client_id: client_id,
              client_group_id: client_group_id,
              column_id: col.column_id,
              row_value: JSON.stringify(defaultValue),
            };
          } else {
            return {
              client_custom_value_id: v4(),
              client_id: client_id,
              client_group_id: client_group_id,
              column_id: col.column_id,
              row_value: matchingValue ?? "",
            };
          }
        });

      const clientNameColumn = clientColumns.find(
        (c) => c.label === "Client Name"
      );
      const clientName = clientNameColumn
        ? formData[clientNameColumn.column_id]
        : "";

      const handlerList =
        formData.handler?.map((h) => {
          const user_id = h.value || h;
          return {
            client_id: client_id,
            user_id: user_id,
          };
        }) || [];

      const logsBody = {
        company_id: currCompanyId,
        user_id: user?.uid,
        section: "Client",
        action: "Create",
        text: `${user?.displayName} created client ${clientName}`,
        subject_id: currSelectedGroupId,
        metadata: {},
      };

      const finalPayload = {
        handler: handlerList,
        client_group_id: currSelectedGroupId,
        user_id: user?.uid,
        client_id: client_id,
        company_id: currCompanyId,
        custom_values,
        // optional: include a flag so backend knows this was created by an admin
        created_by_admin: true,
      };

      dispatch(createClient({ payload: finalPayload, router, logsBody }));
      return;
    } else {
      const errors = {};

      // required checks
      clientColumns.forEach((col) => {
        if (col.is_required) {
          const val = formData[col.column_id];
          if (col.column_id === "handler") {
            if (!val || val.length === 0) {
              errors[col.column_id] = `${col.label} is required`;
            }
          } else if (col.field_type === "alert") {
            const v = formData[col.column_id] || {
              date: "",
              is_complete: false,
            };
            if (!v.date) {
              errors[col.column_id] = `${col.label} date is required`;
            }
          } else {
            if (val === undefined || val === null || `${val}`.trim() === "") {
              errors[col.column_id] = `${col.label} is required`;
            }
          }
        }
      });

      // duplicate checks for columns where allow_duplicate === 0
      if (Object.keys(errors).length === 0) {
        for (const col of clientColumns) {
          if (col.allow_duplicate === 0) {
            const value = formData[col.column_id];
            if (col.column_id === "handler") continue;
            const { isDuplicate, ok } = await checkDuplicate(
              dispatch,
              currSelectedGroupId,
              col.column_id,
              value,
              client_id
            );

            // console.log(isDuplicate)
            // console.log(ok)
            if (!ok) {
              errors[col.column_id] = `${col.label} error`;
              break;
            }
            if (isDuplicate) {
              errors[col.column_id] = `${col.label} value already exists`;
              break;
            }
          }
        }
      }

      if (Object.keys(errors).length > 0) {
        console.log(errors);
        setFormErrors(errors);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      // If validations passed, build payload same as before (non-admin)
      const custom_values = clientColumns
        .filter((c) => c.column_id !== "handler")
        .map((col) => {
          const type = col.field_type;
          const matchingValue = formData[col.column_id];

          if (type === "alert") {
            const matchingObj = matchingValue || {};
            const defaultValue = { date: "", is_complete: false };
            if (matchingObj.date !== undefined)
              defaultValue.date = matchingObj.date;
            if (matchingObj.is_complete !== undefined)
              defaultValue.is_complete = matchingObj.is_complete;
            return {
              client_custom_value_id: v4(),
              client_id: client_id,
              client_group_id: client_group_id,
              column_id: col.column_id,
              row_value: JSON.stringify(defaultValue),
            };
          } else {
            return {
              client_custom_value_id: v4(),
              client_id: client_id,
              client_group_id: client_group_id,
              column_id: col.column_id,
              row_value: matchingValue ?? "",
            };
          }
        });

      const clientNameColumn = clientColumns.find(
        (c) => c.label === "Client Name"
      );
      const clientName = clientNameColumn
        ? formData[clientNameColumn.column_id]
        : "";

      const handlerList =
        formData.handler?.map((h) => {
          const user_id = h.value || h;
          return {
            client_id: client_id,
            user_id: user_id,
          };
        }) || [];

      const logsBody = {
        company_id: currCompanyId,
        user_id: user?.uid,
        section: "Client",
        action: "Create",
        text: `${user?.displayName} created client ${clientName}`,
        client_group_id: currSelectedGroupId,
        metadata: {},
      };

      const finalPayload = {
        handler: handlerList,
        client_group_id: currSelectedGroupId,
        user_id: user?.uid,
        client_id: client_id,
        company_id: currCompanyId,
        custom_values,
      };

      dispatch(createClient({ payload: finalPayload, router, logsBody }));
    }
  };

  const handleCancel = (e) => {
    e.preventDefault();
    router.back();
  };

  return (
    <div className="create-client-container">
      <div className="form-card">
        <div className="form-header">
          <h1>Create New Client</h1>
          <p>Enter the client details below</p>
        </div>

        <form onSubmit={handleSubmit} className="client-form">
          {/* show a top-level error summary if desired */}
          {Object.keys(formErrors).length > 0 && (
            <div className="form-errors">
              <strong>Please fix the highlighted fields.</strong>
            </div>
          )}

          <div className="form-section">
            {visibleColumns.map((column) => (
              <div
                key={column.column_id}
                className="input-group"
                style={{ "--col-width": `${column.width}%` }}
              >
                <label>
                  {column.label}
                  {column.is_required ? (
                    <span style={{ color: "red" }}> *</span>
                  ) : null}
                </label>

                {renderClientInputField(formData, column, setFormData, {
                  disabled: column.permission === "view_only",
                  error: formErrors[column.column_id],
                })}
                {formErrors[column.column_id] && (
                  <div
                    className="field-error"
                    style={{ color: "red", marginTop: 4 }}
                  >
                    {formErrors[column.column_id]}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="form-actions">
            <ActionButton
              type="outlined"
              label="Cancel"
              onClick={handleCancel}
            />
            <ActionButton
              type="primary"
              label="Create Client"
              onClick={handleSubmit}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
